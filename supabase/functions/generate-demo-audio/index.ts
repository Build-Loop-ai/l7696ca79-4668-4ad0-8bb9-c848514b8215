import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DemoRequest {
  businessName: string;
  businessType: string;
  services: string;
  tone: string;
  voiceId: string;
  language?: string;
}

// Business-type specific Q&A scripts
const businessScripts: Record<string, { question: string; answer: string }> = {
  dental_clinic: {
    question: "Do you have any openings for a cleaning this week?",
    answer: "I'd be happy to help you schedule a cleaning. Let me check our availability. We have openings on Thursday at 2 PM and Friday at 10 AM. Which time works better for you?",
  },
  medical_practice: {
    question: "I need to see the doctor about a persistent headache.",
    answer: "I understand. I can help you schedule an appointment. We have availability tomorrow afternoon at 3 PM, or if you prefer, Thursday morning at 9 AM. Would either of those work for you?",
  },
  salon: {
    question: "Can I book a haircut for this Saturday?",
    answer: "Absolutely! Let me check Saturday's schedule. We have openings at 11 AM and 2:30 PM. Which time would you prefer? I can also add any additional services like a treatment or styling.",
  },
  restaurant: {
    question: "Do you have a table for four available tonight?",
    answer: "Let me check our availability for this evening. Yes, we have a lovely table available at 7:30 PM. Would you like me to reserve it for you? I can also note any dietary preferences or special occasions.",
  },
  spa: {
    question: "I'd like to book a massage for the weekend.",
    answer: "Wonderful choice! We have availability on Saturday at 1 PM for a 60-minute relaxation massage, or Sunday at 3 PM. Which day works best for you?",
  },
  fitness: {
    question: "What time are your morning classes?",
    answer: "We have several morning options! Yoga at 6 AM, spin class at 7 AM, and HIIT at 8 AM. Would you like me to reserve a spot in any of these classes?",
  },
  other: {
    question: "What are your business hours?",
    answer: "We're open Monday through Friday from 9 AM to 6 PM, and Saturday from 10 AM to 4 PM. Would you like to schedule an appointment?",
  },
};

// Tone variations
const toneAdjustments: Record<string, { greeting: string; closing: string }> = {
  professional: {
    greeting: "Good day, thank you for calling",
    closing: "Is there anything else I can assist you with today?",
  },
  friendly: {
    greeting: "Hi there! Thanks so much for calling",
    closing: "Anything else I can help you with?",
  },
  casual: {
    greeting: "Hey! Thanks for calling",
    closing: "Need anything else?",
  },
};

function generateDemoScript(data: DemoRequest): string {
  const { businessName, businessType, services, tone } = data;
  const toneStyle = toneAdjustments[tone] || toneAdjustments.friendly;
  const script = businessScripts[businessType] || businessScripts.other;

  // Build the demo script (~30 seconds when spoken)
  const demoScript = `
${toneStyle.greeting} ${businessName}. I'm your AI receptionist. How can I help you today?

[pause]

${script.answer}

${services ? `By the way, we also offer ${services.split(',').slice(0, 2).join(' and ')}.` : ''}

${toneStyle.closing} I'm here to help with scheduling, questions, or anything else you need.
  `.trim();

  return demoScript;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: DemoRequest = await req.json();
    console.log("Demo request received:", { 
      businessName: data.businessName, 
      businessType: data.businessType,
      voiceId: data.voiceId 
    });

    // Validate required fields
    if (!data.businessName || !data.voiceId) {
      return new Response(
        JSON.stringify({ error: "Business name and voice are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate the demo script
    const script = generateDemoScript(data);
    console.log("Generated script:", script);

    // Get ElevenLabs API key
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      console.error("ELEVENLABS_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Voice service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call ElevenLabs TTS API
    const ttsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${data.voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: script,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      console.error("ElevenLabs API error:", ttsResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate audio" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Convert audio to base64 in chunks to avoid stack overflow
    const audioBuffer = await ttsResponse.arrayBuffer();
    const uint8Array = new Uint8Array(audioBuffer);
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }
    const base64Audio = btoa(binary);

    console.log("Audio generated successfully, size:", audioBuffer.byteLength);

    return new Response(
      JSON.stringify({ 
        audioContent: base64Audio,
        script: script,
        contentType: "audio/mpeg"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating demo:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
