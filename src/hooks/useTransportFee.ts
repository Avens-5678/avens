import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TransportResult {
  distance_km: number;
  fee: number;
  vehicle_type: string;
}

export const useTransportFee = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TransportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculate = async (vendorPincode: string, clientPincode: string) => {
    if (!vendorPincode || !clientPincode) {
      setResult(null);
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("calculate-transport", {
        body: { vendor_pincode: vendorPincode, client_pincode: clientPincode },
      });
      if (fnError) throw fnError;
      setResult(data as TransportResult);
      return data as TransportResult;
    } catch (err: any) {
      setError(err.message || "Failed to calculate transport");
      setResult(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { calculate, result, loading, error };
};
