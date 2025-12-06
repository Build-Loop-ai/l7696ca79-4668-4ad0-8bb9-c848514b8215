import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { countryCode, areaCode, contains, limit = 10 } = await req.json();

    if (!countryCode) {
      return new Response(
        JSON.stringify({ error: "Country code is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      return new Response(
        JSON.stringify({ error: "Twilio credentials are not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

    // Build search URL for local numbers
    let searchUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/AvailablePhoneNumbers/${countryCode}/Local.json?VoiceEnabled=true&Limit=${limit}`;

    if (areaCode) searchUrl += `&AreaCode=${areaCode}`;
    if (contains) searchUrl += `&Contains=${contains}`;

    console.log("Searching Twilio:", searchUrl);

    let response = await fetch(searchUrl, {
      headers: { Authorization: `Basic ${auth}` },
    });

    let data = await response.json();

    // If no local numbers found, try mobile
    if (!data.available_phone_numbers?.length) {
      const mobileUrl = searchUrl.replace("/Local.json", "/Mobile.json");
      response = await fetch(mobileUrl, {
        headers: { Authorization: `Basic ${auth}` },
      });
      data = await response.json();
    }

    // If still no numbers, try national
    if (!data.available_phone_numbers?.length) {
      const nationalUrl = searchUrl
        .replace("/Local.json", "/National.json")
        .replace("/Mobile.json", "/National.json");
      response = await fetch(nationalUrl, {
        headers: { Authorization: `Basic ${auth}` },
      });
      data = await response.json();
    }

    const numbers = (data.available_phone_numbers || []).map((n: any) => ({
      phoneNumber: n.phone_number,
      friendlyName: n.friendly_name,
      locality: n.locality || null,
      region: n.region || null,
      postalCode: n.postal_code || null,
      isoCountry: n.iso_country,
      capabilities: {
        voice: n.capabilities?.voice || false,
        sms: n.capabilities?.sms || false,
        mms: n.capabilities?.mms || false,
      },
    }));

    return new Response(
      JSON.stringify({
        success: true,
        numbers,
        count: numbers.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Search error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to search numbers",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
