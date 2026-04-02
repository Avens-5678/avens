import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Unified WhatsApp sender — replaces all WATI functions.
 * Uses Meta WhatsApp Business API directly.
 *
 * Input: {
 *   to: string (phone with country code, e.g. "919876543210"),
 *   template_name: string (Meta-approved template name),
 *   template_params: string[] (ordered parameter values),
 *   language?: string (default "en"),
 *   recipient_name?: string (for logging),
 *   recipient_type?: "customer" | "vendor" | "admin"
 * }
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const body = await req.json();
    const {
      to,
      template_name,
      template_params = [],
      language = "en",
      recipient_name,
      recipient_type = "customer",
    } = body;

    if (!to || !template_name) {
      return new Response(
        JSON.stringify({ success: false, error: "to and template_name required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const PHONE_NUMBER_ID = Deno.env.get("META_PHONE_NUMBER_ID");
    const ACCESS_TOKEN = Deno.env.get("META_WHATSAPP_TOKEN");

    if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
      // Log as failed but don't break the calling flow
      await supabase.from("whatsapp_message_logs").insert({
        template_name,
        recipient_phone: to,
        recipient_name,
        recipient_type,
        parameters: template_params,
        status: "failed",
        error_message: "META_PHONE_NUMBER_ID or META_WHATSAPP_TOKEN not configured",
      } as any);

      return new Response(
        JSON.stringify({ success: false, error: "WhatsApp not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clean phone number
    const cleanPhone = to.replace(/\D/g, "");

    // Build template components
    const components = template_params.length > 0
      ? [{
          type: "body",
          parameters: template_params.map((p: string) => ({ type: "text", text: String(p) })),
        }]
      : [];

    // Send via Meta Graph API
    const graphUrl = `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`;
    const metaResponse = await fetch(graphUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: cleanPhone,
        type: "template",
        template: {
          name: template_name,
          language: { code: language },
          components,
        },
      }),
    });

    const metaResult = await metaResponse.json();
    const messageId = metaResult.messages?.[0]?.id || null;
    const success = metaResponse.ok && !!messageId;

    // Look up template_id for logging
    const { data: templateRow } = await supabase
      .from("whatsapp_templates")
      .select("id")
      .eq("template_name", template_name)
      .maybeSingle();

    // Log to whatsapp_message_logs
    await supabase.from("whatsapp_message_logs").insert({
      template_id: templateRow?.id || null,
      template_name,
      recipient_phone: cleanPhone,
      recipient_name,
      recipient_type,
      parameters: template_params,
      message_type: "template",
      status: success ? "sent" : "failed",
      meta_message_id: messageId,
      error_message: success ? null : JSON.stringify(metaResult.error || metaResult),
    } as any);

    return new Response(
      JSON.stringify({
        success,
        meta_message_id: messageId,
        error: success ? null : metaResult.error?.message || "Unknown error",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("send-whatsapp error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
