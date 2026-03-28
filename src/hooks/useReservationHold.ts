import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

const SESSION_KEY = "evnting_session_id";

const getSessionId = (): string => {
  let sid = sessionStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
};

export interface ReservationHold {
  id: string;
  rental_id: string;
  variant_id: string | null;
  user_id: string | null;
  session_id: string;
  check_in: string;
  check_out: string;
  slot: string;
  quantity: number;
  status: string;
  expires_at: string;
  created_at: string;
}

export const useReservationHold = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [hold, setHold] = useState<ReservationHold | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown timer
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!hold || hold.status !== "held") {
      setTimeLeft(0);
      return;
    }

    const updateTimer = () => {
      const expiresAt = new Date(hold.expires_at).getTime();
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        setHold((prev) => prev ? { ...prev, status: "expired" } : null);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    };

    updateTimer();
    intervalRef.current = setInterval(updateTimer, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [hold]);

  const createHold = useCallback(async ({
    rentalId,
    variantId,
    checkIn,
    checkOut,
    slot = "full_day",
    quantity = 1,
  }: {
    rentalId: string;
    variantId?: string;
    checkIn: string;
    checkOut: string;
    slot?: string;
    quantity?: number;
  }) => {
    setLoading(true);
    try {
      const holdId = crypto.randomUUID();
      const sessionId = getSessionId();

      const { error } = await supabase.from("reservation_holds").insert({
        id: holdId,
        rental_id: rentalId,
        variant_id: variantId || null,
        user_id: user?.id || null,
        session_id: sessionId,
        check_in: checkIn,
        check_out: checkOut,
        slot,
        quantity,
        status: "held",
      });

      if (error) throw error;

      // Fetch the created hold to get expires_at
      const { data } = await supabase
        .from("reservation_holds")
        .select("*")
        .eq("id", holdId)
        .single();

      if (data) {
        setHold(data as ReservationHold);
      }

      return holdId;
    } catch (err: any) {
      toast({ title: "Booking Failed", description: err.message, variant: "destructive" });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const confirmHold = useCallback(async (holdId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("reservation_holds")
        .update({ status: "confirmed" })
        .eq("id", holdId);

      if (error) throw error;
      setHold((prev) => prev ? { ...prev, status: "confirmed" } : null);
      return true;
    } catch (err: any) {
      toast({ title: "Confirmation Failed", description: err.message, variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const cancelHold = useCallback(async (holdId: string) => {
    try {
      await supabase
        .from("reservation_holds")
        .update({ status: "cancelled" })
        .eq("id", holdId);
      setHold(null);
    } catch {}
  }, []);

  const clearHold = useCallback(() => {
    setHold(null);
    setTimeLeft(0);
  }, []);

  return {
    hold,
    loading,
    timeLeft,
    createHold,
    confirmHold,
    cancelHold,
    clearHold,
    isExpired: hold?.status === "expired" || (hold?.status === "held" && timeLeft <= 0),
    isHeld: hold?.status === "held" && timeLeft > 0,
    isConfirmed: hold?.status === "confirmed",
  };
};
