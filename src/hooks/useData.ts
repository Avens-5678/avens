import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Hook for site settings (audio configuration)
export const useSiteSettings = () => {
  return useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .single();
      
      if (error) throw error;
      return data;
    },
  });
};

export const useHeroBanners = () => {
  return useQuery({
    queryKey: ["hero-banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_banners")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};

export const useServices = () => {
  return useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .eq("show_on_home", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};

export const useRentals = () => {
  return useQuery({
    queryKey: ["rentals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rentals")
        .select("*")
        .eq("is_active", true)
        .eq("show_on_home", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};

export const useTrustedClients = () => {
  return useQuery({
    queryKey: ["trusted-clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trusted_clients")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};

export const useNewsAchievements = () => {
  return useQuery({
    queryKey: ["news-achievements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_achievements")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .limit(4);

      if (error) throw error;
      return data;
    },
  });
};

export const useEvents = () => {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;
      return data;
    },
  });
};

export const useEvent = (eventType: string) => {
  return useQuery({
    queryKey: ["event", eventType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("event_type", eventType as any)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!eventType,
  });
};

export const usePortfolio = (eventId?: string) => {
  return useQuery({
    queryKey: ["portfolio", eventId],
    queryFn: async () => {
      let query = supabase
        .from("portfolio")
        .select("*, events(event_type, title)")
        .order("display_order", { ascending: true });

      if (eventId) {
        query = query.eq("event_id", eventId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
};

export const useAwards = () => {
  return useQuery({
    queryKey: ["awards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("awards")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};

export const useAboutContent = () => {
  return useQuery({
    queryKey: ["about-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("about_content")
        .select("*")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });
};

export const useFormSubmissions = () => {
  return useQuery({
    queryKey: ["form-submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("form_submissions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });
};

export const useTeamMembers = () => {
  return useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};

// Admin hooks - fetch all items regardless of show_on_home setting
export const useAllServices = () => {
  return useQuery({
    queryKey: ["all-services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};

export const useAllRentals = () => {
  return useQuery({
    queryKey: ["all-rentals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rentals")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};