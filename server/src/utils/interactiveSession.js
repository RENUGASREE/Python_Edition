import { spawn } from "child_process";
import { randomUUID } from "crypto";

const PYTHON = process.env.PYTHON_BIN || (process.platform === "win32" ? "python" : "python3");
const SESSION_TTL_MS = Number(process.env.TERMINAL_SESSION_TTL_MS || 300_000);
const MAX_SESSIONS_PER_USER = Number(process.env.TERMINAL_MAX_SESSIONS_PER_USER || 5);
const MAX_CODE_LENGTH = 50_000;
const EXECUTION_TIMEOUT_MS = Number(process.env.TERMINAL_TIMEOUT_MS || 30_000);
const OUTPUT_WAIT_MS = Number(process.env.TERMINAL_OUTPUT_WAIT_MS || 220);

/** @type {Map<string, object>} */
const sessions = new Map();

function countUserSessions(userId) {
  let n = 0;
  for (const s of sessions.values()) {
    if (s.userId === userId) n++;
  }
  return n;
}

function killSession(id) {
  const session = sessions.get(id);
  if (!session) return;
  if (session.sessionTimeout) clearTimeout(session.sessionTimeout);
  try {
    if (!session.proc.killed) session.proc.kill("SIGKILL");
  } catch {
    /* ignore */
  }
  session.status = session.status === "timeout" ? "timeout" : "stopped";
  sessions.delete(id);
}

function sweepSessions() {
  const now = Date.now();
  for (const [id, s] of sessions) {
    if (now - s.createdAt > SESSION_TTL_MS) killSession(id);
  }
}

setInterval(sweepSessions, 60_000).unref?.();

function drainOutput(session) {
  const stdout = session.outputBuffer;
  const stderr = session.stderrBuffer;
  session.outputBuffer = "";
  session.stderrBuffer = "";
  return { stdout, stderr };
}

function resolveStatus(session) {
  if (session.status === "timeout" || session.status === "stopped") return session.status;
  if (session.status === "error") return "error";
  if (session.status === "done") return "done";
  if (session.proc.killed || session.proc.exitCode !== null) {
    return session.exitCode === 0 ? "done" : "error";
  }
  return "waiting_input";
}

function waitForIo(session) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { stdout, stderr } = drainOutput(session);
      const status = resolveStatus(session);
      resolve({
        stdout,
        stderr,
        status,
        error: session.errorMessage || (status === "error" ? session.stderrAcc.trim() : null),
        exitCode: session.proc.exitCode,
      });
    }, OUTPUT_WAIT_MS);
  });
}

/**
 * Start an interactive Python process (real stdin/stdout pipes).
 */
export async function startInteractiveSession(userId, code) {
  sweepSessions();
  if (!code?.trim()) throw Object.assign(new Error("Code is required"), { statusCode: 400 });
  if (code.length > MAX_CODE_LENGTH) {
    throw Object.assign(new Error("Code exceeds maximum length"), { statusCode: 400 });
  }

  if (countUserSessions(userId) >= MAX_SESSIONS_PER_USER) {
    for (const [id, s] of sessions) {
      if (s.userId === userId) {
        killSession(id);
        break;
      }
    }
  }

  const id = randomUUID();
  const proc = spawn(PYTHON, ["-u", "-c", code], {
    stdio: ["pipe", "pipe", "pipe"],
    env: { ...process.env, PYTHONUNBUFFERED: "1" },
  });

  const session = {
    id,
    userId,
    proc,
    outputBuffer: "",
    stderrBuffer: "",
    stderrAcc: "",
    status: "running",
    errorMessage: null,
    createdAt: Date.now(),
    sessionTimeout: null,
    killTimeout: null,
    exitCode: null,
  };

  proc.stdout.on("data", (chunk) => {
    session.outputBuffer += chunk.toString();
  });

  proc.stderr.on("data", (chunk) => {
    const text = chunk.toString();
    session.stderrBuffer += text;
    session.stderrAcc += text;
  });

  proc.on("close", (exitCode) => {
    session.exitCode = exitCode;
    session.status = exitCode === 0 ? "done" : "error";
    if (session.sessionTimeout) clearTimeout(session.sessionTimeout);
  });

  proc.on("error", (err) => {
    session.status = "error";
    session.errorMessage =
      err.code === "ENOENT"
        ? `Python not found (${PYTHON}). Set PYTHON_BIN on the server.`
        : err.message;
  });

  session.sessionTimeout = setTimeout(() => {
    session.status = "timeout";
    try {
      proc.kill("SIGKILL");
    } catch {
      /* ignore */
    }
    sessions.delete(id);
  }, EXECUTION_TIMEOUT_MS);

  sessions.set(id, session);

  const io = await waitForIo(session);
  return { sessionId: id, ...io };
}

/**
 * Send one line of stdin (user pressed Enter in the terminal).
 */
export async function sendInteractiveInput(sessionId, userId, line) {
  const session = sessions.get(sessionId);
  if (!session) throw Object.assign(new Error("Session not found or expired"), { statusCode: 404 });
  if (session.userId !== userId) throw Object.assign(new Error("Forbidden"), { statusCode: 403 });
  if (session.status === "done" || session.status === "error" || session.status === "timeout") {
    return drainAndRespond(session);
  }

  if (!session.proc.stdin.writable) {
    throw Object.assign(new Error("Process is not accepting input"), { statusCode: 400 });
  }

  session.proc.stdin.write(`${line}\n`);

  const io = await waitForIo(session);
  if (io.status === "done" || io.status === "error") {
    sessions.delete(sessionId);
  }
  return { sessionId, ...io };
}

function drainAndRespond(session) {
  const { stdout, stderr } = drainOutput(session);
  return {
    sessionId: session.id,
    stdout,
    stderr,
    status: session.status,
    error: session.errorMessage || (session.status === "error" ? session.stderrAcc.trim() : null),
    exitCode: session.exitCode,
  };
}

export function stopInteractiveSession(sessionId, userId) {
  const session = sessions.get(sessionId);
  if (!session) return { ok: true };
  if (session.userId !== userId) throw Object.assign(new Error("Forbidden"), { statusCode: 403 });
  killSession(sessionId);
  return { ok: true };
}

export function getInteractiveSession(sessionId, userId) {
  const session = sessions.get(sessionId);
  if (!session || session.userId !== userId) return null;
  return session;
}
