import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";

type Msg = { role: "user" | "assistant"; content: string };

interface DashboardChatbotProps {
  role: "client" | "vendor";
  userName: string;
}

const CLIENT_CHIPS = [
  { label: "🎉 Plan an Event", prompt: "I want to plan an event. Help me get started with choosing the type, theme, and budget." },
  { label: "📋 Check My Events", prompt: "Can you tell me about my current event requests and their status?" },
  { label: "🏗️ Explore Rentals", prompt: "Show me the premium rental equipment available — structures, stages, lighting, and specialty items." },
  { label: "💡 Event Ideas", prompt: "Give me creative event ideas and themes for a corporate conference." },
];

const VENDOR_CHIPS = [
  { label: "📦 Add a Listing", prompt: "Help me create a new inventory listing with a compelling description and competitive pricing." },
  { label: "💼 View My Jobs", prompt: "What are my current assigned jobs and rental orders?" },
  { label: "💰 Pricing Tips", prompt: "Give me pricing strategies and tips to make my listings more competitive on the marketplace." },
  { label: "📊 Manage Inventory", prompt: "Help me organize and manage my equipment inventory effectively." },
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dashboard-chat`;

export default function DashboardChatbot({ role, userName }: DashboardChatbotProps) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const chips = role === "client" ? CLIENT_CHIPS : VENDOR_CHIPS;
  const greeting = role === "client"
    ? "Ready to Plan Something Amazing?"
    : "Ready to Grow Your Business?";

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

  // Welcome / Home Screen
  if (!showChat && messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[70vh] px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-xl w-full"
        >
          <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-2">
            Hi {firstName}! 👋
          </h2>
          <p className="text-lg text-muted-foreground mb-8">{greeting}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {chips.map((chip, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                onClick={() => sendMessage(chip.prompt)}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-card hover:bg-muted/60 hover:border-primary/30 px-4 py-3.5 text-left text-sm font-medium text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft"
              >
                <span>{chip.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Manual input */}
          <div className="relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              rows={1}
              className="w-full resize-none rounded-xl border border-border/60 bg-card px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
            />
            <Button
              size="icon"
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Chat View
  return (
    <div className="flex flex-col h-full min-h-[70vh] max-h-[calc(100vh-120px)]">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setShowChat(false); setMessages([]); }}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Bot className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Avens AI</p>
          <p className="text-xs text-muted-foreground">{isStreaming ? "Typing..." : "Online"}</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-foreground text-background rounded-br-md"
                    : "bg-muted/60 text-foreground border border-border/40 rounded-bl-md"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-headings:mb-1 prose-headings:mt-2">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-muted/60 border border-border/40 rounded-2xl rounded-bl-md px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border/40 px-4 py-3">
        <div className="relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            disabled={isStreaming}
            className="w-full resize-none rounded-xl border border-border/60 bg-card px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all disabled:opacity-50"
          />
          <Button
            size="icon"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isStreaming}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
