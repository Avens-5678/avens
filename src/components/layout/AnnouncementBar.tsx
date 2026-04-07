import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";

const DISMISS_KEY = "evnting_announcement_dismissed";

const AnnouncementBar = () => {
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem(DISMISS_KEY) === "true");

  const { data: settings } = useQuery({
    queryKey: ["announcement-bar"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "announcement_bar")
        .maybeSingle();
      if (error) throw error;
      return data?.value as { text: string; is_active: boolean; bg_color: string; text_color: string } | null;
    },
    staleTime: 5 * 60 * 1000,
  });

  if (dismissed || !settings?.is_active || !settings?.text) return null;

  return (
    <div
      className="relative flex items-center justify-center px-10 py-2 text-center text-sm font-medium"
      style={{ backgroundColor: settings.bg_color, color: settings.text_color }}
    >
      <span className="line-clamp-1">{settings.text}</span>
      <button
        onClick={() => { setDismissed(true); sessionStorage.setItem(DISMISS_KEY, "true"); }}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/10 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default AnnouncementBar;
