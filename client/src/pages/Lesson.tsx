import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { Bookmark, CheckCircle, Volume2, Download, Lightbulb, AlertTriangle, Lock, Target, BookOpen, ChevronRight, Play, Code, FileText } from "lucide-react";
import { Layout } from "@/components/Layout";
import { GlassCard } from "@/components/GlassCard";
import { LessonExercise } from "@/components/LessonExercise";
import { LessonNavigation } from "@/components/LessonNavigation";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/PageLoader";
import { Progress } from "@/components/ui/progress";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Lesson as LessonType, LessonRequirements, LessonAdaptiveContext } from "@/types";

export default function LessonPage() {
  const [, params] = useRoute("/lessons/:slug");
  const slug = params?.slug || "";
  const { toast } = useToast();
  const qc = useQueryClient();
  const [answers, setAnswers] = useState<string[]>([]);
  const [quizResult, setQuizResult] = useState<{ score: number } | null>(null);
  const [requirements, setRequirements] = useState<LessonRequirements | null>(null);
  const [currentSection, setCurrentSection] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ["lesson", slug],
    queryFn: () =>
      apiFetch<{
        lesson: LessonType;
        savedCode: string;
        requirements: LessonRequirements;
        adaptive?: LessonAdaptiveContext;
        navigation?: {
          position: number;
          total: number;
          prev: { slug: string; title: string; unlocked: boolean } | null;
          next: { slug: string; title: string; unlocked: boolean } | null;
        };
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
      qc.invalidateQueries({ queryKey: ["adaptive"] });
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
      qc.invalidateQueries({ queryKey: ["lesson", slug] });
      qc.invalidateQueries({ queryKey: ["progress"] });
      qc.invalidateQueries({ queryKey: ["auth", "me"] });
      const nextTitle = data?.navigation?.next?.title;
      toast({
        title: "Lesson completed!",
        description: nextTitle ? `Next up: ${nextTitle}` : "Next lesson unlocked.",
      });
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
    const msg = (error as Error)?.message || "Lesson unavailable";
    const locked = msg.toLowerCase().includes("locked");
    return (
      <Layout>
        <GlassCard variant="elevated" className="p-12 text-center max-w-lg mx-auto">
          <div className="p-4 rounded-full bg-accent/10 w-fit mx-auto mb-4">
            <Lock className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{locked ? "Lesson locked" : "Lesson unavailable"}</h2>
          <p className="text-muted-foreground mb-6">{msg}</p>
          {locked && (
            <p className="text-sm text-muted-foreground mb-6">
              Complete the previous lesson in your track (challenge + quiz ≥ 70%) to unlock this lesson.
            </p>
          )}
          <Link href="/courses">
            <Button variant="outline">← Back to courses</Button>
          </Link>
        </GlassCard>
      </Layout>
    );
  }

  const req = requirements || data?.requirements;
  const canComplete = req?.canComplete;
  const nav = data?.navigation;

  const sections = [
    { id: "objectives", title: "Learning Objectives", icon: Target },
    { id: "theory", title: "Theory", icon: BookOpen },
    { id: "analogy", title: "Real-World Analogy", icon: Lightbulb },
    { id: "syntax", title: "Syntax", icon: Code },
    { id: "example", title: "Code Example", icon: Play },
    { id: "output", title: "Expected Output", icon: FileText },
    { id: "mistakes", title: "Common Mistakes", icon: AlertTriangle },
    { id: "tips", title: "Tips & Tricks", icon: Lightbulb },
  ];

  return (
    <Layout>
      <div className="flex flex-wrap gap-2 mb-6">
        <Link href="/courses" className="text-sm text-primary hover:underline flex items-center gap-1">
          ← Courses
        </Link>
        <span className="text-muted-foreground">·</span>
        <span className="text-sm capitalize text-muted-foreground">{lesson.category}</span>
      </div>

      {nav && (
        <LessonNavigation
          prev={nav.prev}
          next={nav.next}
          position={nav.position}
          total={nav.total}
          className="mb-6"
        />
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Premium Lesson Header */}
        <GlassCard variant="gradient" className="p-8">
          <div className="flex flex-wrap justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold uppercase tracking-wide">
                  {lesson.category}
                </span>
                <span className="px-3 py-1 rounded-full bg-muted/50 text-muted-foreground text-xs font-semibold">
                  {lesson.difficulty}
                </span>
                <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">
                  {lesson.estimated_time}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">{lesson.title}</h1>
              <p className="text-muted-foreground text-lg">
                Master this concept with interactive examples and hands-on practice
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="lg" onClick={() => bookmark.mutate()}>
                <Bookmark className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  if ("speechSynthesis" in window) speechSynthesis.speak(new SpeechSynthesisUtterance(lesson.theory.slice(0, 500)));
                }}
              >
                <Volume2 className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => downloadNotes(lesson)}>
                <Download className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </GlassCard>

        {/* Adaptive Context */}
        {data?.adaptive && (
          <GlassCard variant="bordered" className="p-6 border-primary/30">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-primary">Adaptive Targeting (Live)</h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                <p className="text-xs text-muted-foreground mb-1">Your Level</p>
                <p className="text-lg font-bold">{data.adaptive.targetDifficulty}</p>
              </div>
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                <p className="text-xs text-muted-foreground mb-1">Lesson Adjustment</p>
                <p className="text-lg font-bold capitalize">{data.adaptive.difficultyAdjustment}</p>
              </div>
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                <p className="text-xs text-muted-foreground mb-1">Predicted Quiz</p>
                <p className="text-lg font-bold">{data.adaptive.predictedQuizScore}%</p>
              </div>
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                <p className="text-xs text-muted-foreground mb-1">Topic Mastery</p>
                <p className="text-lg font-bold">{data.adaptive.topicMastery.toFixed(2)}</p>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Progress Requirements */}
        {req && (
          <GlassCard variant="elevated" className="p-6">
            <h3 className="font-bold mb-4">Lesson Requirements</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border ${req.challengePassed ? "border-primary bg-primary/10" : "border-border bg-muted/30"}`}>
                <div className="flex items-center gap-2 mb-2">
                  {req.challengePassed ? <CheckCircle className="w-5 h-5 text-primary" /> : <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />}
                  <span className="font-semibold">Coding Challenge</span>
                </div>
                <p className="text-sm text-muted-foreground">{req.challengePassed ? "Completed" : "Not completed"}</p>
              </div>
              <div className={`p-4 rounded-xl border ${req.quizPassed ? "border-primary bg-primary/10" : "border-border bg-muted/30"}`}>
                <div className="flex items-center gap-2 mb-2">
                  {req.quizPassed ? <CheckCircle className="w-5 h-5 text-primary" /> : <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />}
                  <span className="font-semibold">Quiz Score</span>
                </div>
                <p className="text-sm text-muted-foreground">{req.quizScore}% / {req.quizThreshold}% required</p>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Learning Objectives */}
        <GlassCard variant="elevated" className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Learning Objectives</h2>
              <p className="text-sm text-muted-foreground">What you'll learn in this lesson</p>
            </div>
          </div>
          <ul className="space-y-3">
            {lesson.objectives.map((o, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-xs font-bold">{i + 1}</span>
                </div>
                <span className="text-muted-foreground">{o}</span>
              </li>
            ))}
          </ul>
        </GlassCard>

        {/* Theory Section */}
        <GlassCard variant="default" className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <BookOpen className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Theory</h2>
              <p className="text-sm text-muted-foreground">Core concepts explained</p>
            </div>
          </div>
          <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-base">{lesson.theory}</div>
        </GlassCard>

        {/* Real-World Analogy */}
        <GlassCard variant="default" className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <Lightbulb className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Real-World Analogy</h2>
              <p className="text-sm text-muted-foreground">Connect concepts to everyday life</p>
            </div>
          </div>
          <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-base">{lesson.real_world_example}</div>
        </GlassCard>

        {/* Syntax */}
        <GlassCard variant="default" className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
              <Code className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Syntax</h2>
              <p className="text-sm text-muted-foreground">The Python syntax for this concept</p>
            </div>
          </div>
          <pre className="bg-muted/50 p-6 rounded-xl text-sm font-mono overflow-x-auto border border-border/50">{lesson.syntax}</pre>
        </GlassCard>

        {/* Code Example */}
        <GlassCard variant="default" className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <Play className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Code Example</h2>
              <p className="text-sm text-muted-foreground">Study this example — don't copy for the challenge</p>
            </div>
          </div>
          <pre className="bg-muted/50 p-6 rounded-xl text-sm font-mono overflow-x-auto border border-border/50">{lesson.code_example}</pre>
        </GlassCard>

        {/* Expected Output */}
        <GlassCard variant="default" className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/20">
              <FileText className="w-6 h-6 text-pink-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Expected Output</h2>
              <p className="text-sm text-muted-foreground">What the code should produce</p>
            </div>
          </div>
          <pre className="bg-primary/10 p-6 rounded-xl text-sm font-mono border border-primary/20">{lesson.output_example}</pre>
        </GlassCard>

        {/* Common Mistakes */}
        <GlassCard variant="bordered" className="p-6 border-amber-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-amber-400">Common Mistakes</h2>
              <p className="text-sm text-muted-foreground">Avoid these pitfalls</p>
            </div>
          </div>
          <ul className="space-y-3">
            {lesson.common_mistakes.map((m, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-amber-400 text-xs font-bold">{i + 1}</span>
                </div>
                <span className="text-muted-foreground">{m}</span>
              </li>
            ))}
          </ul>
        </GlassCard>

        {/* Tips & Tricks */}
        <GlassCard variant="bordered" className="p-6 border-primary/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <Lightbulb className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary">Tips & Tricks</h2>
              <p className="text-sm text-muted-foreground">Expert advice for mastering this concept</p>
            </div>
          </div>
          <ul className="space-y-3">
            {lesson.tips.map((t, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-xs font-bold">{i + 1}</span>
                </div>
                <span className="text-muted-foreground">{t}</span>
              </li>
            ))}
          </ul>
        </GlassCard>

        {/* Coding Challenge */}
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

        {/* Quiz */}
        <GlassCard variant="elevated" className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-accent/10 border border-accent/20">
              <Target className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Quiz</h2>
              <p className="text-sm text-muted-foreground">Test your understanding</p>
            </div>
          </div>
          {lesson.quiz.map((q, i) => (
            <div key={i} className="mb-6">
              <p className="font-medium text-base mb-3">{i + 1}. {q.question}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {q.options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      const next = [...answers];
                      next[i] = opt;
                      setAnswers(next);
                    }}
                    className={`px-4 py-3 rounded-xl text-sm border transition-all ${
                      answers[i] === opt
                        ? "border-primary bg-primary/15 text-primary font-medium"
                        : "border-border hover:border-primary/40 hover:bg-primary/5"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <Button
            size="lg"
            onClick={() => {
              if (lesson.quiz.findIndex((_, i) => !answers[i]) >= 0) {
                toast({ title: "Incomplete quiz", variant: "destructive" });
                return;
              }
              submitQuiz.mutate();
            }}
            disabled={submitQuiz.isPending}
            className="w-full sm:w-auto"
          >
            Submit Quiz
          </Button>
          {quizResult && (
            <div className="mt-4 p-4 rounded-xl bg-primary/10 border border-primary/20">
              <p className="text-sm">
                Score: <span className="text-primary font-bold text-lg">{quizResult.score}%</span>
              </p>
            </div>
          )}
        </GlassCard>

        {/* Summary */}
        <GlassCard variant="default" className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20">
              <FileText className="w-6 h-6 text-secondary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Summary</h2>
              <p className="text-sm text-muted-foreground">Key takeaways</p>
            </div>
          </div>
          <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-base">{lesson.summary}</div>
        </GlassCard>

        {/* Complete Button */}
        <div className="space-y-4">
          <Button
            size="lg"
            className="gap-2 w-full sm:w-auto"
            disabled={!canComplete || complete.isPending}
            onClick={() => complete.mutate()}
          >
            <CheckCircle className="w-5 h-5" />
            {canComplete ? "Complete Lesson & Unlock Next" : "Pass Challenge + Quiz (70%) to Complete"}
          </Button>

          {nav && (
            <LessonNavigation
              prev={nav.prev}
              next={nav.next}
              position={nav.position}
              total={nav.total}
            />
          )}

          {canComplete && nav?.next?.unlocked && (
            <Link href={`/lessons/${nav.next.slug}`}>
              <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
                Continue to Next Lesson <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
          )}
        </div>
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
