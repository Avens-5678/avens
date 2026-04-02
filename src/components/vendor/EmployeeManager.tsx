import { useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Plus, User, Phone, Mail, CalendarIcon, Loader2, Pencil, UserX, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import AttendanceTracker from "./AttendanceTracker";

// ── Types ──
interface Employee {
  id: string;
  vendor_id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  role: string;
  employment_type: string;
  salary_type: string;
  base_salary: number;
  joining_date: string;
  is_active: boolean;
  avatar_url: string | null;
  notes: string | null;
  created_at: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
}

const ROLES = [
  { value: "manager", label: "Manager" },
  { value: "driver", label: "Driver" },
  { value: "loader", label: "Loader" },
  { value: "technician", label: "Technician" },
  { value: "coordinator", label: "Coordinator" },
  { value: "cleaner", label: "Cleaner" },
  { value: "security", label: "Security" },
  { value: "other", label: "Other" },
];

const EMPLOYMENT_TYPES = [
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "daily_wage", label: "Daily Wage" },
];

const SALARY_TYPES = [
  { value: "monthly", label: "Monthly" },
  { value: "daily", label: "Daily" },
  { value: "hourly", label: "Hourly" },
];

const ROLE_COLORS: Record<string, string> = {
  manager: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  driver: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  loader: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  technician: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  coordinator: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  cleaner: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  security: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  other: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
};

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

// ═══════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════
const EmployeeManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [addOpen, setAddOpen] = useState(false);
  const [detailEmployee, setDetailEmployee] = useState<Employee | null>(null);
  const [activeView, setActiveView] = useState<"employees" | "attendance">("employees");

  // ── Fetch employees ──
  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["employees", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("vendor_id", user!.id)
        .order("is_active", { ascending: false })
        .order("full_name");
      if (error) throw error;
      return data as Employee[];
    },
  });

  const activeCount = employees.filter((e) => e.is_active).length;

  // ── Toggle active status ──
  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("employees")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast({ title: "Status updated" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Team Management</h2>
          <p className="text-sm text-muted-foreground">{activeCount} active employee{activeCount !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setActiveView("employees")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${activeView === "employees" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
            >
              Employees
            </button>
            <button
              onClick={() => setActiveView("attendance")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${activeView === "attendance" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
            >
              Attendance
            </button>
          </div>
          <AddEmployeeDialog open={addOpen} onOpenChange={setAddOpen} />
        </div>
      </div>

      {activeView === "attendance" ? (
        <AttendanceTracker employees={employees.filter((e) => e.is_active)} />
      ) : (
        <>
          {employees.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                <User className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No employees yet</h3>
              <p className="text-sm text-muted-foreground">Add your first team member to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees.map((emp) => (
                <Card
                  key={emp.id}
                  className={`cursor-pointer transition-all hover:shadow-md hover:border-primary/30 ${!emp.is_active ? "opacity-60" : ""}`}
                  onClick={() => setDetailEmployee(emp)}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {getInitials(emp.full_name)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{emp.full_name}</p>
                          <Badge variant="secondary" className={`text-[10px] ${ROLE_COLORS[emp.role] || ""}`}>
                            {emp.role}
                          </Badge>
                        </div>
                      </div>
                      <Switch
                        checked={emp.is_active}
                        onCheckedChange={(checked) => {
                          toggleActive.mutate({ id: emp.id, is_active: checked });
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="scale-75"
                      />
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      {emp.phone && (
                        <p className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{emp.phone}</p>
                      )}
                      <p className="flex items-center gap-1.5">
                        <CalendarIcon className="h-3 w-3" />
                        Joined {format(new Date(emp.joining_date), "dd MMM yyyy")}
                      </p>
                      <p className="capitalize">{emp.employment_type.replace("_", " ")} &middot; ₹{emp.base_salary.toLocaleString()}/{emp.salary_type}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Detail Sheet */}
      {detailEmployee && (
        <EmployeeDetailSheet
          employee={detailEmployee}
          open={!!detailEmployee}
          onOpenChange={(open) => { if (!open) setDetailEmployee(null); }}
        />
      )}
    </div>
  );
};

// ═══════════════════════════════════════════
// Add Employee Dialog
// ═══════════════════════════════════════════
const AddEmployeeDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [joiningDate, setJoiningDate] = useState<Date | undefined>(new Date());
  const [form, setForm] = useState({
    full_name: "", phone: "", email: "", role: "other",
    employment_type: "full_time", salary_type: "monthly",
    base_salary: "", notes: "",
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("employees").insert({
        vendor_id: user!.id,
        full_name: form.full_name,
        phone: form.phone || null,
        email: form.email || null,
        role: form.role,
        employment_type: form.employment_type,
        salary_type: form.salary_type,
        base_salary: parseFloat(form.base_salary) || 0,
        joining_date: joiningDate ? format(joiningDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
        notes: form.notes || null,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      onOpenChange(false);
      setForm({ full_name: "", phone: "", email: "", role: "other", employment_type: "full_time", salary_type: "monthly", base_salary: "", notes: "" });
      setJoiningDate(new Date());
      toast({ title: "Employee added!" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />Add Employee</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Full Name *</Label>
            <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Employee name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Role *</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Employment Type</Label>
              <Select value={form.employment_type} onValueChange={(v) => setForm({ ...form, employment_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Salary Type</Label>
              <Select value={form.salary_type} onValueChange={(v) => setForm({ ...form, salary_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SALARY_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Base Salary (₹)</Label>
              <Input type="number" min={0} value={form.base_salary} onChange={(e) => setForm({ ...form, base_salary: e.target.value })} placeholder="15000" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Joining Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal text-sm">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {joiningDate ? format(joiningDate, "dd MMM yyyy") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={joiningDate} onSelect={setJoiningDate} initialFocus className="pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Notes</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any additional notes..." rows={2} />
          </div>
          <Button
            onClick={() => addMutation.mutate()}
            disabled={!form.full_name.trim() || addMutation.isPending}
            className="w-full"
          >
            {addMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Add Employee
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ═══════════════════════════════════════════
// Employee Detail Sheet
// ═══════════════════════════════════════════
const EmployeeDetailSheet = ({
  employee,
  open,
  onOpenChange,
}: {
  employee: Employee;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...employee });

  // Fetch assigned tasks
  const { data: tasks = [] } = useQuery({
    queryKey: ["employee-tasks", employee.id],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("id, title, status, priority, due_date")
        .eq("assigned_to", employee.id)
        .neq("status", "cancelled")
        .order("due_date", { ascending: true })
        .limit(20);
      if (error) throw error;
      return data as Task[];
    },
  });

  // Fetch this month attendance
  const now = new Date();
  const monthStart = format(new Date(now.getFullYear(), now.getMonth(), 1), "yyyy-MM-dd");
  const monthEnd = format(new Date(now.getFullYear(), now.getMonth() + 1, 0), "yyyy-MM-dd");

  const { data: attendance = [] } = useQuery({
    queryKey: ["employee-attendance", employee.id, monthStart],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("status")
        .eq("employee_id", employee.id)
        .gte("date", monthStart)
        .lte("date", monthEnd);
      if (error) throw error;
      return data as { status: string }[];
    },
  });

  const attendanceSummary = {
    present: attendance.filter((a) => a.status === "present").length,
    absent: attendance.filter((a) => a.status === "absent").length,
    half_day: attendance.filter((a) => a.status === "half_day").length,
    leave: attendance.filter((a) => a.status === "leave").length,
  };

  const updateEmployee = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("employees")
        .update({
          full_name: form.full_name,
          phone: form.phone || null,
          email: form.email || null,
          role: form.role,
          employment_type: form.employment_type,
          salary_type: form.salary_type,
          base_salary: form.base_salary,
          notes: form.notes || null,
        } as any)
        .eq("id", employee.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setEditing(false);
      toast({ title: "Employee updated!" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const PRIORITY_COLORS: Record<string, string> = {
    low: "bg-gray-100 text-gray-600",
    medium: "bg-blue-100 text-blue-600",
    high: "bg-amber-100 text-amber-700",
    urgent: "bg-red-100 text-red-700",
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              {getInitials(employee.full_name)}
            </div>
            {employee.full_name}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5 mt-5">
          {/* Info */}
          {editing ? (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Name</Label>
                <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Phone</Label>
                  <Input value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Email</Label>
                  <Input value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Role</Label>
                  <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Salary (₹)</Label>
                  <Input type="number" value={form.base_salary} onChange={(e) => setForm({ ...form, base_salary: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Notes</Label>
                <Textarea value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => updateEmployee.mutate()} disabled={updateEmployee.isPending} size="sm">
                  {updateEmployee.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}Save
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setEditing(false); setForm({ ...employee }); }}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className={`${ROLE_COLORS[employee.role] || ""}`}>{employee.role}</Badge>
                <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="gap-1 text-xs">
                  <Pencil className="h-3 w-3" />Edit
                </Button>
              </div>
              {employee.phone && (
                <p className="text-sm flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" />{employee.phone}</p>
              )}
              {employee.email && (
                <p className="text-sm flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" />{employee.email}</p>
              )}
              <p className="text-sm flex items-center gap-2">
                <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                Joined {format(new Date(employee.joining_date), "dd MMM yyyy")}
              </p>
              <p className="text-sm capitalize">
                {employee.employment_type.replace("_", " ")} &middot; ₹{employee.base_salary.toLocaleString()}/{employee.salary_type}
              </p>
              {employee.notes && <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">{employee.notes}</p>}
            </div>
          )}

          <Separator />

          {/* Attendance Summary */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">
              Attendance — {format(now, "MMMM yyyy")}
            </h4>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                <p className="text-lg font-bold text-emerald-600">{attendanceSummary.present}</p>
                <p className="text-[10px] text-muted-foreground">Present</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
                <p className="text-lg font-bold text-red-600">{attendanceSummary.absent}</p>
                <p className="text-[10px] text-muted-foreground">Absent</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                <p className="text-lg font-bold text-amber-600">{attendanceSummary.half_day}</p>
                <p className="text-[10px] text-muted-foreground">Half Day</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <p className="text-lg font-bold text-blue-600">{attendanceSummary.leave}</p>
                <p className="text-[10px] text-muted-foreground">Leave</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Assigned Tasks */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">
              Assigned Tasks ({tasks.length})
            </h4>
            {tasks.length === 0 ? (
              <p className="text-xs text-muted-foreground">No tasks assigned.</p>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      {task.status === "done" ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                      ) : task.status === "in_progress" ? (
                        <Clock className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                      ) : (
                        <div className="h-3.5 w-3.5 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                      )}
                      <span className={`truncate ${task.status === "done" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {task.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Badge variant="secondary" className={`text-[9px] ${PRIORITY_COLORS[task.priority] || ""}`}>{task.priority}</Badge>
                      {task.due_date && (
                        <span className={`text-[10px] ${new Date(task.due_date) < new Date() && task.status !== "done" ? "text-red-500 font-semibold" : "text-muted-foreground"}`}>
                          {format(new Date(task.due_date), "dd MMM")}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EmployeeManager;
