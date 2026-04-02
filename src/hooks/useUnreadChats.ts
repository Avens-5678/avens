import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Conversation {
  id: string;
  vendor_id: string;
  client_id: string | null;
  unread_count_vendor: number;
  unread_count_client: number;
  last_message: string | null;
  title: string | null;
}

/**
 * Returns total unread chat count for the current user (vendor or client perspective).
 * Also subscribes to real-time message inserts and shows a toast notification
 * when a message arrives from someone else.
 */
export const useUnreadChats = (perspective: "vendor" | "client") => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch conversations to sum unread counts
  const { data: conversations = [] } = useQuery({
    queryKey: [perspective === "vendor" ? "chat-conversations" : "client-chat-conversations", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const query = supabase.from("chat_conversations").select("id, vendor_id, client_id, unread_count_vendor, unread_count_client, last_message, title");
      if (perspective === "vendor") {
        query.eq("vendor_id", user!.id);
      } else {
        query.eq("client_id", user!.id).eq("type", "client");
      }
      const { data, error } = await query.order("last_message_at", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data as Conversation[];
    },
  });

  const totalUnread = useMemo(() => {
    return conversations.reduce((sum, c) => {
      return sum + (perspective === "vendor" ? c.unread_count_vendor : c.unread_count_client);
    }, 0);
  }, [conversations, perspective]);

  // Global realtime subscription for new messages (toast notifications)
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("global-chat-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          const msg = payload.new as any;
          // Only notify if message is from someone else
          if (msg.sender_id === user.id) return;
          // Check if this conversation belongs to user
          const conv = conversations.find((c) => c.id === msg.conversation_id);
          if (!conv) {
            // Refetch conversations to pick up new ones
            queryClient.invalidateQueries({ queryKey: [perspective === "vendor" ? "chat-conversations" : "client-chat-conversations"] });
            return;
          }
          // Show toast
          const senderLabel = conv.title || "Someone";
          const preview = msg.message?.slice(0, 60) || "[attachment]";
          toast({
            title: `New message from ${senderLabel}`,
            description: preview,
          });
          // Invalidate to update unread counts
          queryClient.invalidateQueries({ queryKey: [perspective === "vendor" ? "chat-conversations" : "client-chat-conversations"] });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, conversations.length, perspective, queryClient, toast]);

  return totalUnread;
};
