import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useVendorProfile = (vendorId?: string) => {
  return useQuery({
    queryKey: ["vendor-profile", vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, company_name, avatar_url, city")
        .eq("user_id", vendorId!)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000,
  });
};
