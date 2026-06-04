import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Flame, BookOpen, Target, Clock, ArrowRight, Sparkles, TrendingUp, Brain, Zap, Calendar } from "lucide-react";
import { TrackSelector } from "@/components/TrackSelector";
import { Layout } from "@/components/Layout";
import { GlassCard } from "@/components/GlassCard";
import { DashboardSkeleton } from "@/components/PageLoader";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch } from "@/lib/api";
import { AdaptiveLearningPanel } from "@/components/AdaptiveLearningPanel";
import type { AdaptivePlan } from "@/types";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ["progress"],
    queryFn: () =>
      apiFetch<{
        stats: {
          lessonsCompleted: number;
          totalLessons: number;
          accuracy: number;
          streak: number;
          xp: number;
          level: number;
        };
        levelInfo?: { xpInLevel: number; xpToNext: number };
      }>("/progress"),
  });

  const { data: adaptive, isLoading: adaptiveLoading } = useQuery({
    queryKey: ["adaptive"],
    queryFn: () => apiFetch<AdaptivePlan>("/lessons/adaptive"),
  });

  const { data: velocity } = useQuery({
    queryKey: ["velocity"],
    queryFn: () => apiFetch<{ velocityClass: string; weeklyVelocity: number }>("/adaptive/velocity"),
  });

  const { data: learningStyle } = useQuery({
    queryKey: ["learning-style"],
    queryFn: () => apiFetch<{ dominantStyle: string; styleProfile: { theoryOriented: number; handsOn: number } }>("/adaptive/learning-style"),
  });

  if (progressLoading || adaptiveLoading) {
    return (
      <Layout>
        <DashboardSkeleton />
      </Layout>
    );
  }

  const stats = progress?.stats;
  const pct = stats ? Math.round((stats.lessonsCompleted / Math.max(stats.totalLessons, 1)) * 100) : 0;
  const levelInfo = progress?.levelInfo;
  const levelPct =
    levelInfo?.xpToNext ? Math.round((levelInfo.xpInLevel / Math.max(levelInfo.xpToNext, 1)) * 100) : 0;

  return (
    <Layout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <GlassCard className="p-6 md:p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent pointer-events-none" />
          <div className="relative">
            <h1 className="text-3xl md:text-4xl font-display font-bold">
              Welcome back, {user?.name?.split(" ")[0]}
            </h1>
            <p className="text-muted-foreground mt-2 flex flex-wrap items-center gap-2">
              <span className="capitalize text-primary font-medium">Level {progress?.stats.level ?? user?.level ?? 1}</span>
              <span className="text-muted-foreground/60">·</span>
              <Sparkles className="w-4 h-4 text-accent inline" />
              <span>{progress?.stats.xp ?? user?.xp ?? 0} XP</span>
              <span className="text-muted-foreground/60">·</span>
              <span className="capitalize">{user?.selectedTrack || "beginner"} track</span>
            </p>

            {levelInfo && (
              <div className="mt-5">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    XP to next level
                  </span>
                  <span className="text-muted-foreground">
                    {levelInfo.xpInLevel}/{levelInfo.xpToNext}
                  </span>
                </div>
                <Progress value={levelPct} className="h-2" />
              </div>
            )}
          </div>
        </GlassCard>

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Your learning track</h2>
          <TrackSelector current={user?.selectedTrack} />
        </div>

        <AdaptiveLearningPanel plan={adaptive} />

        {/* Learning Velocity & Style */}
        <div className="grid sm:grid-cols-2 gap-4">
          {velocity && (
            <GlassCard className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-purple-500" />
                <h3 className="font-semibold">Learning Velocity</h3>
              </div>
              <p className="text-2xl font-bold capitalize mb-1">{velocity.velocityClass || "Stable"}</p>
              <p className="text-sm text-muted-foreground mb-2">Weekly Score: {velocity.weeklyVelocity || 0}/100</p>
              <Progress value={velocity.weeklyVelocity || 0} className="h-2" />
            </GlassCard>
          )}
          {learningStyle && (
            <GlassCard className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-pink-500" />
                <h3 className="font-semibold">Learning Style</h3>
              </div>
              <p className="text-2xl font-bold capitalize mb-1">{learningStyle.dominantStyle || "Balanced"}</p>
              <p className="text-sm text-muted-foreground">
                Theory: {Math.round((learningStyle.styleProfile?.theoryOriented || 0.5) * 100)}% · Hands-on:{" "}
                {Math.round((learningStyle.styleProfile?.handsOn || 0.5) * 100)}%
              </p>
            </GlassCard>
          )}
        </div>

        {/* Review Center Link */}
        <GlassCard className="p-6 border-primary/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/15">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Review Center</h3>
                <p className="text-sm text-muted-foreground">
                  Intelligent spaced repetition for long-term retention
                </p>
              </div>
            </div>
            <Link href="/review-center">
              <Button variant="outline" className="gap-2">
                Open <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </GlassCard>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Streak", value: stats?.streak ?? user?.streak ?? 0, icon: Flame, color: "text-orange-400" },
            { label: "Lessons done", value: stats?.lessonsCompleted ?? 0, icon: BookOpen, color: "text-primary" },
            { label: "Accuracy", value: `${stats?.accuracy ?? 0}%`, icon: Target, color: "text-accent" },
            { label: "Time (min)", value: user?.performance?.timeSpentMinutes ?? 0, icon: Clock, color: "text-blue-400" },
          ].map((s, i) => (
            <GlassCard key={s.label} delay={i * 0.05} className="p-5">
              <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </GlassCard>
          ))}
        </div>

        <GlassCard className="p-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold">Overall progress</h2>
            <span className="text-sm text-muted-foreground">{pct}%</span>
          </div>
          <Progress value={pct} className="h-2" />
        </GlassCard>

        {adaptive?.continueLearning && (
          <GlassCard className="p-6">
            <h2 className="font-semibold mb-2">Continue learning</h2>
            <p className="text-muted-foreground text-sm mb-1">{adaptive.continueLearning.title}</p>
            {adaptive.continueLearning.reason && (
              <p className="text-xs text-primary mb-4">{adaptive.continueLearning.reason}</p>
            )}
            <Link href={`/lessons/${adaptive.continueLearning.slug}`}>
              <Button className="gap-2">
                Resume lesson <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </GlassCard>
        )}

        <div>
          <h2 className="text-xl font-semibold mb-4">Recommended for you</h2>
          {!(adaptive?.recommended?.length) ? (
            <EmptyState
              icon={BookOpen}
              title="No recommendations yet"
              description="Complete a lesson or take a quiz to unlock personalized suggestions."
              actionLabel="Browse courses"
              onAction={() => (window.location.href = "/courses")}
            />
          ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(adaptive?.recommended || []).slice(0, 6).map((lesson, i) => (
              <GlassCard key={lesson.slug} delay={i * 0.04} className="p-5 hover:border-primary/30 transition-colors">
                <span className="text-xs uppercase tracking-wide text-primary">{lesson.category}</span>
                <h3 className="font-semibold mt-1">{lesson.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{lesson.estimated_time}</p>
                <Link href={`/lessons/${lesson.slug}`}>
                  <Button variant="outline" size="sm" className="mt-3">Open</Button>
                </Link>
              </GlassCard>
            ))}
          </div>
          )}
        </div>

        {adaptive?.revisionTopics && adaptive.revisionTopics.length > 0 && (
          <GlassCard className="p-6 border-amber-500/20">
            <h2 className="font-semibold text-amber-400 mb-2">Revision suggested</h2>
            <ul className="text-sm text-muted-foreground space-y-1">
              {adaptive.revisionTopics.map((l) => (
                <li key={l.slug}>
                  <Link href={`/lessons/${l.slug}`} className="hover:text-primary">{l.title}</Link>
                </li>
              ))}
            </ul>
          </GlassCard>
        )}
      </motion.div>
    </Layout>
  );
}
