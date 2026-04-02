import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  Plus, Loader2, CalendarIcon, TrendingDown, TrendingUp, ArrowUpRight, ArrowDownRight,
  IndianRupee, Download, Search, Trash2, Pencil, Receipt, PieChart, BarChart3,
  AlertTriangle,
} from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart as RPieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from "recharts";

// ── Constants ──
const CATEGORIES = [
  { value: "inventory", label: "Inventory", color: "#6366f1" },
  { value: "transport", label: "Transport", color: "#f59e0b" },
  { value: "labour", label: "Labour", color: "#10b981" },
  { value: "marketing", label: "Marketing", color: "#ef4444" },
  { value: "utilities", label: "Utilities", color: "#8b5cf6" },
  { value: "rent", label: "Rent", color: "#06b6d4" },
  { value: "equipment_repair", label: "Equipment Repair", color: "#f97316" },
  { value: "b2b_purchase", label: "B2B Purchase", color: "#ec4899" },
  { value: "salary", label: "Salary", color: "#14b8a6" },
  { value: "advance", label: "Advance", color: "#a855f7" },
  { value: "other", label: "Other", color: "#6b7280" },
];

const CATEGORY_MAP: Record<string, { label: string; color: string }> = {};
CATEGORIES.forEach((c) => { CATEGORY_MAP[c.value] = { label: c.label, color: c.color }; });

const PAYMENT_MODES = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "credit_card", label: "Credit Card" },
];

interface Expense {
  id: string;
  vendor_id: string;
  title: string;
  amount: number;
  category: string;
  payment_mode: string;
  date: string;
  notes: string | null;
  receipt_url: string | null;
  related_order_id: string | null;
  is_tax_deductible: boolean;
  created_at: string;
}

interface Budget {
  id: string;
  category: string;
  monthly_limit: number;
  month: number;
  year: number;
}

const r = (n: number) => Math.round(n);

// ═══════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════
const SpendingTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const now = new Date();
  const thisMonth = now.getMonth() + 1;
  const thisYear = now.getFullYear();

  const [activeView, setActiveView] = useState<"overview" | "expenses" | "analytics">("overview");
  const [addOpen, setAddOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [catFilter, setCatFilter] = useState("");

  // ── Fetch all expenses ──
  const { data: allExpenses = [], isLoading } = useQuery({
    queryKey: ["expenses", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("vendor_id", user!.id)
        .order("date", { ascending: false });
      if (error) throw error;
      return data as Expense[];
    },
  });

  // ── Fetch budgets for this month ──
  const { data: budgets = [] } = useQuery({
    queryKey: ["budgets", user?.id, thisMonth, thisYear],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("vendor_id", user!.id)
        .eq("month", thisMonth)
        .eq("year", thisYear);
      if (error) throw error;
      return data as Budget[];
    },
  });

  const budgetMap = useMemo(() => {
    const m: Record<string, number> = {};
    budgets.forEach((b) => { m[b.category] = b.monthly_limit; });
    return m;
  }, [budgets]);

  // ── Fetch revenue for analytics ──
  const { data: orders = [] } = useQuery({
    queryKey: ["vendor-revenue", user?.id],
    enabled: !!user && activeView === "analytics",
    queryFn: async () => {
      const sixMonthsAgo = format(subMonths(now, 6), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("rental_orders")
        .select("created_at, vendor_payout")
        .eq("assigned_vendor_id", user!.id)
        .gte("created_at", sixMonthsAgo)
        .in("status", ["confirmed", "completed", "delivered"]);
      if (error) throw error;
      return data as { created_at: string; vendor_payout: number | null }[];
    },
  });

  // ── Derived data ──
  const thisMonthExpenses = useMemo(() => {
    const start = format(startOfMonth(now), "yyyy-MM-dd");
    const end = format(endOfMonth(now), "yyyy-MM-dd");
    return allExpenses.filter((e) => e.date >= start && e.date <= end);
  }, [allExpenses]);

  const lastMonthExpenses = useMemo(() => {
    const lm = subMonths(now, 1);
    const start = format(startOfMonth(lm), "yyyy-MM-dd");
    const end = format(endOfMonth(lm), "yyyy-MM-dd");
    return allExpenses.filter((e) => e.date >= start && e.date <= end);
  }, [allExpenses]);

  const totalThisMonth = thisMonthExpenses.reduce((s, e) => s + e.amount, 0);
  const totalLastMonth = lastMonthExpenses.reduce((s, e) => s + e.amount, 0);
  const pctChange = totalLastMonth > 0 ? ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100 : 0;
  const taxDeductible = thisMonthExpenses.filter((e) => e.is_tax_deductible).reduce((s, e) => s + e.amount, 0);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const m: Record<string, number> = {};
    thisMonthExpenses.forEach((e) => { m[e.category] = (m[e.category] || 0) + e.amount; });
    return CATEGORIES
      .map((c) => ({ ...c, amount: m[c.value] || 0 }))
      .filter((c) => c.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [thisMonthExpenses]);

  const largestCategory = categoryBreakdown[0];

  // Budget alerts
  useEffect(() => {
    if (budgets.length === 0) return;
    categoryBreakdown.forEach((cat) => {
      const limit = budgetMap[cat.value];
      if (!limit) return;
      const pct = (cat.amount / limit) * 100;
      if (pct > 100) {
        toast({ title: `${cat.label} budget exceeded`, description: `Over by ₹${r(cat.amount - limit).toLocaleString("en-IN")}`, variant: "destructive" });
      } else if (pct >= 80) {
        toast({ title: `${cat.label} budget ${Math.round(pct)}% used`, description: `₹${r(cat.amount).toLocaleString("en-IN")} of ₹${r(limit).toLocaleString("en-IN")}` });
      }
    });
  }, [categoryBreakdown.length, budgets.length]);

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Spending Tracker</h2>
          <p className="text-sm text-muted-foreground">{format(now, "MMMM yyyy")}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(["overview", "expenses", "analytics"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setActiveView(v)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors capitalize ${activeView === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
              >
                {v}
              </button>
            ))}
          </div>
          <AddExpenseDialog open={addOpen} onOpenChange={setAddOpen} editData={null} />
        </div>
      </div>

      {activeView === "overview" && (
        <OverviewSection
          totalThisMonth={totalThisMonth}
          pctChange={pctChange}
          largestCategory={largestCategory}
          taxDeductible={taxDeductible}
          categoryBreakdown={categoryBreakdown}
          budgetMap={budgetMap}
          thisMonthExpenses={thisMonthExpenses}
          onCategoryClick={(cat) => { setCatFilter(cat); setActiveView("expenses"); }}
          onEditExpense={setEditExpense}
        />
      )}

      {activeView === "expenses" && (
        <ExpensesListSection
          expenses={allExpenses}
          initialCatFilter={catFilter}
          onEdit={setEditExpense}
        />
      )}

      {activeView === "analytics" && (
        <AnalyticsSection
          allExpenses={allExpenses}
          orders={orders}
          categoryBreakdown={categoryBreakdown}
        />
      )}

      {/* Edit Sheet */}
      {editExpense && (
        <EditExpenseSheet expense={editExpense} open={!!editExpense} onOpenChange={(o) => { if (!o) setEditExpense(null); }} />
      )}
    </div>
  );
};

// ═══════════════════════════════════════════
// Overview Section
// ═══════════════════════════════════════════
const OverviewSection = ({
  totalThisMonth, pctChange, largestCategory, taxDeductible,
  categoryBreakdown, budgetMap, thisMonthExpenses, onCategoryClick, onEditExpense,
}: {
  totalThisMonth: number;
  pctChange: number;
  largestCategory: { label: string; amount: number } | undefined;
  taxDeductible: number;
  categoryBreakdown: { value: string; label: string; color: string; amount: number }[];
  budgetMap: Record<string, number>;
  thisMonthExpenses: Expense[];
  onCategoryClick: (cat: string) => void;
  onEditExpense: (e: Expense) => void;
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [budgetCat, setBudgetCat] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");

  const saveBudget = useMutation({
    mutationFn: async () => {
      const now = new Date();
      const { error } = await supabase.from("budgets").upsert({
        vendor_id: user!.id,
        category: budgetCat,
        monthly_limit: parseFloat(budgetAmount) || 0,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      } as any, { onConflict: "vendor_id,category,month,year" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      setBudgetDialogOpen(false);
      toast({ title: "Budget saved!" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const total = totalThisMonth || 1;
  const recentExpenses = thisMonthExpenses.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">This Month</span>
            </div>
            <p className="text-xl font-bold text-foreground">₹{r(totalThisMonth).toLocaleString("en-IN")}</p>
            {pctChange !== 0 && (
              <div className={`flex items-center gap-0.5 text-[10px] font-medium mt-0.5 ${pctChange > 0 ? "text-red-500" : "text-emerald-500"}`}>
                {pctChange > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(Math.round(pctChange))}% vs last month
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Largest Category</span>
            </div>
            <p className="text-lg font-bold text-foreground">{largestCategory?.label || "—"}</p>
            {largestCategory && <p className="text-xs text-muted-foreground">₹{r(largestCategory.amount).toLocaleString("en-IN")}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Tax Deductible</span>
            </div>
            <p className="text-xl font-bold text-emerald-600">₹{r(taxDeductible).toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <PieChart className="h-4 w-4 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Categories</span>
            </div>
            <p className="text-xl font-bold text-foreground">{categoryBreakdown.length}</p>
            <p className="text-xs text-muted-foreground">active this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Category breakdown bars */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Spending by Category</h3>
          <div className="space-y-2.5">
            {categoryBreakdown.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">No expenses this month.</p>
            ) : (
              categoryBreakdown.map((cat) => {
                const pct = (cat.amount / total) * 100;
                return (
                  <button key={cat.value} onClick={() => onCategoryClick(cat.value)} className="w-full text-left group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">{cat.label}</span>
                      <span className="text-xs font-semibold text-foreground">₹{r(cat.amount).toLocaleString("en-IN")} <span className="text-muted-foreground font-normal">({Math.round(pct)}%)</span></span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: cat.color }} />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Budget vs Actual */}
      {Object.keys(budgetMap).length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Budget vs Actual</h3>
            <div className="space-y-3">
              {CATEGORIES.filter((c) => budgetMap[c.value]).map((cat) => {
                const spent = categoryBreakdown.find((b) => b.value === cat.value)?.amount || 0;
                const limit = budgetMap[cat.value];
                const pct = (spent / limit) * 100;
                const barColor = pct > 100 ? "#ef4444" : pct >= 80 ? "#f59e0b" : "#10b981";
                return (
                  <div key={cat.value}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-foreground">{cat.label}</span>
                      <div className="flex items-center gap-1.5">
                        {pct > 100 && <AlertTriangle className="h-3 w-3 text-red-500" />}
                        <span className="text-xs text-muted-foreground">₹{r(spent).toLocaleString("en-IN")} / ₹{r(limit).toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Set Budget */}
      <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs"><Plus className="h-3 w-3" />Set Budget</Button>
        </DialogTrigger>
        <DialogContent className="max-w-xs">
          <DialogHeader><DialogTitle className="text-base">Set Monthly Budget</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Category</Label>
              <Select value={budgetCat} onValueChange={setBudgetCat}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Monthly Limit (₹)</Label>
              <Input type="number" min={0} value={budgetAmount} onChange={(e) => setBudgetAmount(e.target.value)} placeholder="50000" />
            </div>
            <Button onClick={() => saveBudget.mutate()} disabled={!budgetCat || !budgetAmount || saveBudget.isPending} className="w-full" size="sm">
              {saveBudget.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}Save Budget
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recent expenses */}
      {recentExpenses.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2">Recent Expenses</h3>
          <div className="space-y-1.5">
            {recentExpenses.map((exp) => (
              <button
                key={exp.id}
                onClick={() => onEditExpense(exp)}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CATEGORY_MAP[exp.category]?.color || "#6b7280" }} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{exp.title}</p>
                    <p className="text-[10px] text-muted-foreground">{format(new Date(exp.date), "dd MMM")} &middot; {CATEGORY_MAP[exp.category]?.label || exp.category}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-foreground flex-shrink-0">₹{r(exp.amount).toLocaleString("en-IN")}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════
// Expenses List Section
// ═══════════════════════════════════════════
const ExpensesListSection = ({
  expenses,
  initialCatFilter,
  onEdit,
}: {
  expenses: Expense[];
  initialCatFilter: string;
  onEdit: (e: Expense) => void;
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [catFilter, setCatFilter] = useState(initialCatFilter);
  const [modeFilter, setModeFilter] = useState("");

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      if (catFilter && e.category !== catFilter) return false;
      if (modeFilter && e.payment_mode !== modeFilter) return false;
      if (searchTerm && !e.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [expenses, catFilter, modeFilter, searchTerm]);

  const deleteExpense = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast({ title: "Expense deleted" });
    },
  });

  const exportCSV = (taxOnly = false) => {
    const data = taxOnly ? filtered.filter((e) => e.is_tax_deductible) : filtered;
    const header = "Date,Title,Category,Payment Mode,Amount,Tax Deductible,Notes";
    const rows = data.map((e) =>
      `${e.date},"${e.title}",${CATEGORY_MAP[e.category]?.label || e.category},${e.payment_mode},${e.amount},${e.is_tax_deductible ? "Yes" : "No"},"${(e.notes || "").replace(/"/g, '""')}"`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses${taxOnly ? "_tax" : ""}_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search expenses..." className="pl-8 h-8 text-xs" />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={modeFilter} onValueChange={setModeFilter}>
          <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="Payment" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Modes</SelectItem>
            {PAYMENT_MODES.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" className="gap-1 h-8 text-xs" onClick={() => exportCSV(false)}>
            <Download className="h-3 w-3" />CSV
          </Button>
          <Button variant="outline" size="sm" className="gap-1 h-8 text-xs" onClick={() => exportCSV(true)}>
            <Receipt className="h-3 w-3" />Tax Report
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs">Title</TableHead>
                <TableHead className="text-xs">Category</TableHead>
                <TableHead className="text-xs">Mode</TableHead>
                <TableHead className="text-xs text-right">Amount</TableHead>
                <TableHead className="text-xs w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">No expenses found.</TableCell></TableRow>
              ) : (
                filtered.map((exp) => (
                  <TableRow key={exp.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => onEdit(exp)}>
                    <TableCell className="text-xs text-muted-foreground">{format(new Date(exp.date), "dd MMM yy")}</TableCell>
                    <TableCell>
                      <p className="text-sm font-medium text-foreground">{exp.title}</p>
                      {exp.is_tax_deductible && <Badge variant="secondary" className="text-[9px] mt-0.5 bg-emerald-50 text-emerald-600">Tax</Badge>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px]" style={{ backgroundColor: `${CATEGORY_MAP[exp.category]?.color}15`, color: CATEGORY_MAP[exp.category]?.color }}>
                        {CATEGORY_MAP[exp.category]?.label || exp.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground capitalize">{exp.payment_mode.replace("_", " ")}</TableCell>
                    <TableCell className="text-right text-sm font-semibold">₹{r(exp.amount).toLocaleString("en-IN")}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-7 px-1.5 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); if (confirm("Delete this expense?")) deleteExpense.mutate(exp.id); }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{filtered.length} expenses &middot; Total: ₹{r(filtered.reduce((s, e) => s + e.amount, 0)).toLocaleString("en-IN")}</p>
    </div>
  );
};

// ═══════════════════════════════════════════
// Analytics Section
// ═══════════════════════════════════════════
const AnalyticsSection = ({
  allExpenses,
  orders,
  categoryBreakdown,
}: {
  allExpenses: Expense[];
  orders: { created_at: string; vendor_payout: number | null }[];
  categoryBreakdown: { value: string; label: string; color: string; amount: number }[];
}) => {
  const now = new Date();

  // Monthly trend (last 6 months)
  const monthlyTrend = useMemo(() => {
    const months: { month: string; expenses: number; revenue: number; profit: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(now, i);
      const key = format(d, "yyyy-MM");
      const label = format(d, "MMM");
      const start = format(startOfMonth(d), "yyyy-MM-dd");
      const end = format(endOfMonth(d), "yyyy-MM-dd");
      const exp = allExpenses.filter((e) => e.date >= start && e.date <= end).reduce((s, e) => s + e.amount, 0);
      const rev = orders.filter((o) => { const od = format(new Date(o.created_at), "yyyy-MM"); return od === key; }).reduce((s, o) => s + (o.vendor_payout || 0), 0);
      months.push({ month: label, expenses: r(exp), revenue: r(rev), profit: r(rev - exp) });
    }
    return months;
  }, [allExpenses, orders]);

  // Top expense days this month
  const topDays = useMemo(() => {
    const start = format(startOfMonth(now), "yyyy-MM-dd");
    const end = format(endOfMonth(now), "yyyy-MM-dd");
    const thisMonth = allExpenses.filter((e) => e.date >= start && e.date <= end);
    const dayMap: Record<string, number> = {};
    thisMonth.forEach((e) => { dayMap[e.date] = (dayMap[e.date] || 0) + e.amount; });
    return Object.entries(dayMap)
      .map(([date, amount]) => ({ date: format(new Date(date), "dd MMM"), amount: r(amount) }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [allExpenses]);

  // B2B spend
  const b2bSpend = useMemo(() => {
    const start = format(startOfMonth(now), "yyyy-MM-dd");
    const end = format(endOfMonth(now), "yyyy-MM-dd");
    return allExpenses
      .filter((e) => e.category === "b2b_purchase" && e.date >= start && e.date <= end)
      .reduce((s, e) => s + e.amount, 0);
  }, [allExpenses]);

  return (
    <div className="space-y-6">
      {/* Monthly Trend */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Monthly Trend (6 months)</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <RechartsTooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", fontSize: 12 }}
                  formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, ""]}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Profit row */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border overflow-x-auto">
            {monthlyTrend.map((m) => (
              <div key={m.month} className="text-center flex-shrink-0">
                <p className="text-[10px] text-muted-foreground">{m.month}</p>
                <p className={`text-xs font-bold ${m.profit >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {m.profit >= 0 ? "+" : ""}₹{m.profit.toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Pie + B2B + Top Days */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Pie chart */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Category Split</h3>
            {categoryBreakdown.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">No data this month.</p>
            ) : (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RPieChart>
                    <Pie
                      data={categoryBreakdown}
                      dataKey="amount"
                      nameKey="label"
                      cx="50%" cy="50%"
                      outerRadius={70}
                      innerRadius={40}
                      paddingAngle={2}
                    >
                      {categoryBreakdown.map((c) => (
                        <Cell key={c.value} fill={c.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", fontSize: 12 }}
                      formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, ""]}
                    />
                  </RPieChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {categoryBreakdown.slice(0, 5).map((c) => (
                <span key={c.value} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />{c.label}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {/* B2B */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-foreground mb-1">B2B Purchases</h3>
              <p className="text-2xl font-bold text-foreground">₹{r(b2bSpend).toLocaleString("en-IN")}</p>
              <p className="text-xs text-muted-foreground">this month</p>
            </CardContent>
          </Card>

          {/* Top days */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">Top Spending Days</h3>
              {topDays.length === 0 ? (
                <p className="text-xs text-muted-foreground">No data.</p>
              ) : (
                <div className="space-y-1.5">
                  {topDays.map((d, i) => (
                    <div key={d.date} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{d.date}</span>
                      <span className="font-semibold">₹{d.amount.toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════
// Add / Edit Expense Dialog
// ═══════════════════════════════════════════
const AddExpenseDialog = ({
  open,
  onOpenChange,
  editData,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editData: Expense | null;
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expDate, setExpDate] = useState<Date | undefined>(editData ? new Date(editData.date) : new Date());
  const [form, setForm] = useState({
    title: editData?.title || "",
    amount: editData ? String(editData.amount) : "",
    category: editData?.category || "other",
    payment_mode: editData?.payment_mode || "cash",
    notes: editData?.notes || "",
    is_tax_deductible: editData?.is_tax_deductible || false,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        vendor_id: user!.id,
        title: form.title,
        amount: parseFloat(form.amount) || 0,
        category: form.category,
        payment_mode: form.payment_mode,
        date: expDate ? format(expDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
        notes: form.notes || null,
        is_tax_deductible: form.is_tax_deductible,
      };
      if (editData) {
        const { error } = await supabase.from("expenses").update(payload).eq("id", editData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("expenses").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      onOpenChange(false);
      toast({ title: editData ? "Expense updated!" : "Expense added!" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />Add Expense</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90dvh] overflow-y-auto">
        <DialogHeader><DialogTitle>{editData ? "Edit" : "Add"} Expense</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Title *</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="What was this expense?" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Amount (₹) *</Label>
              <Input type="number" min={0} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="5000" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Payment Mode</Label>
              <Select value={form.payment_mode} onValueChange={(v) => setForm({ ...form, payment_mode: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PAYMENT_MODES.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal text-sm">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expDate ? format(expDate, "dd MMM yyyy") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={expDate} onSelect={setExpDate} initialFocus className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Notes</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional details..." rows={2} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Tax Deductible</Label>
            <Switch checked={form.is_tax_deductible} onCheckedChange={(v) => setForm({ ...form, is_tax_deductible: v })} />
          </div>
          <Button onClick={() => saveMutation.mutate()} disabled={!form.title.trim() || !form.amount || saveMutation.isPending} className="w-full">
            {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {editData ? "Update" : "Add"} Expense
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ═══════════════════════════════════════════
// Edit Expense Sheet
// ═══════════════════════════════════════════
const EditExpenseSheet = ({
  expense,
  open,
  onOpenChange,
}: {
  expense: Expense;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expDate, setExpDate] = useState<Date>(new Date(expense.date));
  const [form, setForm] = useState({
    title: expense.title,
    amount: String(expense.amount),
    category: expense.category,
    payment_mode: expense.payment_mode,
    notes: expense.notes || "",
    is_tax_deductible: expense.is_tax_deductible,
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("expenses").update({
        title: form.title,
        amount: parseFloat(form.amount) || 0,
        category: form.category,
        payment_mode: form.payment_mode,
        date: format(expDate, "yyyy-MM-dd"),
        notes: form.notes || null,
        is_tax_deductible: form.is_tax_deductible,
      } as any).eq("id", expense.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      onOpenChange(false);
      toast({ title: "Expense updated!" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("expenses").delete().eq("id", expense.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      onOpenChange(false);
      toast({ title: "Expense deleted" });
    },
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader><SheetTitle>Edit Expense</SheetTitle></SheetHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Amount (₹)</Label>
              <Input type="number" min={0} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Payment Mode</Label>
              <Select value={form.payment_mode} onValueChange={(v) => setForm({ ...form, payment_mode: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PAYMENT_MODES.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal text-sm">
                    <CalendarIcon className="mr-2 h-4 w-4" />{format(expDate, "dd MMM yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={expDate} onSelect={(d) => d && setExpDate(d)} initialFocus className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Notes</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Tax Deductible</Label>
            <Switch checked={form.is_tax_deductible} onCheckedChange={(v) => setForm({ ...form, is_tax_deductible: v })} />
          </div>
          <Separator />
          <div className="flex gap-2">
            <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending} className="flex-1" size="sm">
              {updateMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}Save
            </Button>
            <Button variant="destructive" size="sm" onClick={() => { if (confirm("Delete this expense?")) deleteMutation.mutate(); }} disabled={deleteMutation.isPending}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SpendingTracker;
