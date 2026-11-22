import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface LeadPayload {
  email: string;
  name?: string;
  message?: string;
  lang?: "en" | "es";
  leadType?: "newsletter" | "contact" | "custom-kit";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: LeadPayload = await req.json();
    const email = body.email?.trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Valid email is required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    // Strictly isolated write to `calmo_kit_leads` (never uses Cuyo Marketing login or tables)
    if (supabaseUrl && serviceRoleKey) {
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const { error: dbError } = await supabaseAdmin
        .from("calmo_kit_leads")
        .insert([
          {
            source_app: "calmo-kit",
            lead_type: body.leadType ?? "newsletter",
            name: body.name?.trim() || null,
            email,
            lang: body.lang ?? "en",
            message: body.message?.trim() || null,
          },
        ]);

      if (dbError) throw dbError;
    }

    // Optional Resend notification if RESEND_API_KEY is configured
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const notifyTo = Deno.env.get("CALMO_NOTIFY_EMAIL");

    if (resendKey) {
      const resend = new Resend(resendKey);
      const fromEmail =
        Deno.env.get("CALMO_FROM_EMAIL") ?? "Calmo Kit <onboarding@resend.dev>";

      if (notifyTo) {
        await resend.emails.send({
          from: fromEmail,
          to: notifyTo,
          subject: `[Calmo Kit] New ${body.leadType ?? "newsletter"} lead`,
          html: `
            <h2>New Calmo Kit Lead (calmokit.eu)</h2>
            <p><strong>Email:</strong> ${email}</p>
            ${body.name ? `<p><strong>Name:</strong> ${body.name}</p>` : ""}
            ${body.message ? `<p><strong>Message:</strong> ${body.message}</p>` : ""}
          `,
        });
      }

      await resend.emails.send({
        from: fromEmail,
        to: email,
        subject:
          body.lang === "es"
            ? "Bienvenido a Calmo Kit — Tu código de 10%: CALMO10"
            : "Welcome to Calmo Kit — Your 10% code: CALMO10",
        html:
          body.lang === "es"
            ? `<h2>Mantén la calma. Está preparado.</h2><p>Gracias por unirte a la lista de preparación de <strong>calmokit.eu</strong>. Usa el código <strong>CALMO10</strong> en tu primer kit.</p>`
            : `<h2>Stay Calm. Stay Ready.</h2><p>Thanks for joining the <strong>calmokit.eu</strong> readiness list. Use code <strong>CALMO10</strong> for 10% off your first kit.</p>`,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("calmo-submit-lead error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Lead submission failed",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
