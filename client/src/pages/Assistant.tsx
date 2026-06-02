import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Bot, Trash2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Layout } from "@/components/Layout";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch, apiStreamPost } from "@/lib/api";

type Mode = "tutor" | "hint" | "debug" | "revision";
type Msg = { role: "user" | "assistant"; content: string; streaming?: boolean };

const MODES: { id: Mode; label: string }[] = [
  { id: "tutor", label: "Tutor" },
  { id: "hint", label: "Hint" },
  { id: "debug", label: "Debugger" },
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
  const [streaming, setStreaming] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const lessonSlug = new URLSearchParams(window.location.search).get("lesson");

  const { data: aiStatus } = useQuery({
    queryKey: ["ai-status"],
    queryFn: () =>
      apiFetch<{
        enabled: boolean;
        provider: string | null;
        model: string | null;
        hint: string;
        defaultOpenRouterModel?: string;
        probe?: { ok: boolean; error?: string; model?: string; provider?: string };
      }>("/ai/status?probe=1"),
  });

  useQuery({
    queryKey: ["ai-history"],
    queryFn: async () => {
      const res = await apiFetch<{ messages: { role: string; content: string }[] }>("/ai/history");
      setMessages(res.messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })));
      return res;
    },
  });

  const clear = useMutation({
    mutationFn: () => apiFetch("/ai/history", { method: "DELETE" }),
    onSuccess: () => setMessages([]),
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  const send = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || streaming) return;
    setMessages((m) => [...m, { role: "user", content: msg }, { role: "assistant", content: "", streaming: true }]);
    setInput("");
    setStreaming(true);

    let acc = "";

    try {
      await apiStreamPost(
        "/ai/chat/stream",
        { message: msg, mode, lessonSlug },
        {
          onMeta: (data) => {
            setProvider((data.provider as string) || "offline");
          },
          onToken: (t) => {
            acc += t;
            setMessages((m) => {
              const copy = [...m];
              const last = copy[copy.length - 1];
              if (last?.role === "assistant") {
                copy[copy.length - 1] = { role: "assistant", content: acc, streaming: true };
              }
              return copy;
            });
          },
          onDone: (data) => {
            const final = (data.text as string) || acc;
            setMessages((m) => {
              const copy = [...m];
              copy[copy.length - 1] = { role: "assistant", content: final, streaming: false };
              return copy;
            });
          },
          onError: (err) => {
            setMessages((m) => {
              const copy = [...m];
              copy[copy.length - 1] = {
                role: "assistant",
                content: `Sorry — ${err}. Check API keys on the server.`,
                streaming: false,
              };
              return copy;
            });
          },
        }
      );
      qc.invalidateQueries({ queryKey: ["ai-history"] });
    } catch (e: unknown) {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = {
          role: "assistant",
          content: (e as Error).message || "Request failed",
          streaming: false,
        };
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-display font-bold flex items-center gap-2">
          <Bot className="text-primary" /> AI Learning Assistant
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-xs px-2 py-1 rounded-full border flex items-center gap-1 max-w-md ${
              aiStatus?.probe?.ok
                ? "border-primary/40 text-primary bg-primary/10"
                : aiStatus?.enabled
                  ? "border-destructive/40 text-destructive bg-destructive/10"
                  : "border-border text-muted-foreground bg-muted/30"
            }`}
          >
            <Sparkles className="w-3 h-3 shrink-0" />
            {aiStatus?.probe?.ok ? (
              <span className="truncate">
                Live AI · {aiStatus.probe.provider} · {aiStatus.probe.model}
              </span>
            ) : aiStatus?.enabled ? (
              <span className="truncate" title={aiStatus.probe?.error}>
                {aiStatus.probe?.error?.includes("401") || aiStatus.probe?.error?.includes("User not found")
                  ? "Invalid OpenRouter key — create new key at openrouter.ai/keys, redeploy API"
                  : aiStatus.probe?.error?.includes("404")
                    ? "Model not found — set AI_MODEL=meta-llama/llama-3.2-3b-instruct:free on API, redeploy"
                    : `AI failed — ${aiStatus.probe?.error?.slice(0, 100) || "check model/credits"}`}
              </span>
            ) : (
              <span>
                Offline tutor — set OPENROUTER_API_KEY on API service (default model:{" "}
                {aiStatus?.defaultOpenRouterModel || "meta-llama/llama-3.2-3b-instruct:free"})
              </span>
            )}
          </span>
          {provider && provider !== "offline" && (
            <span className="text-xs text-muted-foreground">Session: {provider}</span>
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
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              mode === m.id ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/40"
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
            disabled={streaming}
            className="text-xs px-3 py-1 rounded-full bg-muted/50 hover:bg-muted border border-border disabled:opacity-50"
          >
            {p}
          </button>
        ))}
      </div>

      <GlassCard className="flex flex-col h-[calc(100vh-280px)] min-h-[400px]">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Ask anything about Python. Streaming responses with markdown and code blocks.
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
                    : "bg-muted/50 prose prose-sm prose-invert max-w-none"
                }`}
              >
                {m.role === "assistant" ? (
                  <>
                    <ReactMarkdown>{m.content || (m.streaming ? "▍" : "")}</ReactMarkdown>
                    {m.streaming && !m.content && (
                      <span className="inline-block w-2 h-4 bg-primary/80 animate-pulse ml-0.5 align-middle" />
                    )}
                  </>
                ) : (
                  m.content
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={endRef} />
        </div>
        <div className="p-4 border-t border-border flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={`Ask in ${mode} mode...`}
            disabled={streaming}
          />
          <Button onClick={() => send()} disabled={streaming}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </GlassCard>
    </Layout>
  );
}
