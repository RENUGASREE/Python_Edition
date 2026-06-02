import React, { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { API_BASE } from "@/lib/api";

interface InteractiveTerminalProps {
  code: string;
  onExit?: (code: number | null) => void;
  autoRun?: boolean;
}

interface Log {
  type: "stdout" | "stderr" | "input" | "system";
  text: string;
}

export default function InteractiveTerminal({ code, onExit, autoRun = false }: InteractiveTerminalProps) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getWsUrl = () => {
    // If API_BASE is absolute (e.g. https://api.com), convert to wss://
    if (API_BASE.startsWith("http")) {
      return API_BASE.replace(/^http/, "ws") + "/compiler/ws";
    }
    // If relative (/api), construct from window.location
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}${API_BASE}/compiler/ws`;
  };

  const runCode = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    setLogs([{ type: "system", text: "Starting execution..." }]);
    setIsRunning(true);
    setInputValue("");

    const ws = new WebSocket(getWsUrl());
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "run", code }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "stdout" || msg.type === "stderr") {
          setLogs((prev) => [...prev, { type: msg.type, text: msg.data }]);
        } else if (msg.type === "exit") {
          setLogs((prev) => [...prev, { type: "system", text: `\\nProcess exited with code ${msg.code}` }]);
          setIsRunning(false);
          if (onExit) onExit(msg.code);
        } else if (msg.type === "error") {
          setLogs((prev) => [...prev, { type: "stderr", text: `\\n[System Error]: ${msg.data}` }]);
          setIsRunning(false);
        }
      } catch (e) {
        console.error("Invalid WS message:", event.data);
      }
    };

    ws.onclose = () => {
      setIsRunning(false);
    };

    ws.onerror = () => {
      setLogs((prev) => [...prev, { type: "stderr", text: "\\nWebSocket connection failed." }]);
      setIsRunning(false);
    };
  };

  const killProcess = () => {
    if (wsRef.current && isRunning) {
      wsRef.current.send(JSON.stringify({ type: "kill" }));
    }
  };

  useEffect(() => {
    if (autoRun && code) {
      runCode();
    }
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRun]); // Only run on mount if autoRun is true

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRunning || !wsRef.current) return;
    const val = inputValue;
    setLogs((prev) => [...prev, { type: "input", text: val + "\\n" }]);
    wsRef.current.send(JSON.stringify({ type: "input", input: val }));
    setInputValue("");
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-[#c9d1d9] font-mono text-sm rounded-xl overflow-hidden border border-border/50 shadow-inner">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
          <span className="ml-2 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            Interactive Console
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isRunning && (
            <span className="flex items-center gap-1.5 text-xs text-green-400">
              <Loader2 className="w-3 h-3 animate-spin" /> Running
            </span>
          )}
          <button
            onClick={runCode}
            disabled={isRunning}
            className="px-2.5 py-1 text-xs bg-primary/20 text-primary hover:bg-primary/30 rounded disabled:opacity-50 transition-colors"
          >
            Run
          </button>
          <button
            onClick={killProcess}
            disabled={!isRunning}
            className="px-2.5 py-1 text-xs bg-destructive/20 text-destructive hover:bg-destructive/30 rounded disabled:opacity-50 transition-colors"
          >
            Stop
          </button>
          <button
            onClick={() => setLogs([])}
            className="px-2.5 py-1 text-xs bg-white/5 text-white/70 hover:bg-white/10 rounded transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Terminal Output */}
      <div
        ref={terminalRef}
        className="flex-1 p-4 overflow-y-auto whitespace-pre-wrap break-all"
        onClick={() => inputRef.current?.focus()}
      >
        {logs.length === 0 && !isRunning && (
          <span className="text-muted-foreground/50">Press Run to execute code...</span>
        )}
        {logs.map((log, i) => (
          <span
            key={i}
            className={
              log.type === "stderr"
                ? "text-red-400"
                : log.type === "system"
                ? "text-blue-400/80 italic"
                : log.type === "input"
                ? "text-green-300"
                : "text-gray-300"
            }
          >
            {log.text}
          </span>
        ))}
        {isRunning && (
          <form onSubmit={handleInputSubmit} className="inline-block w-full mt-1 relative">
            <span className="text-green-400 mr-2">❯</span>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="bg-transparent border-none outline-none text-gray-300 w-[90%] font-mono"
              autoFocus
              autoComplete="off"
              spellCheck="false"
            />
          </form>
        )}
      </div>
    </div>
  );
}
