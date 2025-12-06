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
    const { organizationId, areaCode, country } = await req.json();

    if (!organizationId) {
      throw new Error("organizationId is required");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get organization and assistant ID
    const { data: settings, error: settingsError } = await supabase
      .from("organization_settings")
      .select("vapi_assistant_id, vapi_api_key")
      .eq("organization_id", organizationId)
      .single();

    if (settingsError) {
      throw new Error(`Failed to get organization settings: ${settingsError.message}`);
    }

    const vapiApiKey = settings?.vapi_api_key || Deno.env.get("VAPI_API_KEY");

    if (!vapiApiKey) {
      throw new Error("VAPI_API_KEY is not configured");
    }

    console.log("Buying phone number for org:", organizationId, "area:", areaCode);

    // Buy phone number from Vapi
    const response = await fetch("https://api.vapi.ai/phone-number", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${vapiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        provider: "vapi",
        areaCode: areaCode?.replace("+", "") || "31",
        // Assign to assistant for inbound calls
        assistantId: settings?.vapi_assistant_id,
        name: `${organizationId}-main`,
      }),
    });

    const phoneNumber = await response.json();

    if (!response.ok || phoneNumber.error) {
      console.error("Vapi phone number error:", phoneNumber);
      throw new Error(phoneNumber.message || phoneNumber.error || "Failed to purchase phone number");
    }

    console.log("Phone number purchased:", phoneNumber.number);

    // Save to database
    const { error: insertError } = await supabase.from("phone_numbers").insert({
      organization_id: organizationId,
      phone_number: phoneNumber.number,
      vapi_phone_id: phoneNumber.id,
      friendly_name: phoneNumber.name || "Main Line",
      is_active: true,
    });

    if (insertError) {
      console.error("Error saving phone number:", insertError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        phoneNumber: phoneNumber.number,
        phoneId: phoneNumber.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in buy-phone-number:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
