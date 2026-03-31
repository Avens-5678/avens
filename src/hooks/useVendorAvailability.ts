import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface VendorAvailabilityEntry {
  id: string;
  vendor_id: string;
  inventory_item_id: string | null;
  date: string;
  is_booked: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useVendorAvailability = (inventoryItemId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["vendor_availability", user?.id, inventoryItemId],
    queryFn: async () => {
      let query = supabase
        .from("vendor_availability")
        .select("*")
        .order("date", { ascending: true });

      if (inventoryItemId) {
        query = query.eq("inventory_item_id", inventoryItemId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as VendorAvailabilityEntry[];
    },
    enabled: !!user,
  });
};

export const useToggleBookedDate = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      date,
      inventoryItemId,
      isBooked,
      notes,
      slot = "full_day",
    }: {
      date: string;
      inventoryItemId?: string;
      isBooked: boolean;
      notes?: string;
      slot?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      if (isBooked) {
        const { error } = await supabase.from("vendor_availability").insert({
          vendor_id: user.id,
          inventory_item_id: inventoryItemId || null,
          date,
          is_booked: true,
          slot,
          notes: notes || null,
        });
        if (error) throw error;
      } else {
        let query = supabase
          .from("vendor_availability")
          .delete()
          .eq("vendor_id", user.id)
          .eq("date", date)
          .eq("slot", slot);

        if (inventoryItemId) {
          query = query.eq("inventory_item_id", inventoryItemId);
        }

        const { error } = await query;
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor_availability"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
