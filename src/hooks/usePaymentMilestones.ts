import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export interface PaymentMilestone {
  id: string;
  order_id: string;
  milestone_name: string;
  amount_due: number;
  due_date: string | null;
  status: string;
  paid_at: string | null;
  razorpay_link_id: string | null;
  razorpay_payment_id: string | null;
  payment_plan: string;
  milestone_order: number;
  created_at: string;
  updated_at: string;
}

export type PaymentPlan = "advance" | "full" | "milestones";

export interface MilestoneBreakdown {
  plan: PaymentPlan;
  milestones: {
    name: string;
    percentage: number;
    amount: number;
    due_date: string | null;
    milestone_order: number;
  }[];
  platformCut: number;
  vendorPayout: number;
}

/**
 * Golden Rule: Platform takes its ENTIRE margin in Milestone 1.
 * Milestones 2 & 3 belong entirely to the vendor.
 */
export const calculateMilestoneBreakdown = (
  grandTotal: number,
  platformFee: number,
  vendorPayout: number,
  eventDate: string | null,
  plan: PaymentPlan
): MilestoneBreakdown => {
  if (plan === "full") {
    return {
      plan,
      milestones: [
        { name: "Full Payment (Escrow)", percentage: 100, amount: grandTotal, due_date: null, milestone_order: 1 },
      ],
      platformCut: platformFee,
      vendorPayout,
    };
  }

  if (plan === "advance") {
    const advanceAmount = Math.ceil(grandTotal * 0.25);
    return {
      plan,
      milestones: [
        { name: "Booking Advance (25%)", percentage: 25, amount: advanceAmount, due_date: null, milestone_order: 1 },
      ],
      platformCut: platformFee,
      vendorPayout,
    };
  }

  // "milestones" — 3-part payment
  // Golden Rule: Milestone 1 = platform fee + proportional vendor share
  const m1Amount = Math.ceil(grandTotal * 0.25);
  const m2Amount = Math.ceil(grandTotal * 0.50);
  const m3Amount = grandTotal - m1Amount - m2Amount;

  let m2DueDate: string | null = null;
  let m3DueDate: string | null = null;

  if (eventDate) {
    const eventDateObj = new Date(eventDate);
    const m2Date = new Date(eventDateObj);
    m2Date.setDate(m2Date.getDate() - 7);
    m2DueDate = m2Date.toISOString().split("T")[0];
    m3DueDate = eventDate;
  }

  return {
    plan,
    milestones: [
      { name: "Booking Advance", percentage: 25, amount: m1Amount, due_date: null, milestone_order: 1 },
      { name: "Mid-Payment", percentage: 50, amount: m2Amount, due_date: m2DueDate, milestone_order: 2 },
      { name: "Final Settlement", percentage: 25, amount: m3Amount, due_date: m3DueDate, milestone_order: 3 },
    ],
    platformCut: platformFee,
    vendorPayout,
  };
};

export const useOrderMilestones = (orderId?: string) => {
  return useQuery({
    queryKey: ["payment_milestones", orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_milestones")
        .select("*")
        .eq("order_id", orderId!)
        .order("milestone_order", { ascending: true });
      if (error) throw error;
      return data as PaymentMilestone[];
    },
    enabled: !!orderId,
  });
};

export const useCreateMilestones = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      orderId,
      breakdown,
    }: {
      orderId: string;
      breakdown: MilestoneBreakdown;
    }) => {
      const rows = breakdown.milestones.map((m) => ({
        order_id: orderId,
        milestone_name: m.name,
        amount_due: m.amount,
        due_date: m.due_date,
        status: m.milestone_order === 1 ? "paid" : "pending",
        paid_at: m.milestone_order === 1 ? new Date().toISOString() : null,
        payment_plan: breakdown.plan,
        milestone_order: m.milestone_order,
      }));

      const { error } = await supabase.from("payment_milestones").insert(rows as any);
      if (error) throw error;

      // Update the order's payment_plan
      await supabase
        .from("rental_orders")
        .update({ payment_plan: breakdown.plan } as any)
        .eq("id", orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment_milestones"] });
      toast({ title: "Payment plan created", description: "Milestones have been set up." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
};

export const useUpdateMilestoneStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status, razorpay_payment_id }: { id: string; status: string; razorpay_payment_id?: string }) => {
      const update: Record<string, any> = { status, updated_at: new Date().toISOString() };
      if (status === "paid") update.paid_at = new Date().toISOString();
      if (razorpay_payment_id) update.razorpay_payment_id = razorpay_payment_id;

      const { error } = await supabase
        .from("payment_milestones")
        .update(update as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment_milestones"] });
      toast({ title: "Milestone updated" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
};
