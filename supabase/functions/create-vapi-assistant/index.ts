import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { organizationId } = await req.json();

    if (!organizationId) {
      throw new Error("organizationId is required");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get organization data with settings
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("*, organization_settings(*)")
      .eq("id", organizationId)
      .single();

    if (orgError || !org) {
      throw new Error(`Organization not found: ${orgError?.message}`);
    }

    const settings = org.organization_settings?.[0] || org.organization_settings;
    
    // Determine which API key to use (org's own or platform default)
    const vapiApiKey = settings?.vapi_api_key || Deno.env.get("VAPI_API_KEY");

    if (!vapiApiKey) {
      throw new Error("VAPI_API_KEY is not configured");
    }

    // Build the system prompt based on business info
    const systemPrompt = buildSystemPrompt(org, settings);

    // Use voice_id directly - it's now stored as the actual ElevenLabs voice ID
    // Default to first recommended voice (Sarah) if not set
    const defaultVoiceId = "EXAVITQu4vr4xnSDxMaL"; // Sarah - first recommended voice
    const elevenLabsVoiceId = settings?.voice_id || defaultVoiceId;

    // Map stored language codes to Deepgram-compatible codes
    const storedLanguage = settings?.language || settings?.ai_config?.language || "en";
    const transcriberLanguage = mapToTranscriberLanguage(storedLanguage);

    console.log("Creating Vapi assistant for org:", org.name);

    // Create assistant via Vapi API
    const response = await fetch("https://api.vapi.ai/assistant", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${vapiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `${org.name} Receptionist`,

        // Transcriber settings (Speech-to-Text) with enhanced VAD
        transcriber: {
          provider: "deepgram",
          model: "nova-2",
          language: transcriberLanguage,
          smartFormat: true,
          endpointing: 300, // Faster turn detection (300ms silence)
        },

        // LLM settings
        model: {
          provider: "openai",
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
          ],
          temperature: 0.7,
          maxTokens: 500,
          tools: [
            {
              type: "function",
              // Filler messages while waiting for webhook response
              messages: [
                { 
                  type: "request-start", 
                  content: settings?.language?.startsWith("nl") 
                    ? "Een moment, ik controleer de agenda..." 
                    : "Let me check the calendar for you..." 
                },
                { 
                  type: "request-failed", 
                  content: settings?.language?.startsWith("nl") 
                    ? "Sorry, ik kon de agenda niet controleren. Kunt u het later proberen?" 
                    : "I'm sorry, I couldn't check the calendar right now. Please try again." 
                },
                { 
                  type: "request-response-delayed", 
                  content: settings?.language?.startsWith("nl") 
                    ? "Nog even geduld..." 
                    : "Still checking...", 
                  timingMilliseconds: 5000 
                }
              ],
              function: {
                name: "checkAvailability",
                description: "Check available appointment slots for a given date",
                parameters: {
                  type: "object",
                  properties: {
                    date: {
                      type: "string",
                      description: "The date to check in YYYY-MM-DD format",
                    },
                    service: {
                      type: "string",
                      description: "The type of service/appointment",
                    },
                  },
                  required: ["date"],
                },
              },
            },
            {
              type: "function",
              // Filler messages while booking
              messages: [
                { 
                  type: "request-start", 
                  content: settings?.language?.startsWith("nl") 
                    ? "Ik boek uw afspraak..." 
                    : "I'm booking your appointment now..." 
                },
                { 
                  type: "request-failed", 
                  content: settings?.language?.startsWith("nl") 
                    ? "Er ging iets mis bij het boeken. Kunt u het opnieuw proberen?" 
                    : "Something went wrong with the booking. Please try again." 
                },
                { 
                  type: "request-response-delayed", 
                  content: settings?.language?.startsWith("nl") 
                    ? "Nog even..." 
                    : "Almost done...", 
                  timingMilliseconds: 5000 
                }
              ],
              function: {
                name: "bookAppointment",
                description: "Book an appointment for the caller",
                parameters: {
                  type: "object",
                  properties: {
                    patientName: {
                      type: "string",
                      description: "Full name of the patient",
                    },
                    phoneNumber: {
                      type: "string",
                      description: "Contact phone number",
                    },
                    datetime: {
                      type: "string",
                      description: "Appointment date and time in ISO format",
                    },
                    service: {
                      type: "string",
                      description: "Type of appointment/service",
                    },
                    notes: {
                      type: "string",
                      description: "Any additional notes from the caller",
                    },
                  },
                  required: ["patientName", "phoneNumber", "datetime", "service"],
                },
              },
            },
            {
              type: "transferCall",
              destinations: settings?.transfer_number
                ? [
                    {
                      type: "number",
                      number: settings.transfer_number,
                      description: "Transfer to staff when caller requests human or for emergencies",
                    },
                  ]
                : [],
            },
            {
              type: "endCall",
            },
          ],
        },

        // Voice settings (Text-to-Speech)
        voice: {
          provider: "11labs",
          voiceId: elevenLabsVoiceId,
          model: "eleven_multilingual_v2",
          stability: 0.5,
          similarityBoost: 0.75,
        },

        // First message when call is answered - prioritize custom_greeting
        firstMessage:
          settings?.custom_greeting ||
          settings?.ai_config?.greeting ||
          `Hello, thank you for calling ${org.name}. How may I help you today?`,

        // Behavior settings
        firstMessageMode: "assistant-speaks-first",

        // Background sound - disabled for clean audio
        backgroundSound: "off",

        // Voice Activity Detection for better speech recognition
        silenceTimeoutSeconds: 15,
        responseDelaySeconds: 0.2,
        
        // Enable interruptions for natural conversation
        interruptionsEnabled: true,

        // Turn detection - when to start speaking after user stops
        startSpeakingPlan: {
          waitSeconds: 0.4,
          smartEndpointingEnabled: true,
          transcriptionEndpointingPlan: {
            onPunctuationSeconds: 0.1,
            onNoPunctuationSeconds: 1.5,
            onNumberSeconds: 0.5,
          },
        },

        // Turn detection - when to stop speaking if user interrupts
        stopSpeakingPlan: {
          numWords: 2,
          voiceSeconds: 0.2,
          backoffSeconds: 1,
        },

        // Server URL for webhooks
        serverUrl: `${Deno.env.get("SUPABASE_URL")}/functions/v1/vapi-webhook`,

        // Which events to send to server
        serverMessages: [
          "end-of-call-report",
          "tool-calls",
          "transfer-destination-request",
          "hang",
        ],

        // Call settings
        maxDurationSeconds: 600, // 10 minute max call

        // End call message
        endCallMessage: "Thank you for calling. Goodbye!",

        // Voicemail message
        voicemailMessage: `You've reached ${org.name}. Please leave a message and we'll call you back.`,

        // Metadata
        metadata: {
          organizationId: org.id,
          organizationName: org.name,
        },
      }),
    });

    const assistant = await response.json();

    if (!response.ok) {
      console.error("Vapi API error:", assistant);
      throw new Error(assistant.message || "Failed to create Vapi assistant");
    }

    console.log("Vapi assistant created:", assistant.id);

    // Save assistant ID to database
    const { error: updateError } = await supabase
      .from("organization_settings")
      .update({ vapi_assistant_id: assistant.id })
      .eq("organization_id", organizationId);

    if (updateError) {
      console.error("Error saving assistant ID:", updateError);
    }

    return new Response(
      JSON.stringify({ success: true, assistantId: assistant.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in create-vapi-assistant:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildSystemPrompt(org: any, settings: any): string {
  const businessHours = formatBusinessHours(settings?.business_hours);
  const services =
    settings?.services?.map((s: any) => s.name).join(", ") || "general appointments";

  // Add current date for relative date parsing
  const today = new Date();
  const currentDate = today.toISOString().split('T')[0];
  const currentDateFormatted = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const businessTypeMap: Record<string, string> = {
    dental_clinic: "dental clinic",
    medical_practice: "medical practice",
    salon: "salon",
    restaurant: "restaurant",
    other: "business",
  };

  const businessType = businessTypeMap[org.business_type] || "business";
  const address = org.address
    ? `${org.address.street || ""}, ${org.address.city || ""} ${org.address.postal_code || ""}`
    : "Not available";

  const personality = settings?.ai_config?.personality || "friendly";
  const language = settings?.ai_config?.language || "en";

  const languageNames: Record<string, string> = {
    en: "English",
    nl: "Dutch",
    de: "German",
    es: "Spanish",
    fr: "French",
  };

  // Include business description if available
  const descriptionSection = org.description 
    ? `\n## About the Business\n${org.description}\n` 
    : "";

  // Include special instructions if available
  const specialInstructionsSection = org.special_instructions 
    ? `\n## Special Instructions\n${org.special_instructions}\n` 
    : "";

  return `You are a friendly and professional virtual receptionist for ${org.name}, a ${businessType}.

## Your Role
- Answer incoming calls professionally and warmly
- Provide information about the business
- Help callers schedule appointments
- Transfer calls to staff when needed

## Business Information
- Name: ${org.name}
- Address: ${address}
- Phone: ${org.phone || "Not available"}
- Website: ${org.website || "Not available"}
${descriptionSection}
## Business Hours
${businessHours}

## Services Offered
${services}

## Instructions
1. Always greet callers warmly and identify yourself as the virtual assistant for ${org.name}
2. Listen carefully to understand what the caller needs
3. For appointment requests:
   - Ask for their preferred date and time
   - Use checkAvailability to verify the slot is open
   - Collect their name, phone number, and service type
   - Use bookAppointment to confirm the booking
   - Repeat the appointment details back to confirm
4. For questions about services, hours, or location, provide the information above
5. If the caller asks to speak with a person, has an emergency, or you cannot help, use transferCall
6. Be concise but friendly - don't over-explain
7. If unsure about something, offer to transfer to staff
${specialInstructionsSection}
## Tone
${personality === "professional" ? "Maintain a professional, business-like tone" : personality === "casual" ? "Be casual and friendly, like talking to a neighbor" : "Be warm and friendly while remaining professional"}

## Current Date
Today is ${currentDateFormatted} (${currentDate}).
When users mention relative dates like "tomorrow", "next week", "this Friday", etc., calculate the correct date using this as reference.
ALWAYS use the current year (${today.getFullYear()}) unless the user explicitly specifies a different year.
For example: if today is ${currentDateFormatted}, "tomorrow" means ${new Date(today.getTime() + 86400000).toISOString().split('T')[0]}.

## Language
Speak in ${languageNames[language] || "English"}.`;
}

function formatBusinessHours(hours: any): string {
  if (!hours) return "Monday-Friday: 9:00 AM - 5:00 PM";

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  return days
    .map((day) => {
      const dayHours = hours[day];
      if (!dayHours || !dayHours.isOpen) return `${day}: Closed`;
      return `${day}: ${dayHours.open} - ${dayHours.close}`;
    })
    .join("\n");
}

// Map stored language codes (like nl-NL) to Deepgram-compatible codes (like nl)
function mapToTranscriberLanguage(language: string): string {
  const languageMap: Record<string, string> = {
    // Full locale to Deepgram code
    "nl-NL": "nl",
    "nl-BE": "nl-BE",
    "de-DE": "de",
    "de-CH": "de-CH",
    "fr-FR": "fr",
    "fr-CA": "fr-CA",
    "es-ES": "es",
    "es-419": "es-419",
    "it-IT": "it",
    "pt-PT": "pt",
    "pt-BR": "pt-BR",
    "en-US": "en-US",
    "en-GB": "en-GB",
    "en-AU": "en-AU",
    "en-NZ": "en-NZ",
    "en-IN": "en-IN",
    "da-DK": "da-DK",
    "sv-SE": "sv-SE",
    "no-NO": "no",
    "fi-FI": "fi",
    "pl-PL": "pl",
    "ja-JP": "ja",
    "ko-KR": "ko-KR",
    "zh-CN": "zh-CN",
    "zh-TW": "zh-TW",
    "tr-TR": "tr",
    "ru-RU": "ru",
    "ar-SA": "multi", // Arabic uses multi model
    "hi-IN": "hi",
  };

  // Check if we have an exact match
  if (languageMap[language]) {
    return languageMap[language];
  }

  // Extract base language code (e.g., "nl" from "nl-NL")
  const baseLanguage = language.split("-")[0];
  
  // Valid Deepgram base languages
  const validBaseLanguages = [
    "en", "bg", "ca", "zh", "cs", "da", "nl", "et", "fi", "fr", "de", 
    "el", "hi", "hu", "id", "it", "ja", "ko", "lv", "lt", "ms", "multi", 
    "no", "pl", "pt", "ro", "ru", "sk", "es", "sv", "th", "tr", "uk", "vi"
  ];

  if (validBaseLanguages.includes(baseLanguage)) {
    return baseLanguage;
  }

  // Fallback to English
  return "en";
}
