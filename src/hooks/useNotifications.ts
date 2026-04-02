import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  data: any;
  is_read: boolean;
  created_at: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notification_logs")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data as Notification[];
    },
    refetchInterval: 60000, // Refresh every minute as backup
  });

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  );

  // Realtime subscription for new notifications
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("user-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notification_logs",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const n = payload.new as Notification;
          queryClient.setQueryData<Notification[]>(
            ["notifications", user.id],
            (old) => (old ? [n, ...old].slice(0, 30) : [n])
          );
          toast({ title: n.title, description: n.body });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, queryClient, toast]);

  const markAsRead = async (id: string) => {
    await supabase.from("notification_logs").update({ is_read: true } as any).eq("id", id);
    queryClient.setQueryData<Notification[]>(
      ["notifications", user?.id],
      (old) => old?.map((n) => (n.id === id ? { ...n, is_read: true } : n)) || []
    );
  };

  const markAllAsRead = async () => {
    await supabase.from("notification_logs")
      .update({ is_read: true } as any)
      .eq("user_id", user!.id)
      .eq("is_read", false);
    queryClient.setQueryData<Notification[]>(
      ["notifications", user?.id],
      (old) => old?.map((n) => ({ ...n, is_read: true })) || []
    );
  };

  return { notifications, unreadCount, markAsRead, markAllAsRead };
};
