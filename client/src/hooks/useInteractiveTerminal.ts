import { useCallback, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";

export type TerminalLineKind = "stdout" | "stderr" | "input" | "system";
export type TerminalLine = { kind: TerminalLineKind; text: string };
export type TerminalStatus =
  | "idle"
  | "running"
  | "waiting_input"
  | "done"
  | "error"
  | "timeout"
  | "stopped";

type IoResult = {
  sessionId: string;
  stdout: string;
  stderr: string;
  status: string;
  error?: string | null;
};

function appendChunks(lines: TerminalLine[], stdout: string, stderr: string) {
  const next = [...lines];
  if (stdout) next.push({ kind: "stdout", text: stdout });
  if (stderr) next.push({ kind: "stderr", text: stderr });
  return next;
}

export function useInteractiveTerminal() {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [status, setStatus] = useState<TerminalStatus>("idle");
  const sessionRef = useRef<string | null>(null);
  const busyRef = useRef(false);

  const mapStatus = (s: string): TerminalStatus => {
    if (s === "waiting_input") return "waiting_input";
    if (s === "done") return "done";
    if (s === "timeout") return "timeout";
    if (s === "stopped") return "stopped";
    if (s === "error") return "error";
    return "running";
  };

  const applyIo = useCallback((res: IoResult, echoInput?: string) => {
    sessionRef.current = res.sessionId;
    setLines((prev) => {
      let next = prev;
      if (echoInput !== undefined) next = [...next, { kind: "input", text: echoInput }];
      return appendChunks(next, res.stdout, res.stderr);
    });
    const mapped = mapStatus(res.status);
    setStatus(mapped);
    if (res.error && mapped === "error") {
      setLines((prev) => [...prev, { kind: "stderr", text: res.error! }]);
    }
    if (mapped === "done" || mapped === "error" || mapped === "timeout") {
      sessionRef.current = null;
    }
  }, []);

  const stop = useCallback(async () => {
    const id = sessionRef.current;
    if (id) {
      try {
        await apiFetch("/terminal/stop", { method: "POST", body: JSON.stringify({ sessionId: id }) });
      } catch {
        /* ignore */
      }
    }
    sessionRef.current = null;
    setStatus("stopped");
  }, []);

  const clear = useCallback(() => {
    setLines([]);
    setStatus("idle");
    sessionRef.current = null;
  }, []);

  const run = useCallback(
    async (code: string) => {
      if (busyRef.current) return;
      busyRef.current = true;
      await stop();
      setLines([{ kind: "system", text: "Starting Python…" }]);
      setStatus("running");
      try {
        const res = await apiFetch<IoResult>("/terminal/start", {
          method: "POST",
          body: JSON.stringify({ code }),
        });
        setLines([]);
        applyIo(res);
      } catch (e: unknown) {
        sessionRef.current = null;
        setStatus("error");
        setLines((prev) => [
          ...prev.filter((l) => l.kind !== "system"),
          { kind: "stderr", text: (e as Error).message || "Execution failed" },
        ]);
      } finally {
        busyRef.current = false;
      }
    },
    [applyIo, stop]
  );

  const submitInput = useCallback(
    async (line: string) => {
      const id = sessionRef.current;
      if (!id || status !== "waiting_input" || busyRef.current) return;
      busyRef.current = true;
      setStatus("running");
      try {
        const res = await apiFetch<IoResult>("/terminal/input", {
          method: "POST",
          body: JSON.stringify({ sessionId: id, line }),
        });
        applyIo(res, line);
      } catch (e: unknown) {
        setStatus("error");
        setLines((prev) => [...prev, { kind: "stderr", text: (e as Error).message || "Input failed" }]);
        sessionRef.current = null;
      } finally {
        busyRef.current = false;
      }
    },
    [applyIo, status]
  );

  return {
    lines,
    status,
    run,
    submitInput,
    stop,
    clear,
    isBusy: status === "running" || busyRef.current,
    canInput: status === "waiting_input",
  };
}
