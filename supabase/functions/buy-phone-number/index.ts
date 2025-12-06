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
    const { organizationId, areaCode } = await req.json();

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

    // Get organization name for the phone number label
    const { data: org } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", organizationId)
      .single();

    const vapiApiKey = settings?.vapi_api_key || Deno.env.get("VAPI_API_KEY");

    if (!vapiApiKey) {
      throw new Error("VAPI_API_KEY is not configured");
    }

    console.log("Creating phone number for org:", organizationId);

    // Create a short, descriptive name (max 40 chars)
    const orgName = org?.name || "Main";
    const shortName = orgName.substring(0, 30) + " Line";

    // Create phone number from Vapi using the new API format
    // Vapi now provides free US numbers through their platform
    const response = await fetch("https://api.vapi.ai/phone-number", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${vapiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        provider: "vapi",
        // For Vapi-provided numbers, we create a SIP endpoint
        // Vapi will assign a number when using their free tier
        name: shortName,
        assistantId: settings?.vapi_assistant_id || undefined,
      }),
    });

    const responseText = await response.text();
    let phoneNumber;
    
    try {
      phoneNumber = JSON.parse(responseText);
    } catch {
      console.error("Failed to parse Vapi response:", responseText);
      throw new Error("Invalid response from phone provider");
    }

    if (!response.ok || phoneNumber.error) {
      console.error("Vapi phone number error:", phoneNumber);
      
      // Provide user-friendly error messages
      const errorMsg = phoneNumber.message || phoneNumber.error;
      if (typeof errorMsg === 'string') {
        throw new Error(errorMsg);
      } else if (Array.isArray(errorMsg)) {
        throw new Error(errorMsg.join(", "));
      } else {
        throw new Error("Failed to create phone number. Please try again.");
      }
    }

    // Extract the phone number - Vapi may return it in different formats
    const number = phoneNumber.number || phoneNumber.sipUri || phoneNumber.id;
    
    if (!number) {
      console.error("No number in response:", phoneNumber);
      throw new Error("Phone provider did not return a number");
    }

    console.log("Phone number created:", number);

    // Save to database
    const { error: insertError } = await supabase.from("phone_numbers").insert({
      organization_id: organizationId,
      phone_number: number,
      vapi_phone_id: phoneNumber.id,
      friendly_name: shortName,
      is_active: true,
    });

    if (insertError) {
      console.error("Error saving phone number:", insertError);
      // Don't throw - the number was created successfully in Vapi
    }

    return new Response(
      JSON.stringify({
        success: true,
        phoneNumber: number,
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
