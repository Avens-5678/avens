import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  MessageSquare, Send, ArrowLeft, Plus, Search, Loader2,
  Paperclip, Image as ImageIcon, FileText, Package, User,
} from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";

// ── Types ──
interface Conversation {
  id: string;
  vendor_id: string;
  type: string;
  title: string | null;
  client_id: string | null;
  related_order_id: string | null;
  last_message: string | null;
  last_message_at: string | null;
  unread_count_vendor: number;
  unread_count_client: number;
  created_at: string;
}

interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  sender_type: string;
  message: string | null;
  message_type: string;
  file_url: string | null;
  file_name: string | null;
  is_read: boolean;
  created_at: string;
}

interface Profile {
  user_id: string;
  full_name: string | null;
  company_name: string | null;
}

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const formatMsgTime = (dateStr: string) => {
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, "h:mm a");
  if (isYesterday(d)) return "Yesterday";
  return format(d, "dd MMM");
};

const groupByDate = (messages: ChatMessage[]) => {
  const groups: { label: string; messages: ChatMessage[] }[] = [];
  let currentLabel = "";
  messages.forEach((msg) => {
    const d = new Date(msg.created_at);
    let label: string;
    if (isToday(d)) label = "Today";
    else if (isYesterday(d)) label = "Yesterday";
    else label = format(d, "dd MMMM yyyy");
    if (label !== currentLabel) {
      currentLabel = label;
      groups.push({ label, messages: [] });
    }
    groups[groups.length - 1].messages.push(msg);
  });
  return groups;
};

// ═══════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════
const ChatManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [chatFilter, setChatFilter] = useState<"client" | "internal">("client");
  const [searchTerm, setSearchTerm] = useState("");
  const [newConvOpen, setNewConvOpen] = useState(false);

  // ── Fetch conversations ──
  const { data: conversations = [], isLoading: convsLoading } = useQuery({
    queryKey: ["chat-conversations", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_conversations")
        .select("*")
        .or(`vendor_id.eq.${user!.id},client_id.eq.${user!.id}`)
        .order("last_message_at", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data as Conversation[];
    },
  });

  // ── Fetch profiles for names ──
  const participantIds = useMemo(() => {
    const ids = new Set<string>();
    conversations.forEach((c) => {
      if (c.client_id) ids.add(c.client_id);
      if (c.vendor_id) ids.add(c.vendor_id);
    });
    return Array.from(ids);
  }, [conversations]);

  const { data: profiles = [] } = useQuery({
    queryKey: ["chat-profiles", participantIds.join(",")],
    enabled: participantIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, company_name")
        .in("user_id", participantIds);
      if (error) throw error;
      return data as Profile[];
    },
  });

  const profileMap = useMemo(() => {
    const m: Record<string, Profile> = {};
    profiles.forEach((p) => { m[p.user_id] = p; });
    return m;
  }, [profiles]);

  const getConvName = (conv: Conversation) => {
    if (conv.title) return conv.title;
    if (conv.type === "client" && conv.client_id) {
      const p = profileMap[conv.client_id];
      return p?.full_name || p?.company_name || "Client";
    }
    return "Conversation";
  };

  // ── Filter conversations ──
  const filtered = useMemo(() => {
    return conversations.filter((c) => {
      if (c.type !== chatFilter) return false;
      if (searchTerm) {
        const name = getConvName(c).toLowerCase();
        const msg = (c.last_message || "").toLowerCase();
        if (!name.includes(searchTerm.toLowerCase()) && !msg.includes(searchTerm.toLowerCase())) return false;
      }
      return true;
    });
  }, [conversations, chatFilter, searchTerm, profileMap]);

  const activeConv = conversations.find((c) => c.id === activeConvId) || null;

  return (
    <div className="h-[calc(100vh-180px)] sm:h-[calc(100vh-140px)] flex flex-col">
      <div className="flex-1 flex overflow-hidden border border-border rounded-xl bg-background">
        {/* LEFT: Conversation list — hidden on mobile when chat is open */}
        <div className={`w-full sm:w-80 sm:border-r border-border flex flex-col ${activeConvId ? "hidden sm:flex" : "flex"}`}>
          {/* Tabs + search */}
          <div className="p-3 space-y-2 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex rounded-lg border border-border overflow-hidden">
                <button
                  onClick={() => setChatFilter("client")}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${chatFilter === "client" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                >
                  Clients
                </button>
                <button
                  onClick={() => setChatFilter("internal")}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${chatFilter === "internal" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                >
                  Team
                </button>
              </div>
              <NewConversationDialog
                open={newConvOpen}
                onOpenChange={setNewConvOpen}
                type={chatFilter}
                onCreated={(id) => { setActiveConvId(id); setNewConvOpen(false); }}
              />
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search conversations..."
                className="pl-8 h-8 text-xs"
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {convsLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                No {chatFilter === "client" ? "client" : "team"} conversations yet.
              </div>
            ) : (
              filtered.map((conv) => {
                const name = getConvName(conv);
                const unread = conv.unread_count_vendor;
                const isActive = conv.id === activeConvId;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`w-full text-left px-3 py-3 border-b border-border/50 hover:bg-muted/50 transition-colors ${isActive ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                        {getInitials(name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground truncate">{name}</span>
                          {conv.last_message_at && (
                            <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-2">{formatMsgTime(conv.last_message_at)}</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-xs text-muted-foreground truncate">{conv.last_message || "No messages yet"}</p>
                          {unread > 0 && (
                            <span className="flex-shrink-0 ml-2 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 min-w-[16px] flex items-center justify-center px-1">
                              {unread}
                            </span>
                          )}
                        </div>
                        {conv.related_order_id && (
                          <span className="text-[10px] text-primary flex items-center gap-0.5 mt-0.5">
                            <Package className="h-2.5 w-2.5" />Order linked
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT: Active conversation */}
        <div className={`flex-1 flex flex-col ${!activeConvId ? "hidden sm:flex" : "flex"}`}>
          {activeConv ? (
            <ChatPanel
              conversation={activeConv}
              convName={getConvName(activeConv)}
              onBack={() => setActiveConvId(null)}
              profileMap={profileMap}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center space-y-2">
                <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground/30" />
                <p className="text-sm">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════
// Chat Panel (right side)
// ═══════════════════════════════════════════
const ChatPanel = ({
  conversation,
  convName,
  onBack,
  profileMap,
}: {
  conversation: Conversation;
  convName: string;
  onBack: () => void;
  profileMap: Record<string, Profile>;
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch messages ──
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["chat-messages", conversation.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as ChatMessage[];
    },
  });

  // ── Realtime subscription ──
  useEffect(() => {
    const channel = supabase
      .channel(`chat-${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          queryClient.setQueryData<ChatMessage[]>(
            ["chat-messages", conversation.id],
            (old) => (old ? [...old, newMsg] : [newMsg])
          );
          // Mark as read if from other party
          if (newMsg.sender_id !== user?.id) {
            supabase
              .from("chat_messages")
              .update({ is_read: true } as any)
              .eq("id", newMsg.id)
              .then(() => {});
            // Reset unread count
            supabase
              .from("chat_conversations")
              .update({ unread_count_vendor: 0 } as any)
              .eq("id", conversation.id)
              .then(() => queryClient.invalidateQueries({ queryKey: ["chat-conversations"] }));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversation.id, user?.id, queryClient]);

  // ── Auto-scroll ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Mark unread as read on open ──
  useEffect(() => {
    if (conversation.unread_count_vendor > 0) {
      supabase
        .from("chat_conversations")
        .update({ unread_count_vendor: 0 } as any)
        .eq("id", conversation.id)
        .then(() => queryClient.invalidateQueries({ queryKey: ["chat-conversations"] }));
      supabase
        .from("chat_messages")
        .update({ is_read: true } as any)
        .eq("conversation_id", conversation.id)
        .eq("is_read", false)
        .neq("sender_id", user?.id || "")
        .then(() => {});
    }
  }, [conversation.id]);

  // ── Send message ──
  const sendMessage = useCallback(async (text: string, type = "text", fileUrl?: string, fileName?: string) => {
    if (!text.trim() && !fileUrl) return;
    setSending(true);
    try {
      const { error } = await supabase.from("chat_messages").insert({
        conversation_id: conversation.id,
        sender_id: user!.id,
        sender_type: "vendor",
        message: text.trim() || null,
        message_type: type,
        file_url: fileUrl || null,
        file_name: fileName || null,
      } as any);
      if (error) throw error;

      // Update conversation last_message
      const senderIsVendor = conversation.vendor_id === user!.id;
      await supabase.from("chat_conversations").update({
        last_message: text.trim() || `[${type}]`,
        last_message_at: new Date().toISOString(),
        ...(senderIsVendor
          ? { unread_count_client: (conversation.unread_count_client || 0) + 1 }
          : { unread_count_vendor: (conversation.unread_count_vendor || 0) + 1 }),
      } as any).eq("id", conversation.id);

      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
      setInputText("");
    } catch (e: any) {
      toast({ title: "Failed to send", description: e.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  }, [conversation, user, queryClient, toast]);

  // ── File upload ──
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop();
    const path = `chat/${conversation.id}/${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage.from("review-photos").upload(path, file);
    if (error) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); return; }
    const { data: urlData } = supabase.storage.from("review-photos").getPublicUrl(path);
    const isImage = file.type.startsWith("image/");
    await sendMessage(file.name, isImage ? "image" : "file", urlData.publicUrl, file.name);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [conversation.id, sendMessage, toast]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputText);
    }
  };

  const grouped = groupByDate(messages);

  const getSenderName = (msg: ChatMessage) => {
    if (msg.sender_type === "system") return "System";
    if (msg.sender_id && profileMap[msg.sender_id]) {
      return profileMap[msg.sender_id].full_name || profileMap[msg.sender_id].company_name || "User";
    }
    return msg.sender_type === "vendor" ? "You" : "Client";
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/30">
        <button onClick={onBack} className="sm:hidden p-1 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
          {getInitials(convName)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{convName}</p>
          <p className="text-[10px] text-muted-foreground capitalize">{conversation.type} chat</p>
        </div>
        {conversation.related_order_id && (
          <Badge variant="outline" className="text-[10px] gap-1 flex-shrink-0">
            <Package className="h-2.5 w-2.5" />Order
          </Badge>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground">No messages yet. Start the conversation!</div>
        ) : (
          grouped.map((group) => (
            <div key={group.label}>
              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] text-muted-foreground font-medium">{group.label}</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              {group.messages.map((msg) => {
                const isMine = msg.sender_id === user?.id;
                const isSystem = msg.sender_type === "system";

                if (isSystem) {
                  return (
                    <div key={msg.id} className="text-center my-2">
                      <span className="text-[11px] text-muted-foreground italic bg-muted/50 px-3 py-1 rounded-full">{msg.message}</span>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className={`flex mb-1.5 ${isMine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] sm:max-w-[65%] rounded-2xl px-3.5 py-2 ${isMine ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md"}`}>
                      {!isMine && (
                        <p className={`text-[10px] font-semibold mb-0.5 ${isMine ? "text-primary-foreground/70" : "text-primary"}`}>
                          {getSenderName(msg)}
                        </p>
                      )}
                      {msg.message_type === "image" && msg.file_url && (
                        <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="block mb-1">
                          <img src={msg.file_url} alt="" className="max-w-full max-h-48 rounded-lg object-cover" loading="lazy" />
                        </a>
                      )}
                      {msg.message_type === "file" && msg.file_url && (
                        <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1.5 text-xs underline mb-1 ${isMine ? "text-primary-foreground/80" : "text-primary"}`}>
                          <FileText className="h-3 w-3" />{msg.file_name || "Download file"}
                        </a>
                      )}
                      {msg.message && <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>}
                      <p className={`text-[9px] mt-1 ${isMine ? "text-primary-foreground/50 text-right" : "text-muted-foreground text-right"}`}>
                        {format(new Date(msg.created_at), "h:mm a")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-border p-3 bg-background">
        <div className="flex items-end gap-2">
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf,.doc,.docx,.xlsx" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground flex-shrink-0"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary min-h-[36px] max-h-[120px]"
            style={{ height: "36px" }}
            onInput={(e) => { const el = e.currentTarget; el.style.height = "36px"; el.style.height = Math.min(el.scrollHeight, 120) + "px"; }}
          />
          <Button
            size="icon"
            className="h-9 w-9 rounded-xl flex-shrink-0"
            disabled={(!inputText.trim() && !sending) || sending}
            onClick={() => sendMessage(inputText)}
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </>
  );
};

// ═══════════════════════════════════════════
// New Conversation Dialog
// ═══════════════════════════════════════════
const NewConversationDialog = ({
  open,
  onOpenChange,
  type,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  type: "client" | "internal";
  onCreated: (id: string) => void;
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [title, setTitle] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");

  // Search clients
  const { data: clientResults = [] } = useQuery({
    queryKey: ["chat-search-clients", searchTerm],
    enabled: type === "client" && searchTerm.length >= 2,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, phone, email")
        .or(`full_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .neq("user_id", user!.id)
        .limit(10);
      if (error) throw error;
      return data as { user_id: string; full_name: string | null; phone: string | null; email: string | null }[];
    },
  });

  // Search employees (for internal)
  const { data: employees = [] } = useQuery({
    queryKey: ["employees-for-chat", user?.id],
    enabled: type === "internal" && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, full_name, role")
        .eq("vendor_id", user!.id)
        .eq("is_active", true)
        .order("full_name");
      if (error) throw error;
      return data as { id: string; full_name: string; role: string }[];
    },
  });

  const createConversation = useMutation({
    mutationFn: async () => {
      const convData: any = {
        vendor_id: user!.id,
        type,
        title: title || null,
      };
      if (type === "client" && selectedClientId) {
        convData.client_id = selectedClientId;
      }
      const { data, error } = await supabase
        .from("chat_conversations")
        .insert(convData)
        .select("id")
        .single();
      if (error) throw error;

      // Insert system message
      await supabase.from("chat_messages").insert({
        conversation_id: data.id,
        sender_id: user!.id,
        sender_type: "system",
        message: `Conversation started`,
        message_type: "system",
      } as any);

      return data.id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
      setSearchTerm("");
      setTitle("");
      setSelectedClientId("");
      onCreated(id);
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1 h-7 text-xs"><Plus className="h-3 w-3" />New</Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">New {type === "client" ? "Client" : "Team"} Chat</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {type === "client" ? (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs">Search Client (name or phone)</Label>
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Type to search..."
                  className="text-sm"
                />
              </div>
              {clientResults.length > 0 && (
                <div className="max-h-[150px] overflow-y-auto space-y-1 border border-border rounded-lg p-1">
                  {clientResults.map((c) => (
                    <button
                      key={c.user_id}
                      onClick={() => { setSelectedClientId(c.user_id); setTitle(c.full_name || ""); }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedClientId === c.user_id ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
                    >
                      <span className="font-medium">{c.full_name || "Unknown"}</span>
                      {c.phone && <span className="text-xs text-muted-foreground ml-2">{c.phone}</span>}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-1.5">
              <Label className="text-xs">Conversation Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Event Setup Team" className="text-sm" />
            </div>
          )}
          <Button
            onClick={() => createConversation.mutate()}
            disabled={createConversation.isPending || (type === "client" && !selectedClientId)}
            className="w-full"
            size="sm"
          >
            {createConversation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
            Start Conversation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatManager;
