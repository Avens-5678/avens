import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AvailabilityResult {
  available: number;
  base: number;
  held: number;
  booked: number;
}

export const useAvailability = (
  rentalId?: string,
  checkIn?: string,
  checkOut?: string,
  slot: string = "full_day"
) => {
  return useQuery({
    queryKey: ["availability", rentalId, checkIn, checkOut, slot],
    queryFn: async (): Promise<AvailabilityResult> => {
      const { data, error } = await supabase.rpc("get_available_inventory", {
        p_rental_id: rentalId!,
        p_check_in: checkIn!,
        p_check_out: checkOut!,
        p_slot: slot,
      });

      if (error) throw error;
      return data as unknown as AvailabilityResult;
    },
    enabled: !!rentalId && !!checkIn && !!checkOut,
    refetchInterval: 30000, // Refresh every 30s for real-time feel
  });
};
