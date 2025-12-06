import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const VAPI_API_KEY = Deno.env.get("VAPI_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumberId, organizationId } = await req.json();

    if (!phoneNumberId) {
      return new Response(
        JSON.stringify({ error: "phoneNumberId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get the phone number record
    const { data: phoneNumber, error: fetchError } = await supabase
      .from("phone_numbers")
      .select("*")
      .eq("id", phoneNumberId)
      .single();

    if (fetchError || !phoneNumber) {
      return new Response(
        JSON.stringify({ error: "Phone number not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify ownership if organizationId provided
    if (organizationId && phoneNumber.organization_id !== organizationId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Delete from Vapi first
    if (phoneNumber.vapi_phone_id && VAPI_API_KEY) {
      try {
        await fetch(`https://api.vapi.ai/phone-number/${phoneNumber.vapi_phone_id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${VAPI_API_KEY}` },
        });
        console.log("Deleted from Vapi:", phoneNumber.vapi_phone_id);
      } catch (vapiError) {
        console.error("Vapi delete error:", vapiError);
      }
    }

    // Release from Twilio if we have a Twilio SID
    if (phoneNumber.twilio_sid && TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
      try {
        const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
        const releaseRes = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/IncomingPhoneNumbers/${phoneNumber.twilio_sid}.json`,
          {
            method: "DELETE",
            headers: { Authorization: `Basic ${auth}` },
          }
        );

        if (!releaseRes.ok && releaseRes.status !== 404) {
          const error = await releaseRes.json();
          console.error("Twilio release error:", error);
        } else {
          console.log("Released from Twilio:", phoneNumber.twilio_sid);
        }
      } catch (twilioError) {
        console.error("Twilio release error:", twilioError);
      }
    }

    // Update database
    const { error: updateError } = await supabase
      .from("phone_numbers")
      .update({
        status: "released",
        released_at: new Date().toISOString(),
        is_active: false,
      })
      .eq("id", phoneNumberId);

    if (updateError) {
      console.error("Database update error:", updateError);
    }

    // Clear organization forwarding info
    await supabase
      .from("organizations")
      .update({
        forwarding_active: false,
      })
      .eq("id", phoneNumber.organization_id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Release error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to release phone number",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
