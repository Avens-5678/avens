import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";
import { syncInventoryToZoho } from "@/utils/zohoSync";

export interface VendorInventoryItem {
  id: string;
  vendor_id: string;
  name: string;
  description: string | null;
  short_description: string | null;
  quantity: number;
  price_per_day: number | null;
  price_value: number | null;
  pricing_unit: string | null;
  has_variants: boolean | null;
  image_url: string | null;
  image_urls: string[] | null;
  categories: string[] | null;
  search_keywords: string | null;
  display_order: number | null;
  is_available: boolean;
  address: string | null;
  service_type: string;
  amenities: string[] | null;
  guest_capacity: string | null;
  experience_level: string | null;
  created_at: string;
  updated_at: string;
}

export interface VendorInventoryInsert {
  name: string;
  description?: string;
  short_description?: string;
  quantity?: number;
  price_per_day?: number;
  price_value?: number;
  pricing_unit?: string;
  has_variants?: boolean;
  image_url?: string;
  image_urls?: string[];
  categories?: string[];
  search_keywords?: string;
  display_order?: number;
  is_available?: boolean;
  address?: string;
  service_type?: string;
  amenities?: string[];
  guest_capacity?: string;
  experience_level?: string;
}

// Fetch vendor's own inventory
export const useVendorInventory = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["vendor_inventory", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendor_inventory")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as VendorInventoryItem[];
    },
    enabled: !!user,
  });
};

// Fetch all available inventory (marketplace view)
export const useMarketplaceInventory = () => {
  return useQuery({
    queryKey: ["marketplace_inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendor_inventory")
        .select("*")
        .eq("is_available", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as VendorInventoryItem[];
    },
  });
};

// Create inventory item
export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: VendorInventoryInsert) => {
      if (!user) throw new Error("Not authenticated");

      const { data: result, error } = await supabase
        .from("vendor_inventory")
        .insert({
          ...data,
          vendor_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["vendor_inventory"] });
      toast({
        title: "Item Added",
        description: "Inventory item has been added successfully.",
      });
      // Sync to Zoho CRM
      syncInventoryToZoho('create', result);
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

// Update inventory item
export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<VendorInventoryItem> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("vendor_inventory")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["vendor_inventory"] });
      toast({
        title: "Item Updated",
        description: "Inventory item has been updated.",
      });
      // Sync to Zoho CRM
      syncInventoryToZoho('update', result);
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

// Delete inventory item
export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("vendor_inventory")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor_inventory"] });
      toast({
        title: "Item Deleted",
        description: "Inventory item has been removed.",
      });
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

// Toggle availability
export const useToggleAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_available }: { id: string; is_available: boolean }) => {
      const { data, error } = await supabase
        .from("vendor_inventory")
        .update({ is_available })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor_inventory"] });
    },
  });
};

// Vendor inventory variants hooks
export interface VendorInventoryVariant {
  id: string;
  inventory_item_id: string;
  attribute_type: string;
  attribute_value: string;
  price_value: number | null;
  pricing_unit: string | null;
  stock_quantity: number | null;
  image_url: string | null;
  image_urls: string[] | null;
  display_order: number | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export const useVendorInventoryVariants = (itemId?: string) => {
  return useQuery({
    queryKey: ["vendor_inventory_variants", itemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendor_inventory_variants" as any)
        .select("*")
        .eq("inventory_item_id", itemId!)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data as any[]) as VendorInventoryVariant[];
    },
    enabled: !!itemId,
  });
};

export const useSaveVendorVariants = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      itemId,
      variants,
    }: {
      itemId: string;
      variants: Partial<VendorInventoryVariant>[];
    }) => {
      // Delete existing variants
      await (supabase.from("vendor_inventory_variants" as any) as any).delete().eq("inventory_item_id", itemId);

      if (variants.length === 0) return;

      const rows = variants.map((v, i) => ({
        inventory_item_id: itemId,
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

      const { error } = await (supabase.from("vendor_inventory_variants" as any) as any).insert(rows);
      if (error) throw error;
    },
    onSuccess: (_, { itemId }) => {
      queryClient.invalidateQueries({ queryKey: ["vendor_inventory_variants", itemId] });
      queryClient.invalidateQueries({ queryKey: ["vendor_inventory_variants"] });
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
