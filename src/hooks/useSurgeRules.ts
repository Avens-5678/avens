import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SurgeRule, SURGE_RULES_QUERY_KEY } from "@/utils/surgeCalculator";

export const useSurgeRules = () => {
  return useQuery({
    queryKey: SURGE_RULES_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("surge_rules")
        .select("*")
        .eq("is_active", true)
        .order("priority", { ascending: false });
      if (error) throw error;
      return data as SurgeRule[];
    },
    staleTime: 5 * 60 * 1000, // Cache 5 min
  });
};
