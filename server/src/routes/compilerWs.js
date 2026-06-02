import { spawn } from "child_process";

const PYTHON = process.env.PYTHON_BIN || (process.platform === "win32" ? "python" : "python3");

export function setupCompilerWs(wss) {
  wss.on("connection", (ws, req) => {
    // Only handle compiler run path
    if (!req.url.startsWith("/api/compiler/ws")) {
      return;
    }

    let pyProc = null;

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message);
        
        if (data.type === "run") {
          // Kill existing process if any
          if (pyProc) {
            pyProc.kill("SIGKILL");
          }

          const code = data.code;
          if (!code) {
            ws.send(JSON.stringify({ type: "error", data: "No code provided" }));
            return;
          }

          ws.send(JSON.stringify({ type: "start" }));

          pyProc = spawn(PYTHON, ["-c", code], {
            env: {
              ...process.env,
              PYTHONUNBUFFERED: "1", // Force unbuffered stdout/stderr
            },
          });

          pyProc.stdout.on("data", (chunk) => {
            ws.send(JSON.stringify({ type: "stdout", data: chunk.toString() }));
          });

          pyProc.stderr.on("data", (chunk) => {
            ws.send(JSON.stringify({ type: "stderr", data: chunk.toString() }));
          });

          pyProc.on("close", (code) => {
            ws.send(JSON.stringify({ type: "exit", code }));
            pyProc = null;
          });

          pyProc.on("error", (err) => {
            ws.send(JSON.stringify({ type: "error", data: \`Process error: \${err.message}\` }));
          });
        } else if (data.type === "input") {
          if (pyProc && data.input !== undefined) {
            // Write input followed by newline to stdin
            pyProc.stdin.write(data.input + "\\n");
          }
        } else if (data.type === "kill") {
          if (pyProc) {
            pyProc.kill("SIGKILL");
            pyProc = null;
          }
        }
      } catch (err) {
        ws.send(JSON.stringify({ type: "error", data: "Invalid message format" }));
      }
    });

    ws.on("close", () => {
      if (pyProc) {
        pyProc.kill("SIGKILL");
      }
    });
  });
}
