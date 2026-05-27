import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { Bookmark, CheckCircle, Volume2, Download, Lightbulb, AlertTriangle, Lock } from "lucide-react";
import { Layout } from "@/components/Layout";
import { GlassCard } from "@/components/GlassCard";
import { LessonExercise } from "@/components/LessonExercise";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/PageLoader";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Lesson as LessonType, LessonRequirements } from "@/types";

export default function LessonPage() {
  const [, params] = useRoute("/lessons/:slug");
  const slug = params?.slug || "";
  const { toast } = useToast();
  const qc = useQueryClient();
  const [answers, setAnswers] = useState<string[]>([]);
  const [quizResult, setQuizResult] = useState<{ score: number } | null>(null);
  const [requirements, setRequirements] = useState<LessonRequirements | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["lesson", slug],
    queryFn: () =>
      apiFetch<{
        lesson: LessonType;
        savedCode: string;
        requirements: LessonRequirements;
      }>(`/lessons/${slug}`),
    enabled: !!slug,
    retry: false,
  });

  const lesson = data?.lesson;

  useEffect(() => {
    if (data?.requirements) setRequirements(data.requirements);
  }, [data?.requirements]);

  const submitQuiz = useMutation({
    mutationFn: () =>
      apiFetch<{ score: number; requirements: LessonRequirements }>(`/lessons/${slug}/quiz`, {
        method: "POST",
        body: JSON.stringify({ answers }),
      }),
    onSuccess: (res) => {
      setQuizResult({ score: res.score });
      setRequirements(res.requirements);
      qc.invalidateQueries({ queryKey: ["lesson-map"] });
      toast({
        title: `Quiz: ${res.score}%`,
        description: res.requirements.quizPassed ? "Quiz requirement met!" : "Need 70% to complete lesson.",
      });
    },
  });

  const complete = useMutation({
    mutationFn: () =>
      apiFetch(`/lessons/${slug}/complete`, {
        method: "POST",
        body: JSON.stringify({ timeSpentMinutes: 15 }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lesson-map"] });
      qc.invalidateQueries({ queryKey: ["progress"] });
      qc.invalidateQueries({ queryKey: ["auth", "me"] });
      toast({ title: "Lesson completed!", description: "Next lesson unlocked." });
    },
    onError: (e: Error) => toast({ title: "Cannot complete", description: e.message, variant: "destructive" }),
  });

  const bookmark = useMutation({
    mutationFn: () => apiFetch(`/lessons/${slug}/bookmark`, { method: "POST" }),
    onSuccess: () => toast({ title: "Bookmark updated" }),
  });

  if (isLoading) {
    return (
      <Layout>
        <PageLoader label="Loading lesson..." />
      </Layout>
    );
  }

  if (error || !lesson) {
    return (
      <Layout>
        <GlassCard className="p-8 text-center">
          <Lock className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p>{(error as Error)?.message || "Lesson unavailable"}</p>
          <Link href="/courses" className="text-primary text-sm mt-2 inline-block">
            Back to courses
          </Link>
        </GlassCard>
      </Layout>
    );
  }

  const req = requirements || data?.requirements;
  const canComplete = req?.canComplete;

  return (
    <Layout>
      <div className="flex flex-wrap gap-2 mb-6">
        <Link href="/courses" className="text-sm text-primary hover:underline">
          ← Courses
        </Link>
        <span className="text-muted-foreground">·</span>
        <span className="text-sm capitalize text-muted-foreground">{lesson.category}</span>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex flex-wrap justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-display font-bold">{lesson.title}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {lesson.difficulty} · {lesson.estimated_time}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => bookmark.mutate()}>
              <Bookmark className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if ("speechSynthesis" in window) speechSynthesis.speak(new SpeechSynthesisUtterance(lesson.theory.slice(0, 500)));
              }}
            >
              <Volume2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => downloadNotes(lesson)}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {req && (
          <GlassCard className="p-4 mb-6 flex flex-wrap gap-4 text-sm">
            <span className={req.challengePassed ? "text-primary" : "text-muted-foreground"}>
              {req.challengePassed ? "✓" : "○"} Coding challenge
            </span>
            <span className={req.quizPassed ? "text-primary" : "text-muted-foreground"}>
              {req.quizPassed ? "✓" : "○"} Quiz ≥ {req.quizThreshold}% ({req.quizScore}%)
            </span>
          </GlassCard>
        )}

        <GlassCard className="p-6 mb-6">
          <h2 className="font-semibold mb-2">Learning objectives</h2>
          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
            {lesson.objectives.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </GlassCard>

        <Section title="Theory">{lesson.theory}</Section>
        <Section title="Real-world analogy">{lesson.real_world_example}</Section>
        <Section title="Syntax">
          <pre className="bg-muted/50 p-4 rounded-xl text-sm font-mono overflow-x-auto">{lesson.syntax}</pre>
        </Section>
        <Section title="Code example (study only — don’t copy for the challenge)">
          <pre className="bg-muted/50 p-4 rounded-xl text-sm font-mono overflow-x-auto">{lesson.code_example}</pre>
        </Section>
        <Section title="Expected output">
          <pre className="bg-primary/10 p-4 rounded-xl text-sm font-mono">{lesson.output_example}</pre>
        </Section>

        <GlassCard className="p-6 mb-6">
          <h2 className="font-semibold flex items-center gap-2 text-amber-400 mb-3">
            <AlertTriangle className="w-4 h-4" /> Common mistakes
          </h2>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
            {lesson.common_mistakes.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard className="p-6 mb-6">
          <h2 className="font-semibold flex items-center gap-2 text-primary mb-3">
            <Lightbulb className="w-4 h-4" /> Tips & tricks
          </h2>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
            {lesson.tips.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </GlassCard>

        {lesson.codingChallenge && (
          <LessonExercise
            slug={slug}
            challenge={lesson.codingChallenge}
            savedCode={data?.savedCode || ""}
            requirements={req || undefined}
            onPassed={() => {
              setRequirements((r) => (r ? { ...r, challengePassed: true, canComplete: r.quizPassed } : r));
              qc.invalidateQueries({ queryKey: ["lesson", slug] });
            }}
          />
        )}

        <GlassCard className="p-6 mb-6">
          <h2 className="font-semibold mb-4">Quiz</h2>
          {lesson.quiz.map((q, i) => (
            <div key={i} className="mb-4">
              <p className="font-medium text-sm mb-2">{q.question}</p>
              <div className="flex flex-wrap gap-2">
                {q.options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      const next = [...answers];
                      next[i] = opt;
                      setAnswers(next);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm border ${
                      answers[i] === opt ? "border-primary bg-primary/15" : "border-border"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <Button
            onClick={() => {
              if (lesson.quiz.findIndex((_, i) => !answers[i]) >= 0) {
                toast({ title: "Incomplete quiz", variant: "destructive" });
                return;
              }
              submitQuiz.mutate();
            }}
            disabled={submitQuiz.isPending}
          >
            Submit quiz
          </Button>
          {quizResult && (
            <p className="mt-3 text-sm">
              Score: <span className="text-primary font-bold">{quizResult.score}%</span>
            </p>
          )}
        </GlassCard>

        <Section title="Summary">{lesson.summary}</Section>

        <Button
          className="gap-2"
          disabled={!canComplete || complete.isPending}
          onClick={() => complete.mutate()}
        >
          <CheckCircle className="w-4 h-4" />
          {canComplete ? "Complete lesson & unlock next" : "Pass challenge + quiz (70%) to complete"}
        </Button>
      </motion.div>
    </Layout>
  );
}

function downloadNotes(lesson: LessonType) {
  const content = `# ${lesson.title}\n\n${lesson.theory}\n\n## Summary\n${lesson.summary}`;
  const blob = new Blob([content], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${lesson.slug}-notes.txt`;
  a.click();
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <GlassCard className="p-6 mb-6">
      <h2 className="font-semibold mb-3">{title}</h2>
      <div className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">{children}</div>
    </GlassCard>
  );
}
