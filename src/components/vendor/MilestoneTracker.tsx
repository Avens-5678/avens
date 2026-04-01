import { useOrderMilestones, PaymentMilestone } from "@/hooks/usePaymentMilestones";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertTriangle, IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";

interface MilestoneTrackerProps {
  orderId: string;
  compact?: boolean;
}

const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  paid: { icon: <CheckCircle2 className="h-4 w-4" />, color: "text-green-600 bg-green-500/10 border-green-500/20", label: "Collected ✅" },
  pending: { icon: <Clock className="h-4 w-4" />, color: "text-yellow-600 bg-yellow-500/10 border-yellow-500/20", label: "Pending ⏳" },
  overdue: { icon: <AlertTriangle className="h-4 w-4" />, color: "text-red-600 bg-red-500/10 border-red-500/20", label: "Overdue ❗" },
};

const MilestoneTracker = ({ orderId, compact = false }: MilestoneTrackerProps) => {
  const { data: milestones, isLoading } = useOrderMilestones(orderId);

  if (isLoading || !milestones || milestones.length === 0) return null;

  const totalDue = milestones.reduce((s, m) => s + m.amount_due, 0);
  const totalPaid = milestones.filter(m => m.status === "paid").reduce((s, m) => s + m.amount_due, 0);
  const progressPercent = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;
  const planLabel = milestones[0]?.payment_plan === "full" ? "Full Escrow" : milestones[0]?.payment_plan === "milestones" ? "3-Part EMI" : "Advance + Cash";

  if (compact) {
    return (
      <div className="bg-muted/30 rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-foreground">Payment Progress</span>
          <Badge variant="secondary" className="text-[10px]">{planLabel}</Badge>
        </div>
        <Progress value={progressPercent} className="h-2" />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>₹{totalPaid.toLocaleString("en-IN")} collected</span>
          <span>₹{totalDue.toLocaleString("en-IN")} total</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-foreground">Payment Milestones</h4>
        <Badge variant="secondary" className="text-[10px]">{planLabel}</Badge>
      </div>

      <Progress value={progressPercent} className="h-2.5" />
      <p className="text-xs text-muted-foreground">
        {progressPercent}% collected · ₹{totalPaid.toLocaleString("en-IN")} of ₹{totalDue.toLocaleString("en-IN")}
      </p>

      <div className="space-y-2">
        {milestones.map((m, i) => {
          const config = statusConfig[m.status] || statusConfig.pending;
          return (
            <div key={m.id} className="flex items-center gap-3">
              {/* Timeline dot */}
              <div className="flex flex-col items-center">
                <div className={cn(
                  "h-7 w-7 rounded-full border flex items-center justify-center",
                  config.color
                )}>
                  {config.icon}
                </div>
                {i < milestones.length - 1 && (
                  <div className={cn(
                    "w-0.5 h-4",
                    m.status === "paid" ? "bg-green-500/40" : "bg-border"
                  )} />
                )}
              </div>

              <div className="flex-1 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{m.milestone_name}</p>
                  {m.due_date && (
                    <p className="text-[10px] text-muted-foreground">
                      Due: {new Date(m.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  )}
                  {m.paid_at && (
                    <p className="text-[10px] text-green-600">
                      Paid: {new Date(m.paid_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-foreground flex items-center justify-end">
                    <IndianRupee className="h-3 w-3" />
                    {m.amount_due.toLocaleString("en-IN")}
                  </span>
                  <Badge variant="outline" className={cn("text-[10px] mt-0.5", config.color)}>
                    {config.label}
                  </Badge>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MilestoneTracker;
