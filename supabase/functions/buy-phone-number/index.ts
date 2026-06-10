import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireOrgAccess, unauthorizedResponse } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY");
const TWILIO_API_SECRET = Deno.env.get("TWILIO_API_SECRET");
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

    // Buying a number spends the operator's Twilio balance — require that the
    // caller is a member of this organization (or an internal service call).
    const access = await requireOrgAccess(req, organizationId);
    if (!access.ok) {
      return unauthorizedResponse(access, corsHeaders);
    }

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      return new Response(
        JSON.stringify({ 
          error: "Twilio is not configured. Please add TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in Settings → Backend → Secrets.",
          missing: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN"].filter(k => !Deno.env.get(k))
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

    // Check if org already has an active number that's a real phone number
    const { data: existingNumber } = await supabase
      .from("phone_numbers")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("status", "active")
      .maybeSingle();

    if (existingNumber && existingNumber.phone_number?.startsWith('+')) {
      console.log("Organization already has active number:", existingNumber.phone_number);
      return new Response(
        JSON.stringify({
          success: true,
          phoneNumber: existingNumber.phone_number,
          phoneNumberId: existingNumber.id,
          vapiPhoneId: existingNumber.vapi_phone_id,
          twilioSid: existingNumber.twilio_sid,
          alreadyExists: true,
          connected: !!existingNumber.vapi_phone_id,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if there are already numbers on this Twilio account we can use
    console.log("Checking for existing Twilio numbers...");
    const existingTwilioRes = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/IncomingPhoneNumbers.json`,
      {
        headers: { Authorization: `Basic ${auth}` },
      }
    );
    const existingTwilioData = await existingTwilioRes.json();

    const twilioNumber = existingTwilioData.incoming_phone_numbers?.find(
      (n: any) => n.phone_number && n.capabilities?.voice
    );

    let purchased: any = null;

    if (twilioNumber) {
      // Use existing Twilio number
      console.log("Found existing Twilio number:", twilioNumber.phone_number);
      
      // Update the webhook URL to point to Vapi
      const updateRes = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/IncomingPhoneNumbers/${twilioNumber.sid}.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            VoiceUrl: "https://api.vapi.ai/twilio/inbound",
            VoiceMethod: "POST",
          }).toString(),
        }
      );
      
      if (updateRes.ok) {
        console.log("Updated Twilio number webhook to Vapi");
      }
      
      purchased = twilioNumber;
    } else {
      // No existing number, try to purchase one
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

      purchased = await purchaseRes.json();

      if (purchased.code || purchaseRes.status >= 400) {
        console.error("Twilio purchase error:", purchased);
        throw new Error(
          purchased.message || "Failed to purchase number from Twilio"
        );
      }
    }

    const numberToBuy = purchased.phone_number;
    console.log("Using Twilio number:", numberToBuy, "SID:", purchased.sid);

    // Import to Vapi - handle case where number already exists
    let vapiPhoneId: string | null = null;

    if (VAPI_API_KEY) {
      try {
        // First, check if the number already exists in Vapi
        console.log("Checking if number exists in Vapi...");
        const vapiListRes = await fetch("https://api.vapi.ai/phone-number", {
          headers: {
            Authorization: `Bearer ${VAPI_API_KEY}`,
          },
        });
        
        if (vapiListRes.ok) {
          const vapiNumbers = await vapiListRes.json();
          const existingVapiNumber = vapiNumbers.find(
            (n: any) => n.number === numberToBuy || n.twilioPhoneNumber === numberToBuy
          );
          
          if (existingVapiNumber) {
            vapiPhoneId = existingVapiNumber.id;
            console.log("Found existing Vapi number:", vapiPhoneId);
          }
        }

        // If not found, import it
        if (!vapiPhoneId) {
          console.log("Importing number to Vapi...");
          
          // Build the import payload - use API Key/Secret if available, fallback to Auth Token
          const importPayload: Record<string, string> = {
            provider: "twilio",
            number: numberToBuy,
            twilioAccountSid: TWILIO_ACCOUNT_SID!,
          };
          
          if (TWILIO_API_KEY && TWILIO_API_SECRET) {
            // Preferred: Use API Key authentication (required by Vapi)
            importPayload.twilioApiKey = TWILIO_API_KEY;
            importPayload.twilioApiSecret = TWILIO_API_SECRET;
            console.log("Using Twilio API Key authentication for Vapi import");
          } else if (TWILIO_AUTH_TOKEN) {
            // Fallback: Try Auth Token (may not work with all Vapi configurations)
            importPayload.twilioAuthToken = TWILIO_AUTH_TOKEN;
            console.log("Using Twilio Auth Token authentication for Vapi import (fallback)");
          }
          
          const vapiRes = await fetch("https://api.vapi.ai/phone-number", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${VAPI_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(importPayload),
          });

          const vapiNumber = await vapiRes.json();

          if (vapiRes.ok && vapiNumber.id) {
            vapiPhoneId = vapiNumber.id;
            console.log("Imported to Vapi:", vapiPhoneId);
          } else {
            console.error("Vapi import failed:", vapiNumber);
            // Check if it's a duplicate error
            if (vapiNumber.message?.includes("Existing Phone Number")) {
              // Extract the ID from the error message if possible
              const match = vapiNumber.message.match(/Existing Phone Number ([a-f0-9-]+)/);
              if (match) {
                vapiPhoneId = match[1];
                console.log("Extracted existing Vapi phone ID:", vapiPhoneId);
              }
            }
          }
        }

        // Assign assistant to the Vapi number
        if (vapiPhoneId) {
          const { data: orgSettings } = await supabase
            .from("organization_settings")
            .select("vapi_assistant_id")
            .eq("organization_id", organizationId)
            .maybeSingle();

          if (orgSettings?.vapi_assistant_id) {
            console.log("Assigning assistant to phone number...");
            const patchRes = await fetch(`https://api.vapi.ai/phone-number/${vapiPhoneId}`, {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${VAPI_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                assistantId: orgSettings.vapi_assistant_id,
              }),
            });
            
            if (patchRes.ok) {
              console.log("Successfully assigned assistant:", orgSettings.vapi_assistant_id);
            } else {
              const patchError = await patchRes.json();
              console.error("Failed to assign assistant:", patchError);
            }
          } else {
            console.log("No assistant configured for organization");
          }
        }
      } catch (vapiError) {
        console.error("Vapi integration error:", vapiError);
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

    // Mark any existing invalid entries as replaced
    if (existingNumber) {
      await supabase
        .from("phone_numbers")
        .update({ status: "replaced", is_active: false })
        .eq("id", existingNumber.id);
    }

    // Save to database (without is_primary which doesn't exist)
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
        is_active: true,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to save phone number to database");
    }

    console.log("Successfully saved phone number:", savedNumber?.id);

    return new Response(
      JSON.stringify({
        success: true,
        phoneNumber: numberToBuy,
        phoneNumberId: savedNumber?.id,
        twilioSid: purchased.sid,
        vapiPhoneId,
        connected: !!vapiPhoneId,
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
