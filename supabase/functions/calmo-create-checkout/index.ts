import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { SHIPPING_COUNTRIES } from "../_shared/calmoCatalog.ts";
import { buildCart } from "../_shared/calmoCart.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/** What the browser may send. Prices and names are NOT read from here. */
interface CheckoutPayload {
  items?: unknown;
  lang?: unknown;
  customer?: Record<string, unknown>;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

const str = (v: unknown, max = 200): string =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

/**
 * Stripe redirects back to this origin. Only our own hosts are allowed, so a
 * forged Origin header can't turn our checkout into a redirect to another site.
 */
const ALLOWED_ORIGIN =
  /^https:\/\/((www\.)?calmokit\.eu|([a-z0-9-]+--)?calmokit\.netlify\.app)$|^http:\/\/localhost(:\d+)?$/;
const getBaseUrl = (req: Request): string => {
  const origin = req.headers.get("origin") ?? "";
  return ALLOWED_ORIGIN.test(origin) ? origin : "https://calmokit.eu";
};

const newOrderRef = () =>
  `CK-${crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body: CheckoutPayload = await req.json().catch(() => ({}));
    // 1. Rebuild the cart from the catalog. Anything unknown is rejected.
    const cart = buildCart(body.items);
    if (!cart.ok) return json({ error: cart.error }, 400);
    const { lines, subtotalCents, shippingCents } = cart;

    const customer = body.customer ?? {};
    // Informational only: Stripe collects the real address and only offers
    // ES/PT. Older site builds sent free text here, so don't reject on it.
    const rawCountry = str(customer.country, 40).toUpperCase();
    const country = (SHIPPING_COUNTRIES as readonly string[]).includes(rawCountry)
      ? rawCountry
      : "";
    const email = str(customer.email, 200);
    const lang = str(body.lang, 2);
    const locale = lang === "pt" ? "pt" : lang === "en" ? "en" : "es";

    const orderRef = newOrderRef();
    const baseUrl = getBaseUrl(req);

    // 2. Stripe Checkout Session (always EUR; amounts come from the catalog).
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    let stripeSessionId: string | null = null;
    let checkoutUrl: string | null = null;

    if (stripeKey) {
      const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        locale,
        line_items: lines.map((l) => ({
          price_data: {
            currency: "eur",
            product_data: {
              name: l.variantLabel ? `${l.name} · ${l.variantLabel}` : l.name,
              images: l.image ? [`${baseUrl}${l.image}`] : [],
              metadata: { sku: l.sku, variant_id: l.variantId, source_app: "calmo-kit" },
            },
            unit_amount: l.unitCents,
          },
          quantity: l.quantity,
        })),
        customer_email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : undefined,
        success_url: `${baseUrl}/?checkout=success&ref=${orderRef}`,
        cancel_url: `${baseUrl}/?checkout=cancelled`,
        billing_address_collection: "required",
        // The site offers CALMO10 for a first order; the code is created in Stripe.
        allow_promotion_codes: true,
        shipping_address_collection: {
          allowed_countries: [...SHIPPING_COUNTRIES],
        },
        shipping_options: [
          {
            shipping_rate_data: {
              type: "fixed_amount",
              fixed_amount: { amount: shippingCents, currency: "eur" },
              display_name: shippingCents === 0 ? "Envío gratis" : "Envío estándar",
            },
          },
        ],
        metadata: { source_app: "calmo-kit", order_ref: orderRef },
      });

      stripeSessionId = session.id;
      checkoutUrl = session.url;
    }

    // 3. Record the order in the isolated calmo_kit_orders table.
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (supabaseUrl && serviceRoleKey) {
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const { error: dbError } = await supabaseAdmin.from("calmo_kit_orders").insert([
        {
          order_ref: orderRef,
          source_app: "calmo-kit",
          stripe_session_id: stripeSessionId,
          status: "pending",
          currency: "EUR",
          subtotal_cents: subtotalCents,
          shipping_cents: shippingCents,
          total_cents: subtotalCents + shippingCents,
          customer_name: str(customer.name) || null,
          customer_email: email || "guest@calmokit.eu",
          shipping_address: {
            address: str(customer.address),
            city: str(customer.city, 100),
            country,
          },
          items: lines.map(({ image: _image, ...l }) => l),
        },
      ]);

      if (dbError) console.error("calmo_kit_orders insert error:", dbError);
    }

    return json({
      orderRef,
      url: checkoutUrl,
      mode: checkoutUrl ? "stripe" : "order-recorded",
      totalCents: subtotalCents + shippingCents,
    });
  } catch (error) {
    console.error("calmo-create-checkout error:", error);
    return json({ error: "Checkout failed" }, 500);
  }
});
