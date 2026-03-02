import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const watiApiKey = Deno.env.get("WATI_API_KEY");
    const watiApiUrl = Deno.env.get("WATI_API_URL");

    // Verify admin auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseAuth = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsError } = await supabaseAuth.auth.getUser(token);
    if (claimsError || !claims?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdmin } = await supabaseAdmin.rpc("has_role", {
      _user_id: claims.user.id,
      _role: "admin",
    });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, vendor_ids } = await req.json();

    if (action === "send_reminder") {
      if (!watiApiKey || !watiApiUrl) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "WATI_API_KEY and WATI_API_URL not configured.",
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // Fetch profiles (Works for clients or vendors based on user_ids passed)
      const { data: profiles, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("user_id, full_name, company_name, phone")
        .in("user_id", vendor_ids || []);

      if (profileError) throw profileError;

      const results: Array<{ vendor: string; phone: string; success: boolean; error?: string }> = [];

      // Send template messages concurrently
      const promises = (profiles || [])
        .filter((v: any) => v.phone)
        .map(async (profile: any) => {
          const profileName = profile.full_name || profile.company_name || "User";
          const phone = profile.phone.replace(/[^0-9]/g, "");

          try {
            const response = await fetch(`${watiApiUrl}/api/v1/sendTemplateMessage/${phone}`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${watiApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                broadcast_name: "vendor_new_request_reminder",
                template_name: "reminder",
                parameters: [{ name: "1", value: profileName }],
              }),
            });

            if (response.ok) {
              results.push({ vendor: profileName, phone, success: true });
            } else {
              const errText = await response.text();
              console.error(`WATI error for ${phone}:`, errText);
              results.push({ vendor: profileName, phone, success: false, error: errText });
            }
          } catch (err) {
            console.error(`Failed to send to ${phone}:`, err);
            results.push({ vendor: profileName, phone, success: false, error: String(err) });
          }
        });

      await Promise.all(promises);

      const successCount = results.filter((r) => r.success).length;

      return new Response(
        JSON.stringify({
          success: true,
          sent: successCount,
          total: results.length,
          results,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
