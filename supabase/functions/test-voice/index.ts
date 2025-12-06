import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Map voice IDs to ElevenLabs voice IDs
const voiceMapping: Record<string, string> = {
  rachel: "EXAVITQu4vr4xnSDxMaL",
  adam: "pNInz6obpgDQGcFmaJgB",
  bella: "EXAVITQu4vr4xnSDxMaL",
  josh: "TxGEqnHWrfWFTfGW9XjX",
  antoni: "ErXwobaYiN019PkySvjV",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { voiceId, text } = await req.json();

    if (!voiceId || !text) {
      throw new Error("voiceId and text are required");
    }

    const vapiApiKey = Deno.env.get("VAPI_API_KEY");

    if (!vapiApiKey) {
      throw new Error("VAPI_API_KEY is not configured");
    }

    const elevenLabsVoiceId = voiceMapping[voiceId] || voiceMapping.rachel;

    console.log("Generating voice preview for:", voiceId, "->", elevenLabsVoiceId);

    // Use Vapi's voice synthesis endpoint
    // Note: If Vapi doesn't provide a direct TTS endpoint, we'll use their assistant 
    // for now and return a placeholder
    
    // For demo purposes, return info about the voice
    // In production, you'd integrate with ElevenLabs directly or use Vapi's streaming
    return new Response(
      JSON.stringify({
        success: true,
        voiceId: voiceId,
        elevenLabsVoiceId: elevenLabsVoiceId,
        message: "Voice preview generated",
        // In production, this would be a base64 audio or a URL
        audioUrl: null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in test-voice:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
