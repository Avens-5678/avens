import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  ShieldAlert, Loader2, AlertTriangle, Ban, CheckCircle2,
  Clock, Eye, UserX, Search,
} from "lucide-react";
import { format, isToday } from "date-fns";

interface ModerationLog {
  id: string;
  message_id: string | null;
  conversation_id: string;
  sender_id: string | null;
  original_content: string;
  sanitized_content: string;
  detection_type: string;
  detected_patterns: string[] | null;
  severity: string;
  action_taken: string | null;
  ai_reasoning: string | null;
  created_at: string;
}

interface ViolationCount {
  id: string;
  user_id: string;
  total_violations: number;
  last_violation_at: string | null;
  warning_level: string;
  restriction_until: string | null;
}

interface Profile {
  user_id: string;
  full_name: string | null;
  email: string | null;
}

const SEVERITY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-700",
  critical: "bg-red-200 text-red-900",
};

const LEVEL_COLORS: Record<string, string> = {
  none: "bg-gray-100 text-gray-600",
  first_warning: "bg-amber-100 text-amber-700",
  second_warning: "bg-orange-100 text-orange-700",
  restricted: "bg-red-100 text-red-700",
  suspended: "bg-red-200 text-red-900",
};

const AdminChatModeration = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [detailUser, setDetailUser] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch moderation logs
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["admin-moderation-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_moderation_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as ModerationLog[];
    },
  });

  // Fetch violation counts
  const { data: violations = [] } = useQuery({
    queryKey: ["admin-violation-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_violation_counts")
        .select("*")
        .order("total_violations", { ascending: false });
      if (error) throw error;
      return data as ViolationCount[];
    },
  });

  // Fetch profiles for names
  const senderIds = useMemo(() => {
    const ids = new Set<string>();
    logs.forEach((l) => { if (l.sender_id) ids.add(l.sender_id); });
    violations.forEach((v) => ids.add(v.user_id));
    return Array.from(ids);
  }, [logs, violations]);

  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-mod-profiles", senderIds.join(",")],
    enabled: senderIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", senderIds);
      if (error) throw error;
      return data as Profile[];
    },
  });

  const profileMap = useMemo(() => {
    const m: Record<string, Profile> = {};
    profiles.forEach((p) => { m[p.user_id] = p; });
    return m;
  }, [profiles]);

  // Stats
  const todayLogs = logs.filter((l) => isToday(new Date(l.created_at)));
  const activeRestrictions = violations.filter((v) => v.warning_level === "restricted" && v.restriction_until && new Date(v.restriction_until) > new Date());
  const suspendedUsers = violations.filter((v) => v.warning_level === "suspended");

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      if (severityFilter !== "all" && l.severity !== severityFilter) return false;
      if (searchTerm) {
        const name = l.sender_id ? (profileMap[l.sender_id]?.full_name || "").toLowerCase() : "";
        if (!name.includes(searchTerm.toLowerCase()) && !l.original_content.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      }
      return true;
    });
  }, [logs, severityFilter, searchTerm, profileMap]);

  // Update user warning level
  const updateUserLevel = useMutation({
    mutationFn: async ({ userId, level, restrictionHours }: { userId: string; level: string; restrictionHours?: number }) => {
      const updates: any = {
        warning_level: level,
        updated_at: new Date().toISOString(),
      };
      if (level === "restricted" && restrictionHours) {
        updates.restriction_until = new Date(Date.now() + restrictionHours * 60 * 60 * 1000).toISOString();
      } else if (level === "none") {
        updates.restriction_until = null;
        updates.total_violations = 0;
      }
      const { error } = await supabase
        .from("chat_violation_counts")
        .update(updates)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-violation-counts"] });
      toast({ title: "User status updated" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2"><ShieldAlert className="h-5 w-5" />Chat Moderation</h2>
        <p className="text-sm text-muted-foreground">Monitor and manage contact-sharing violations</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <AlertTriangle className="h-4 w-4 mx-auto text-amber-500 mb-1" />
            <p className="text-2xl font-bold text-foreground">{todayLogs.length}</p>
            <p className="text-[10px] text-muted-foreground">Flags Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Eye className="h-4 w-4 mx-auto text-blue-500 mb-1" />
            <p className="text-2xl font-bold text-foreground">{logs.length}</p>
            <p className="text-[10px] text-muted-foreground">Total Flags</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Clock className="h-4 w-4 mx-auto text-orange-500 mb-1" />
            <p className="text-2xl font-bold text-orange-600">{activeRestrictions.length}</p>
            <p className="text-[10px] text-muted-foreground">Restricted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Ban className="h-4 w-4 mx-auto text-red-500 mb-1" />
            <p className="text-2xl font-bold text-red-600">{suspendedUsers.length}</p>
            <p className="text-[10px] text-muted-foreground">Suspended</p>
          </CardContent>
        </Card>
      </div>

      {/* Flagged Users */}
      {violations.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2">Users with Violations</h3>
          <div className="flex flex-wrap gap-2">
            {violations.map((v) => {
              const p = profileMap[v.user_id];
              return (
                <button
                  key={v.id}
                  onClick={() => setDetailUser(v.user_id)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-sm"
                >
                  <span className="font-medium">{p?.full_name || v.user_id.slice(0, 8)}</span>
                  <Badge variant="secondary" className={`text-[9px] ${LEVEL_COLORS[v.warning_level] || ""}`}>{v.warning_level.replace("_", " ")}</Badge>
                  <span className="text-xs text-muted-foreground">({v.total_violations})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by name or content..." className="pl-8 h-8 text-xs" />
        </div>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-[110px] h-8 text-xs"><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Moderation Logs Table */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground">
          <ShieldAlert className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
          No moderation flags yet.
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs">User</TableHead>
                  <TableHead className="text-xs">Original Message</TableHead>
                  <TableHead className="text-xs w-[100px]">Detected</TableHead>
                  <TableHead className="text-xs w-[70px]">Type</TableHead>
                  <TableHead className="text-xs w-[70px]">Severity</TableHead>
                  <TableHead className="text-xs w-[100px]">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => {
                  const p = log.sender_id ? profileMap[log.sender_id] : null;
                  return (
                    <TableRow key={log.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => log.sender_id && setDetailUser(log.sender_id)}>
                      <TableCell>
                        <p className="text-sm font-medium">{p?.full_name || (log.sender_id?.slice(0, 8) || "—")}</p>
                        <p className="text-[10px] text-muted-foreground">{p?.email || ""}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs text-foreground line-clamp-2 max-w-[250px]">{log.original_content}</p>
                        {log.ai_reasoning && <p className="text-[10px] text-blue-600 mt-0.5 italic">AI: {log.ai_reasoning}</p>}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-0.5">
                          {(log.detected_patterns || []).map((p, i) => (
                            <Badge key={i} variant="outline" className="text-[8px]">{p.replace("_", " ")}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[9px]">{log.detection_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`text-[9px] ${SEVERITY_COLORS[log.severity] || ""}`}>{log.severity}</Badge>
                      </TableCell>
                      <TableCell className="text-[10px] text-muted-foreground">
                        {format(new Date(log.created_at), "dd MMM HH:mm")}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* User Detail Sheet */}
      {detailUser && (
        <UserModerationSheet
          userId={detailUser}
          open={!!detailUser}
          onOpenChange={(o) => { if (!o) setDetailUser(null); }}
          logs={logs.filter((l) => l.sender_id === detailUser)}
          violation={violations.find((v) => v.user_id === detailUser) || null}
          profile={profileMap[detailUser] || null}
          onUpdateLevel={(level, hours) => updateUserLevel.mutate({ userId: detailUser, level, restrictionHours: hours })}
        />
      )}
    </div>
  );
};

// ── User Detail Sheet ──
const UserModerationSheet = ({
  userId, open, onOpenChange, logs, violation, profile, onUpdateLevel,
}: {
  userId: string; open: boolean; onOpenChange: (v: boolean) => void;
  logs: ModerationLog[]; violation: ViolationCount | null; profile: Profile | null;
  onUpdateLevel: (level: string, hours?: number) => void;
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{profile?.full_name || userId.slice(0, 8)} — Moderation</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <p className="text-lg font-bold">{violation?.total_violations || 0}</p>
              <p className="text-[10px] text-muted-foreground">Violations</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <Badge variant="secondary" className={`text-[10px] ${LEVEL_COLORS[violation?.warning_level || "none"]}`}>
                {(violation?.warning_level || "none").replace("_", " ")}
              </Badge>
              <p className="text-[10px] text-muted-foreground mt-1">Level</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <p className="text-xs font-medium">{violation?.last_violation_at ? format(new Date(violation.last_violation_at), "dd MMM") : "—"}</p>
              <p className="text-[10px] text-muted-foreground">Last Flag</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => onUpdateLevel("none")}>
              <CheckCircle2 className="h-3 w-3" />Clear All
            </Button>
            <Button size="sm" variant="outline" className="gap-1 text-xs text-amber-600" onClick={() => onUpdateLevel("first_warning")}>
              Issue Warning
            </Button>
            <Button size="sm" variant="outline" className="gap-1 text-xs text-orange-600" onClick={() => onUpdateLevel("restricted", 24)}>
              <Clock className="h-3 w-3" />Restrict 24h
            </Button>
            <Button size="sm" variant="destructive" className="gap-1 text-xs" onClick={() => onUpdateLevel("suspended")}>
              <Ban className="h-3 w-3" />Suspend
            </Button>
          </div>

          <Separator />

          {/* Violation History */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Violation History ({logs.length})</h4>
            {logs.length === 0 ? (
              <p className="text-xs text-muted-foreground">No violations recorded.</p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {logs.map((log) => (
                  <div key={log.id} className="p-2.5 rounded-lg bg-muted/30 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="secondary" className={`text-[8px] ${SEVERITY_COLORS[log.severity]}`}>{log.severity}</Badge>
                        <Badge variant="outline" className="text-[8px]">{log.detection_type}</Badge>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{format(new Date(log.created_at), "dd MMM HH:mm")}</span>
                    </div>
                    <p className="text-xs text-foreground">{log.original_content}</p>
                    <div className="flex flex-wrap gap-0.5">
                      {(log.detected_patterns || []).map((p, i) => (
                        <span key={i} className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{p.replace("_", " ")}</span>
                      ))}
                    </div>
                    {log.ai_reasoning && (
                      <p className="text-[10px] text-blue-600 italic mt-0.5">AI: {log.ai_reasoning}</p>
                    )}
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

export default AdminChatModeration;
