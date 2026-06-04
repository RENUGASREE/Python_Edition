import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Flame, BookOpen, Target, Clock, ArrowRight, Sparkles, TrendingUp, Brain, Zap, Calendar, Trophy, Award, ChevronRight, Activity } from "lucide-react";
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
        {/* Premium Welcome Card */}
        <GlassCard variant="gradient" className="p-8 md:p-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-display font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Welcome back, {user?.name?.split(" ")[0]}
                </h1>
                <p className="text-muted-foreground text-lg mb-6">
                  Continue your Python learning journey with personalized recommendations
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-primary">Level {progress?.stats.level ?? user?.level ?? 1}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>{progress?.stats.xp ?? user?.xp ?? 0} XP</span>
                    <span>·</span>
                    <span className="capitalize">{user?.selectedTrack || "beginner"} track</span>
                  </div>
                </div>
              </div>
              {levelInfo && (
                <div className="hidden md:block min-w-[200px]">
                  <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    XP Progress
                  </div>
                  <div className="text-3xl font-bold mb-2">{levelPct}%</div>
                  <Progress value={levelPct} className="h-3" />
                  <div className="text-xs text-muted-foreground mt-2">
                    {levelInfo.xpInLevel}/{levelInfo.xpToNext} XP
                  </div>
                </div>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Quick Stats Row */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Streak", value: stats?.streak ?? user?.streak ?? 0, icon: Flame, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
            { label: "Lessons", value: stats?.lessonsCompleted ?? 0, icon: BookOpen, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
            { label: "Accuracy", value: `${stats?.accuracy ?? 0}%`, icon: Target, color: "text-accent", bg: "bg-accent/10", border: "border-accent/20" },
            { label: "Time", value: `${user?.performance?.timeSpentMinutes ?? 0}m`, icon: Clock, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
          ].map((s, i) => (
            <GlassCard key={s.label} variant="elevated" hover delay={i * 0.05} className="p-6">
              <div className={`p-3 rounded-xl ${s.bg} ${s.border} mb-4 w-fit`}>
                <s.icon className={`w-6 h-6 ${s.color}`} />
              </div>
              <p className="text-3xl font-bold mb-1">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </GlassCard>
          ))}
        </div>

        {/* Learning Track */}
        <div>
          <h2 className="text-2xl font-display font-bold mb-4">Your Learning Track</h2>
          <TrackSelector current={user?.selectedTrack} />
        </div>

        {/* Adaptive Learning Panel */}
        <AdaptiveLearningPanel plan={adaptive} />

        {/* Learning Velocity & Style - Premium Cards */}
        <div className="grid sm:grid-cols-2 gap-6">
          {velocity && (
            <GlassCard variant="bordered" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <Zap className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Learning Velocity</h3>
                    <p className="text-sm text-muted-foreground">Your improvement rate</p>
                  </div>
                </div>
                <Activity className="w-5 h-5 text-purple-400" />
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-4xl font-bold capitalize mb-1">{velocity.velocityClass || "Stable"}</p>
                  <p className="text-sm text-muted-foreground">Current classification</p>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Weekly Score</span>
                    <span className="font-semibold">{velocity.weeklyVelocity || 0}/100</span>
                  </div>
                  <Progress value={velocity.weeklyVelocity || 0} className="h-3" />
                </div>
              </div>
            </GlassCard>
          )}
          {learningStyle && (
            <GlassCard variant="bordered" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/20">
                    <Brain className="w-6 h-6 text-pink-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Learning Style</h3>
                    <p className="text-sm text-muted-foreground">Your preference profile</p>
                  </div>
                </div>
                <Trophy className="w-5 h-5 text-pink-400" />
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-4xl font-bold capitalize mb-1">{learningStyle.dominantStyle || "Balanced"}</p>
                  <p className="text-sm text-muted-foreground">Dominant style</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Theory-oriented</span>
                      <span className="font-semibold">{Math.round((learningStyle.styleProfile?.theoryOriented || 0.5) * 100)}%</span>
                    </div>
                    <Progress value={(learningStyle.styleProfile?.theoryOriented || 0.5) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Hands-on</span>
                      <span className="font-semibold">{Math.round((learningStyle.styleProfile?.handsOn || 0.5) * 100)}%</span>
                    </div>
                    <Progress value={(learningStyle.styleProfile?.handsOn || 0.5) * 100} className="h-2" />
                  </div>
                </div>
              </div>
            </GlassCard>
          )}
        </div>

        {/* Review Center - Premium Card */}
        <GlassCard variant="glow" hover className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Review Center</h3>
                <p className="text-muted-foreground">
                  Intelligent spaced repetition for long-term retention
                </p>
              </div>
            </div>
            <Link href="/review-center">
              <Button size="lg" className="gap-2 shadow-lg shadow-primary/25">
                Open <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </GlassCard>

        {/* Overall Progress */}
        <GlassCard variant="elevated" className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Overall Progress</h2>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-primary">{pct}%</span>
              <span className="text-sm text-muted-foreground">complete</span>
            </div>
          </div>
          <Progress value={pct} className="h-4" />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>{stats?.lessonsCompleted ?? 0} lessons completed</span>
            <span>{stats?.totalLessons ?? 0} total lessons</span>
          </div>
        </GlassCard>

        {/* Continue Learning */}
        {adaptive?.continueLearning && (
          <GlassCard variant="gradient" hover className="p-6">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-accent" />
                  <span className="text-sm font-semibold text-accent uppercase tracking-wide">Continue Learning</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">{adaptive.continueLearning.title}</h3>
                {adaptive.continueLearning.reason && (
                  <p className="text-sm text-muted-foreground mb-4">{adaptive.continueLearning.reason}</p>
                )}
                <Link href={`/lessons/${adaptive.continueLearning.slug}`}>
                  <Button size="lg" className="gap-2">
                    Resume lesson <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Recommended Lessons */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold">Recommended for You</h2>
            <Link href="/courses" className="text-sm text-primary hover:underline flex items-center gap-1">
              Browse all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
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
              <GlassCard key={lesson.slug} variant="default" hover delay={i * 0.04} className="p-5">
                <span className="text-xs uppercase tracking-wide text-primary font-semibold">{lesson.category}</span>
                <h3 className="font-semibold mt-2 text-lg">{lesson.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{lesson.estimated_time} · {lesson.difficulty}</p>
                <Link href={`/lessons/${lesson.slug}`}>
                  <Button variant="outline" size="sm" className="mt-4 w-full">Start Lesson</Button>
                </Link>
              </GlassCard>
            ))}
          </div>
          )}
        </div>

        {/* Revision Suggested */}
        {adaptive?.revisionTopics && adaptive.revisionTopics.length > 0 && (
          <GlassCard variant="bordered" className="p-6 border-amber-500/30">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="font-bold text-amber-400">Revision Suggested</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Strengthen your understanding by reviewing these topics
            </p>
            <ul className="space-y-2">
              {adaptive.revisionTopics.map((l) => (
                <li key={l.slug}>
                  <Link href={`/lessons/${l.slug}`} className="flex items-center gap-2 text-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/5">
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    {l.title}
                  </Link>
                </li>
              ))}
            </ul>
          </GlassCard>
        )}
      </motion.div>
    </Layout>
  );
}
