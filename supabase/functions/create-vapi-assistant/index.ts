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
    // Default to Sarah (EXAVITQu4vr4xnSDxMaL) if not set
    const elevenLabsVoiceId = settings?.voice_id || "EXAVITQu4vr4xnSDxMaL";

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

        // Transcriber settings (Speech-to-Text)
        transcriber: {
          provider: "deepgram",
          model: "nova-2",
          language: settings?.ai_config?.language || "en",
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
          stability: 0.5,
          similarityBoost: 0.75,
        },

        // First message when call is answered
        firstMessage:
          settings?.ai_config?.greeting ||
          `Hello, thank you for calling ${org.name}. How may I help you today?`,

        // Behavior settings
        firstMessageMode: "assistant-speaks-first",

        // Background sound
        backgroundSound: "office",

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

## Tone
${personality === "professional" ? "Maintain a professional, business-like tone" : personality === "casual" ? "Be casual and friendly, like talking to a neighbor" : "Be warm and friendly while remaining professional"}

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
