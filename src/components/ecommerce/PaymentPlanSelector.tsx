import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, CreditCard, CalendarDays, CheckCircle2, IndianRupee, Banknote } from "lucide-react";
import { PaymentPlan, calculateMilestoneBreakdown, MilestoneBreakdown } from "@/hooks/usePaymentMilestones";
import { cn } from "@/lib/utils";

interface PaymentPlanSelectorProps {
  grandTotal: number;
  platformFee: number;
  vendorPayout: number;
  eventDate: string | null;
  onPlanSelect: (plan: PaymentPlan, breakdown: MilestoneBreakdown) => void;
  selectedPlan?: PaymentPlan;
}

const plans: { key: PaymentPlan; label: string; icon: React.ReactNode; tag?: string; description: string }[] = [
  {
    key: "advance",
    label: "Pay Advance",
    icon: <Banknote className="h-5 w-5" />,
    tag: "Standard",
    description: "Pay 25% now digitally. Pay 75% in cash directly to the vendor later.",
  },
  {
    key: "full",
    label: "Pay Full Amount",
    icon: <Shield className="h-5 w-5" />,
    tag: "Escrow Protected",
    description: "Pay 100% now. Evnting holds the funds securely until completion.",
  },
  {
    key: "milestones",
    label: "Pay in Parts",
    icon: <CalendarDays className="h-5 w-5" />,
    tag: "Zero-Interest EMI",
    description: "Pay 25% now → 50% before event → 25% on event day.",
  },
];

const PaymentPlanSelector = ({
  grandTotal,
  platformFee,
  vendorPayout,
  eventDate,
  onPlanSelect,
  selectedPlan,
}: PaymentPlanSelectorProps) => {
  const [activePlan, setActivePlan] = useState<PaymentPlan>(selectedPlan || "advance");

  const handleSelect = (plan: PaymentPlan) => {
    setActivePlan(plan);
    const breakdown = calculateMilestoneBreakdown(grandTotal, platformFee, vendorPayout, eventDate, plan);
    onPlanSelect(plan, breakdown);
  };

  const activeBreakdown = calculateMilestoneBreakdown(grandTotal, platformFee, vendorPayout, eventDate, activePlan);

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-primary" />
        Choose Payment Plan
      </h4>

      <div className="grid grid-cols-1 gap-2">
        {plans.map((plan) => {
          const isActive = activePlan === plan.key;
          return (
            <button
              key={plan.key}
              onClick={() => handleSelect(plan.key)}
              className={cn(
                "w-full text-left border rounded-xl p-3 transition-all",
                isActive
                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                  : "border-border hover:border-primary/40 hover:bg-muted/30"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {plan.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{plan.label}</span>
                    {plan.tag && (
                      <Badge variant={isActive ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                        {plan.tag}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{plan.description}</p>
                </div>
                <div className={cn(
                  "h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1",
                  isActive ? "border-primary bg-primary" : "border-muted-foreground/30"
                )}>
                  {isActive && <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Breakdown */}
      <div className="bg-muted/50 rounded-lg p-3 space-y-2">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Payment Breakdown</p>
        <Separator />
        {activeBreakdown.milestones.map((m, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className={cn(
                "h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                i === 0 ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20 text-muted-foreground"
              )}>
                {i + 1}
              </div>
              <div>
                <span className="text-foreground font-medium">{m.name}</span>
                {m.due_date && (
                  <span className="text-[10px] text-muted-foreground ml-1.5">Due: {m.due_date}</span>
                )}
              </div>
            </div>
            <span className="font-bold text-foreground flex items-center">
              <IndianRupee className="h-3 w-3" />
              {m.amount.toLocaleString("en-IN")}
            </span>
          </div>
        ))}
        <Separator />
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            {activePlan === "advance"
              ? "Remaining 75% payable directly to vendor"
              : activePlan === "full"
                ? "Funds held in Evnting escrow until event completion"
                : "All digital payments — automated reminders via WhatsApp"}
          </span>
        </div>
        <div className="flex justify-between items-center pt-1">
          <span className="text-sm font-bold text-foreground">Pay Now</span>
          <span className="text-base font-bold text-primary flex items-center">
            <IndianRupee className="h-3.5 w-3.5" />
            {activeBreakdown.milestones[0].amount.toLocaleString("en-IN")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PaymentPlanSelector;
