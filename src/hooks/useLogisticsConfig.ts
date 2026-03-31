import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { TransportTier } from "@/utils/pricingUtils";

export interface LogisticsConfig {
  id: string;
  markup_percent: number;
  labor_units_per_loader: number;
  loader_daily_rate: number;
  min_booking_hours: number;
}

export const useLogisticsConfig = () => {
  return useQuery({
    queryKey: ["logistics_config"],
    queryFn: async () => {
      const { data, error } = await (supabase.from("logistics_config" as any) as any)
        .select("*")
        .limit(1)
        .single();
      if (error) throw error;
      return data as LogisticsConfig;
    },
  });
};

export const useTransportTiers = () => {
  return useQuery({
    queryKey: ["transport_tiers"],
    queryFn: async () => {
      const { data, error } = await (supabase.from("transport_tiers" as any) as any)
        .select("*")
        .order("min_km");
      if (error) throw error;
      return (data || []) as TransportTier[];
    },
  });
};
