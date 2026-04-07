import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EquipmentDetailsDisplay } from "@/utils/formatEquipmentDetails";
import { Calendar, MapPin, IndianRupee, Truck, ChevronRight, Loader2 } from "lucide-react";
import { format, differenceInDays } from "date-fns";

interface Props {
  orderId: string;
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  sent_to_vendors: "bg-amber-100 text-amber-700",
  quoted: "bg-purple-100 text-purple-700",
  accepted: "bg-emerald-100 text-emerald-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  in_progress: "bg-purple-100 text-purple-700",
  out_for_delivery: "bg-orange-100 text-orange-700",
  delivered: "bg-teal-100 text-teal-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const OrderContextCard = ({ orderId }: Props) => {
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [milestone, setMilestone] = useState<any>(null);
  const [delivery, setDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      const [{ data: ord }, { data: ms }, { data: del }] = await Promise.all([
        supabase.from("rental_orders").select("*").eq("id", orderId).maybeSingle(),
        (supabase.from as any)("payment_milestones")
          .select("*").eq("order_id", orderId).eq("status", "pending")
          .order("due_date", { ascending: true }).limit(1).maybeSingle(),
        (supabase.from as any)("delivery_orders")
          .select("id, status, delivered_at, picked_up_at")
          .eq("order_id", orderId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      ]);
      if (!active) return;
      setOrder(ord);
      setMilestone(ms);
      setDelivery(del);
      setLoading(false);
    };
    load();
    return () => { active = false; };
  }, [orderId]);

  if (loading) {
    return (
      <div className="border-b border-border bg-muted/30 p-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" /> Loading order…
      </div>
    );
  }
  if (!order) return null;

  const statusBadge = (
    <Badge className={`text-[10px] capitalize ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-700"}`}>
      {(order.status || "").replace(/_/g, " ")}
    </Badge>
  );

  const dueIn = milestone?.due_date
    ? differenceInDays(new Date(milestone.due_date), new Date())
    : null;

  const handlePay = async () => {
    if (milestone?.razorpay_link_url) {
      window.open(milestone.razorpay_link_url, "_blank");
      return;
    }
    // No link cached → just deep-link to past-orders so the user can complete payment from there
    navigate(`/client/dashboard?tab=past-orders&order=${order.id}`);
  };

  return (
    <div className="border-b border-border bg-gradient-to-b from-primary/5 to-transparent p-3 space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate">{order.title}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground mt-0.5">
            {order.event_date && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(order.event_date), "d MMM yyyy")}
              </span>
            )}
            {order.location && (
              <span className="inline-flex items-center gap-1 truncate max-w-[180px]">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{order.location}</span>
              </span>
            )}
          </div>
        </div>
        {statusBadge}
      </div>

      {order.equipment_details && (
        <div className="rounded-md bg-background/60 p-2 text-xs">
          <EquipmentDetailsDisplay details={order.equipment_details} />
        </div>
      )}

      {milestone && (
        <div className="flex items-center justify-between p-2 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <div className="text-xs">
            <p className="font-semibold flex items-center gap-1">
              <IndianRupee className="h-3 w-3" />
              {milestone.amount_due?.toLocaleString("en-IN")} due
            </p>
            <p className="text-[10px] text-muted-foreground">
              {milestone.milestone_name}
              {dueIn !== null && (dueIn >= 0 ? ` · in ${dueIn} day${dueIn === 1 ? "" : "s"}` : ` · ${Math.abs(dueIn)} day${Math.abs(dueIn) === 1 ? "" : "s"} overdue`)}
            </p>
          </div>
          <Button size="sm" className="h-7 text-xs" onClick={handlePay}>Pay now</Button>
        </div>
      )}

      {delivery && (
        <button
          onClick={() => navigate(`/track-delivery/${delivery.id}`)}
          className="w-full flex items-center justify-between gap-2 text-xs p-2 rounded-md border border-border bg-background hover:bg-muted/50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Truck className="h-3 w-3 text-primary" />
            Delivery: <span className="font-medium capitalize">{delivery.status?.replace(/_/g, " ")}</span>
          </span>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
        </button>
      )}

      <div className="flex gap-2 pt-1">
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs flex-1 gap-1"
          onClick={() => navigate(`/client/dashboard?tab=past-orders&order=${order.id}`)}
        >
          View Order <ChevronRight className="h-3 w-3" />
        </Button>
        {delivery && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs flex-1 gap-1"
            onClick={() => navigate(`/track-delivery/${delivery.id}`)}
          >
            <Truck className="h-3 w-3" /> Track
          </Button>
        )}
      </div>
    </div>
  );
};

export default OrderContextCard;
