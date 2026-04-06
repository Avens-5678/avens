import { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Loader2, CheckCircle2, Check, Eye, X, Send, MessageSquare, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { format, isToday, subDays, startOfDay } from "date-fns";

interface MessageLog {
  id: string;
  template_name: string | null;
  recipient_phone: string;
  recipient_name: string | null;
  recipient_type: string | null;
  parameters: any;
  message_type: string | null;
  status: string;
  meta_message_id: string | null;
  error_message: string | null;
  sent_at: string;
  delivered_at: string | null;
  read_at: string | null;
}

const STATUS_ICONS: Record<string, { icon: any; color: string; label: string }> = {
  queued: { icon: Send, color: "text-muted-foreground", label: "Queued" },
  sent: { icon: Check, color: "text-blue-500", label: "Sent" },
  delivered: { icon: CheckCircle2, color: "text-emerald-500", label: "Delivered" },
  read: { icon: Eye, color: "text-primary", label: "Read" },
  received: { icon: ArrowDownLeft, color: "text-blue-600", label: "Received" },
  failed: { icon: X, color: "text-red-500", label: "Failed" },
};

const WhatsAppMessageLogs = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [directionFilter, setDirectionFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["wa-message-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("whatsapp_message_logs")
        .select("*")
        .order("sent_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as MessageLog[];
    },
  });

  // Real-time subscription for new messages
  useEffect(() => {
    const channel = supabase
      .channel("whatsapp-message-logs-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "whatsapp_message_logs" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["wa-message-logs"] });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (directionFilter === "incoming" && l.message_type !== "incoming") return false;
      if (directionFilter === "outgoing" && l.message_type === "incoming") return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const msgText = (l.parameters as any)?.text || "";
        if (
          !(l.recipient_phone || "").includes(q) &&
          !(l.recipient_name || "").toLowerCase().includes(q) &&
          !(l.template_name || "").toLowerCase().includes(q) &&
          !msgText.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [logs, statusFilter, directionFilter, searchTerm]);

  // Stats
  const today = startOfDay(new Date());
  const outgoing = logs.filter((l) => l.message_type !== "incoming");
  const incoming = logs.filter((l) => l.message_type === "incoming");
  const todayLogs = logs.filter((l) => new Date(l.sent_at) >= today);
  const weekLogs = logs.filter((l) => new Date(l.sent_at) >= subDays(new Date(), 7));
  const deliveredCount = outgoing.filter((l) => l.status === "delivered" || l.status === "read").length;
  const readCount = outgoing.filter((l) => l.status === "read").length;
  const deliveryRate = outgoing.length > 0 ? Math.round((deliveredCount / outgoing.length) * 100) : 0;
  const readRate = deliveredCount > 0 ? Math.round((readCount / deliveredCount) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{todayLogs.length}</p>
          <p className="text-[10px] text-muted-foreground">Today</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{incoming.length}</p>
          <p className="text-[10px] text-muted-foreground">Received</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{weekLogs.length}</p>
          <p className="text-[10px] text-muted-foreground">This Week</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-emerald-600">{deliveryRate}%</p>
          <p className="text-[10px] text-muted-foreground">Delivery Rate</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-primary">{readRate}%</p>
          <p className="text-[10px] text-muted-foreground">Read Rate</p>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search phone, name, template..." className="pl-8 h-8 text-xs" />
        </div>
        <Select value={directionFilter} onValueChange={setDirectionFilter}>
          <SelectTrigger className="w-[110px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Messages</SelectItem>
            <SelectItem value="incoming">Incoming</SelectItem>
            <SelectItem value="outgoing">Outgoing</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[110px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="received">Received</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground"><MessageSquare className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />No messages found.</div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs w-[50px]">Dir</TableHead>
                  <TableHead className="text-xs">Phone / Name</TableHead>
                  <TableHead className="text-xs">Content</TableHead>
                  <TableHead className="text-xs w-[70px]">Status</TableHead>
                  <TableHead className="text-xs w-[100px]">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((log) => {
                  const isIncoming = log.message_type === "incoming";
                  const si = STATUS_ICONS[log.status] || STATUS_ICONS.sent;
                  const Icon = si.icon;
                  const msgText = (log.parameters as any)?.text || "";
                  return (
                    <TableRow key={log.id} className="hover:bg-muted/30">
                      <TableCell>
                        {isIncoming ? (
                          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 text-[9px] px-1.5 py-0">
                            <ArrowDownLeft className="h-2.5 w-2.5 mr-0.5" />Received
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 text-[9px] px-1.5 py-0">
                            <ArrowUpRight className="h-2.5 w-2.5 mr-0.5" />Sent
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium">{log.recipient_name || log.recipient_phone}</p>
                        {log.recipient_name && <p className="text-[10px] text-muted-foreground">{log.recipient_phone}</p>}
                      </TableCell>
                      <TableCell>
                        {isIncoming ? (
                          <p className="text-xs text-foreground truncate max-w-[200px]">{msgText || "—"}</p>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">{log.template_name || "—"}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Icon className={`h-3.5 w-3.5 ${si.color}`} />
                          <span className={`text-[10px] font-medium ${si.color}`}>{si.label}</span>
                        </div>
                        {log.error_message && <p className="text-[9px] text-red-500 truncate max-w-[150px]">{log.error_message}</p>}
                      </TableCell>
                      <TableCell className="text-[10px] text-muted-foreground">
                        {format(new Date(log.sent_at), isToday(new Date(log.sent_at)) ? "h:mm a" : "dd MMM h:mm a")}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppMessageLogs;
