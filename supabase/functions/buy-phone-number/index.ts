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
    const { organizationId, countryCode, areaCode, phoneNumber } = await req.json();

    if (!organizationId) {
      throw new Error("organizationId is required");
    }

    if (!countryCode) {
      throw new Error("countryCode is required");
    }

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      throw new Error("Twilio credentials are not configured");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

    // Check if org already has an active number
    const { data: existingNumber } = await supabase
      .from("phone_numbers")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("status", "active")
      .maybeSingle();

    if (existingNumber && existingNumber.phone_number.match(/^\+?[\d\s\-()]+$/)) {
      return new Response(
        JSON.stringify({
          success: true,
          phoneNumber: existingNumber.phone_number,
          phoneNumberId: existingNumber.id,
          alreadyExists: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If no specific number provided, search for one
    let numberToBuy = phoneNumber;

    if (!numberToBuy) {
      let searchUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/AvailablePhoneNumbers/${countryCode}/Local.json?VoiceEnabled=true&Limit=1`;
      if (areaCode) searchUrl += `&AreaCode=${areaCode}`;

      console.log("Searching for numbers:", searchUrl);

      const searchRes = await fetch(searchUrl, {
        headers: { Authorization: `Basic ${auth}` },
      });
      const searchData = await searchRes.json();

      if (!searchData.available_phone_numbers?.length) {
        // Try mobile
        const mobileUrl = searchUrl.replace("/Local.json", "/Mobile.json");
        const mobileRes = await fetch(mobileUrl, {
          headers: { Authorization: `Basic ${auth}` },
        });
        const mobileData = await mobileRes.json();

        if (!mobileData.available_phone_numbers?.length) {
          throw new Error(
            "No phone numbers available in this region. Try a different area code or country."
          );
        }

        numberToBuy = mobileData.available_phone_numbers[0].phone_number;
      } else {
        numberToBuy = searchData.available_phone_numbers[0].phone_number;
      }
    }

    console.log("Purchasing number:", numberToBuy);

    // Build purchase parameters
    const purchaseParams = new URLSearchParams({
      PhoneNumber: numberToBuy,
      VoiceUrl: "https://api.vapi.ai/twilio/inbound",
      VoiceMethod: "POST",
    });

    // Purchase from Twilio
    const purchaseRes = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/IncomingPhoneNumbers.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: purchaseParams.toString(),
      }
    );

    const purchased = await purchaseRes.json();

    if (purchased.code || purchaseRes.status >= 400) {
      console.error("Twilio purchase error:", purchased);
      throw new Error(
        purchased.message || "Failed to purchase number from Twilio"
      );
    }

    console.log("Purchased from Twilio:", purchased.sid);

    // Import to Vapi
    let vapiPhoneId: string | null = null;

    if (VAPI_API_KEY) {
      try {
        const vapiRes = await fetch("https://api.vapi.ai/phone-number", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${VAPI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            provider: "twilio",
            number: numberToBuy,
            twilioAccountSid: TWILIO_ACCOUNT_SID,
            twilioAuthToken: TWILIO_AUTH_TOKEN,
          }),
        });

        const vapiNumber = await vapiRes.json();

        if (vapiRes.ok && vapiNumber.id) {
          vapiPhoneId = vapiNumber.id;
          console.log("Imported to Vapi:", vapiPhoneId);

          // Get assistant ID and assign
          const { data: orgSettings } = await supabase
            .from("organization_settings")
            .select("vapi_assistant_id")
            .eq("organization_id", organizationId)
            .maybeSingle();

          if (orgSettings?.vapi_assistant_id) {
            await fetch(`https://api.vapi.ai/phone-number/${vapiPhoneId}`, {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${VAPI_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                assistantId: orgSettings.vapi_assistant_id,
              }),
            });
            console.log("Assigned assistant:", orgSettings.vapi_assistant_id);
          }
        } else {
          console.error("Vapi import failed:", vapiNumber);
        }
      } catch (vapiError) {
        console.error("Vapi import error:", vapiError);
      }
    }

    // Get organization name for friendly name
    const { data: org } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", organizationId)
      .maybeSingle();

    const orgName = org?.name || "Main";
    const friendlyName = orgName.substring(0, 30) + " Line";

    // Delete any existing web-only endpoints
    if (existingNumber) {
      await supabase
        .from("phone_numbers")
        .update({ status: "replaced" })
        .eq("id", existingNumber.id);
    }

    // Save to database
    const { data: savedNumber, error: dbError } = await supabase
      .from("phone_numbers")
      .insert({
        organization_id: organizationId,
        phone_number: numberToBuy,
        friendly_name: friendlyName,
        country_code: countryCode,
        number_type: "local",
        twilio_sid: purchased.sid,
        vapi_phone_id: vapiPhoneId,
        status: "active",
        is_primary: true,
        is_active: true,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        phoneNumber: numberToBuy,
        phoneNumberId: savedNumber?.id,
        twilioSid: purchased.sid,
        vapiPhoneId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in buy-phone-number:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
