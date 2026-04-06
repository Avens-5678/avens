import { PushNotifications } from "@capacitor/push-notifications";
import { Capacitor } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";

export const initPushNotifications = async () => {
  if (!Capacitor.isNativePlatform()) return;

  const permission = await PushNotifications.requestPermissions();
  if (permission.receive !== "granted") return;

  await PushNotifications.register();

  PushNotifications.addListener("registration", async (token) => {
    console.log("Push token:", token.value);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Write to both tables — edge function reads push_notification_tokens
      await supabase.from("push_notification_tokens").upsert({
        user_id: user.id,
        token: token.value,
        platform: Capacitor.getPlatform(),
        is_active: true,
        updated_at: new Date().toISOString(),
      } as any, { onConflict: "user_id,token" }).catch(() => {});
      await supabase.from("device_tokens").upsert({
        user_id: user.id,
        token: token.value,
        platform: Capacitor.getPlatform(),
        updated_at: new Date().toISOString(),
      } as any, { onConflict: "user_id,token" }).catch(() => {});
    }
  });

  PushNotifications.addListener("registrationError", (error) => {
    console.error("Push registration error:", error);
  });

  PushNotifications.addListener("pushNotificationReceived", (notification) => {
    console.log("Push received:", notification);
  });

  PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
    const data = action.notification.data;
    if (data?.link) {
      window.location.href = data.link;
    } else if (data?.type === "order_update" && data?.order_id) {
      window.location.href = `/event/${data.order_id}`;
    } else if (data?.type === "chat_message") {
      window.location.href = "/vendor/dashboard?tab=chat";
    }
  });
};
