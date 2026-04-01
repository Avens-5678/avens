import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DynamicTransportResult {
  distance_km: number;
  duration_min: number;
  vehicle_type: string;
  base_fare: number;
  extra_km: number;
  per_km_rate: number;
  surge_applied: boolean;
  surge_multiplier: number;
  fee: number;
  total_volume_units: number;
}

interface CalcParams {
  warehouse_lat: number;
  warehouse_lng: number;
  venue_lat: number;
  venue_lng: number;
  total_volume_units: number;
  delivery_hour?: number;
}

export const useDynamicTransport = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DynamicTransportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculate = async (params: CalcParams): Promise<DynamicTransportResult | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("calculate-dynamic-route", {
        body: params,
      });
      if (fnError) throw fnError;
      setResult(data as DynamicTransportResult);
      return data as DynamicTransportResult;
    } catch (err: any) {
      setError(err.message || "Failed to calculate transport");
      setResult(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  return { calculate, result, loading, error, reset };
};
