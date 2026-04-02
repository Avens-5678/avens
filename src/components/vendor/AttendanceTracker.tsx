import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, CheckCircle2, Loader2, Users } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isToday, isFuture, getDay } from "date-fns";

interface Employee {
  id: string;
  full_name: string;
  role: string;
}

interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  status: string;
}

type AttendanceStatus = "present" | "absent" | "half_day" | "leave" | "holiday";

const STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: "P",
  absent: "A",
  half_day: "H",
  leave: "L",
  holiday: "Off",
};

const STATUS_COLORS: Record<AttendanceStatus, string> = {
  present: "bg-emerald-500 text-white",
  absent: "bg-red-500 text-white",
  half_day: "bg-amber-500 text-white",
  leave: "bg-blue-500 text-white",
  holiday: "bg-gray-400 text-white",
};

const STATUS_OPTIONS: { value: AttendanceStatus; label: string }[] = [
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "half_day", label: "Half Day" },
  { value: "leave", label: "Leave" },
  { value: "holiday", label: "Holiday" },
];

const AttendanceTracker = ({ employees }: { employees: Employee[] }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const todayStr = format(new Date(), "yyyy-MM-dd");

  // Fetch attendance for the month
  const { data: records = [], isLoading } = useQuery({
    queryKey: ["attendance", user?.id, format(monthStart, "yyyy-MM")],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("id, employee_id, date, status")
        .eq("vendor_id", user!.id)
        .gte("date", format(monthStart, "yyyy-MM-dd"))
        .lte("date", format(monthEnd, "yyyy-MM-dd"));
      if (error) throw error;
      return data as AttendanceRecord[];
    },
  });

  // Index records for fast lookup: { "empId|date": status }
  const recordMap = useMemo(() => {
    const map: Record<string, { id: string; status: string }> = {};
    records.forEach((r) => {
      map[`${r.employee_id}|${r.date}`] = { id: r.id, status: r.status };
    });
    return map;
  }, [records]);

  // Upsert attendance
  const upsertMutation = useMutation({
    mutationFn: async ({ employee_id, date, status }: { employee_id: string; date: string; status: AttendanceStatus }) => {
      const existing = recordMap[`${employee_id}|${date}`];
      if (existing) {
        const { error } = await supabase
          .from("attendance")
          .update({ status } as any)
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("attendance")
          .insert({ employee_id, vendor_id: user!.id, date, status } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  // Bulk mark all present for today
  const bulkMarkPresent = useMutation({
    mutationFn: async () => {
      const inserts = employees
        .filter((emp) => !recordMap[`${emp.id}|${todayStr}`])
        .map((emp) => ({
          employee_id: emp.id,
          vendor_id: user!.id,
          date: todayStr,
          status: "present" as const,
        }));
      if (inserts.length === 0) return;
      const { error } = await supabase.from("attendance").insert(inserts as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast({ title: "All marked present for today!" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  // Monthly summary per employee
  const summaries = useMemo(() => {
    const map: Record<string, Record<string, number>> = {};
    employees.forEach((emp) => {
      map[emp.id] = { present: 0, absent: 0, half_day: 0, leave: 0, holiday: 0 };
    });
    records.forEach((r) => {
      if (map[r.employee_id] && map[r.employee_id][r.status] !== undefined) {
        map[r.employee_id][r.status]++;
      }
    });
    return map;
  }, [employees, records]);

  if (employees.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">Add employees first to track attendance.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Month navigation + bulk action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-sm font-semibold text-foreground min-w-[120px] text-center">
            {format(currentMonth, "MMMM yyyy")}
          </h3>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => bulkMarkPresent.mutate()}
          disabled={bulkMarkPresent.isPending}
        >
          {bulkMarkPresent.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
          Mark All Present Today
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Calendar grid — horizontal scroll on mobile */}
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[600px]">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="sticky left-0 z-10 bg-muted/50 text-left px-3 py-2 font-semibold text-foreground min-w-[120px]">
                      Employee
                    </th>
                    {daysInMonth.map((day) => {
                      const dayNum = getDay(day);
                      const isSunday = dayNum === 0;
                      return (
                        <th
                          key={day.toISOString()}
                          className={`px-1 py-2 text-center font-medium min-w-[32px] ${isToday(day) ? "bg-primary/10 text-primary" : isSunday ? "text-red-400" : "text-muted-foreground"}`}
                        >
                          <div>{format(day, "d")}</div>
                          <div className="text-[9px] font-normal">{format(day, "EEE")}</div>
                        </th>
                      );
                    })}
                    <th className="px-2 py-2 text-center font-semibold text-foreground min-w-[40px]">P</th>
                    <th className="px-2 py-2 text-center font-semibold text-foreground min-w-[40px]">A</th>
                    <th className="px-2 py-2 text-center font-semibold text-foreground min-w-[40px]">L</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id} className="border-t border-border/50 hover:bg-muted/30">
                      <td className="sticky left-0 z-10 bg-background px-3 py-1.5 font-medium text-foreground whitespace-nowrap">
                        {emp.full_name}
                        <span className="text-[10px] text-muted-foreground ml-1 capitalize">({emp.role})</span>
                      </td>
                      {daysInMonth.map((day) => {
                        const dateStr = format(day, "yyyy-MM-dd");
                        const key = `${emp.id}|${dateStr}`;
                        const record = recordMap[key];
                        const status = record?.status as AttendanceStatus | undefined;
                        const futureDay = isFuture(day) && !isToday(day);

                        return (
                          <td key={dateStr} className="px-0.5 py-1 text-center">
                            {futureDay ? (
                              <div className="w-7 h-7 mx-auto rounded bg-muted/30" />
                            ) : (
                              <Select
                                value={status || ""}
                                onValueChange={(v) => upsertMutation.mutate({ employee_id: emp.id, date: dateStr, status: v as AttendanceStatus })}
                              >
                                <SelectTrigger className="w-7 h-7 p-0 border-0 justify-center [&>svg]:hidden">
                                  {status ? (
                                    <span className={`w-6 h-6 rounded text-[10px] font-bold flex items-center justify-center ${STATUS_COLORS[status]}`}>
                                      {STATUS_LABELS[status]}
                                    </span>
                                  ) : (
                                    <span className="w-6 h-6 rounded border border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground/40">
                                      –
                                    </span>
                                  )}
                                </SelectTrigger>
                                <SelectContent align="center" className="min-w-[100px]">
                                  {STATUS_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                      <span className="flex items-center gap-2">
                                        <span className={`w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center ${STATUS_COLORS[opt.value]}`}>
                                          {STATUS_LABELS[opt.value]}
                                        </span>
                                        {opt.label}
                                      </span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </td>
                        );
                      })}
                      {/* Summary columns */}
                      <td className="px-2 py-1.5 text-center font-semibold text-emerald-600">{summaries[emp.id]?.present || 0}</td>
                      <td className="px-2 py-1.5 text-center font-semibold text-red-600">{summaries[emp.id]?.absent || 0}</td>
                      <td className="px-2 py-1.5 text-center font-semibold text-blue-600">{summaries[emp.id]?.leave || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {STATUS_OPTIONS.map((opt) => (
              <span key={opt.value} className="flex items-center gap-1.5">
                <span className={`w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center ${STATUS_COLORS[opt.value]}`}>
                  {STATUS_LABELS[opt.value]}
                </span>
                {opt.label}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AttendanceTracker;
