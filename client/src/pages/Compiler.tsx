import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Editor from "@monaco-editor/react";
import { Save } from "lucide-react";
import { Layout } from "@/components/Layout";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { InteractiveTerminal } from "@/components/InteractiveTerminal";
import { apiFetch } from "@/lib/api";

const DEFAULT_CODE = `name = input("Enter name: ")
age = input("Enter age: ")
print(name, age)
`;

export default function Compiler() {
  const [code, setCode] = useState(DEFAULT_CODE);

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
        Type directly in the console when Python calls <code className="font-mono text-accent">input()</code> — just like VS Code.
      </p>

      <div className="grid xl:grid-cols-[1fr_440px] gap-4">
        <GlassCard className="overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 p-3 border-b border-border">
            <Button size="sm" variant="outline" onClick={() => save.mutate()} className="gap-1">
              <Save className="w-4 h-4" /> Save
            </Button>
          </div>
          <Editor
            height="520px"
            defaultLanguage="python"
            theme="vs-dark"
            value={code}
            onChange={(v) => setCode(v || "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
            }}
          />
        </GlassCard>

        <InteractiveTerminal code={code} height={520} title="Python console" />
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
