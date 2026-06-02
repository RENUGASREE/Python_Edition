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
} from "recharts";
import { Layout } from "@/components/Layout";
import { GlassCard } from "@/components/GlassCard";
import { PageLoader } from "@/components/PageLoader";
import { apiFetch } from "@/lib/api";
import { Award, Flame, Sparkles, Target } from "lucide-react";

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
    boxShadow: theme === "dark" ? "0 16px 40px rgba(0,0,0,0.45)" : "0 16px 40px rgba(2,6,23,0.12)",
  } as const;
  const gridStroke = "hsl(var(--border) / 0.6)";
  const axisStroke = "hsl(var(--muted-foreground))";

  return (
    <Layout>
      <h1 className="text-3xl font-display font-bold mb-2">Progress & Analytics</h1>
      <p className="text-muted-foreground mb-8">Your learning journey at a glance</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Target} label="Lessons" value={stats?.lessonsCompleted ?? 0} sub={`/ ${stats?.totalLessons ?? 0}`} />
        <StatCard icon={Sparkles} label="XP" value={stats?.xp ?? 0} sub={`Level ${stats?.level ?? 1}`} />
        <StatCard icon={Flame} label="Streak" value={stats?.streak ?? 0} sub="days" />
        <StatCard icon={Award} label="Accuracy" value={`${stats?.accuracy ?? 0}%`} sub="quiz avg" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <GlassCard className="p-6">
          <h2 className="font-semibold mb-4">Weekly activity</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weekly}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="day" stroke={axisStroke} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={axisStroke} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="activity" fill="hsl(var(--chart-1))" name="Actions" radius={[8, 8, 0, 0]} />
              <Bar dataKey="lessons" fill="hsl(var(--chart-3))" name="Completed" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="font-semibold mb-4">Challenge completions</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={challengeWeekly}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="day" stroke={axisStroke} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={axisStroke} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area
                type="monotone"
                dataKey="passed"
                stroke="hsl(var(--chart-2))"
                fill="hsl(var(--chart-2) / 0.25)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <GlassCard className="p-6">
          <h2 className="font-semibold mb-4">Quiz accuracy trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={accuracyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="title" stroke={axisStroke} fontSize={10} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} stroke={axisStroke} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--chart-4))"
                strokeWidth={2.5}
                dot={{ r: 3, strokeWidth: 2, stroke: "hsl(var(--chart-4))", fill: "hsl(var(--background))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="font-semibold mb-4">Time by topic</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topicTime} layout="vertical">
              <XAxis type="number" stroke={axisStroke} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis dataKey="topic" type="category" width={80} stroke={axisStroke} fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="minutes" fill="hsl(var(--chart-1))" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <h2 className="font-semibold mb-4">Learning heatmap (28 days)</h2>
        <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
          <p className="text-xs text-muted-foreground">
            Hover a cell to see activity count. More activity → stronger color.
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="inline-block w-3 h-3 rounded-sm border border-border/60"
                style={{
                  backgroundColor:
                    i === 0 ? "hsl(var(--muted))" : `hsl(var(--chart-1) / ${Math.min(1, 0.18 + i * 0.18)})`,
                }}
              />
            ))}
            <span>More</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {heatmap.map((d) => (
            <div
              key={d.date}
              role="img"
              aria-label={`${d.date}: ${d.count} activities`}
              title={`${d.date}: ${d.count} activities`}
              className="w-3.5 h-3.5 rounded-sm border border-border/40"
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
}: {
  icon: typeof Target;
  label: string;
  value: string | number;
  sub: string;
}) {
  return (
    <GlassCard className="p-5">
      <Icon className="w-5 h-5 text-primary mb-2" />
      <p className="text-2xl font-bold">
        {value} <span className="text-sm font-normal text-muted-foreground">{sub}</span>
      </p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </GlassCard>
  );
}
