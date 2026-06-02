import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Bot, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Layout } from "@/components/Layout";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import Editor from "@monaco-editor/react";

type Mode = "tutor" | "hint" | "debug" | "revision";
type Msg = { role: "user" | "assistant"; content: string };

const MODES: { id: Mode; label: string }[] = [
  { id: "tutor", label: "Tutor" },
  { id: "hint", label: "Hint" },
  { id: "debug", label: "Debug" },
  { id: "revision", label: "Revision" },
];

const PROMPTS = [
  "Explain variables like I'm new to coding",
  "Why is my loop infinite?",
  "Give me a hint for this challenge",
  "What should I review next?",
];

export default function Assistant() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("tutor");
  const [provider, setProvider] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  useQuery({
    queryKey: ["ai-history"],
    queryFn: async () => {
      const res = await apiFetch<{ messages: { role: string; content: string }[] }>("/ai/history");
      setMessages(res.messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })));
      return res;
    },
  });

  const chat = useMutation({
    mutationFn: (message: string) =>
      apiFetch<{ reply: string; provider?: string; model?: string | null }>("/ai/chat", {
        method: "POST",
        body: JSON.stringify({ message, mode, lessonSlug: new URLSearchParams(window.location.search).get("lesson") }),
      }),
    onSuccess: (res) => {
      setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
      setProvider(res.provider || null);
      qc.invalidateQueries({ queryKey: ["ai-history"] });
    },
  });

  const clear = useMutation({
    mutationFn: () => apiFetch("/ai/history", { method: "DELETE" }),
    onSuccess: () => setMessages([]),
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chat.isPending]);

  const send = (text?: string) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setMessages((m) => [...m, { role: "user", content: msg }]);
    chat.mutate(msg);
    setInput("");
  };

  return (
    <Layout>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-display font-bold flex items-center gap-2">
          <Bot className="text-primary" /> AI Learning Assistant
        </h1>
        <div className="flex items-center gap-2">
          {provider && (
            <span className="text-xs px-2 py-1 rounded-full border border-border bg-muted/30 text-muted-foreground">
              {provider === "offline" ? "Offline tutor" : `AI: ${provider}`}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={() => clear.mutate()} className="gap-1">
            <Trash2 className="w-4 h-4" /> Clear
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              mode === m.id ? "bg-primary text-primary-foreground border-primary" : "border-border"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {PROMPTS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => send(p)}
            className="text-xs px-3 py-1 rounded-full bg-muted/50 hover:bg-muted border border-border"
          >
            {p}
          </button>
        ))}
      </div>

      <GlassCard className="flex flex-col h-[calc(100vh-280px)] min-h-[400px]">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Ask anything about Python. Use Hint mode on lessons for guided help without full answers.
            </p>
          )}
          <AnimatePresence>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`max-w-[90%] p-3 rounded-2xl text-sm ${
                  m.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted/50 prose prose-sm max-w-none"
                }`}
              >
                {m.role === "assistant" ? (
                  <ReactMarkdown
                    components={{
                      code({ node, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        return match ? (
                          <Editor
                            height="150px"
                            defaultLanguage={match[1]}
                            theme="vs-dark"
                            value={String(children).replace(/\n$/, "")}
                            options={{ readOnly: true, minimap: { enabled: false } }}
                          />
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                ) : (
                  m.content
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {chat.isPending && (
            <div className="text-sm text-muted-foreground animate-pulse">Thinking...</div>
          )}
          <div ref={endRef} />
        </div>
        <div className="p-4 border-t border-border flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={`Ask in ${mode} mode...`}
          />
          <Button onClick={() => send()} disabled={chat.isPending}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </GlassCard>
    </Layout>
  );
}
