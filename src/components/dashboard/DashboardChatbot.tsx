import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, ArrowLeft, Plus, Calendar, Package, Briefcase, TrendingUp, Search, Star, LayoutGrid } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import FloatingRobot from "./FloatingRobot";

type Msg = { role: "user" | "assistant"; content: string };

interface DashboardChatbotProps {
  role: "client" | "vendor";
  userName: string;
}

const CLIENT_CHIPS = [
  { icon: Calendar, label: "Plan an Event", prompt: "I want to plan an event. Help me get started with choosing the type, theme, and budget." },
  { icon: Search, label: "Check My Events", prompt: "Can you tell me about my current event requests and their status?" },
  { icon: Package, label: "Explore Rentals", prompt: "Show me the premium rental equipment available — structures, stages, lighting, and specialty items." },
  { icon: Star, label: "Event Ideas", prompt: "Give me creative event ideas and themes for a corporate conference." },
];

const CLIENT_FEATURES = [
  { icon: Calendar, title: "Plan your dream event with AI-powered suggestions, budgets and timelines.", label: "Plan Events", color: "from-primary/10 to-primary/5" },
  { icon: Package, title: "Browse premium rental equipment — stages, lighting, structures and more.", label: "Browse Rentals", color: "from-accent/10 to-accent/5" },
];

const VENDOR_CHIPS = [
  { icon: Plus, label: "Add Listing", prompt: "Help me create a new inventory listing with a compelling description and competitive pricing." },
  { icon: Briefcase, label: "View Jobs", prompt: "What are my current assigned jobs and rental orders?" },
  { icon: TrendingUp, label: "Pricing Tips", prompt: "Give me pricing strategies and tips to make my listings more competitive." },
  { icon: Search, label: "Rent Equipment", prompt: "I need to find equipment for rent. Show me what's available in the Evnting catalog." },
];

const VENDOR_FEATURES = [
  { icon: Package, title: "Find and rent equipment from the Evnting catalog for your projects.", label: "Rent Equipment", color: "from-primary/10 to-primary/5" },
  { icon: LayoutGrid, title: "Manage your inventory, optimize listings, and grow your marketplace presence.", label: "Manage Business", color: "from-accent/10 to-accent/5" },
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dashboard-chat`;

export default function DashboardChatbot({ role, userName }: DashboardChatbotProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const chips = role === "client" ? CLIENT_CHIPS : VENDOR_CHIPS;
  const features = role === "client" ? CLIENT_FEATURES : VENDOR_FEATURES;
  const greeting = role === "client"
    ? "Ready to Plan\nSomething Amazing?"
    : "Ready to Grow\nYour Business?";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setShowChat(true);
    setIsStreaming(true);

    let assistantSoFar = "";

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          messages: allMessages.map(m => ({ role: m.role, content: m.content })),
          role,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || `Error ${resp.status}`);
      }

      if (!resp.body) throw new Error("No response stream");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let nlIdx: number;
        while ((nlIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nlIdx);
          buffer = buffer.slice(nlIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            // Handle action markers from tool calls
            if (parsed.action) {
              const action = parsed.action;
              if (action.success) {
                const msgs: Record<string, string> = {
                  rental_order: "🎉 Rental inquiry submitted! Check Admin Orders.",
                  form_submission: "🎉 Inquiry submitted successfully!",
                  vendor_listing: "🎉 Listing created! Check your Vendor Inventory.",
                };
                toast({ title: "Action Completed", description: msgs[action.type] || "Done!" });
              } else if (action.error) {
                toast({ title: "Action Failed", description: action.error, variant: "destructive" });
              }
            }
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              const snapshot = assistantSoFar;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: snapshot } : m);
                }
                return [...prev, { role: "assistant", content: snapshot }];
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e: any) {
      setMessages(prev => [...prev, { role: "assistant", content: `⚠️ ${e.message || "Something went wrong. Please try again."}` }]);
    } finally {
      setIsStreaming(false);
    }
  }, [messages, isStreaming, role]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const firstName = userName?.split(" ")[0] || (role === "client" ? "there" : "Partner");

  // ─── Input Bar (shared) ───
  const InputBar = (
    <div className="relative flex items-center rounded-2xl border border-border/50 bg-card shadow-sm">
      <div className="pl-4">
        <Plus className="h-4 w-4 text-muted-foreground" />
      </div>
      <textarea
        ref={inputRef}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        rows={1}
        disabled={isStreaming}
        className="flex-1 resize-none bg-transparent px-3 py-3.5 text-sm focus:outline-none placeholder:text-muted-foreground/60 disabled:opacity-50"
      />
      <div className="pr-3">
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isStreaming}
          className="h-9 w-9 rounded-xl bg-foreground text-background flex items-center justify-center disabled:opacity-30 hover:bg-foreground/85 transition-all active:scale-95"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  // ─── Welcome Home Screen ───
  if (!showChat && messages.length === 0) {
    return (
      <div className="flex flex-col h-full min-h-[70vh] lg:min-h-[calc(100vh-120px)] max-h-[calc(100vh-120px)] bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 lg:pt-14 pb-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Top bar */}
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                    <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Evnting AI</span>
                </div>
                <div className="h-9 w-9 rounded-full bg-foreground flex items-center justify-center">
                  <span className="text-xs font-bold text-background">
                    {firstName.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Robot + Greeting side by side on desktop */}
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 mb-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="shrink-0"
                >
                  <FloatingRobot />
                </motion.div>
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-foreground leading-tight">
                    Hi <span className="text-primary">{firstName}</span>,{" "}
                    {greeting.split("\n").map((line, i) => (
                      <span key={i}>
                        {i > 0 && <br />}
                        {line}
                      </span>
                    ))}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-2 max-w-md">
                    {role === "client"
                      ? "Your personal AI assistant for planning unforgettable events."
                      : "Your AI partner for growing your rental business on Evnting."}
                  </p>
                </div>
              </div>

              {/* Feature Cards — 2 col grid, wider on desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {features.map((feat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className={`rounded-2xl bg-gradient-to-br ${feat.color} border border-border/30 p-5 cursor-default hover:border-primary/20 transition-colors`}
                  >
                    <div className="h-10 w-10 rounded-xl bg-background/80 border border-border/40 flex items-center justify-center mb-3">
                      <feat.icon className="h-5 w-5 text-foreground/70" />
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed mb-2">{feat.title}</p>
                    <p className="text-[11px] font-medium text-muted-foreground">{feat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Quick Action Chips */}
              <div className="flex flex-wrap gap-2 mb-6">
                {chips.map((chip, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 + i * 0.06 }}
                    onClick={() => sendMessage(chip.prompt)}
                    className="flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-2.5 text-xs font-medium hover:bg-foreground/85 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <chip.icon className="h-3.5 w-3.5" />
                    {chip.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Input Bar */}
        <div className="px-4 lg:px-8 pb-4 pt-2">
          <div className="max-w-3xl mx-auto">{InputBar}</div>
        </div>
      </div>
    );
  }

  // ─── Chat View ───
  return (
    <div className="flex flex-col h-full min-h-[70vh] lg:min-h-[calc(100vh-120px)] max-h-[calc(100vh-120px)] bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-border/30">
        <button
          onClick={() => { setShowChat(false); setMessages([]); }}
          className="h-8 w-8 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-foreground/70" />
        </button>
        <div className="flex-1 text-center">
          <p className="text-sm font-semibold text-foreground">Evnting AI</p>
        </div>
        <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="h-7 w-7 rounded-full bg-foreground flex items-center justify-center mr-2 mt-1 shrink-0">
                    <Sparkles className="h-3.5 w-3.5 text-background" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-foreground text-background rounded-br-md"
                      : "bg-muted/40 text-foreground border border-border/30 rounded-bl-md"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-headings:mb-1 prose-headings:mt-2 prose-strong:text-foreground">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                  <p className={`text-[10px] mt-1.5 ${msg.role === "user" ? "text-background/50" : "text-muted-foreground/60"}`}>
                    {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="h-7 w-7 rounded-full bg-foreground flex items-center justify-center mr-2 mt-1 shrink-0">
                <Sparkles className="h-3.5 w-3.5 text-background" />
              </div>
              <div className="bg-muted/40 border border-border/30 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-foreground/40 animate-bounce [animation-delay:0ms]" />
                  <span className="h-2 w-2 rounded-full bg-foreground/40 animate-bounce [animation-delay:150ms]" />
                  <span className="h-2 w-2 rounded-full bg-foreground/40 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border/30 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-3xl mx-auto">{InputBar}</div>
      </div>
    </div>
  );
}
