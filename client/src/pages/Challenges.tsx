import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Editor from "@monaco-editor/react";
import { Zap, Search, Filter, Trophy, Clock, Target, CheckCircle, XCircle, Flame, Award } from "lucide-react";
import { Layout } from "@/components/Layout";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { PageLoader } from "@/components/PageLoader";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { InteractiveTerminal } from "@/components/InteractiveTerminal";
import type { Challenge } from "@/types";

const CATEGORIES = ["beginner", "intermediate", "advanced"] as const;

const DIFFICULTY_COLORS = {
  easy: "bg-green-500/10 text-green-400 border-green-500/20",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  hard: "bg-red-500/10 text-red-400 border-red-500/20",
};

const DIFFICULTY_BADGES = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export default function Challenges() {
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("beginner");
  const [search, setSearch] = useState("");
  const [lastResult, setLastResult] = useState<{
    passed: boolean;
    score: number;
    total: number;
    scorePercent: number;
    results: { hidden?: boolean; output: string; error: string | null; passed: boolean }[];
  } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["challenges", category],
    queryFn: () => apiFetch<{ challenges: Challenge[] }>(`/challenges?category=${category}`),
  });

  const { data: stats } = useQuery({
    queryKey: ["challenge-stats"],
    queryFn: () =>
      apiFetch<{
        byCategory: Record<string, { total: number; solved: number; percent: number }>;
        recent: Challenge[];
        totalSolved: number;
      }>("/challenges/stats"),
  });

  const filtered = useMemo(() => {
    const list = data?.challenges || [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.challengeType?.toLowerCase().includes(q)
    );
  }, [data, search]);

  const active = filtered.find((c) => c._id === selectedId) || filtered[0];

  const submit = useMutation({
    mutationFn: (id: string) =>
      apiFetch<{
        passed: boolean;
        pointsAwarded?: number;
        score: number;
        total: number;
        scorePercent: number;
        results: { hidden?: boolean; output: string; error: string | null; passed: boolean }[];
      }>(`/challenges/${id}/submit`, {
        method: "POST",
        body: JSON.stringify({ code }),
      }),
    onSuccess: (res) => {
      setLastResult(res);
      toast({
        title: res.passed ? "🎉 Challenge Solved!" : "Keep trying",
        description: res.passed ? `+${res.pointsAwarded || 0} XP earned` : "Review the test results and try again",
        variant: res.passed ? "default" : "destructive",
      });
    },
  });

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold flex items-center gap-3 mb-3">
          <div className="p-3 rounded-2xl bg-accent/10 border border-accent/20">
            <Zap className="w-8 h-8 text-accent" />
          </div>
          Coding Challenges
        </h1>
        <p className="text-muted-foreground text-lg">
          Practice your Python skills with {stats?.totalSolved ?? 0} challenges solved
        </p>
      </div>

      {/* Category Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {CATEGORIES.map((cat) => {
          const s = stats?.byCategory?.[cat];
          const isActive = category === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className="text-left w-full"
            >
              <GlassCard
                variant={isActive ? "bordered" : "default"}
                hover
                className={`p-6 ${isActive ? "border-primary/50" : ""}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="font-bold text-lg capitalize">{cat}</p>
                  {isActive && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
                <div className="flex items-end gap-2 mb-3">
                  <span className="text-3xl font-bold text-primary">{s?.solved ?? 0}</span>
                  <span className="text-muted-foreground mb-1">/ {s?.total ?? 0}</span>
                </div>
                <Progress value={s?.percent ?? 0} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">{Math.round(s?.percent ?? 0)}% complete</p>
              </GlassCard>
            </button>
          );
        })}
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            className="pl-12 h-12 text-base"
            placeholder="Search challenges by title, type, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="lg" className="px-6">
          <Filter className="w-5 h-5 mr-2" />
          Filter
        </Button>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Challenge List */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {filtered.map((c) => (
              <button
                key={c._id}
                type="button"
                onClick={() => {
                  setSelectedId(c._id);
                  setCode(c.starterCode);
                }}
                className={`w-full text-left p-5 rounded-2xl border transition-all ${
                  selectedId === c._id || active?._id === c._id
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                    : "border-border hover:border-primary/40 hover:bg-primary/5"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="font-semibold text-base">{c.title}</p>
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent">
                    {c.points} XP
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{c.description}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${
                    DIFFICULTY_COLORS[c.difficulty as keyof typeof DIFFICULTY_COLORS] || DIFFICULTY_COLORS.medium
                  }`}>
                    {DIFFICULTY_BADGES[c.difficulty as keyof typeof DIFFICULTY_BADGES] || c.difficulty}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">{c.challengeType}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    ~{c.estimatedMinutes}m
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Challenge Editor */}
          <GlassCard variant="elevated" className="lg:col-span-2 overflow-hidden">
            {active ? (
              <>
                <div className="p-6 border-b border-border">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold">{active.title}</h2>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                          DIFFICULTY_COLORS[active.difficulty as keyof typeof DIFFICULTY_COLORS] || DIFFICULTY_COLORS.medium
                        }`}>
                          {DIFFICULTY_BADGES[active.difficulty as keyof typeof DIFFICULTY_BADGES] || active.difficulty}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{active.description}</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 border border-accent/20">
                      <Award className="w-5 h-5 text-accent" />
                      <span className="font-bold text-accent">{active.points} XP</span>
                    </div>
                  </div>
                </div>
                <Editor
                  height="320px"
                  defaultLanguage="python"
                  theme="vs-dark"
                  value={code || active.starterCode}
                  onChange={(v) => setCode(v || "")}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    padding: { top: 16 },
                  }}
                />
                <div className="p-6 border-t border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Target className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">Test your code with live input() support before submitting</p>
                  </div>
                  <InteractiveTerminal
                    code={code || active.starterCode}
                    height={200}
                    title="Test Console"
                  />
                </div>
                <div className="p-6 pt-0">
                  <Button
                    size="lg"
                    onClick={() => submit.mutate(active._id)}
                    disabled={submit.isPending}
                    className="w-full sm:w-auto gap-2"
                  >
                    <Zap className="w-5 h-5" />
                    Submit Solution
                  </Button>
                  {lastResult && (
                    <div className="mt-6 space-y-4">
                      <div className={`p-4 rounded-xl border ${
                        lastResult.passed
                          ? "border-primary bg-primary/10"
                          : "border-destructive bg-destructive/10"
                      }`}>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            {lastResult.passed ? (
                              <CheckCircle className="w-6 h-6 text-primary" />
                            ) : (
                              <XCircle className="w-6 h-6 text-destructive" />
                            )}
                            <span className="font-semibold text-lg">
                              {lastResult.passed ? "All Tests Passed!" : "Some Tests Failed"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Score:</span>
                            <span className={`font-bold text-xl ${
                              lastResult.passed ? "text-primary" : "text-destructive"
                            }`}>
                              {lastResult.score}/{lastResult.total}
                            </span>
                            <span className="text-muted-foreground">({lastResult.scorePercent}%)</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {lastResult.results.map((r, idx) => (
                          <div
                            key={idx}
                            className={`rounded-xl border px-4 py-3 text-sm font-mono whitespace-pre-wrap ${
                              r.passed
                                ? "border-primary/30 bg-primary/5"
                                : "border-destructive/30 bg-destructive/5"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-2 font-sans">
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Test Case {idx + 1}</span>
                                {r.hidden && (
                                  <span className="px-2 py-0.5 rounded-full text-xs bg-muted/50 text-muted-foreground">
                                    Hidden
                                  </span>
                                )}
                              </div>
                              <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                                r.passed
                                  ? "bg-primary/20 text-primary"
                                  : "bg-destructive/20 text-destructive"
                              }`}>
                                {r.passed ? "PASS" : "FAIL"}
                              </span>
                            </div>
                            {r.error ? (
                              <span className="text-destructive">{r.error}</span>
                            ) : (
                              <span className="text-muted-foreground">{r.output || "(no output)"}</span>
                            )}
                          </div>
                        ))}
                        <p className="text-xs text-muted-foreground mt-4 p-3 rounded-lg bg-muted/30">
                          💡 Hidden tests help prevent hardcoding. Focus on writing correct logic that works for all possible inputs.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-12 text-center">
                <div className="p-4 rounded-full bg-muted/10 w-fit mx-auto mb-4">
                  <Zap className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No challenges in this category</p>
              </div>
            )}
          </GlassCard>
        </div>
      )}

      {/* Recently Solved */}
      {stats?.recent && stats.recent.length > 0 && (
        <GlassCard variant="elevated" className="p-6 mt-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <Flame className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Recently Solved</h3>
              <p className="text-sm text-muted-foreground">Your latest achievements</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {stats.recent.map((c) => (
              <div
                key={c._id}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20"
              >
                <CheckCircle className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">{c.title}</span>
                <span className="text-xs text-primary font-semibold">+{c.points} XP</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </Layout>
  );
}
