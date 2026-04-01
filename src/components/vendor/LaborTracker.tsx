import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Users, IndianRupee, CheckCircle, Clock, Loader2 } from "lucide-react";
import { format, startOfWeek, endOfWeek } from "date-fns";

interface LaborShift {
  id: string;
  worker_name: string;
  worker_phone: string | null;
  shift_date: string;
  hours_worked: number;
  daily_rate: number;
  total_pay: number;
  status: string;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
}

const LaborTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [newShift, setNewShift] = useState({
    worker_name: "", worker_phone: "", shift_date: format(new Date(), "yyyy-MM-dd"),
    hours_worked: 8, daily_rate: 600, notes: "",
  });

  const { data: shifts = [], isLoading } = useQuery({
    queryKey: ["labor-shifts", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("labor_shifts")
        .select("*")
        .eq("vendor_id", user!.id)
        .order("shift_date", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as LaborShift[];
    },
  });

  const addShift = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("labor_shifts").insert({
        vendor_id: user!.id,
        worker_name: newShift.worker_name,
        worker_phone: newShift.worker_phone || null,
        shift_date: newShift.shift_date,
        hours_worked: newShift.hours_worked,
        daily_rate: newShift.daily_rate,
        notes: newShift.notes || null,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labor-shifts"] });
      setShowAdd(false);
      setNewShift({ worker_name: "", worker_phone: "", shift_date: format(new Date(), "yyyy-MM-dd"), hours_worked: 8, daily_rate: 600, notes: "" });
      toast({ title: "Shift logged!" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const markPaid = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("labor_shifts")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["labor-shifts"] }),
  });

  // Weekly summary
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const thisWeekShifts = shifts.filter((s) => {
    const d = new Date(s.shift_date);
    return d >= weekStart && d <= weekEnd;
  });
  const weeklyTotal = thisWeekShifts.reduce((sum, s) => sum + (s.total_pay || 0), 0);
  const pendingTotal = shifts.filter(s => s.status === "pending").reduce((sum, s) => sum + (s.total_pay || 0), 0);
  const uniqueWorkers = new Set(shifts.map(s => s.worker_name)).size;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> Labor & Payroll
          </h2>
          <p className="text-sm text-muted-foreground">Track shifts and pay for daily-wage workers</p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Log Shift</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Log Worker Shift</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <Input placeholder="Worker name" value={newShift.worker_name} onChange={(e) => setNewShift(p => ({ ...p, worker_name: e.target.value }))} />
              <Input placeholder="Phone (optional)" value={newShift.worker_phone} onChange={(e) => setNewShift(p => ({ ...p, worker_phone: e.target.value }))} />
              <div className="grid grid-cols-3 gap-3">
                <Input type="date" value={newShift.shift_date} onChange={(e) => setNewShift(p => ({ ...p, shift_date: e.target.value }))} />
                <Input type="number" placeholder="Hours" value={newShift.hours_worked} onChange={(e) => setNewShift(p => ({ ...p, hours_worked: parseFloat(e.target.value) || 8 }))} />
                <Input type="number" placeholder="Day rate ₹" value={newShift.daily_rate} onChange={(e) => setNewShift(p => ({ ...p, daily_rate: parseFloat(e.target.value) || 600 }))} />
              </div>
              <Input placeholder="Notes (optional)" value={newShift.notes} onChange={(e) => setNewShift(p => ({ ...p, notes: e.target.value }))} />
              <Button onClick={() => addShift.mutate()} disabled={!newShift.worker_name || addShift.isPending} className="w-full">
                {addShift.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null} Log Shift
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-foreground">₹{weeklyTotal.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">This Week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-amber-600">₹{pendingTotal.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Pending Payout</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-foreground">{uniqueWorkers}</p>
            <p className="text-xs text-muted-foreground">Workers</p>
          </CardContent>
        </Card>
      </div>

      {/* Shifts Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Recent Shifts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div>
          ) : shifts.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No shifts logged yet</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Worker</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Hours</TableHead>
                    <TableHead className="text-xs">Rate</TableHead>
                    <TableHead className="text-xs">Pay</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shifts.slice(0, 20).map((shift) => (
                    <TableRow key={shift.id}>
                      <TableCell className="text-xs font-medium">{shift.worker_name}</TableCell>
                      <TableCell className="text-xs">{new Date(shift.shift_date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-xs">{shift.hours_worked}h</TableCell>
                      <TableCell className="text-xs">₹{shift.daily_rate}</TableCell>
                      <TableCell className="text-xs font-medium">₹{(shift.total_pay || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={shift.status === "paid" ? "default" : "secondary"} className="text-[10px]">
                          {shift.status === "paid" ? <CheckCircle className="h-2.5 w-2.5 mr-0.5" /> : <Clock className="h-2.5 w-2.5 mr-0.5" />}
                          {shift.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {shift.status === "pending" && (
                          <Button size="sm" variant="ghost" className="text-[10px] h-7" onClick={() => markPaid.mutate(shift.id)}>
                            Mark Paid
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LaborTracker;
