import { spawn } from "child_process";

const PYTHON = process.env.PYTHON_BIN || (process.platform === "win32" ? "python" : "python3");

/**
 * Run Python with optional stdin injection (development sandbox).
 * Production should use isolated containers.
 */
export function runPython(code, options = {}) {
  const { stdin = "", timeoutMs = 5000 } = options;
  const script =
    stdin.trim().length > 0
      ? `import sys\nfrom io import StringIO\nsys.stdin = StringIO(${JSON.stringify(stdin)})\n${code}`
      : code;

  return new Promise((resolve) => {
    const proc = spawn(PYTHON, ["-c", script], { timeout: timeoutMs });
    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (d) => (stdout += d.toString()));
    proc.stderr.on("data", (d) => (stderr += d.toString()));

    const timer = setTimeout(() => {
      proc.kill("SIGKILL");
      resolve({ output: stdout.trim(), error: formatError("Execution timed out (5s limit)") });
    }, timeoutMs);

    proc.on("close", (exitCode) => {
      clearTimeout(timer);
      const out = stdout.trim();
      const err = stderr.trim();
      if (exitCode !== 0) {
        resolve({ output: out, error: formatError(err || `Process exited with code ${exitCode}`) });
      } else if (err && !out) {
        resolve({ output: out, error: formatError(err) });
      } else {
        resolve({ output: out, error: null });
      }
    });

    proc.on("error", () => {
      clearTimeout(timer);
      resolve({
        output: "",
        error: formatError(
          `Python not found (${PYTHON}). Set PYTHON_BIN in .env or install Python 3.`
        ),
      });
    });
  });
}

/** Run user code against a single challenge test case */
export function runPythonTestCase(userCode, stdin, timeoutMs = 5000) {
  return runPython(userCode, { stdin, timeoutMs });
}

/** Normalize tracebacks for display in the UI */
export function formatError(message) {
  if (!message) return "Unknown error";
  const lines = message.split("\n").filter(Boolean);
  const last = lines[lines.length - 1];
  if (lines.length > 6) {
    return [...lines.slice(0, 2), "...", last].join("\n");
  }
  return message;
}
