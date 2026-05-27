import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Editor from "@monaco-editor/react";
import { Zap, Search, Filter } from "lucide-react";
import { Layout } from "@/components/Layout";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { PageLoader } from "@/components/PageLoader";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Challenge } from "@/types";

const CATEGORIES = ["beginner", "intermediate", "advanced"] as const;

export default function Challenges() {
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("beginner");
  const [search, setSearch] = useState("");

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
      apiFetch<{ passed: boolean; pointsAwarded?: number }>(`/challenges/${id}/submit`, {
        method: "POST",
        body: JSON.stringify({ code }),
      }),
    onSuccess: (res: { passed: boolean; pointsAwarded?: number }) => {
      toast({
        title: res.passed ? "Solved!" : "Try again",
        description: res.passed ? `+${res.pointsAwarded || 0} points` : "Check your logic",
        variant: res.passed ? "default" : "destructive",
      });
    },
  });

  return (
    <Layout>
      <h1 className="text-3xl font-display font-bold flex items-center gap-2 mb-2">
        <Zap className="text-accent" /> Coding Challenges
      </h1>
      <p className="text-muted-foreground mb-6">
        {stats?.totalSolved ?? 0} solved · Practice by category
      </p>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {CATEGORIES.map((cat) => {
          const s = stats?.byCategory?.[cat];
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className="text-left w-full"
            >
            <GlassCard
              className={`p-4 ${category === cat ? "ring-2 ring-primary" : ""}`}
            >
              <p className="font-semibold capitalize">{cat}</p>
              <p className="text-xs text-muted-foreground mb-2">
                {s?.solved ?? 0}/{s?.total ?? 0} completed
              </p>
              <Progress value={s?.percent ?? 0} className="h-1.5" />
            </GlassCard>
            </button>
          );
        })}
      </div>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search challenges..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="space-y-2 max-h-[520px] overflow-y-auto">
            {filtered.map((c) => (
              <button
                key={c._id}
                type="button"
                onClick={() => {
                  setSelectedId(c._id);
                  setCode(c.starterCode);
                }}
                className={`w-full text-left p-4 rounded-xl border transition-colors ${
                  selectedId === c._id || active?._id === c._id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <p className="font-medium text-sm">{c.title}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {c.challengeType} · {c.difficulty} · {c.points} pts · ~{c.estimatedMinutes}m
                </p>
              </button>
            ))}
          </div>

          <GlassCard className="lg:col-span-2 overflow-hidden">
            {active ? (
              <>
                <div className="p-4 border-b">
                  <h2 className="font-semibold">{active.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{active.description}</p>
                </div>
                <Editor
                  height="300px"
                  defaultLanguage="python"
                  theme="vs-dark"
                  value={code || active.starterCode}
                  onChange={(v) => setCode(v || "")}
                />
                <div className="p-4">
                  <Button onClick={() => submit.mutate(active._id)} disabled={submit.isPending}>
                    Submit solution
                  </Button>
                </div>
              </>
            ) : (
              <p className="p-8 text-muted-foreground">No challenges in this category</p>
            )}
          </GlassCard>
        </div>
      )}

      {stats?.recent && stats.recent.length > 0 && (
        <GlassCard className="p-4 mt-8">
          <h3 className="font-semibold mb-2">Recently solved</h3>
          <div className="flex flex-wrap gap-2">
            {stats.recent.map((c) => (
              <span key={c._id} className="text-xs px-2 py-1 rounded-full bg-primary/15 text-primary">
                {c.title}
              </span>
            ))}
          </div>
        </GlassCard>
      )}
    </Layout>
  );
}
