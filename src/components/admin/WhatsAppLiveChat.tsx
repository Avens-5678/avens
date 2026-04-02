import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Send, CheckCircle, User, Bot, MessageSquare, Phone, UserPlus } from "lucide-react";

interface Session {
  id: string;
  phone_number: string;
  user_type: string;
  current_flow: string;
  assigned_employee_id: string | null;
  assignment_type: string;
  last_message_at: string;
  created_at: string;
}

interface Message {
  id: string;
  session_id: string;
  phone_number: string;
  direction: string;
  message_text: string;
  sent_by: string;
  created_at: string;
}

interface WhatsAppLiveChatProps {
  employeeMode?: boolean;
}

const WhatsAppLiveChat = ({ employeeMode = false }: WhatsAppLiveChatProps) => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch sessions
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["whatsapp_sessions", statusFilter, employeeMode],
    queryFn: async () => {
      let query = supabase
        .from("whatsapp_sessions")
        .select("*")
        .order("last_message_at", { ascending: false });

      if (statusFilter === "handoff") {
        query = query.eq("current_flow", "human_handoff");
      } else if (statusFilter === "assigned") {
        query = query.not("assigned_employee_id", "is", null);
      }

      if (employeeMode && user?.id) {
        query = query.eq("assigned_employee_id", user.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Session[];
    },
  });

  // Fetch messages for selected session
  const { data: messages = [] } = useQuery({
    queryKey: ["whatsapp_messages", selectedSession],
    queryFn: async () => {
      if (!selectedSession) return [];
      const { data, error } = await supabase
        .from("whatsapp_conversations")
        .select("*")
        .eq("session_id", selectedSession)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []) as Message[];
    },
    enabled: !!selectedSession,
  });

  // Fetch employees for assignment
  const { data: employees = [] } = useQuery({
    queryKey: ["employees_for_assignment"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .eq("role", "employee");
      if (error) throw error;
      return data || [];
    },
    enabled: !employeeMode,
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("whatsapp-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "whatsapp_conversations" }, () => {
        queryClient.invalidateQueries({ queryKey: ["whatsapp_messages"] });
        queryClient.invalidateQueries({ queryKey: ["whatsapp_sessions"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "whatsapp_sessions" }, () => {
        queryClient.invalidateQueries({ queryKey: ["whatsapp_sessions"] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedSession) return;
    setSending(true);

    const session = sessions.find((s) => s.id === selectedSession);
    if (!session) return;

    try {
      const response = await supabase.functions.invoke("whatsapp-send", {
        body: {
          action: "send_text",
          to: session.phone_number,
          message: replyText,
          session_id: selectedSession,
        },
      });

      if (response.error) throw new Error(response.error.message);

      setReplyText("");
      queryClient.invalidateQueries({ queryKey: ["whatsapp_messages"] });
      toast({ title: "Message sent!" });
    } catch (error: any) {
      toast({ title: "Failed to send", description: error.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedSession) return;
    try {
      await supabase.functions.invoke("whatsapp-send", {
        body: { action: "resolve_session", session_id: selectedSession },
      });
      setSelectedSession(null);
      queryClient.invalidateQueries({ queryKey: ["whatsapp_sessions"] });
      toast({ title: "Session resolved" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleAssign = async (employeeId: string) => {
    if (!selectedSession) return;
    try {
      await supabase.functions.invoke("whatsapp-send", {
        body: { action: "assign_employee", session_id: selectedSession, employee_id: employeeId },
      });
      queryClient.invalidateQueries({ queryKey: ["whatsapp_sessions"] });
      toast({ title: "Assigned successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const currentSession = sessions.find((s) => s.id === selectedSession);

  const getFlowBadge = (flow: string) => {
    switch (flow) {
      case "human_handoff": return <Badge variant="destructive" className="text-[10px]">Handoff</Badge>;
      case "idle": return <Badge variant="secondary" className="text-[10px]">Idle</Badge>;
      default: return <Badge variant="outline" className="text-[10px]">{flow}</Badge>;
    }
  };

  return (
    <div className="flex h-[calc(100vh-200px)] min-h-[500px] border rounded-xl overflow-hidden bg-background">
      {/* Left: Session List */}
      <div className="w-80 border-r flex flex-col bg-muted/30">
        <div className="p-3 border-b space-y-2">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            {employeeMode ? "My Chats" : "Live Chat"}
          </h3>
          {!employeeMode && (
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sessions</SelectItem>
                <SelectItem value="handoff">Human Handoff</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        <ScrollArea className="flex-1">
          {sessionsLoading ? (
            <div className="p-4 text-sm text-muted-foreground">Loading...</div>
          ) : sessions.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground text-center">No conversations yet</div>
          ) : (
            sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => setSelectedSession(session.id)}
                className={`w-full p-3 text-left border-b hover:bg-muted/50 transition-colors ${
                  selectedSession === session.id ? "bg-primary/5 border-l-2 border-l-primary" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    +{session.phone_number}
                  </span>
                  {getFlowBadge(session.current_flow)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground capitalize">{session.user_type}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(session.last_message_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </button>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Right: Chat Thread */}
      <div className="flex-1 flex flex-col">
        {!selectedSession ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center space-y-2">
              <MessageSquare className="h-12 w-12 mx-auto opacity-30" />
              <p className="text-sm">Select a conversation to start</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-3 border-b flex items-center justify-between bg-muted/20">
              <div>
                <p className="font-semibold text-sm flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" />
                  +{currentSession?.phone_number}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {currentSession?.user_type} · {currentSession?.current_flow}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!employeeMode && (
                  <Select onValueChange={handleAssign}>
                    <SelectTrigger className="h-8 w-40 text-xs">
                      <UserPlus className="h-3 w-3 mr-1" />
                      <SelectValue placeholder="Assign" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.user_id} value={emp.user_id}>
                          {emp.full_name || emp.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Button size="sm" variant="outline" onClick={handleResolve} className="text-xs h-8">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Resolve
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                        msg.direction === "outbound"
                          ? msg.sent_by === "bot"
                            ? "bg-muted text-muted-foreground"
                            : "bg-primary text-primary-foreground"
                          : "bg-secondary/50 text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-1 mb-0.5">
                        {msg.sent_by === "bot" ? (
                          <Bot className="h-3 w-3" />
                        ) : msg.sent_by === "customer" ? (
                          <User className="h-3 w-3" />
                        ) : null}
                        <span className="text-[10px] opacity-70 capitalize">{msg.sent_by}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{msg.message_text}</p>
                      <p className="text-[10px] opacity-50 mt-1 text-right">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Reply Input */}
            <div className="p-3 border-t bg-muted/10">
              <div className="flex gap-2">
                <Input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type a reply..."
                  className="flex-1"
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendReply()}
                />
                <Button onClick={handleSendReply} disabled={sending || !replyText.trim()} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WhatsAppLiveChat;
