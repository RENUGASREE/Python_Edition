import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Layout } from "@/components/Layout";
import { GlassCard } from "@/components/GlassCard";
import { PageLoader } from "@/components/PageLoader";
import { apiFetch } from "@/lib/api";
import { Award, Flame, Sparkles, Target, BarChart3, TrendingUp, Clock, BookOpen, Zap } from "lucide-react";

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function ProgressPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["progress"],
    queryFn: () => apiFetch<Record<string, unknown>>("/progress"),
  });

  if (isLoading) {
    return (
      <Layout>
        <PageLoader label="Loading analytics..." />
      </Layout>
    );
  }

  const stats = data?.stats as Record<string, number> | undefined;
  const heatmap = (data?.heatmap as { date: string; count: number }[]) || [];
  const weekly = (data?.weeklyActivity as { day: string; lessons: number; activity: number }[]) || [];
  const challengeWeekly = (data?.challengeWeekly as { day: string; passed: number }[]) || [];
  const accuracyTrend = (data?.accuracyTrend as { index: number; title: string; score: number }[]) || [];
  const topicTime = (data?.topicTime as { topic: string; minutes: number }[]) || [];
  const tooltipStyle = {
    background: "hsl(var(--popover))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "12px",
    color: "hsl(var(--popover-foreground))",
    boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
    fontSize: "13px",
  } as const;
  const gridStroke = "hsl(var(--border) / 0.4)";
  const axisStroke = "hsl(var(--muted-foreground))";

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">Progress & Analytics</h1>
        <p className="text-muted-foreground text-lg">Your learning journey at a glance</p>
      </div>

      {/* Premium Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Target} label="Lessons" value={stats?.lessonsCompleted ?? 0} sub={`/ ${stats?.totalLessons ?? 0}`} color="text-primary" bg="bg-primary/10" border="border-primary/20" />
        <StatCard icon={Sparkles} label="XP" value={stats?.xp ?? 0} sub={`Level ${stats?.level ?? 1}`} color="text-accent" bg="bg-accent/10" border="border-accent/20" />
        <StatCard icon={Flame} label="Streak" value={stats?.streak ?? 0} sub="days" color="text-orange-400" bg="bg-orange-500/10" border="border-orange-500/20" />
        <StatCard icon={Award} label="Accuracy" value={`${stats?.accuracy ?? 0}%`} sub="quiz avg" color="text-green-400" bg="bg-green-500/10" border="border-green-500/20" />
      </div>

      {/* Weekly Activity & Challenge Completions */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <GlassCard variant="elevated" className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/10 border border-primary/30">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Weekly Activity</h2>
              <p className="text-sm text-muted-foreground">Your learning momentum</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weekly}>
              <defs>
                <linearGradient id="gradientActivity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
                <linearGradient id="gradientLessons" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#0891b2" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="day" stroke={axisStroke} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={axisStroke} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="activity" fill="url(#gradientActivity)" name="Actions" radius={[8, 8, 0, 0]} />
              <Bar dataKey="lessons" fill="url(#gradientLessons)" name="Completed" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard variant="elevated" className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-accent/20 to-orange-500/10 border border-accent/30">
              <Zap className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Challenge Completions</h2>
              <p className="text-sm text-muted-foreground">Coding challenge success rate</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={challengeWeekly}>
              <defs>
                <linearGradient id="gradientChallenge" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <filter id="glowChallenge" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation={4} result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="day" stroke={axisStroke} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={axisStroke} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area
                type="monotone"
                dataKey="passed"
                stroke="#f59e0b"
                fill="url(#gradientChallenge)"
                strokeWidth={4}
                fillOpacity={1}
                filter="url(#glowChallenge)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Quiz Accuracy Trend & Time by Topic */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <GlassCard variant="elevated" className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/30">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Quiz Accuracy Trend</h2>
              <p className="text-sm text-muted-foreground">Performance over time</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={accuracyTrend}>
              <defs>
                <linearGradient id="gradientAccuracy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation={3} result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="title" stroke={axisStroke} fontSize={10} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} stroke={axisStroke} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#10b981"
                fill="url(#gradientAccuracy)"
                strokeWidth={3}
                fillOpacity={1}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#10b981"
                strokeWidth={4}
                dot={{ r: 5, strokeWidth: 3, stroke: "#10b981", fill: "#0f172a" }}
                activeDot={{ r: 8, stroke: "#10b981", strokeWidth: 4, fill: "#10b981" }}
                filter="url(#glow)"
              />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard variant="elevated" className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/30">
              <Clock className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Time by Topic</h2>
              <p className="text-sm text-muted-foreground">Learning distribution</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topicTime} layout="vertical">
              <defs>
                <linearGradient id="gradientTime" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <XAxis type="number" stroke={axisStroke} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis dataKey="topic" type="category" width={90} stroke={axisStroke} fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="minutes" fill="url(#gradientTime)" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Learning Heatmap */}
      <GlassCard variant="bordered" className="p-6 border-primary/30">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Learning Heatmap</h2>
            <p className="text-sm text-muted-foreground">Activity over the last 28 days</p>
          </div>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <p className="text-sm text-muted-foreground">
            Hover a cell to see activity count. More activity → stronger color.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="inline-block w-4 h-4 rounded-md border border-border/60"
                style={{
                  backgroundColor:
                    i === 0 ? "hsl(var(--muted))" : `hsl(var(--chart-1) / ${Math.min(1, 0.18 + i * 0.18)})`,
                }}
              />
            ))}
            <span>More</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {heatmap.map((d) => (
            <div
              key={d.date}
              role="img"
              aria-label={`${d.date}: ${d.count} activities`}
              title={`${d.date}: ${d.count} activities`}
              className="w-4 h-4 rounded-md border border-border/40 transition-transform hover:scale-125"
              style={{
                backgroundColor:
                  d.count === 0 ? "hsl(var(--muted))" : `hsl(var(--chart-1) / ${Math.min(1, 0.18 + d.count * 0.18)})`,
              }}
            />
          ))}
        </div>
      </GlassCard>
    </Layout>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  bg,
  border,
}: {
  icon: typeof Target;
  label: string;
  value: string | number;
  sub: string;
  color: string;
  bg: string;
  border: string;
}) {
  return (
    <GlassCard variant="elevated" hover className="p-6">
      <div className={`p-3 rounded-xl ${bg} ${border} mb-4 w-fit`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <p className="text-3xl font-bold mb-1">
        {value} <span className="text-sm font-normal text-muted-foreground">{sub}</span>
      </p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </GlassCard>
  );
}
