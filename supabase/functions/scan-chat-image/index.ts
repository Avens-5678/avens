import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { image_url, conversation_id, sender_id } = await req.json();
    if (!image_url) {
      return new Response(
        JSON.stringify({ error: "image_url required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      // No API key — allow through but flag for manual review
      return new Response(
        JSON.stringify({ blocked: false, reason: "no_api_key" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch image and convert to base64
    let base64Data: string;
    let mediaType: string;

    try {
      const imageResponse = await fetch(image_url);
      if (!imageResponse.ok) {
        return new Response(
          JSON.stringify({ blocked: false, reason: "fetch_failed" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
      // Only scan images, not PDFs/docs
      if (!contentType.startsWith("image/")) {
        return new Response(
          JSON.stringify({ blocked: false, reason: "not_image" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      mediaType = contentType.split(";")[0].trim();
      // Supported: image/jpeg, image/png, image/webp, image/gif
      if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(mediaType)) {
        return new Response(
          JSON.stringify({ blocked: false, reason: "unsupported_type" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const arrayBuffer = await imageResponse.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // Check size — skip if > 10MB (Claude limit)
      if (bytes.length > 10 * 1024 * 1024) {
        return new Response(
          JSON.stringify({ blocked: false, reason: "too_large" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Convert to base64
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      base64Data = btoa(binary);
    } catch {
      return new Response(
        JSON.stringify({ blocked: false, reason: "image_processing_error" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call Claude Vision API
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 14000); // 14s timeout

    let claudeResult: any;
    try {
      const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 500,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: mediaType,
                    data: base64Data,
                  },
                },
                {
                  type: "text",
                  text: `Analyze this image for contact information that could be used to bypass a marketplace platform. Look for:
- Phone numbers (Indian or international)
- Email addresses
- Social media handles (@username, Instagram, Facebook, etc.)
- UPI IDs or payment QR codes
- Website URLs
- Business cards
- Handwritten numbers or text containing contact details
- WhatsApp/Telegram links or QR codes
- Bank account details

Respond with JSON only, no other text:
{
  "contains_contact_info": boolean,
  "detected_items": ["description of each item found"],
  "confidence": 0.0 to 1.0,
  "reasoning": "brief explanation"
}`,
                },
              ],
            },
          ],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!claudeResponse.ok) {
        // Claude API error — allow through + flag
        return new Response(
          JSON.stringify({ blocked: false, reason: "api_error", status: claudeResponse.status }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const claudeData = await claudeResponse.json();
      const textContent = claudeData.content?.[0]?.text || "";

      // Parse JSON from response (handle markdown code blocks)
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return new Response(
          JSON.stringify({ blocked: false, reason: "parse_error" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      claudeResult = JSON.parse(jsonMatch[0]);
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === "AbortError") {
        // Timeout — allow through but flag for manual review
        return new Response(
          JSON.stringify({
            blocked: false,
            reason: "timeout",
            flag_for_review: true,
            conversation_id,
            sender_id,
            image_url,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ blocked: false, reason: "api_exception" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Evaluate result
    const isViolation =
      claudeResult.contains_contact_info === true &&
      (claudeResult.confidence || 0) > 0.7;

    return new Response(
      JSON.stringify({
        blocked: isViolation,
        contains_contact_info: claudeResult.contains_contact_info,
        detected_items: claudeResult.detected_items || [],
        confidence: claudeResult.confidence || 0,
        reasoning: claudeResult.reasoning || "",
        conversation_id,
        sender_id,
        image_url,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message, blocked: false }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
