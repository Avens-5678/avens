import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { haversineKm } from "@/utils/geoDistance";

/**
 * Fetches featured item IDs for homepage and vendor geo profiles for distance calc.
 * Extracted from Ecommerce.tsx to avoid circular import issues in the bundle.
 */

export const useFeaturedItemIds = () => {
  const { data: featuredItemIds = [] } = useQuery({
    queryKey: ["featured-homepage-ids"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("featured_items")
        .select("item_id")
        .eq("item_type", "product")
        .eq("placement", "homepage")
        .eq("is_active", true)
        .order("display_order");
      if (error) throw error;
      return (data || []).map((d: any) => d.item_id as string);
    },
  });
  return featuredItemIds;
};

export const useVendorGeoProfiles = (vendorIds: string[]) => {
  const { data: vendorGeoProfiles = [] } = useQuery({
    queryKey: ["vendor-geo-profiles", vendorIds.join(",")],
    enabled: vendorIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, warehouse_lat, warehouse_lng")
        .in("user_id", vendorIds);
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const vendorGeoMap = useMemo(() => {
    const m: Record<string, { lat: number; lng: number }> = {};
    vendorGeoProfiles.forEach((p: any) => {
      if (p.warehouse_lat && p.warehouse_lng) m[p.user_id] = { lat: p.warehouse_lat, lng: p.warehouse_lng };
    });
    return m;
  }, [vendorGeoProfiles]);

  return vendorGeoMap;
};

export const enrichItemsWithDistance = (
  allItems: any[],
  userLocation: { lat: number; lng: number } | null,
  vendorGeoMap: Record<string, { lat: number; lng: number }>
) => {
  if (!userLocation) return allItems.map((r: any) => ({ ...r, _distance_km: null }));
  return allItems.map((r: any) => {
    const vGeo = r.vendor_id ? vendorGeoMap[r.vendor_id] : null;
    const lat = r.pickup_lat || vGeo?.lat;
    const lng = r.pickup_lng || vGeo?.lng;
    const dist = lat && lng ? haversineKm(userLocation.lat, userLocation.lng, lat, lng) : null;
    return { ...r, _distance_km: dist };
  });
};
