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

    // Check if user is system admin
    const { data: isAdmin } = await supabaseClient.rpc("is_system_admin", {
      _user_id: user.id,
    });

    if (!isAdmin) {
      throw new Error("Not authorized. Admin access required.");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get all plans
    const { data: plans, error: plansError } = await supabaseAdmin
      .from("plans")
      .select("*")
      .order("sort_order");

    if (plansError) throw plansError;

    const results = [];

    for (const plan of plans || []) {
      console.log(`Syncing plan: ${plan.name}`);

      // Create or update Stripe product
      let product: Stripe.Product;

      if (plan.stripe_product_id) {
        // Update existing product
        product = await stripe.products.update(plan.stripe_product_id, {
          name: plan.name,
          description: plan.description || undefined,
          metadata: {
            plan_id: plan.id,
            plan_slug: plan.slug,
            minutes_included: plan.minutes_included?.toString() || "0",
            phone_numbers_limit: plan.phone_numbers_limit?.toString() || "0",
          },
        });
      } else {
        // Create new product
        product = await stripe.products.create({
          name: plan.name,
          description: plan.description || undefined,
          metadata: {
            plan_id: plan.id,
            plan_slug: plan.slug,
            minutes_included: plan.minutes_included?.toString() || "0",
            phone_numbers_limit: plan.phone_numbers_limit?.toString() || "0",
          },
        });
      }

      // Handle monthly price - check if price changed
      let monthlyPriceId = plan.stripe_price_id_monthly;
      if (plan.price_monthly_cents) {
        let needsNewMonthlyPrice = !monthlyPriceId;
        
        // Check if existing price has different amount
        if (monthlyPriceId) {
          try {
            const existingPrice = await stripe.prices.retrieve(monthlyPriceId);
            if (existingPrice.unit_amount !== plan.price_monthly_cents) {
              console.log(`Monthly price changed for ${plan.name}: ${existingPrice.unit_amount} -> ${plan.price_monthly_cents}`);
              // Archive old price
              await stripe.prices.update(monthlyPriceId, { active: false });
              needsNewMonthlyPrice = true;
            }
          } catch (e) {
            console.log(`Could not retrieve price ${monthlyPriceId}, creating new one`);
            needsNewMonthlyPrice = true;
          }
        }
        
        if (needsNewMonthlyPrice) {
          const price = await stripe.prices.create({
            product: product.id,
            unit_amount: plan.price_monthly_cents,
            currency: "eur",
            recurring: { interval: "month" },
            metadata: { plan_slug: plan.slug, billing_period: "monthly" },
          });
          monthlyPriceId = price.id;
          console.log(`Created new monthly price: ${price.id}`);
        }
      }

      // Handle annual price - check if price changed
      let annualPriceId = plan.stripe_price_id_annual;
      if (plan.price_annual_cents) {
        let needsNewAnnualPrice = !annualPriceId;
        
        // Check if existing price has different amount
        if (annualPriceId) {
          try {
            const existingPrice = await stripe.prices.retrieve(annualPriceId);
            if (existingPrice.unit_amount !== plan.price_annual_cents) {
              console.log(`Annual price changed for ${plan.name}: ${existingPrice.unit_amount} -> ${plan.price_annual_cents}`);
              // Archive old price
              await stripe.prices.update(annualPriceId, { active: false });
              needsNewAnnualPrice = true;
            }
          } catch (e) {
            console.log(`Could not retrieve price ${annualPriceId}, creating new one`);
            needsNewAnnualPrice = true;
          }
        }
        
        if (needsNewAnnualPrice) {
          const price = await stripe.prices.create({
            product: product.id,
            unit_amount: plan.price_annual_cents,
            currency: "eur",
            recurring: { interval: "year" },
            metadata: { plan_slug: plan.slug, billing_period: "annual" },
          });
          annualPriceId = price.id;
          console.log(`Created new annual price: ${price.id}`);
        }
      }

      // Update plan with Stripe IDs
      const { error: updateError } = await supabaseAdmin
        .from("plans")
        .update({
          stripe_product_id: product.id,
          stripe_price_id_monthly: monthlyPriceId,
          stripe_price_id_annual: annualPriceId,
        })
        .eq("id", plan.id);

      if (updateError) {
        console.error(`Error updating plan ${plan.slug}:`, updateError);
      }

      results.push({
        plan: plan.name,
        product_id: product.id,
        monthly_price_id: monthlyPriceId,
        annual_price_id: annualPriceId,
      });
    }

    console.log("Sync complete:", results);

    return new Response(
      JSON.stringify({ success: true, synced: results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error syncing products:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
