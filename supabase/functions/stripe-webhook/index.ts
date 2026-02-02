import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");

if (!STRIPE_SECRET_KEY) {
  console.error("STRIPE_SECRET_KEY is not configured");
}

const stripe = new Stripe(STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  // Check if Stripe is configured
  if (!STRIPE_SECRET_KEY) {
    console.error("Stripe webhook called but STRIPE_SECRET_KEY is not configured");
    return new Response(
      JSON.stringify({ error: "Stripe is not configured" }),
      { status: 503 }
    );
  }

  const signature = req.headers.get("Stripe-Signature");
  const body = await req.text();
  
  let event: Stripe.Event;

  try {
    // Verify webhook signature if webhook secret is set
    if (STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(body, signature!, STRIPE_WEBHOOK_SECRET);
    } else {
      console.warn("STRIPE_WEBHOOK_SECRET is not configured - webhook signatures are not being verified!");
      event = JSON.parse(body);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return new Response(JSON.stringify({ error: message }), { status: 400 });
  }

  console.log("Received Stripe event:", event.type);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error processing webhook:", message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
});

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const organizationId = session.metadata?.organization_id;
  const planSlug = session.metadata?.plan_slug;

  if (!organizationId || !planSlug) {
    console.error("Missing metadata in checkout session");
    return;
  }

  // Get the subscription from Stripe
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

  // Get plan details
  const { data: plan } = await supabaseAdmin
    .from("plans")
    .select("*")
    .eq("slug", planSlug)
    .single();

  // Update or create subscription in database
  const { error } = await supabaseAdmin
    .from("subscriptions")
    .upsert({
      organization_id: organizationId,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscription.id,
      plan: planSlug as "starter" | "growth" | "enterprise",
      status: "active",
      minutes_included: plan?.minutes_included || 100,
      minutes_used: 0,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    }, {
      onConflict: "organization_id",
    });

  if (error) {
    console.error("Error updating subscription:", error);
    throw error;
  }

  console.log(`Subscription activated for org ${organizationId} on plan ${planSlug}`);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
  
  const { error } = await supabaseAdmin
    .from("subscriptions")
    .update({
      status: "active",
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      minutes_used: 0, // Reset usage on new period
    })
    .eq("stripe_subscription_id", invoice.subscription);

  if (error) {
    console.error("Error updating subscription on invoice paid:", error);
  }

  console.log(`Invoice paid for subscription ${invoice.subscription}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  const { error } = await supabaseAdmin
    .from("subscriptions")
    .update({ status: "past_due" })
    .eq("stripe_subscription_id", invoice.subscription);

  if (error) {
    console.error("Error updating subscription on payment failed:", error);
  }

  console.log(`Payment failed for subscription ${invoice.subscription}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const status = subscription.status === "active" ? "active" 
    : subscription.status === "past_due" ? "past_due"
    : subscription.status === "trialing" ? "trialing"
    : "canceled";

  const { error } = await supabaseAdmin
    .from("subscriptions")
    .update({
      status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id);

  if (error) {
    console.error("Error updating subscription:", error);
  }

  console.log(`Subscription ${subscription.id} updated to status ${status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const { error } = await supabaseAdmin
    .from("subscriptions")
    .update({ status: "canceled" })
    .eq("stripe_subscription_id", subscription.id);

  if (error) {
    console.error("Error marking subscription as canceled:", error);
  }

  console.log(`Subscription ${subscription.id} canceled`);
}
