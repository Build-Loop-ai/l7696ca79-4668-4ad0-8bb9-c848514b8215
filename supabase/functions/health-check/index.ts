import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface IntegrationStatus {
  name: string;
  configured: boolean;
  connected: boolean | null;
  error: string | null;
  secrets: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const results: IntegrationStatus[] = [];

    // Check Vapi
    const vapiApiKey = Deno.env.get("VAPI_API_KEY");
    const vapiPublicKey = Deno.env.get("VAPI_PUBLIC_KEY");
    const vapiStatus: IntegrationStatus = {
      name: "Vapi (Voice AI)",
      configured: !!vapiApiKey,
      connected: null,
      error: null,
      secrets: ["VAPI_API_KEY", "VAPI_PUBLIC_KEY"],
    };
    
    if (vapiApiKey) {
      try {
        const res = await fetch("https://api.vapi.ai/assistant", {
          method: "GET",
          headers: { Authorization: `Bearer ${vapiApiKey}` },
        });
        vapiStatus.connected = res.ok;
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          vapiStatus.error = data.message || `HTTP ${res.status}`;
        }
      } catch (e) {
        vapiStatus.connected = false;
        vapiStatus.error = e instanceof Error ? e.message : "Connection failed";
      }
    }
    results.push(vapiStatus);

    // Check Twilio
    const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioApiKey = Deno.env.get("TWILIO_API_KEY");
    const twilioApiSecret = Deno.env.get("TWILIO_API_SECRET");
    const twilioStatus: IntegrationStatus = {
      name: "Twilio (Phone Numbers)",
      configured: !!(twilioSid && twilioToken),
      connected: null,
      error: null,
      secrets: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_API_KEY", "TWILIO_API_SECRET"],
    };
    
    if (twilioSid && twilioToken) {
      try {
        const auth = btoa(`${twilioSid}:${twilioToken}`);
        const res = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}.json`,
          { headers: { Authorization: `Basic ${auth}` } }
        );
        twilioStatus.connected = res.ok;
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          twilioStatus.error = data.message || `HTTP ${res.status}`;
        }
      } catch (e) {
        twilioStatus.connected = false;
        twilioStatus.error = e instanceof Error ? e.message : "Connection failed";
      }
    }
    
    // Add warning if API key not configured (needed for Vapi import)
    if (!twilioApiKey || !twilioApiSecret) {
      twilioStatus.error = (twilioStatus.error || "") + 
        " Note: TWILIO_API_KEY and TWILIO_API_SECRET are required for Vapi phone number integration.";
    }
    results.push(twilioStatus);

    // Check Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const stripeWebhook = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const stripeStatus: IntegrationStatus = {
      name: "Stripe (Payments)",
      configured: !!stripeKey,
      connected: null,
      error: null,
      secrets: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
    };
    
    if (stripeKey) {
      try {
        const res = await fetch("https://api.stripe.com/v1/customers?limit=1", {
          headers: { Authorization: `Bearer ${stripeKey}` },
        });
        stripeStatus.connected = res.ok;
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          stripeStatus.error = data.error?.message || `HTTP ${res.status}`;
        }
      } catch (e) {
        stripeStatus.connected = false;
        stripeStatus.error = e instanceof Error ? e.message : "Connection failed";
      }
    }
    
    if (!stripeWebhook) {
      stripeStatus.error = (stripeStatus.error || "") + 
        " Warning: STRIPE_WEBHOOK_SECRET not configured. Webhooks will not be verified.";
    }
    results.push(stripeStatus);

    // Check Resend
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const resendStatus: IntegrationStatus = {
      name: "Resend (Email)",
      configured: !!resendKey,
      connected: null,
      error: null,
      secrets: ["RESEND_API_KEY"],
    };
    
    if (resendKey) {
      try {
        const res = await fetch("https://api.resend.com/domains", {
          headers: { Authorization: `Bearer ${resendKey}` },
        });
        resendStatus.connected = res.ok;
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          resendStatus.error = data.message || `HTTP ${res.status}`;
        }
      } catch (e) {
        resendStatus.connected = false;
        resendStatus.error = e instanceof Error ? e.message : "Connection failed";
      }
    }
    results.push(resendStatus);

    // Check Google OAuth
    const googleClientId = Deno.env.get("GOOGLE_CLIENT_ID");
    const googleClientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
    const googleStatus: IntegrationStatus = {
      name: "Google (Calendar)",
      configured: !!(googleClientId && googleClientSecret),
      connected: null, // Can't test OAuth without user flow
      error: null,
      secrets: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
    };
    results.push(googleStatus);

    // Check ElevenLabs
    const elevenLabsKey = Deno.env.get("ELEVENLABS_API_KEY");
    const elevenLabsStatus: IntegrationStatus = {
      name: "ElevenLabs (Voice Synthesis)",
      configured: !!elevenLabsKey,
      connected: null,
      error: null,
      secrets: ["ELEVENLABS_API_KEY"],
    };
    
    if (elevenLabsKey) {
      try {
        const res = await fetch("https://api.elevenlabs.io/v1/voices", {
          headers: { "xi-api-key": elevenLabsKey },
        });
        elevenLabsStatus.connected = res.ok;
        if (!res.ok) {
          elevenLabsStatus.error = `HTTP ${res.status}`;
        }
      } catch (e) {
        elevenLabsStatus.connected = false;
        elevenLabsStatus.error = e instanceof Error ? e.message : "Connection failed";
      }
    }
    results.push(elevenLabsStatus);

    // Summary
    const configured = results.filter(r => r.configured).length;
    const connected = results.filter(r => r.connected === true).length;
    const total = results.length;

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          configured: `${configured}/${total}`,
          connected: `${connected}/${total}`,
          allConfigured: configured === total,
          allConnected: connected === total,
        },
        integrations: results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Health check error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Health check failed",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
