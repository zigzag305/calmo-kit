import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

/**
 * Isolated Stripe Webhook for CalmoKit (calmokit.eu).
 * Updates ONLY `public.calmo_kit_orders` when Stripe confirms payment.
 * Never touches Supabase Auth or Cuyo Marketing tables.
 */
serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey || !webhookSecret) {
    return new Response("Stripe webhook not configured", { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  const rawBody = await req.text();
  const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      webhookSecret
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.metadata?.source_app !== "calmo-kit") {
      // Ignore events from any other project sharing this Stripe/Supabase account
      return new Response(JSON.stringify({ ignored: true }), { status: 200 });
    }

    const orderRef = session.metadata?.order_ref;
    const { error } = await supabaseAdmin
      .from("calmo_kit_orders")
      .update({
        status: "paid",
        stripe_session_id: session.id,
        customer_email:
          session.customer_details?.email ?? session.customer_email ?? undefined,
        customer_name: session.customer_details?.name ?? undefined,
        shipping_address: session.shipping_details?.address ?? undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("order_ref", orderRef);

    if (error) {
      console.error("Failed to mark calmo_kit_orders paid:", error);
      return new Response("DB update error", { status: 500 });
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
