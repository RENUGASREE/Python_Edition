import { useEffect, useRef, useState, KeyboardEvent } from "react";
import { Loader2, Square, Trash2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useInteractiveTerminal, type TerminalLine } from "@/hooks/useInteractiveTerminal";

interface InteractiveTerminalProps {
  code: string;
  height?: number | string;
  className?: string;
  title?: string;
  showToolbar?: boolean;
  onStatusChange?: (status: string) => void;
}

function lineClass(kind: TerminalLine["kind"]) {
  switch (kind) {
    case "stderr":
      return "text-red-400";
    case "input":
      return "text-emerald-300";
    case "system":
      return "text-muted-foreground italic";
    default:
      return "text-foreground/90";
  }
}

export function InteractiveTerminal({
  code,
  height = 280,
  className,
  title = "Console",
  showToolbar = true,
  onStatusChange,
}: InteractiveTerminalProps) {
  const { lines, status, run, submitInput, stop, clear, canInput, isBusy } = useInteractiveTerminal();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [lines, status]);

  useEffect(() => {
    if (canInput) inputRef.current?.focus();
  }, [canInput]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const line = draft;
      setDraft("");
      void submitInput(line);
    }
  };

  const statusLabel =
    status === "waiting_input"
      ? "waiting for input"
      : status === "running"
        ? "running"
        : status === "done"
          ? "finished"
          : status === "error"
            ? "error"
            : status === "timeout"
              ? "timed out"
              : "ready";

  return (
    <div
      className={cn(
        "rounded-xl border border-border overflow-hidden bg-[hsl(222_47%_8%)] shadow-inner flex flex-col",
        className
      )}
    >
      {showToolbar && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border/80 bg-muted/20">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-medium text-muted-foreground truncate">{title}</span>
            <span
              className={cn(
                "text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border",
                status === "waiting_input" && "border-accent/50 text-accent",
                status === "running" && "border-primary/40 text-primary animate-pulse",
                status === "error" && "border-destructive/50 text-destructive",
                status === "done" && "border-primary/30 text-primary",
                status === "idle" && "border-border text-muted-foreground"
              )}
            >
              {statusLabel}
            </span>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 px-2"
              onClick={() => void run(code)}
              disabled={isBusy || !code.trim()}
            >
              {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            </Button>
            <Button type="button" size="sm" variant="ghost" className="h-7 px-2" onClick={() => void stop()} disabled={status === "idle"}>
              <Square className="w-3.5 h-3.5" />
            </Button>
            <Button type="button" size="sm" variant="ghost" className="h-7 px-2" onClick={clear}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 font-mono text-sm leading-relaxed terminal-output"
        style={{ minHeight: typeof height === "number" ? height : undefined, height: typeof height === "string" ? height : undefined }}
      >
        {lines.length === 0 ? (
          <p className="text-muted-foreground text-xs">
            Run your code. When Python calls <code className="text-accent">input()</code>, type here and press Enter.
          </p>
        ) : (
          lines.map((line, i) => (
            <pre key={i} className={cn("whitespace-pre-wrap m-0", lineClass(line.kind))}>
              {line.kind === "input" ? line.text : line.text}
            </pre>
          ))
        )}
        {status === "running" && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Loader2 className="w-3 h-3 animate-spin" /> Running…
          </span>
        )}
        {canInput && (
          <div className="flex items-center gap-0 mt-1 text-emerald-300">
            <input
              ref={inputRef}
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              className="flex-1 bg-transparent border-none outline-none font-mono text-sm text-emerald-300 caret-emerald-400 p-0 min-w-0"
              aria-label="Terminal input"
              autoComplete="off"
              spellCheck={false}
            />
            <span className="terminal-cursor w-2 h-4 bg-emerald-400/90 inline-block shrink-0" aria-hidden />
          </div>
        )}
      </div>

      {!showToolbar && (
        <div className="px-3 py-2 border-t border-border/60 flex gap-2">
          <Button type="button" size="sm" onClick={() => void run(code)} disabled={isBusy || !code.trim()} className="gap-1">
            <Play className="w-3.5 h-3.5" /> Run
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={clear}>
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}
