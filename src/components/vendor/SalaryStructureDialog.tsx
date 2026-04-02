import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Loader2, Settings, History } from "lucide-react";
import { format } from "date-fns";

interface SalaryStructure {
  id: string;
  base_salary: number;
  hra: number;
  transport_allowance: number;
  other_allowance: number;
  pf_deduction: number;
  esi_deduction: number;
  other_deduction: number;
  effective_from: string;
  created_at: string;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

const SalaryStructureDialog = ({
  employeeId,
  employeeName,
  currentBaseSalary,
}: {
  employeeId: string;
  employeeName: string;
  currentBaseSalary: number;
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [effectiveDate, setEffectiveDate] = useState<Date>(new Date());
  const [form, setForm] = useState({
    base_salary: String(currentBaseSalary),
    hra: "0",
    transport_allowance: "0",
    other_allowance: "0",
    pf_deduction: "0",
    esi_deduction: "0",
    other_deduction: "0",
  });

  // Fetch salary history
  const { data: history = [] } = useQuery({
    queryKey: ["salary-structure-history", employeeId],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salary_structures")
        .select("*")
        .eq("employee_id", employeeId)
        .order("effective_from", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data as SalaryStructure[];
    },
  });

  // Load latest structure into form when dialog opens
  const loadLatest = () => {
    if (history.length > 0) {
      const latest = history[0];
      setForm({
        base_salary: String(latest.base_salary),
        hra: String(latest.hra),
        transport_allowance: String(latest.transport_allowance),
        other_allowance: String(latest.other_allowance),
        pf_deduction: String(latest.pf_deduction),
        esi_deduction: String(latest.esi_deduction),
        other_deduction: String(latest.other_deduction),
      });
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("salary_structures").insert({
        employee_id: employeeId,
        vendor_id: user!.id,
        base_salary: r2(parseFloat(form.base_salary) || 0),
        hra: r2(parseFloat(form.hra) || 0),
        transport_allowance: r2(parseFloat(form.transport_allowance) || 0),
        other_allowance: r2(parseFloat(form.other_allowance) || 0),
        pf_deduction: r2(parseFloat(form.pf_deduction) || 0),
        esi_deduction: r2(parseFloat(form.esi_deduction) || 0),
        other_deduction: r2(parseFloat(form.other_deduction) || 0),
        effective_from: format(effectiveDate, "yyyy-MM-dd"),
      } as any);
      if (error) throw error;

      // Also update employees.base_salary
      await supabase.from("employees")
        .update({ base_salary: r2(parseFloat(form.base_salary) || 0) } as any)
        .eq("id", employeeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salary-structure"] });
      queryClient.invalidateQueries({ queryKey: ["salary-structures"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast({ title: "Salary structure saved!" });
      setOpen(false);
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  // Computed totals
  const totalEarnings = r2(
    (parseFloat(form.base_salary) || 0) +
    (parseFloat(form.hra) || 0) +
    (parseFloat(form.transport_allowance) || 0) +
    (parseFloat(form.other_allowance) || 0)
  );
  const totalDeductions = r2(
    (parseFloat(form.pf_deduction) || 0) +
    (parseFloat(form.esi_deduction) || 0) +
    (parseFloat(form.other_deduction) || 0)
  );
  const netSalary = r2(totalEarnings - totalDeductions);

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) loadLatest(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <Settings className="h-3 w-3" />Salary Structure
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">Salary Structure — {employeeName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Earnings */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Earnings</p>
            <div className="space-y-2">
              {[
                { key: "base_salary", label: "Base Salary" },
                { key: "hra", label: "HRA" },
                { key: "transport_allowance", label: "Transport Allowance" },
                { key: "other_allowance", label: "Other Allowances" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <Label className="text-xs w-[140px] flex-shrink-0">{label}</Label>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">₹</span>
                    <Input
                      type="number" min={0}
                      value={(form as any)[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="h-8 w-[120px] text-right text-sm"
                    />
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-1 border-t border-border">
                <span className="text-xs font-semibold">Total Earnings</span>
                <span className="text-sm font-bold text-foreground">₹{totalEarnings.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Deductions */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Deductions</p>
            <div className="space-y-2">
              {[
                { key: "pf_deduction", label: "PF Deduction" },
                { key: "esi_deduction", label: "ESI Deduction" },
                { key: "other_deduction", label: "Other Deductions" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <Label className="text-xs w-[140px] flex-shrink-0">{label}</Label>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">₹</span>
                    <Input
                      type="number" min={0}
                      value={(form as any)[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="h-8 w-[120px] text-right text-sm"
                    />
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-1 border-t border-border">
                <span className="text-xs font-semibold">Total Deductions</span>
                <span className="text-sm font-bold text-red-600">₹{totalDeductions.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Net Salary */}
          <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
            <span className="text-sm font-bold text-foreground">Net Monthly Salary</span>
            <span className="text-lg font-bold text-emerald-600">₹{netSalary.toLocaleString("en-IN")}</span>
          </div>

          {/* Effective Date */}
          <div className="space-y-1.5">
            <Label className="text-xs">Effective From</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal text-sm">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(effectiveDate, "dd MMM yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={effectiveDate} onSelect={(d) => d && setEffectiveDate(d)} initialFocus className="pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>

          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="w-full">
            {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Save Salary Structure
          </Button>

          {/* History */}
          {history.length > 0 && (
            <div className="pt-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <History className="h-3 w-3" />Revision History
              </p>
              <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
                {history.map((h) => (
                  <div key={h.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/40">
                    <div>
                      <span className="text-muted-foreground">From </span>
                      <span className="font-medium">{format(new Date(h.effective_from), "dd MMM yyyy")}</span>
                    </div>
                    <span className="font-semibold">₹{h.base_salary.toLocaleString("en-IN")} base</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SalaryStructureDialog;
