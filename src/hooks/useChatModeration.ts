import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { filterChatContent, FilterResult } from "@/utils/chatContentFilter";

type WarningLevel = "none" | "first_warning" | "second_warning" | "restricted" | "suspended";

const WARNING_MESSAGES: Record<WarningLevel, string | null> = {
  none: null,
  first_warning: "Reminder: Contact sharing is not allowed on Evnting. All bookings are protected through the platform.",
  second_warning: "Second warning — continued violations may restrict your chat access.",
  restricted: "Your chat has been temporarily restricted due to repeated violations.",
  suspended: "Your chat access has been suspended. Please contact support.",
};

/**
 * Hook providing chat moderation: content filtering, violation tracking,
 * warning banners, and restriction enforcement.
 */
export const useChatModeration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current user's violation status
  const { data: violationData } = useQuery({
    queryKey: ["chat-violations", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_violation_counts")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as {
        id: string;
        user_id: string;
        total_violations: number;
        warning_level: WarningLevel;
        restriction_until: string | null;
      } | null;
    },
    staleTime: 30 * 1000,
  });

  const warningLevel: WarningLevel = violationData?.warning_level || "none";
  const warningMessage = WARNING_MESSAGES[warningLevel];

  // Check if currently restricted
  const isRestricted = warningLevel === "restricted" &&
    violationData?.restriction_until &&
    new Date(violationData.restriction_until) > new Date();
  const isSuspended = warningLevel === "suspended";
  const canSend = !isRestricted && !isSuspended;

  // Log a moderation event and increment violations
  const logViolation = useCallback(async (
    conversationId: string,
    messageId: string | null,
    original: string,
    sanitized: string,
    filterResult: FilterResult,
  ) => {
    if (!user) return;

    // Insert moderation log
    await supabase.from("chat_moderation_logs").insert({
      message_id: messageId,
      conversation_id: conversationId,
      sender_id: user.id,
      original_content: original,
      sanitized_content: sanitized,
      detection_type: "regex",
      detected_patterns: filterResult.detected,
      severity: filterResult.severity,
      action_taken: "masked",
    } as any);

    // Upsert violation count
    const currentCount = violationData?.total_violations || 0;
    const newCount = currentCount + 1;
    let newLevel: WarningLevel = "none";
    let restrictionUntil: string | null = null;

    if (newCount >= 5) newLevel = "suspended";
    else if (newCount >= 3) {
      newLevel = "restricted";
      restrictionUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    }
    else if (newCount >= 2) newLevel = "second_warning";
    else if (newCount >= 1) newLevel = "first_warning";

    await supabase.from("chat_violation_counts").upsert({
      user_id: user.id,
      total_violations: newCount,
      last_violation_at: new Date().toISOString(),
      warning_level: newLevel,
      restriction_until: restrictionUntil,
      updated_at: new Date().toISOString(),
    } as any, { onConflict: "user_id" });

    queryClient.invalidateQueries({ queryKey: ["chat-violations"] });

    // Show warning toast based on new level
    if (newLevel === "first_warning") {
      toast({ title: "Contact sharing not allowed", description: "All communication happens through Evnting." });
    } else if (newLevel === "second_warning") {
      toast({ title: "Second warning", description: "Continued violations may restrict your account.", variant: "destructive" });
    } else if (newLevel === "restricted") {
      toast({ title: "Chat restricted", description: "Your chat has been restricted for 24 hours.", variant: "destructive" });
    } else if (newLevel === "suspended") {
      toast({ title: "Chat suspended", description: "Your chat access has been suspended. Contact support.", variant: "destructive" });
    }
  }, [user, violationData, queryClient, toast]);

  // Fire async AI moderation for suspicious messages
  const checkWithAI = useCallback(async (conversationId: string, messageId: string, text: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("moderate-chat-message", {
        body: { message_text: text, conversation_id: conversationId, message_id: messageId },
      });
      if (error || !data) return;
      if (data.blocked && data.message_id) {
        // AI flagged it — retroactively mask in DB
        const mask = "[Contact info hidden — all communication happens through Evnting]";
        await supabase.from("chat_messages").update({ message: mask } as any).eq("id", data.message_id);
        // Log
        await supabase.from("chat_moderation_logs").insert({
          message_id: data.message_id,
          conversation_id: conversationId,
          sender_id: user?.id,
          original_content: text,
          sanitized_content: mask,
          detection_type: "ai",
          detected_patterns: [data.violation_type || "ai_flagged"],
          severity: "high",
          action_taken: "flagged",
          ai_reasoning: data.reasoning || null,
        } as any);
        // Increment violations
        const currentCount = violationData?.total_violations || 0;
        await supabase.from("chat_violation_counts").upsert({
          user_id: user!.id,
          total_violations: currentCount + 1,
          last_violation_at: new Date().toISOString(),
          warning_level: currentCount + 1 >= 3 ? "restricted" : currentCount + 1 >= 2 ? "second_warning" : "first_warning",
          updated_at: new Date().toISOString(),
        } as any, { onConflict: "user_id" });
        queryClient.invalidateQueries({ queryKey: ["chat-violations"] });
        queryClient.invalidateQueries({ queryKey: ["chat-messages"] });
      }
    } catch {
      // AI moderation is best-effort, don't block the user
    }
  }, [user, violationData, queryClient]);

  /**
   * Process a message through the filter before sending.
   * Returns { text, wasFiltered } — use text for the DB insert.
   */
  const processMessage = useCallback((
    text: string,
    conversationId: string,
  ): { text: string; wasFiltered: boolean; isSuspicious: boolean } => {
    const result = filterChatContent(text);

    if (result.shouldFlag) {
      // Log async (don't await — don't block send)
      logViolation(conversationId, null, text, result.sanitized, result);
      return { text: result.sanitized, wasFiltered: true, isSuspicious: false };
    }

    return { text: text.trim(), wasFiltered: false, isSuspicious: result.isSuspicious };
  }, [logViolation]);

  return {
    processMessage,
    checkWithAI,
    canSend,
    isRestricted,
    isSuspended,
    warningLevel,
    warningMessage,
    violationCount: violationData?.total_violations || 0,
  };
};
