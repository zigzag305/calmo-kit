import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPPORTED_COUNTRIES = [
  "US", "CA", "GB", "ES", "MX", "AR", "CL", "CO",
  "DE", "FR", "IT", "NL", "PT", "AU", "NZ", "JP",
];

interface CheckoutItem {
  id: string;
  sku: string;
  name: string;
  variant?: string;
  /** Unit price in EUR (catalogue base currency). */
  priceEur: number;
  quantity: number;
  image?: string;
}

interface CheckoutPayload {
  items: CheckoutItem[];
  currency?: "USD" | "EUR";
  customer?: {
    name?: string;
    email?: string;
    address?: string;
    city?: string;
    country?: string;
  };
}

const getBaseUrl = (req: Request): string => {
  const origin = req.headers.get("origin");
  if (!origin) return "https://calmokit.eu";
  try {
    return new URL(origin).origin;
  } catch {
    return "https://calmokit.eu";
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: CheckoutPayload = await req.json();
    const { items, currency = "EUR", customer } = body;

    if (!items?.length) {
      return new Response(
        JSON.stringify({ error: "No items provided for checkout" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Catalogue prices are in EUR; convert only when charging in USD.
    const rate = currency === "USD" ? 1.09 : 1;
    const subtotalEur = items.reduce(
      (sum, item) => sum + item.priceEur * item.quantity,
      0
    );
    const shippingEur = subtotalEur >= 69 ? 0 : 5.9;
    const orderRef = `CK-${Math.floor(100000 + Math.random() * 900000)}`;
    const baseUrl = getBaseUrl(req);

    // 1. Create Stripe Checkout Session if STRIPE_SECRET_KEY is configured
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    let stripeSessionId: string | null = null;
    let checkoutUrl: string | null = null;

    if (stripeKey) {
      const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

      const lineItems = items.map((item) => {
        const cleanImg = item.image?.replace(/^\.\//, "/");
        const imageUrl = cleanImg?.startsWith("/")
          ? `${baseUrl}${cleanImg}`
          : item.image;

        return {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: item.variant ? `${item.name} (${item.variant})` : item.name,
              images: imageUrl?.startsWith("http") ? [imageUrl] : [],
              metadata: { sku: item.sku, source_app: "calmo-kit" },
            },
            unit_amount: Math.round(item.priceEur * rate * 100),
          },
          quantity: item.quantity,
        };
      });

      const session = await stripe.checkout.sessions.create({
        line_items: lineItems,
        mode: "payment",
        customer_email: customer?.email || undefined,
        success_url: `${baseUrl}/?checkout=success&ref=${orderRef}`,
        cancel_url: `${baseUrl}/?checkout=cancelled`,
        billing_address_collection: "required",
        shipping_address_collection: {
          allowed_countries: SUPPORTED_COUNTRIES as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[],
        },
        shipping_options: [
          {
            shipping_rate_data: {
              type: "fixed_amount",
              fixed_amount: {
                amount: Math.round(shippingEur * rate * 100),
                currency: currency.toLowerCase(),
              },
              display_name:
                shippingEur === 0
                  ? "Free Tracked Shipping"
                  : "Standard Tracked Shipping",
            },
          },
        ],
        metadata: {
          source_app: "calmo-kit",
          order_ref: orderRef,
        },
      });

      stripeSessionId = session.id;
      checkoutUrl = session.url;
    }

    // 2. Persist order strictly inside isolated `calmo_kit_orders` table (no Auth / no Cuyo Marketing tables touched)
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (supabaseUrl && serviceRoleKey) {
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const { error: dbError } = await supabaseAdmin
        .from("calmo_kit_orders")
        .insert([
          {
            order_ref: orderRef,
            source_app: "calmo-kit",
            stripe_session_id: stripeSessionId,
            status: "pending",
            currency,
            subtotal_cents: Math.round(subtotalEur * rate * 100),
            shipping_cents: Math.round(shippingEur * rate * 100),
            total_cents: Math.round((subtotalEur + shippingEur) * rate * 100),
            customer_name: customer?.name ?? null,
            customer_email: customer?.email ?? "guest@calmokit.eu",
            shipping_address: {
              address: customer?.address ?? "",
              city: customer?.city ?? "",
              country: customer?.country ?? "",
            },
            items,
          },
        ]);

      if (dbError) {
        console.error("calmo_kit_orders insert error:", dbError);
      }
    }

    return new Response(
      JSON.stringify({
        orderRef,
        url: checkoutUrl,
        mode: checkoutUrl ? "stripe" : "order-recorded",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("calmo-create-checkout error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Checkout failed",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
