import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export interface RentalVariant {
  id: string;
  rental_id: string;
  attribute_type: string;
  attribute_value: string;
  price_value: number | null;
  pricing_unit: string;
  stock_quantity: number;
  image_url: string | null;
  image_urls: string[];
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useRentalVariants = (rentalId?: string) => {
  return useQuery({
    queryKey: ["rental_variants", rentalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rental_variants" as any)
        .select("*")
        .eq("rental_id", rentalId!)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data as any[]) as RentalVariant[];
    },
    enabled: !!rentalId,
  });
};

export const useSaveVariants = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      rentalId,
      variants,
    }: {
      rentalId: string;
      variants: Partial<RentalVariant>[];
    }) => {
      // Delete existing variants
      await (supabase.from("rental_variants" as any) as any).delete().eq("rental_id", rentalId);

      if (variants.length === 0) return;

      // Insert new variants
      const rows = variants.map((v, i) => ({
        rental_id: rentalId,
        attribute_type: v.attribute_type || "Size",
        attribute_value: v.attribute_value || "",
        price_value: v.price_value ?? null,
        pricing_unit: v.pricing_unit || "Per Day",
        stock_quantity: v.stock_quantity ?? 1,
        image_url: v.image_url || null,
        image_urls: v.image_urls || [],
        display_order: i,
        is_active: v.is_active !== false,
      }));

      const { error } = await (supabase.from("rental_variants" as any) as any).insert(rows);
      if (error) throw error;
    },
    onSuccess: (_, { rentalId }) => {
      queryClient.invalidateQueries({ queryKey: ["rental_variants", rentalId] });
      queryClient.invalidateQueries({ queryKey: ["rental_variants"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error saving variants",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
