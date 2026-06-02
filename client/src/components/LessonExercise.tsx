import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { Play, Send, Lightbulb, CheckCircle2, XCircle, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/GlassCard";
import { InteractiveTerminal, type InteractiveTerminalHandle } from "@/components/InteractiveTerminal";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { CodingChallenge, LessonRequirements } from "@/types";

interface Props {
  slug: string;
  challenge: CodingChallenge;
  savedCode: string;
  requirements?: LessonRequirements;
  onPassed: () => void;
}

function codeUsesInput(code: string) {
  return /\binput\s*\(/.test(code);
}

export function LessonExercise({ slug, challenge, savedCode, requirements, onPassed }: Props) {
  const { toast } = useToast();
  const [code, setCode] = useState(savedCode || challenge.starterCode);
  const [hintIndex, setHintIndex] = useState(0);
  const [runResults, setRunResults] = useState<
    { passed: boolean; output?: string; error?: string; expected?: string }[]
  >([]);
  const [submitResults, setSubmitResults] = useState<
    { passed: boolean; hidden?: boolean; error?: string; expected?: string }[]
  >([]);
  const [loading, setLoading] = useState<"tests" | "submit" | null>(null);
  const [consoleRunning, setConsoleRunning] = useState(false);
  const terminalRef = useRef<InteractiveTerminalHandle>(null);

  const noInputRequired = challenge.constraints?.some((c) => /no input/i.test(c));

  useEffect(() => {
    setCode(savedCode || challenge.starterCode);
  }, [savedCode, challenge.starterCode]);

  const runInConsole = async () => {
    setConsoleRunning(true);
    try {
      await terminalRef.current?.run();
    } finally {
      setConsoleRunning(false);
    }
  };

  const checkTests = async () => {
    if (codeUsesInput(code)) {
      toast({
        title: "Use the console for input()",
        description:
          "“Check visible tests” cannot type interactively. Use Run in console below, or remove input() if this lesson does not need it.",
        variant: "destructive",
      });
      return;
    }
    setLoading("tests");
    try {
      const res = await apiFetch<{ results: typeof runResults }>(`/lessons/${slug}/exercise/run`, {
        method: "POST",
        body: JSON.stringify({ code }),
      });
      setRunResults(res.results);
    } catch (e: unknown) {
      toast({ title: "Test check failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const submit = async () => {
    if (codeUsesInput(code) && noInputRequired) {
      toast({
        title: "Remove input() for this challenge",
        description: challenge.constraints?.find((c) => /no input/i.test(c)) || "This exercise does not use input().",
        variant: "destructive",
      });
      return;
    }
    setLoading("submit");
    try {
      const res = await apiFetch<{
        passed: boolean;
        results: typeof submitResults;
        xpAwarded: number;
        requirements: LessonRequirements;
      }>(`/lessons/${slug}/exercise/submit`, {
        method: "POST",
        body: JSON.stringify({ code }),
      });
      setSubmitResults(res.results);
      if (res.passed) {
        toast({ title: "Challenge passed!", description: `+${res.xpAwarded || challenge.xpReward} XP` });
        onPassed();
      } else {
        toast({ title: "Not yet", description: "Some tests failed. Check output below.", variant: "destructive" });
      }
    } catch (e: unknown) {
      toast({ title: "Submit failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  return (
    <GlassCard className="p-6 mb-6 border-primary/20">
      <div className="flex flex-wrap justify-between gap-2 mb-4">
        <div>
          <h2 className="font-semibold text-lg">Coding challenge</h2>
          <p className="text-xs text-muted-foreground">
            {challenge.difficultyLabel} · {challenge.timeEstimate} · {challenge.xpReward} XP
          </p>
        </div>
        {requirements?.challengePassed && (
          <span className="flex items-center gap-1 text-sm text-primary">
            <CheckCircle2 className="w-4 h-4" /> Passed
          </span>
        )}
      </div>

      <p className="text-sm text-muted-foreground mb-4 whitespace-pre-wrap">{challenge.problemStatement}</p>

      {challenge.examples?.length > 0 && (
        <div className="mb-4 text-sm">
          <p className="font-medium mb-1">Examples</p>
          {challenge.examples.map((ex, i) => (
            <div key={i} className="bg-muted/30 rounded-lg p-2 mb-1 font-mono text-xs">
              Input: {ex.input || "(none)"} → Output: {ex.output}
            </div>
          ))}
        </div>
      )}

      {challenge.constraints?.length > 0 && (
        <ul className="text-xs text-muted-foreground list-disc pl-5 mb-4">
          {challenge.constraints.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      )}

      <div className="rounded-xl overflow-hidden border border-border mb-3">
        <Editor height="220px" defaultLanguage="python" theme="vs-dark" value={code} onChange={(v) => setCode(v || "")} />
      </div>

      <div className="mb-4">
        <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
          <Terminal className="w-3.5 h-3.5" /> Interactive console — same as Compiler page
        </p>
        <InteractiveTerminal ref={terminalRef} code={code} height={200} title="Lesson console" />
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <Button size="sm" onClick={runInConsole} disabled={consoleRunning || loading !== null} className="gap-1">
          <Play className="w-4 h-4" /> {consoleRunning ? "Running…" : "Run in console"}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={checkTests}
          disabled={loading !== null || consoleRunning}
          className="gap-1"
        >
          <CheckCircle2 className="w-4 h-4" /> {loading === "tests" ? "Checking…" : "Check visible tests"}
        </Button>
        <Button size="sm" variant="default" onClick={submit} disabled={loading !== null || consoleRunning} className="gap-1">
          <Send className="w-4 h-4" /> {loading === "submit" ? "Checking…" : "Submit solution"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setHintIndex((i) => Math.min(i + 1, challenge.hints.length))}
          className="gap-1"
        >
          <Lightbulb className="w-4 h-4" /> Hint ({hintIndex}/{challenge.hints.length})
        </Button>
      </div>

      {hintIndex > 0 && (
        <p className="text-sm bg-accent/10 border border-accent/20 rounded-lg p-3 mb-3">
          {challenge.hints.slice(0, hintIndex).map((h, i) => (
            <span key={i}>
              {i + 1}. {h}
              <br />
            </span>
          ))}
        </p>
      )}

      {runResults.length > 0 && (
        <div className="space-y-2 mb-3">
          <p className="text-xs font-medium">Automated test results (visible tests only)</p>
          {runResults.map((r, i) => (
            <div key={i} className={`text-xs p-2 rounded-lg ${r.passed ? "bg-primary/10" : "bg-destructive/10"}`}>
              {r.passed ? <CheckCircle2 className="w-3 h-3 inline mr-1" /> : <XCircle className="w-3 h-3 inline mr-1" />}
              Expected: {r.expected} | Got: {r.output || r.error}
            </div>
          ))}
        </div>
      )}

      {submitResults.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium">Submission results</p>
          {submitResults.map((r, i) => (
            <div key={i} className={`text-xs p-2 rounded-lg ${r.passed ? "bg-primary/10" : "bg-destructive/10"}`}>
              {r.hidden ? "Hidden test" : "Public test"} — {r.passed ? "Passed" : "Failed"}
              {!r.passed && r.expected && ` (expected: ${r.expected})`}
              {r.error && <pre className="mt-1 whitespace-pre-wrap">{r.error}</pre>}
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
