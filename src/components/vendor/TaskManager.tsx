import { useState, useMemo } from "react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Plus, Loader2, CalendarIcon, LayoutGrid, List, ChevronRight,
  AlertTriangle, Clock, CheckCircle2, XCircle, ArrowRight,
} from "lucide-react";
import { format } from "date-fns";

// ── Types ──
interface Task {
  id: string;
  vendor_id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  due_date: string | null;
  assigned_to: string | null;
  related_order_id: string | null;
  is_recurring: boolean;
  recurrence: string | null;
  created_at: string;
  completed_at: string | null;
}

interface Employee {
  id: string;
  full_name: string;
  role: string;
}

type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";
type Priority = "low" | "medium" | "high" | "urgent";

const STATUS_COLUMNS: { value: TaskStatus; label: string; icon: any; color: string }[] = [
  { value: "todo", label: "To Do", icon: Clock, color: "text-muted-foreground" },
  { value: "in_progress", label: "In Progress", icon: ArrowRight, color: "text-blue-500" },
  { value: "done", label: "Done", icon: CheckCircle2, color: "text-emerald-500" },
  { value: "cancelled", label: "Cancelled", icon: XCircle, color: "text-red-400" },
];

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; dot: string }> = {
  low: { label: "Low", color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400", dot: "bg-gray-400" },
  medium: { label: "Medium", color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400", dot: "bg-blue-500" },
  high: { label: "High", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", dot: "bg-amber-500" },
  urgent: { label: "Urgent", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", dot: "bg-red-500" },
};

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

// ═══════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════
const TaskManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [addOpen, setAddOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterAssignee, setFilterAssignee] = useState<string>("all");
  const [quickTask, setQuickTask] = useState("");

  // Fetch tasks
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("vendor_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Task[];
    },
  });

  // Fetch employees for assignment
  const { data: employees = [] } = useQuery({
    queryKey: ["employees", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, full_name, role")
        .eq("vendor_id", user!.id)
        .eq("is_active", true)
        .order("full_name");
      if (error) throw error;
      return data as Employee[];
    },
  });

  const employeeMap = useMemo(() => {
    const map: Record<string, Employee> = {};
    employees.forEach((e) => { map[e.id] = e; });
    return map;
  }, [employees]);

  // Move task status
  const moveTask = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) => {
      const updates: any = { status };
      if (status === "done") updates.completed_at = new Date().toISOString();
      else updates.completed_at = null;
      const { error } = await supabase.from("tasks").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  // Quick add personal task
  const quickAddTask = useMutation({
    mutationFn: async (title: string) => {
      const { error } = await supabase.from("tasks").insert({
        vendor_id: user!.id,
        title,
        priority: "medium",
        status: "todo",
        created_by: user!.id,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setQuickTask("");
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filterStatus !== "all" && t.status !== filterStatus) return false;
      if (filterPriority !== "all" && t.priority !== filterPriority) return false;
      if (filterAssignee === "unassigned" && t.assigned_to !== null) return false;
      if (filterAssignee !== "all" && filterAssignee !== "unassigned" && t.assigned_to !== filterAssignee) return false;
      return true;
    });
  }, [tasks, filterStatus, filterPriority, filterAssignee]);

  // Group by status for kanban
  const grouped = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = { todo: [], in_progress: [], done: [], cancelled: [] };
    filteredTasks.forEach((t) => {
      if (map[t.status as TaskStatus]) map[t.status as TaskStatus].push(t);
    });
    return map;
  }, [filteredTasks]);

  // Personal tasks (unassigned)
  const personalTasks = tasks.filter((t) => t.assigned_to === null && t.status !== "done" && t.status !== "cancelled");

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
          <h2 className="text-xl font-bold text-foreground">Task Board</h2>
          <p className="text-sm text-muted-foreground">{tasks.filter((t) => t.status !== "done" && t.status !== "cancelled").length} open tasks</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setView("kanban")}
              className={`p-1.5 transition-colors ${view === "kanban" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-1.5 transition-colors ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <AddTaskDialog open={addOpen} onOpenChange={setAddOpen} employees={employees} />
        </div>
      </div>

      {view === "list" && (
        <>
          {/* Quick-add personal todo */}
          <div className="flex gap-2">
            <Input
              value={quickTask}
              onChange={(e) => setQuickTask(e.target.value)}
              placeholder="Quick add a personal task..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && quickTask.trim()) quickAddTask.mutate(quickTask.trim());
              }}
              className="text-sm"
            />
            <Button
              size="sm"
              variant="outline"
              disabled={!quickTask.trim() || quickAddTask.isPending}
              onClick={() => quickTask.trim() && quickAddTask.mutate(quickTask.trim())}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Personal To-Do section */}
          {personalTasks.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">My Personal Tasks</h4>
              <div className="space-y-1.5">
                {personalTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/40 group">
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        onClick={() => moveTask.mutate({ id: task.id, status: "done" })}
                        className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-muted-foreground/30 hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
                      />
                      <span className="text-sm text-foreground truncate">{task.title}</span>
                    </div>
                    <Badge variant="secondary" className={`text-[9px] ${PRIORITY_CONFIG[task.priority as Priority]?.color || ""}`}>
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {STATUS_COLUMNS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                {(["low", "medium", "high", "urgent"] as Priority[]).map((p) => (
                  <SelectItem key={p} value={p}>{PRIORITY_CONFIG[p].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterAssignee} onValueChange={setFilterAssignee}>
              <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Assignee" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* List Table */}
          <div className="border border-border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs">Task</TableHead>
                  <TableHead className="text-xs w-[80px]">Priority</TableHead>
                  <TableHead className="text-xs w-[100px]">Status</TableHead>
                  <TableHead className="text-xs w-[100px]">Assignee</TableHead>
                  <TableHead className="text-xs w-[90px]">Due</TableHead>
                  <TableHead className="text-xs w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">No tasks match filters.</TableCell>
                  </TableRow>
                ) : (
                  filteredTasks.map((task) => {
                    const assignee = task.assigned_to ? employeeMap[task.assigned_to] : null;
                    const overdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "done" && task.status !== "cancelled";
                    return (
                      <TableRow key={task.id} className="hover:bg-muted/30">
                        <TableCell>
                          <p className={`text-sm font-medium ${task.status === "done" ? "line-through text-muted-foreground" : "text-foreground"}`}>{task.title}</p>
                          {task.description && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{task.description}</p>}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`text-[10px] ${PRIORITY_CONFIG[task.priority as Priority]?.color || ""}`}>
                            {task.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select value={task.status} onValueChange={(v) => moveTask.mutate({ id: task.id, status: v as TaskStatus })}>
                            <SelectTrigger className="h-7 text-[11px] border-0 bg-muted/50 w-[90px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {STATUS_COLUMNS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {assignee ? (
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[9px] font-bold flex-shrink-0">
                                {getInitials(assignee.full_name)}
                              </div>
                              <span className="text-xs truncate">{assignee.full_name.split(" ")[0]}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {task.due_date ? (
                            <span className={`text-xs ${overdue ? "text-red-500 font-semibold" : "text-muted-foreground"}`}>
                              {format(new Date(task.due_date), "dd MMM")}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {task.status !== "done" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-emerald-600 hover:text-emerald-700"
                              onClick={() => moveTask.mutate({ id: task.id, status: "done" })}
                            >
                              Done
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {view === "kanban" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATUS_COLUMNS.map((col) => {
            const Icon = col.icon;
            const columnTasks = grouped[col.value];
            return (
              <div key={col.value} className="space-y-3">
                {/* Column header */}
                <div className="flex items-center gap-2 px-1">
                  <Icon className={`h-4 w-4 ${col.color}`} />
                  <h4 className="text-sm font-semibold text-foreground">{col.label}</h4>
                  <Badge variant="secondary" className="text-[10px] ml-auto">{columnTasks.length}</Badge>
                </div>
                {/* Cards */}
                <div className="space-y-2 min-h-[100px]">
                  {columnTasks.length === 0 ? (
                    <div className="border-2 border-dashed border-border/50 rounded-xl py-6 text-center">
                      <p className="text-xs text-muted-foreground">No tasks</p>
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        assignee={task.assigned_to ? employeeMap[task.assigned_to] : null}
                        onMove={(status) => moveTask.mutate({ id: task.id, status })}
                        currentStatus={col.value}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════
// Task Card (Kanban)
// ═══════════════════════════════════════════
const TaskCard = ({
  task,
  assignee,
  onMove,
  currentStatus,
}: {
  task: Task;
  assignee: Employee | null;
  onMove: (status: TaskStatus) => void;
  currentStatus: TaskStatus;
}) => {
  const overdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "done" && task.status !== "cancelled";
  const prio = PRIORITY_CONFIG[task.priority as Priority];

  // Possible next statuses
  const nextStatuses = STATUS_COLUMNS.filter((s) => s.value !== currentStatus);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-medium leading-snug ${task.status === "done" ? "line-through text-muted-foreground" : "text-foreground"}`}>
            {task.title}
          </p>
          <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${prio?.dot || "bg-gray-400"}`} title={task.priority} />
        </div>

        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
        )}

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            {assignee ? (
              <div className="flex items-center gap-1.5" title={assignee.full_name}>
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[9px] font-bold">
                  {getInitials(assignee.full_name)}
                </div>
                <span className="text-[10px] text-muted-foreground">{assignee.full_name.split(" ")[0]}</span>
              </div>
            ) : (
              <span className="text-[10px] text-muted-foreground italic">Unassigned</span>
            )}
          </div>
          {task.due_date && (
            <span className={`text-[10px] flex items-center gap-0.5 ${overdue ? "text-red-500 font-semibold" : "text-muted-foreground"}`}>
              {overdue && <AlertTriangle className="h-2.5 w-2.5" />}
              {format(new Date(task.due_date), "dd MMM")}
            </span>
          )}
        </div>

        {/* Move buttons */}
        {currentStatus !== "done" && currentStatus !== "cancelled" && (
          <div className="flex gap-1 pt-1 border-t border-border/50">
            {nextStatuses
              .filter((s) => s.value !== "cancelled" || currentStatus === "todo")
              .slice(0, 2)
              .map((s) => {
                const NIcon = s.icon;
                return (
                  <button
                    key={s.value}
                    onClick={() => onMove(s.value)}
                    className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md hover:bg-muted transition-colors ${s.color}`}
                  >
                    <NIcon className="h-3 w-3" /> {s.label}
                  </button>
                );
              })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ═══════════════════════════════════════════
// Add Task Dialog
// ═══════════════════════════════════════════
const AddTaskDialog = ({
  open,
  onOpenChange,
  employees,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  employees: Employee[];
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [form, setForm] = useState({
    title: "", description: "", priority: "medium",
    assigned_to: "", related_order_id: "",
    is_recurring: false, recurrence: "daily",
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("tasks").insert({
        vendor_id: user!.id,
        title: form.title,
        description: form.description || null,
        priority: form.priority,
        status: "todo",
        due_date: dueDate ? format(dueDate, "yyyy-MM-dd") : null,
        assigned_to: form.assigned_to || null,
        related_order_id: form.related_order_id || null,
        is_recurring: form.is_recurring,
        recurrence: form.is_recurring ? form.recurrence : null,
        created_by: user!.id,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      onOpenChange(false);
      setForm({ title: "", description: "", priority: "medium", assigned_to: "", related_order_id: "", is_recurring: false, recurrence: "daily" });
      setDueDate(undefined);
      toast({ title: "Task created!" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />Add Task</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Title *</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="What needs to be done?" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Details..." rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["low", "medium", "high", "urgent"] as Priority[]).map((p) => (
                    <SelectItem key={p} value={p}>
                      <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${PRIORITY_CONFIG[p].dot}`} />
                        {PRIORITY_CONFIG[p].label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Assign To</Label>
              <Select value={form.assigned_to} onValueChange={(v) => setForm({ ...form, assigned_to: v })}>
                <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned (personal)</SelectItem>
                  {employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal text-sm">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "dd MMM yyyy") : "No due date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus className="pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Recurring Task</Label>
            <Switch checked={form.is_recurring} onCheckedChange={(v) => setForm({ ...form, is_recurring: v })} />
          </div>
          {form.is_recurring && (
            <Select value={form.recurrence} onValueChange={(v) => setForm({ ...form, recurrence: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Button
            onClick={() => addMutation.mutate()}
            disabled={!form.title.trim() || addMutation.isPending}
            className="w-full"
          >
            {addMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Create Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskManager;
