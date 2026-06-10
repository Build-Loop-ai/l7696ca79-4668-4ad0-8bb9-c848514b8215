import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAuthenticated, unauthorizedResponse } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Calls a paid TTS API — require an authenticated user (this is only used
    // from the authenticated onboarding/settings voice preview).
    const access = await requireAuthenticated(req);
    if (!access.ok) {
      return unauthorizedResponse(access, corsHeaders);
    }

    const { voiceId, text, language } = await req.json();

    if (!voiceId || !text) {
      throw new Error("voiceId and text are required");
    }

    if (typeof text !== "string" || text.length > 500) {
      throw new Error("text must be a string of at most 500 characters");
    }

    // Try to get ElevenLabs API key from environment
    const elevenLabsApiKey = Deno.env.get("ELEVENLABS_API_KEY");

    if (!elevenLabsApiKey) {
      console.log("ELEVENLABS_API_KEY not configured, returning placeholder");
      return new Response(
        JSON.stringify({
          success: true,
          voiceId: voiceId,
          message: "ElevenLabs API key not configured. Voice will work in production calls.",
          audioContent: null,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Generating ElevenLabs preview for voice: ${voiceId}, language: ${language}`);

    // Call ElevenLabs Text-to-Speech API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": elevenLabsApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", response.status, errorText);
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    // Convert audio to base64
    const audioBuffer = await response.arrayBuffer();
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(audioBuffer))
    );

    console.log(`Successfully generated audio preview (${audioBuffer.byteLength} bytes)`);

    return new Response(
      JSON.stringify({
        success: true,
        voiceId: voiceId,
        audioContent: base64Audio,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in test-voice:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ 
        error: message,
        audioContent: null,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
