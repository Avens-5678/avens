import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  IndianRupee, Loader2, RefreshCw, CheckCircle2, Banknote,
  FileText, Users, TrendingDown, Download,
} from "lucide-react";
import { format } from "date-fns";
import PayslipGenerator from "./PayslipGenerator";
import AdvanceManager from "./AdvanceManager";

// ── Types ──
interface Employee {
  id: string;
  full_name: string;
  role: string;
  base_salary: number;
  salary_type: string;
  is_active: boolean;
}

interface SalaryStructure {
  id: string;
  employee_id: string;
  base_salary: number;
  hra: number;
  transport_allowance: number;
  other_allowance: number;
  pf_deduction: number;
  esi_deduction: number;
  other_deduction: number;
  effective_from: string;
}

interface PayrollRecord {
  id: string;
  employee_id: string;
  month: number;
  year: number;
  working_days: number;
  days_present: number;
  days_absent: number;
  days_leave: number;
  basic_earned: number;
  hra_earned: number;
  allowances: number;
  gross_salary: number;
  pf_deduction: number;
  esi_deduction: number;
  other_deductions: number;
  net_salary: number;
  bonus: number;
  advance_deduction: number;
  status: string;
  paid_at: string | null;
  payment_mode: string | null;
  notes: string | null;
}

interface AttendanceCount {
  employee_id: string;
  status: string;
  count: number;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  approved: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

const r2 = (n: number) => Math.round(n * 100) / 100;

// ═══════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════
const PayrollManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const now = new Date();
  const [selMonth, setSelMonth] = useState(now.getMonth() + 1);
  const [selYear, setSelYear] = useState(now.getFullYear());
  const [activeView, setActiveView] = useState<"payroll" | "advances">("payroll");
  const [payslipRecord, setPayslipRecord] = useState<PayrollRecord | null>(null);

  // ── Fetch employees ──
  const { data: employees = [] } = useQuery({
    queryKey: ["employees", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, full_name, role, base_salary, salary_type, is_active")
        .eq("vendor_id", user!.id)
        .eq("is_active", true)
        .order("full_name");
      if (error) throw error;
      return data as Employee[];
    },
  });

  const employeeMap = useMemo(() => {
    const m: Record<string, Employee> = {};
    employees.forEach((e) => { m[e.id] = e; });
    return m;
  }, [employees]);

  // ── Fetch salary structures (latest per employee) ──
  const { data: salaryStructures = [] } = useQuery({
    queryKey: ["salary-structures", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salary_structures")
        .select("*")
        .eq("vendor_id", user!.id)
        .order("effective_from", { ascending: false });
      if (error) throw error;
      return data as SalaryStructure[];
    },
  });

  // Latest structure per employee
  const latestStructure = useMemo(() => {
    const m: Record<string, SalaryStructure> = {};
    salaryStructures.forEach((s) => {
      if (!m[s.employee_id]) m[s.employee_id] = s;
    });
    return m;
  }, [salaryStructures]);

  // ── Fetch payroll for selected month ──
  const { data: payrollRecords = [], isLoading: payrollLoading } = useQuery({
    queryKey: ["payroll", user?.id, selMonth, selYear],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payroll")
        .select("*")
        .eq("vendor_id", user!.id)
        .eq("month", selMonth)
        .eq("year", selYear)
        .order("created_at");
      if (error) throw error;
      return data as PayrollRecord[];
    },
  });

  // ── Fetch pending advances ──
  const { data: pendingAdvances = [] } = useQuery({
    queryKey: ["payroll-advances-pending", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payroll_advances")
        .select("employee_id, amount")
        .eq("vendor_id", user!.id)
        .eq("recovered", false);
      if (error) throw error;
      return data as { employee_id: string; amount: number }[];
    },
  });

  // Advance total per employee
  const advanceMap = useMemo(() => {
    const m: Record<string, number> = {};
    pendingAdvances.forEach((a) => {
      m[a.employee_id] = (m[a.employee_id] || 0) + a.amount;
    });
    return m;
  }, [pendingAdvances]);

  // ── Generate payroll ──
  const generatePayroll = useMutation({
    mutationFn: async () => {
      // 1. Fetch attendance for the month
      const monthStart = `${selYear}-${String(selMonth).padStart(2, "0")}-01`;
      const lastDay = new Date(selYear, selMonth, 0).getDate();
      const monthEnd = `${selYear}-${String(selMonth).padStart(2, "0")}-${lastDay}`;

      const { data: attendance, error: attError } = await supabase
        .from("attendance")
        .select("employee_id, status")
        .eq("vendor_id", user!.id)
        .gte("date", monthStart)
        .lte("date", monthEnd);
      if (attError) throw attError;

      // Count per employee
      const attMap: Record<string, { present: number; absent: number; leave: number; half_day: number }> = {};
      (attendance || []).forEach((r: any) => {
        if (!attMap[r.employee_id]) attMap[r.employee_id] = { present: 0, absent: 0, leave: 0, half_day: 0 };
        if (r.status === "present") attMap[r.employee_id].present++;
        else if (r.status === "absent") attMap[r.employee_id].absent++;
        else if (r.status === "leave") attMap[r.employee_id].leave++;
        else if (r.status === "half_day") { attMap[r.employee_id].present += 0.5; attMap[r.employee_id].half_day++; }
      });

      // 2. Build payroll rows
      const workingDays = 26; // configurable default
      const rows = employees.map((emp) => {
        const ss = latestStructure[emp.id];
        const base = ss?.base_salary ?? emp.base_salary;
        const hra = ss?.hra ?? 0;
        const transport = ss?.transport_allowance ?? 0;
        const otherAllow = ss?.other_allowance ?? 0;
        const pfRate = ss?.pf_deduction ?? 0;
        const esiRate = ss?.esi_deduction ?? 0;
        const otherDed = ss?.other_deduction ?? 0;

        const att = attMap[emp.id] || { present: 0, absent: 0, leave: 0, half_day: 0 };
        const daysPresent = att.present;
        const daysAbsent = att.absent;
        const daysLeave = att.leave;

        const basicEarned = r2((base / workingDays) * daysPresent);
        const hraEarned = r2((hra / workingDays) * daysPresent);
        const allowances = r2(((transport + otherAllow) / workingDays) * daysPresent);
        const gross = r2(basicEarned + hraEarned + allowances);
        const pfDed = r2(pfRate);
        const esiDed = r2(esiRate);
        const advanceDed = r2(advanceMap[emp.id] || 0);
        const net = r2(gross - pfDed - esiDed - otherDed - advanceDed);

        return {
          vendor_id: user!.id,
          employee_id: emp.id,
          month: selMonth,
          year: selYear,
          working_days: workingDays,
          days_present: daysPresent,
          days_absent: daysAbsent,
          days_leave: daysLeave,
          basic_earned: basicEarned,
          hra_earned: hraEarned,
          allowances,
          gross_salary: gross,
          pf_deduction: pfDed,
          esi_deduction: esiDed,
          other_deductions: otherDed,
          net_salary: net,
          bonus: 0,
          advance_deduction: advanceDed,
          status: "draft",
        };
      });

      // 3. Delete existing draft records for this month and insert new
      await supabase
        .from("payroll")
        .delete()
        .eq("vendor_id", user!.id)
        .eq("month", selMonth)
        .eq("year", selYear)
        .eq("status", "draft");

      const { error } = await supabase.from("payroll").insert(rows as any);
      if (error) throw error;

      // 4. Mark advances as recovered
      const empIdsWithAdvance = Object.keys(advanceMap);
      if (empIdsWithAdvance.length > 0) {
        await supabase
          .from("payroll_advances")
          .update({ recovered: true, recovered_month: selMonth, recovered_year: selYear } as any)
          .eq("vendor_id", user!.id)
          .eq("recovered", false)
          .in("employee_id", empIdsWithAdvance);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll"] });
      queryClient.invalidateQueries({ queryKey: ["payroll-advances"] });
      toast({ title: "Payroll generated!", description: `${employees.length} employees for ${MONTHS[selMonth - 1]} ${selYear}` });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  // ── Bulk approve ──
  const bulkApprove = useMutation({
    mutationFn: async () => {
      const draftIds = payrollRecords.filter((r) => r.status === "draft").map((r) => r.id);
      if (draftIds.length === 0) return;
      const { error } = await supabase
        .from("payroll")
        .update({ status: "approved" } as any)
        .in("id", draftIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll"] });
      toast({ title: "All payroll approved!" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  // ── Bulk mark paid ──
  const [bulkPayMode, setBulkPayMode] = useState<string>("bank_transfer");
  const bulkMarkPaid = useMutation({
    mutationFn: async () => {
      const approvedIds = payrollRecords.filter((r) => r.status === "approved").map((r) => r.id);
      if (approvedIds.length === 0) return;
      const { error } = await supabase
        .from("payroll")
        .update({ status: "paid", paid_at: new Date().toISOString(), payment_mode: bulkPayMode } as any)
        .in("id", approvedIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll"] });
      toast({ title: "All payroll marked as paid!" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  // ── Update single record (bonus, status) ──
  const updateRecord = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, any> }) => {
      // Recalculate net if bonus changed
      if (updates.bonus !== undefined) {
        const record = payrollRecords.find((r) => r.id === id);
        if (record) {
          const newGross = r2(record.basic_earned + record.hra_earned + record.allowances + updates.bonus);
          updates.gross_salary = newGross;
          updates.net_salary = r2(newGross - record.pf_deduction - record.esi_deduction - record.other_deductions - record.advance_deduction);
        }
      }
      const { error } = await supabase.from("payroll").update(updates as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["payroll"] }),
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  // ── Summary stats ──
  const totalGross = payrollRecords.reduce((s, r) => s + r.gross_salary, 0);
  const totalDeductions = payrollRecords.reduce((s, r) => s + r.pf_deduction + r.esi_deduction + r.other_deductions + r.advance_deduction, 0);
  const totalNet = payrollRecords.reduce((s, r) => s + r.net_salary, 0);
  const draftCount = payrollRecords.filter((r) => r.status === "draft").length;
  const approvedCount = payrollRecords.filter((r) => r.status === "approved").length;

  // ── Years list ──
  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Payroll</h2>
          <p className="text-sm text-muted-foreground">{employees.length} active employees</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setActiveView("payroll")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${activeView === "payroll" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
            >
              Monthly Payroll
            </button>
            <button
              onClick={() => setActiveView("advances")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${activeView === "advances" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
            >
              Advances
            </button>
          </div>
        </div>
      </div>

      {activeView === "advances" ? (
        <AdvanceManager employees={employees} />
      ) : (
        <>
          {/* Month/Year selector + Generate */}
          <div className="flex flex-wrap items-center gap-3">
            <Select value={String(selMonth)} onValueChange={(v) => setSelMonth(Number(v))}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={String(selYear)} onValueChange={(v) => setSelYear(Number(v))}>
              <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button
              onClick={() => generatePayroll.mutate()}
              disabled={generatePayroll.isPending || employees.length === 0}
              className="gap-1.5"
              size="sm"
            >
              {generatePayroll.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Generate Payroll
            </Button>
          </div>

          {/* Summary Cards */}
          {payrollRecords.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card>
                <CardContent className="p-3 text-center">
                  <Users className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                  <p className="text-lg font-bold text-foreground">{payrollRecords.length}</p>
                  <p className="text-[10px] text-muted-foreground">Employees</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <IndianRupee className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                  <p className="text-lg font-bold text-foreground">₹{totalGross.toLocaleString("en-IN")}</p>
                  <p className="text-[10px] text-muted-foreground">Gross Total</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <TrendingDown className="h-4 w-4 mx-auto text-red-400 mb-1" />
                  <p className="text-lg font-bold text-red-600">₹{totalDeductions.toLocaleString("en-IN")}</p>
                  <p className="text-[10px] text-muted-foreground">Deductions</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <Banknote className="h-4 w-4 mx-auto text-emerald-500 mb-1" />
                  <p className="text-lg font-bold text-emerald-600">₹{totalNet.toLocaleString("en-IN")}</p>
                  <p className="text-[10px] text-muted-foreground">Net Payout</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Bulk Actions */}
          {payrollRecords.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {draftCount > 0 && (
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => bulkApprove.mutate()} disabled={bulkApprove.isPending}>
                  <CheckCircle2 className="h-3.5 w-3.5" />Approve All ({draftCount})
                </Button>
              )}
              {approvedCount > 0 && (
                <div className="flex items-center gap-2">
                  <Select value={bulkPayMode} onValueChange={setBulkPayMode}>
                    <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => bulkMarkPaid.mutate()} disabled={bulkMarkPaid.isPending}>
                    <Banknote className="h-3.5 w-3.5" />Mark All Paid ({approvedCount})
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Payroll Table */}
          {payrollLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : payrollRecords.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <IndianRupee className="h-10 w-10 mx-auto text-muted-foreground/40" />
              <h3 className="text-lg font-semibold text-foreground">No payroll for {MONTHS[selMonth - 1]} {selYear}</h3>
              <p className="text-sm text-muted-foreground">Click "Generate Payroll" to auto-calculate from attendance.</p>
            </div>
          ) : (
            <div className="border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-xs min-w-[140px]">Employee</TableHead>
                      <TableHead className="text-xs text-center w-[70px]">Present</TableHead>
                      <TableHead className="text-xs text-right w-[90px]">Gross</TableHead>
                      <TableHead className="text-xs text-right w-[90px]">Deductions</TableHead>
                      <TableHead className="text-xs text-right w-[80px]">Bonus</TableHead>
                      <TableHead className="text-xs text-right w-[100px]">Net Pay</TableHead>
                      <TableHead className="text-xs text-center w-[80px]">Status</TableHead>
                      <TableHead className="text-xs w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payrollRecords.map((record) => {
                      const emp = employeeMap[record.employee_id];
                      const totalDed = record.pf_deduction + record.esi_deduction + record.other_deductions + record.advance_deduction;
                      return (
                        <TableRow key={record.id} className="hover:bg-muted/30">
                          <TableCell>
                            <p className="text-sm font-medium text-foreground">{emp?.full_name || "Unknown"}</p>
                            <p className="text-[10px] text-muted-foreground capitalize">{emp?.role}</p>
                          </TableCell>
                          <TableCell className="text-center text-sm">
                            <span className="font-medium">{record.days_present}</span>
                            <span className="text-muted-foreground">/{record.working_days}</span>
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium">₹{record.gross_salary.toLocaleString("en-IN")}</TableCell>
                          <TableCell className="text-right text-sm text-red-600">₹{totalDed.toLocaleString("en-IN")}</TableCell>
                          <TableCell className="text-right">
                            {record.status === "draft" ? (
                              <Input
                                type="number"
                                min={0}
                                value={record.bonus}
                                onChange={(e) => {
                                  const bonus = parseFloat(e.target.value) || 0;
                                  updateRecord.mutate({ id: record.id, updates: { bonus: r2(bonus) } });
                                }}
                                className="h-7 w-[70px] text-xs text-right ml-auto"
                              />
                            ) : (
                              <span className="text-sm">₹{record.bonus.toLocaleString("en-IN")}</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right text-sm font-bold text-emerald-600">₹{record.net_salary.toLocaleString("en-IN")}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className={`text-[10px] ${STATUS_COLORS[record.status] || ""}`}>
                              {record.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {record.status === "draft" && (
                                <Button
                                  variant="ghost" size="sm" className="h-7 text-[10px] text-blue-600"
                                  onClick={() => updateRecord.mutate({ id: record.id, updates: { status: "approved" } })}
                                >
                                  Approve
                                </Button>
                              )}
                              {record.status === "approved" && (
                                <Button
                                  variant="ghost" size="sm" className="h-7 text-[10px] text-emerald-600"
                                  onClick={() => updateRecord.mutate({ id: record.id, updates: { status: "paid", paid_at: new Date().toISOString(), payment_mode: "bank_transfer" } })}
                                >
                                  Pay
                                </Button>
                              )}
                              <Button
                                variant="ghost" size="sm" className="h-7 px-1.5"
                                onClick={() => setPayslipRecord(record)}
                              >
                                <FileText className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Payslip Dialog */}
      {payslipRecord && (
        <PayslipGenerator
          record={payslipRecord}
          employee={employeeMap[payslipRecord.employee_id]}
          open={!!payslipRecord}
          onOpenChange={(open) => { if (!open) setPayslipRecord(null); }}
        />
      )}
    </div>
  );
};

export default PayrollManager;
