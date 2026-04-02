import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Send push notification via FCM HTTP v1 API.
 * Also logs to notification_logs for in-app display.
 *
 * Input: {
 *   user_id: string (single recipient) OR user_ids: string[] (multiple),
 *   title: string,
 *   body: string,
 *   type: string,
 *   data?: { link?: string, order_id?: string, ... }
 * }
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate OAuth2 access token from service account JSON
async function getAccessToken(serviceAccount: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = btoa(JSON.stringify({
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }));

  // Import private key and sign JWT
  const pemContent = serviceAccount.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\n/g, "");
  const binaryKey = Uint8Array.from(atob(pemContent), (c) => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    "pkcs8", binaryKey, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]
  );

  const data = new TextEncoder().encode(`${header}.${claim}`);
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, data);
  const sig = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const jwt = `${header}.${claim}.${sig}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const tokenData = await tokenRes.json();
  return tokenData.access_token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const body = await req.json();
    const { user_id, user_ids, title, body: msgBody, type = "system", data = {} } = body;

    if (!title || !msgBody) {
      return new Response(JSON.stringify({ error: "title and body required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const recipients: string[] = user_ids || (user_id ? [user_id] : []);
    if (recipients.length === 0) {
      return new Response(JSON.stringify({ error: "user_id or user_ids required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert notification_logs for all recipients (in-app notifications)
    const logRows = recipients.map((uid) => ({
      user_id: uid, title, body: msgBody, type, data, is_read: false,
    }));
    await supabase.from("notification_logs").insert(logRows as any);

    // Check FCM config
    const projectId = Deno.env.get("FIREBASE_PROJECT_ID");
    const serviceAccountJson = Deno.env.get("FIREBASE_SERVICE_ACCOUNT_JSON");

    if (!projectId || !serviceAccountJson) {
      // No FCM configured — in-app notifications still work via Realtime
      await supabase.from("notification_logs")
        .update({ push_status: "skipped" } as any)
        .in("user_id", recipients)
        .eq("title", title)
        .eq("is_push_sent", false);
      return new Response(JSON.stringify({ success: true, push: "skipped", reason: "FCM not configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get FCM access token
    let accessToken: string;
    try {
      const sa = JSON.parse(serviceAccountJson);
      accessToken = await getAccessToken(sa);
    } catch (authErr) {
      console.error("FCM auth failed:", authErr);
      return new Response(JSON.stringify({ success: true, push: "failed", reason: "FCM auth error" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch tokens for all recipients
    const { data: tokens } = await supabase
      .from("push_notification_tokens")
      .select("id, user_id, token")
      .in("user_id", recipients)
      .eq("is_active", true);

    if (!tokens || tokens.length === 0) {
      return new Response(JSON.stringify({ success: true, push: "no_tokens" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send to each token
    const fcmUrl = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;
    let sentCount = 0;
    let failedCount = 0;
    const invalidTokenIds: string[] = [];

    for (const t of tokens) {
      try {
        const res = await fetch(fcmUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: {
              token: t.token,
              notification: { title, body: msgBody },
              data: {
                type,
                click_action: data.link || "/",
                ...Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
              },
              webpush: {
                fcm_options: { link: data.link || "/" },
              },
            },
          }),
        });

        if (res.ok) {
          sentCount++;
        } else {
          const errBody = await res.json().catch(() => ({}));
          // Token invalid or unregistered — deactivate
          if (res.status === 404 || res.status === 410 ||
              errBody.error?.details?.some((d: any) => d.errorCode === "UNREGISTERED")) {
            invalidTokenIds.push(t.id);
          }
          failedCount++;
        }
      } catch {
        failedCount++;
      }
    }

    // Deactivate invalid tokens
    if (invalidTokenIds.length > 0) {
      await supabase.from("push_notification_tokens")
        .update({ is_active: false } as any)
        .in("id", invalidTokenIds);
    }

    // Update push_status on notification_logs
    const pushStatus = sentCount > 0 ? "sent" : "failed";
    await supabase.from("notification_logs")
      .update({ is_push_sent: sentCount > 0, push_status: pushStatus } as any)
      .in("user_id", recipients)
      .eq("title", title)
      .eq("is_push_sent", false);

    return new Response(
      JSON.stringify({ success: true, push: pushStatus, sent: sentCount, failed: failedCount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("send-push-notification error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
