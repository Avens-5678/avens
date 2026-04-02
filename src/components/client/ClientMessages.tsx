import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useChatModeration } from "@/hooks/useChatModeration";
import { useChatImageScan } from "@/hooks/useChatImageScan";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare, Send, ArrowLeft, Search, Loader2,
  Paperclip, FileText, Package,
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
// Client Messages — same layout, client perspective
// ═══════════════════════════════════════════
const ClientMessages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch conversations where client_id = me
  const { data: conversations = [], isLoading: convsLoading } = useQuery({
    queryKey: ["client-chat-conversations", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_conversations")
        .select("*")
        .eq("client_id", user!.id)
        .eq("type", "client")
        .order("last_message_at", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data as Conversation[];
    },
  });

  // Vendor profiles for names
  const vendorIds = useMemo(() => {
    return [...new Set(conversations.map((c) => c.vendor_id).filter(Boolean))];
  }, [conversations]);

  const { data: profiles = [] } = useQuery({
    queryKey: ["client-chat-profiles", vendorIds.join(",")],
    enabled: vendorIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, company_name")
        .in("user_id", vendorIds);
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
    const p = profileMap[conv.vendor_id];
    return p?.company_name || p?.full_name || "Vendor";
  };

  const filtered = useMemo(() => {
    if (!searchTerm) return conversations;
    return conversations.filter((c) => {
      const name = getConvName(c).toLowerCase();
      const msg = (c.last_message || "").toLowerCase();
      return name.includes(searchTerm.toLowerCase()) || msg.includes(searchTerm.toLowerCase());
    });
  }, [conversations, searchTerm, profileMap]);

  const activeConv = conversations.find((c) => c.id === activeConvId) || null;

  return (
    <div className="h-[calc(100vh-180px)] sm:h-[calc(100vh-140px)] flex flex-col">
      <div className="flex-1 flex overflow-hidden border border-border rounded-xl bg-background">
        {/* LEFT */}
        <div className={`w-full sm:w-80 sm:border-r border-border flex flex-col ${activeConvId ? "hidden sm:flex" : "flex"}`}>
          <div className="p-3 space-y-2 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Messages</h3>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..." className="pl-8 h-8 text-xs" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {convsLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">No conversations yet.</div>
            ) : (
              filtered.map((conv) => {
                const name = getConvName(conv);
                const unread = conv.unread_count_client;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`w-full text-left px-3 py-3 border-b border-border/50 hover:bg-muted/50 transition-colors ${conv.id === activeConvId ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                        {getInitials(name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground truncate">{name}</span>
                          {conv.last_message_at && <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-2">{formatMsgTime(conv.last_message_at)}</span>}
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-xs text-muted-foreground truncate">{conv.last_message || "No messages yet"}</p>
                          {unread > 0 && (
                            <span className="flex-shrink-0 ml-2 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 min-w-[16px] flex items-center justify-center px-1">{unread}</span>
                          )}
                        </div>
                        {conv.related_order_id && (
                          <span className="text-[10px] text-primary flex items-center gap-0.5 mt-0.5"><Package className="h-2.5 w-2.5" />Order linked</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className={`flex-1 flex flex-col ${!activeConvId ? "hidden sm:flex" : "flex"}`}>
          {activeConv ? (
            <ClientChatPanel
              conversation={activeConv}
              convName={getConvName(activeConv)}
              onBack={() => setActiveConvId(null)}
              profileMap={profileMap}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center space-y-2">
                <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground/30" />
                <p className="text-sm">Select a conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════
// Client Chat Panel
// ═══════════════════════════════════════════
const ClientChatPanel = ({
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
  const { processMessage, checkWithAI, canSend, warningMessage, warningLevel, isRestricted, isSuspended } = useChatModeration();
  const { uploadAndScan, scanning: imageScanning } = useChatImageScan();
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel(`client-chat-${conversation.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `conversation_id=eq.${conversation.id}` },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          queryClient.setQueryData<ChatMessage[]>(
            ["chat-messages", conversation.id],
            (old) => (old ? [...old, newMsg] : [newMsg])
          );
          if (newMsg.sender_id !== user?.id) {
            supabase.from("chat_messages").update({ is_read: true } as any).eq("id", newMsg.id).then(() => {});
            supabase.from("chat_conversations").update({ unread_count_client: 0 } as any).eq("id", conversation.id)
              .then(() => queryClient.invalidateQueries({ queryKey: ["client-chat-conversations"] }));
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversation.id, user?.id, queryClient]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // Mark read on open
  useEffect(() => {
    if (conversation.unread_count_client > 0) {
      supabase.from("chat_conversations").update({ unread_count_client: 0 } as any).eq("id", conversation.id)
        .then(() => queryClient.invalidateQueries({ queryKey: ["client-chat-conversations"] }));
      supabase.from("chat_messages").update({ is_read: true } as any)
        .eq("conversation_id", conversation.id).eq("is_read", false).neq("sender_id", user?.id || "").then(() => {});
    }
  }, [conversation.id]);

  const sendMessage = useCallback(async (text: string, type = "text", fileUrl?: string, fileName?: string) => {
    if (!text.trim() && !fileUrl) return;
    if (!canSend) { toast({ title: "Chat restricted", variant: "destructive" }); return; }
    setSending(true);
    try {
      let messageText = text.trim();
      let isSuspicious = false;
      if (type === "text" && messageText) {
        const result = processMessage(messageText, conversation.id);
        messageText = result.text;
        isSuspicious = result.isSuspicious;
      }
      const { data: inserted, error } = await supabase.from("chat_messages").insert({
        conversation_id: conversation.id,
        sender_id: user!.id,
        sender_type: "client",
        message: messageText || null,
        message_type: type,
        file_url: fileUrl || null,
        file_name: fileName || null,
      } as any).select("id").single();
      if (error) throw error;
      if (isSuspicious && inserted?.id) {
        checkWithAI(conversation.id, inserted.id, text.trim());
      }
      await supabase.from("chat_conversations").update({
        last_message: messageText || `[${type}]`,
        last_message_at: new Date().toISOString(),
        unread_count_vendor: (conversation.unread_count_vendor || 0) + 1,
      } as any).eq("id", conversation.id);
      queryClient.invalidateQueries({ queryKey: ["client-chat-conversations"] });
      setInputText("");
    } catch (e: any) {
      toast({ title: "Failed to send", description: e.message, variant: "destructive" });
    } finally { setSending(false); }
  }, [conversation, user, queryClient, toast, canSend, processMessage, checkWithAI]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileInputRef.current) fileInputRef.current.value = "";
    const result = await uploadAndScan(file, conversation.id);
    if (!result) return;
    if (result.allowed) {
      await sendMessage(result.fileName, file.type.startsWith("image/") ? "image" : "file", result.imageUrl, result.fileName);
    } else {
      await supabase.from("chat_messages").insert({
        conversation_id: conversation.id, sender_id: user!.id, sender_type: "system",
        message: "[Image blocked — contained contact information]", message_type: "system",
      } as any);
      queryClient.invalidateQueries({ queryKey: ["chat-messages"] });
    }
  }, [conversation.id, sendMessage, uploadAndScan, user, queryClient]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(inputText); }
  };

  const grouped = groupByDate(messages);

  const getSenderName = (msg: ChatMessage) => {
    if (msg.sender_type === "system") return "System";
    if (msg.sender_id === user?.id) return "You";
    if (msg.sender_id && profileMap[msg.sender_id]) return profileMap[msg.sender_id].company_name || profileMap[msg.sender_id].full_name || "Vendor";
    return "Vendor";
  };

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/30">
        <button onClick={onBack} className="sm:hidden p-1 hover:bg-muted rounded-lg transition-colors"><ArrowLeft className="h-5 w-5" /></button>
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">{getInitials(convName)}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{convName}</p>
          {conversation.related_order_id && <span className="text-[10px] text-primary flex items-center gap-0.5"><Package className="h-2.5 w-2.5" />Order linked</span>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground">No messages yet.</div>
        ) : (
          grouped.map((group) => (
            <div key={group.label}>
              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 h-px bg-border" /><span className="text-[10px] text-muted-foreground font-medium">{group.label}</span><div className="flex-1 h-px bg-border" />
              </div>
              {group.messages.map((msg) => {
                const isMine = msg.sender_id === user?.id;
                const isSystem = msg.sender_type === "system";
                if (isSystem) return <div key={msg.id} className="text-center my-2"><span className="text-[11px] text-muted-foreground italic bg-muted/50 px-3 py-1 rounded-full">{msg.message}</span></div>;
                return (
                  <div key={msg.id} className={`flex mb-1.5 ${isMine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] sm:max-w-[65%] rounded-2xl px-3.5 py-2 ${isMine ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md"}`}>
                      {!isMine && <p className="text-[10px] font-semibold mb-0.5 text-primary">{getSenderName(msg)}</p>}
                      {msg.message_type === "image" && msg.file_url && <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="block mb-1"><img src={msg.file_url} alt="" className="max-w-full max-h-48 rounded-lg object-cover" loading="lazy" /></a>}
                      {msg.message_type === "file" && msg.file_url && <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1.5 text-xs underline mb-1 ${isMine ? "text-primary-foreground/80" : "text-primary"}`}><FileText className="h-3 w-3" />{msg.file_name || "Download file"}</a>}
                      {msg.message && <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>}
                      <p className={`text-[9px] mt-1 text-right ${isMine ? "text-primary-foreground/50" : "text-muted-foreground"}`}>{format(new Date(msg.created_at), "h:mm a")}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {warningMessage && (
        <div className={`px-4 py-2 text-xs text-center font-medium ${warningLevel === "first_warning" ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"}`}>
          {warningMessage}
        </div>
      )}
      {imageScanning && (
        <div className="px-4 py-2 text-xs text-center text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 flex items-center justify-center gap-1.5">
          <Loader2 className="h-3 w-3 animate-spin" />Scanning image...
        </div>
      )}
      <div className="border-t border-border p-3 bg-background">
        {isRestricted || isSuspended ? (
          <p className="text-xs text-center text-muted-foreground py-2">{isSuspended ? "Chat suspended — contact support." : "Chat restricted — try again later."}</p>
        ) : (
        <div className="flex items-end gap-2">
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf,.doc,.docx,.xlsx" />
          <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground flex-shrink-0" disabled={imageScanning}><Paperclip className="h-4 w-4" /></button>
          <textarea
            value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Type a message..." rows={1}
            className="flex-1 resize-none bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary min-h-[36px] max-h-[120px]"
            style={{ height: "36px" }}
            onInput={(e) => { const el = e.currentTarget; el.style.height = "36px"; el.style.height = Math.min(el.scrollHeight, 120) + "px"; }}
          />
          <Button size="icon" className="h-9 w-9 rounded-xl flex-shrink-0" disabled={!inputText.trim() || sending} onClick={() => sendMessage(inputText)}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        )}
      </div>
    </>
  );
};

export default ClientMessages;
