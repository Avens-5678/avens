import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const metaToken = Deno.env.get("META_WHATSAPP_TOKEN");
    const phoneNumberId = Deno.env.get("META_PHONE_NUMBER_ID");

    if (!metaToken || !phoneNumberId) {
      return new Response(
        JSON.stringify({ error: "META_WHATSAPP_TOKEN and META_PHONE_NUMBER_ID not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAuth = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsError } = await supabaseAuth.auth.getUser(token);
    if (claimsError || !claims?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin or employee
    const { data: isAdmin } = await supabaseAdmin.rpc("has_role", { _user_id: claims.user.id, _role: "admin" });
    const { data: isEmployee } = await supabaseAdmin.rpc("has_role", { _user_id: claims.user.id, _role: "employee" });

    if (!isAdmin && !isEmployee) {
      return new Response(JSON.stringify({ error: "Access denied" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action, to, message, template_name, template_params, session_id } = body;

    const graphUrl = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;

    if (action === "send_text") {
      // Send free-form text message
      const phone = to.replace(/\D/g, "");
      const response = await fetch(graphUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${metaToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone,
          type: "text",
          text: { body: message },
        }),
      });

      const result = await response.json();

      // Store outbound message in conversations
      if (session_id) {
        await supabaseAdmin.from("whatsapp_conversations").insert({
          session_id,
          phone_number: phone,
          direction: "outbound",
          message_text: message,
          sent_by: isAdmin ? "admin" : "employee",
          admin_user_id: claims.user.id,
        });
      }

      return new Response(JSON.stringify({ success: response.ok, result }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "send_template") {
      // Send template message
      const phone = to.replace(/\D/g, "");
      const components = template_params?.length ? [{
        type: "body",
        parameters: template_params.map((p: string) => ({ type: "text", text: p })),
      }] : [];

      const response = await fetch(graphUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${metaToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone,
          type: "template",
          template: {
            name: template_name,
            language: { code: "en" },
            components,
          },
        }),
      });

      const result = await response.json();

      return new Response(JSON.stringify({ success: response.ok, result }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "resolve_session") {
      // Resolve a human handoff session
      await supabaseAdmin
        .from("whatsapp_sessions")
        .update({ current_flow: "idle", assigned_employee_id: null, assigned_at: null, flow_data: {} })
        .eq("id", session_id);

      await supabaseAdmin
        .from("whatsapp_conversations")
        .update({ is_resolved: true })
        .eq("session_id", session_id);

      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "assign_employee") {
      const { employee_id } = body;
      await supabaseAdmin
        .from("whatsapp_sessions")
        .update({
          assigned_employee_id: employee_id,
          assigned_at: new Date().toISOString(),
          assignment_type: "manual",
        })
        .eq("id", session_id);

      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
