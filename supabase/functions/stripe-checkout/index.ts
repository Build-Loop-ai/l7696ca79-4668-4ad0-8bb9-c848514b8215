import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error("Not authenticated");
    }

    const { planSlug, billingPeriod = "monthly" } = await req.json();

    // Get user's profile and organization
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    if (!profile?.organization_id) {
      throw new Error("No organization found");
    }

    // Get the plan
    const { data: plan, error: planError } = await supabaseClient
      .from("plans")
      .select("*")
      .eq("slug", planSlug)
      .eq("is_active", true)
      .single();

    if (planError || !plan) {
      throw new Error("Plan not found");
    }

    const priceId = billingPeriod === "annual" 
      ? plan.stripe_price_id_annual 
      : plan.stripe_price_id_monthly;

    if (!priceId) {
      throw new Error("Plan not synced with Stripe. Please contact support.");
    }

    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    if (!STRIPE_SECRET_KEY) {
      throw new Error("Payments not configured. Add STRIPE_SECRET_KEY in Settings → Backend → Secrets.");
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });

    // Check if organization already has a Stripe customer
    const { data: subscription } = await supabaseClient
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("organization_id", profile.organization_id)
      .single();

    let customerId = subscription?.stripe_customer_id;

    // Create customer if not exists
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          organization_id: profile.organization_id,
          user_id: user.id,
        },
      });
      customerId = customer.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/dashboard/settings?tab=billing&success=true`,
      cancel_url: `${req.headers.get("origin")}/dashboard/settings?tab=billing&canceled=true`,
      metadata: {
        organization_id: profile.organization_id,
        plan_slug: planSlug,
        billing_period: billingPeriod,
      },
    });

    console.log("Created checkout session:", session.id);

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error creating checkout session:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
