import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Compresses an image file client-side to max 1024px on longest side.
 * Returns the original file if it's already small enough or not an image.
 */
async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.size <= 5 * 1024 * 1024) return file;

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 1024;
      let { width, height } = img;
      if (width <= MAX && height <= MAX) { resolve(file); return; }
      if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
      else { width = Math.round((width * MAX) / height); height = MAX; }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(new File([blob], file.name, { type: "image/jpeg" }));
          else resolve(file);
        },
        "image/jpeg",
        0.85
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

interface ScanResult {
  blocked: boolean;
  detected_items?: string[];
  reasoning?: string;
  flag_for_review?: boolean;
}

export const useChatImageScan = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [scanning, setScanning] = useState(false);

  /**
   * Upload an image, scan it for contact info, and return the result.
   * Returns { allowed, imageUrl, fileName } — caller decides whether to send.
   */
  const uploadAndScan = useCallback(
    async (
      file: File,
      conversationId: string,
    ): Promise<{ allowed: boolean; imageUrl: string; fileName: string } | null> => {
      const isImage = file.type.startsWith("image/");
      const isScannable = ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type);

      // Compress if needed
      const processedFile = isImage ? await compressImage(file) : file;

      // Upload to storage
      const ext = file.name.split(".").pop();
      const path = `chat/${conversationId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("review-photos")
        .upload(path, processedFile);
      if (uploadError) {
        toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
        return null;
      }
      const { data: urlData } = supabase.storage.from("review-photos").getPublicUrl(path);
      const imageUrl = urlData.publicUrl;

      // Non-image files skip scanning
      if (!isScannable) {
        return { allowed: true, imageUrl, fileName: file.name };
      }

      // Scan image
      setScanning(true);
      try {
        const { data: scanResult, error: scanError } = await supabase.functions.invoke(
          "scan-chat-image",
          {
            body: {
              image_url: imageUrl,
              conversation_id: conversationId,
              sender_id: user?.id,
            },
          }
        );

        if (scanError) {
          // Edge function error — allow through + flag for review
          await logModerationEvent(conversationId, imageUrl, "scan_error", "medium");
          return { allowed: true, imageUrl, fileName: file.name };
        }

        const result = scanResult as ScanResult;

        if (result.flag_for_review) {
          // Timeout or similar — allow through + flag
          await logModerationEvent(conversationId, imageUrl, "OCR scan timed out — needs manual review", "medium");
          return { allowed: true, imageUrl, fileName: file.name };
        }

        if (result.blocked) {
          // Contact info detected — block image
          const detectedStr = (result.detected_items || []).join(", ");
          await logModerationEvent(
            conversationId,
            imageUrl,
            result.reasoning || detectedStr,
            "high",
            result.detected_items
          );
          // Increment violation count
          await incrementViolation();
          toast({
            title: "Image blocked",
            description: "Contact information was detected in this image.",
            variant: "destructive",
          });
          return { allowed: false, imageUrl, fileName: file.name };
        }

        // Clean — allow through
        return { allowed: true, imageUrl, fileName: file.name };
      } catch {
        // Any error — allow through (don't block on failure)
        return { allowed: true, imageUrl, fileName: file.name };
      } finally {
        setScanning(false);
      }
    },
    [user, toast]
  );

  const logModerationEvent = async (
    conversationId: string,
    imageUrl: string,
    reasoning: string,
    severity: string,
    patterns?: string[]
  ) => {
    await supabase.from("chat_moderation_logs").insert({
      conversation_id: conversationId,
      sender_id: user?.id,
      original_content: `[Image: ${imageUrl}]`,
      sanitized_content: "[Image blocked — contained contact information]",
      detection_type: "image_ocr",
      detected_patterns: patterns || ["image_contact_info"],
      severity,
      action_taken: severity === "medium" ? "flagged" : "blocked",
      ai_reasoning: reasoning,
    } as any);
  };

  const incrementViolation = async () => {
    if (!user) return;
    const { data: existing } = await supabase
      .from("chat_violation_counts")
      .select("total_violations, warning_level")
      .eq("user_id", user.id)
      .maybeSingle();

    const count = (existing?.total_violations || 0) + 1;
    let level = "first_warning";
    let restrictionUntil: string | null = null;
    if (count >= 5) level = "suspended";
    else if (count >= 3) {
      level = "restricted";
      restrictionUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    } else if (count >= 2) level = "second_warning";

    await supabase.from("chat_violation_counts").upsert({
      user_id: user.id,
      total_violations: count,
      last_violation_at: new Date().toISOString(),
      warning_level: level,
      restriction_until: restrictionUntil,
      updated_at: new Date().toISOString(),
    } as any, { onConflict: "user_id" });

    queryClient.invalidateQueries({ queryKey: ["chat-violations"] });
  };

  return { uploadAndScan, scanning };
};
