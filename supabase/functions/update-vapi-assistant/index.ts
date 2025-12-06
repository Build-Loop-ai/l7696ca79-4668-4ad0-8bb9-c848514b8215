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
    const { organizationId, updates } = await req.json();

    if (!organizationId) {
      throw new Error("organizationId is required");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get organization settings including language config
    const { data: settings, error: settingsError } = await supabase
      .from("organization_settings")
      .select("vapi_assistant_id, vapi_api_key, language, transcriber_language")
      .eq("organization_id", organizationId)
      .single();

    if (settingsError || !settings?.vapi_assistant_id) {
      throw new Error("Assistant not found for this organization");
    }

    const vapiApiKey = settings.vapi_api_key || Deno.env.get("VAPI_API_KEY");

    if (!vapiApiKey) {
      throw new Error("VAPI_API_KEY is not configured");
    }

    console.log("Updating Vapi assistant:", settings.vapi_assistant_id);
    console.log("Updates:", JSON.stringify(updates, null, 2));

    // Get organization details for system prompt
    const { data: org } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", organizationId)
      .single();

    // Build the update payload
    const updatePayload: Record<string, unknown> = {};

    // Handle voice updates - use the voice ID directly (it's the actual ElevenLabs ID)
    if (updates.voice) {
      updatePayload.voice = {
        provider: "11labs",
        voiceId: updates.voice.voiceId,
        model: "eleven_multilingual_v2",
        stability: 0.5,
        similarityBoost: 0.75,
      };
    }

    // Handle transcriber updates
    if (updates.transcriber) {
      updatePayload.transcriber = updates.transcriber;
    }

    // If updating voice/transcriber, also update system prompt to enforce language
    if (updates.transcriber || updates.voice) {
      const language = settings.language || "en-US";
      const languageNames: Record<string, string> = {
        "nl-NL": "Dutch",
        "nl-BE": "Flemish Dutch",
        "en-US": "English",
        "en-GB": "British English",
        "de-DE": "German",
        "fr-FR": "French",
        "es-ES": "Spanish",
        "es-MX": "Mexican Spanish",
        "it-IT": "Italian",
        "pt-BR": "Brazilian Portuguese",
        "pl-PL": "Polish",
        "ja-JP": "Japanese",
        "ko-KR": "Korean",
        "zh-CN": "Mandarin Chinese",
        "tr-TR": "Turkish",
        "ru-RU": "Russian",
        "sv-SE": "Swedish",
        "da-DK": "Danish",
        "no-NO": "Norwegian",
        "fi-FI": "Finnish",
        "ar-SA": "Arabic",
        "hi-IN": "Hindi",
      };

      const languageName = languageNames[language] || "English";

      // Fetch current assistant to get existing model config
      const getResponse = await fetch(
        `https://api.vapi.ai/assistant/${settings.vapi_assistant_id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${vapiApiKey}`,
          },
        }
      );

      if (getResponse.ok) {
        const currentAssistant = await getResponse.json();
        const currentSystemPrompt = currentAssistant.model?.messages?.[0]?.content || "";
        
        // Remove old language instruction if present
        const cleanedPrompt = currentSystemPrompt
          .replace(/\n\nIMPORTANT LANGUAGE INSTRUCTION:[\s\S]*$/, "")
          .trim();

        // Add new language instruction
        const languageInstruction = `

IMPORTANT LANGUAGE INSTRUCTION:
You MUST speak ONLY in ${languageName}. Never switch to English or any other language.
Say all numbers, dates, times, and proper nouns in ${languageName}.
If the caller speaks a different language, politely respond in ${languageName} and ask if they need assistance in that language.`;

        updatePayload.model = {
          ...currentAssistant.model,
          messages: [
            {
              role: "system",
              content: cleanedPrompt + languageInstruction,
            },
          ],
        };
      }
    }

    // Update assistant via PATCH
    const response = await fetch(
      `https://api.vapi.ai/assistant/${settings.vapi_assistant_id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${vapiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatePayload),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Vapi update error:", result);
      throw new Error(result.message || "Failed to update assistant");
    }

    console.log("Assistant updated successfully");

    return new Response(
      JSON.stringify({ success: true, assistant: result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in update-vapi-assistant:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
