import { supabase } from "@/integrations/supabase/client";

export const notifyUser = async (
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>
) => {
  try {
    await supabase.functions.invoke("send-push-notification", {
      body: { user_id: userId, title, body, data },
    });
  } catch (error) {
    console.error("Push notification failed:", error);
  }
};
