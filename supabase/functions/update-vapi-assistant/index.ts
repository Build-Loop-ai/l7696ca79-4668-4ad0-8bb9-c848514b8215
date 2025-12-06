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

    const { data: settings, error: settingsError } = await supabase
      .from("organization_settings")
      .select("vapi_assistant_id, vapi_api_key")
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

    // Update assistant via PATCH
    const response = await fetch(
      `https://api.vapi.ai/assistant/${settings.vapi_assistant_id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${vapiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
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
