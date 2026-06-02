import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Editor from "@monaco-editor/react";
import { Play, Save, Loader2, Terminal, Trash2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "@/components/ThemeProvider";
import { apiFetch } from "@/lib/api";

const DEFAULT_CODE = '# Welcome to Python Edition Compiler\nprint("Hello, World!")\n';
const DEFAULT_INPUT = "Alice\n21\n";

export default function Compiler() {
  const { theme } = useTheme();
  const [code, setCode] = useState(DEFAULT_CODE);
  const [stdin, setStdin] = useState(DEFAULT_INPUT);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const monacoTheme = useMemo(() => (theme === "dark" ? "vs-dark" : "vs"), [theme]);

  const run = useMutation({
    mutationFn: () =>
      apiFetch<{ output: string; error: string | null }>("/compiler/run", {
        method: "POST",
        body: JSON.stringify({ code, stdin }),
      }),
    onSuccess: (res) => {
      setOutput(res.output);
      setError(res.error || "");
    },
  });

  const { data: saved } = useQuery({
    queryKey: ["saved-code"],
    queryFn: () => apiFetch<{ snippets: { _id: string; title: string; code: string }[] }>("/compiler/saved"),
  });

  const save = useMutation({
    mutationFn: () =>
      apiFetch("/compiler/saved", {
        method: "POST",
        body: JSON.stringify({ title: "My snippet", code }),
      }),
  });

  return (
    <Layout>
      <h1 className="text-3xl font-display font-bold mb-2">Interactive Compiler</h1>
      <p className="text-muted-foreground mb-6">
        Run Python with optional stdin input. Supports multi-line input for <code className="font-mono">input()</code>.
      </p>

      <div className="grid xl:grid-cols-[1fr_420px] gap-4">
        <GlassCard className="overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 p-3 border-b border-border">
            <Button size="sm" onClick={() => run.mutate()} disabled={run.isPending} className="gap-1">
              {run.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {run.isPending ? "Running..." : "Run"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => save.mutate()} className="gap-1">
              <Save className="w-4 h-4" /> Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="gap-1 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setOutput("");
                setError("");
              }}
              type="button"
            >
              <Trash2 className="w-4 h-4" />
              Clear output
            </Button>
          </div>
          <Editor
            height="520px"
            defaultLanguage="python"
            theme={monacoTheme}
            value={code}
            onChange={(v) => setCode(v || "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
            }}
          />
        </GlassCard>

        <div className="space-y-4">
          <GlassCard className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Terminal className="w-4 h-4 text-muted-foreground" />
              <h2 className="font-semibold">Provide Input (stdin)</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Each line here becomes one <code className="font-mono">input()</code>. Example: name then age on next line.
            </p>
            <Textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder={"Alice\n21\n"}
              className="min-h-[140px] font-mono text-sm"
            />
            <div className="flex justify-end mt-2">
              <Button size="sm" variant="outline" onClick={() => setStdin("")} type="button">
                Clear input
              </Button>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <h2 className="font-semibold mb-2">Console</h2>
            <div className="rounded-xl border border-border bg-card/40 overflow-hidden">
              <div className="px-3 py-2 border-b border-border bg-muted/30 text-xs text-muted-foreground font-mono">
                {run.isPending ? "running…" : error ? "stderr" : "stdout"}
              </div>
              <pre className="p-4 text-sm font-mono min-h-[220px] whitespace-pre-wrap leading-relaxed">
                {error ? (
                  <span className="text-destructive">{error}</span>
                ) : output ? (
                  output
                ) : (
                  <span className="text-muted-foreground">Run code to see output…</span>
                )}
              </pre>
            </div>
          </GlassCard>
        </div>
      </div>

      {saved?.snippets && saved.snippets.length > 0 && (
        <GlassCard className="p-4 mt-6">
          <h2 className="font-semibold mb-2">Saved snippets</h2>
          <div className="flex flex-wrap gap-2">
            {saved.snippets.map((s) => (
              <button
                key={s._id}
                type="button"
                className="text-sm px-3 py-1 rounded-lg border hover:border-primary"
                onClick={() => setCode(s.code)}
              >
                {s.title}
              </button>
            ))}
          </div>
        </GlassCard>
      )}
    </Layout>
  );
}
