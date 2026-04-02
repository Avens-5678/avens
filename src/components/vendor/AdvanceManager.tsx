import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Loader2, IndianRupee, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";

interface Employee {
  id: string;
  full_name: string;
  role: string;
}

interface Advance {
  id: string;
  employee_id: string;
  amount: number;
  reason: string | null;
  given_date: string;
  recovered: boolean;
  recovered_month: number | null;
  recovered_year: number | null;
  created_at: string;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const AdvanceManager = ({ employees }: { employees: Employee[] }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ employee_id: "", amount: "", reason: "" });

  // Fetch all advances
  const { data: advances = [], isLoading } = useQuery({
    queryKey: ["payroll-advances", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payroll_advances")
        .select("*")
        .eq("vendor_id", user!.id)
        .order("given_date", { ascending: false });
      if (error) throw error;
      return data as Advance[];
    },
  });

  const empMap: Record<string, Employee> = {};
  employees.forEach((e) => { empMap[e.id] = e; });

  const pendingAdvances = advances.filter((a) => !a.recovered);
  const recoveredAdvances = advances.filter((a) => a.recovered);
  const totalPending = pendingAdvances.reduce((s, a) => s + a.amount, 0);

  // Pending per employee
  const pendingPerEmployee: Record<string, number> = {};
  pendingAdvances.forEach((a) => {
    pendingPerEmployee[a.employee_id] = (pendingPerEmployee[a.employee_id] || 0) + a.amount;
  });

  const addAdvance = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("payroll_advances").insert({
        employee_id: form.employee_id,
        vendor_id: user!.id,
        amount: parseFloat(form.amount) || 0,
        reason: form.reason || null,
        given_date: format(new Date(), "yyyy-MM-dd"),
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-advances"] });
      setAddOpen(false);
      setForm({ employee_id: "", amount: "", reason: "" });
      toast({ title: "Advance recorded!" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      {/* Header + Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Card className="border-amber-200 dark:border-amber-800">
            <CardContent className="p-3 flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-amber-500" />
              <div>
                <p className="text-lg font-bold text-foreground">₹{totalPending.toLocaleString("en-IN")}</p>
                <p className="text-[10px] text-muted-foreground">Total Pending Recovery</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />Give Advance</Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Record Advance</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Employee *</Label>
                <Select value={form.employee_id} onValueChange={(v) => setForm({ ...form, employee_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                  <SelectContent>
                    {employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Amount (₹) *</Label>
                <Input type="number" min={1} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="5000" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Reason</Label>
                <Textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Medical, personal, etc." rows={2} />
              </div>
              <Button
                onClick={() => addAdvance.mutate()}
                disabled={!form.employee_id || !form.amount || addAdvance.isPending}
                className="w-full"
              >
                {addAdvance.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Record Advance
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Per-employee pending summary */}
      {Object.keys(pendingPerEmployee).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(pendingPerEmployee).map(([empId, amount]) => (
            <Badge key={empId} variant="secondary" className="text-xs gap-1 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
              {empMap[empId]?.full_name || "Unknown"}: ₹{amount.toLocaleString("en-IN")}
            </Badge>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : advances.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground">No advances recorded yet.</div>
      ) : (
        <div className="space-y-4">
          {/* Pending */}
          {pendingAdvances.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="h-3 w-3" />Pending Recovery ({pendingAdvances.length})
              </h4>
              <div className="border border-border rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-xs">Employee</TableHead>
                      <TableHead className="text-xs">Date</TableHead>
                      <TableHead className="text-xs">Reason</TableHead>
                      <TableHead className="text-xs text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingAdvances.map((adv) => (
                      <TableRow key={adv.id}>
                        <TableCell className="text-sm font-medium">{empMap[adv.employee_id]?.full_name || "Unknown"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{format(new Date(adv.given_date), "dd MMM yyyy")}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{adv.reason || "—"}</TableCell>
                        <TableCell className="text-sm font-semibold text-right text-amber-600">₹{adv.amount.toLocaleString("en-IN")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Recovered */}
          {recoveredAdvances.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3" />Recovered ({recoveredAdvances.length})
              </h4>
              <div className="border border-border rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-xs">Employee</TableHead>
                      <TableHead className="text-xs">Given Date</TableHead>
                      <TableHead className="text-xs">Recovered In</TableHead>
                      <TableHead className="text-xs text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recoveredAdvances.map((adv) => (
                      <TableRow key={adv.id} className="opacity-60">
                        <TableCell className="text-sm">{empMap[adv.employee_id]?.full_name || "Unknown"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{format(new Date(adv.given_date), "dd MMM yyyy")}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {adv.recovered_month && adv.recovered_year
                            ? `${MONTHS[adv.recovered_month - 1]} ${adv.recovered_year}`
                            : "—"}
                        </TableCell>
                        <TableCell className="text-sm text-right line-through text-muted-foreground">₹{adv.amount.toLocaleString("en-IN")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvanceManager;
