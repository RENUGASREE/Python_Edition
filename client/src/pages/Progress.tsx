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
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="day" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "none" }} />
              <Bar dataKey="activity" fill="#22c55e" name="Actions" radius={[6, 6, 0, 0]} />
              <Bar dataKey="lessons" fill="#3b82f6" name="Completed" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="font-semibold mb-4">Challenge completions</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={challengeWeekly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="day" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "none" }} />
              <Area type="monotone" dataKey="passed" stroke="#f59e0b" fill="#f59e0b33" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <GlassCard className="p-6">
          <h2 className="font-semibold mb-4">Quiz accuracy trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={accuracyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="title" stroke="#888" fontSize={10} />
              <YAxis domain={[0, 100]} stroke="#888" fontSize={12} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "none" }} />
              <Line type="monotone" dataKey="score" stroke="#a855f7" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="font-semibold mb-4">Time by topic</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topicTime} layout="vertical">
              <XAxis type="number" stroke="#888" fontSize={12} />
              <YAxis dataKey="topic" type="category" width={80} stroke="#888" fontSize={11} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "none" }} />
              <Bar dataKey="minutes" fill="#22c55e" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <h2 className="font-semibold mb-4">Learning heatmap (28 days)</h2>
        <div className="flex flex-wrap gap-1">
          {heatmap.map((d) => (
            <div
              key={d.date}
              title={`${d.date}: ${d.count} activities`}
              className="w-3 h-3 rounded-sm"
              style={{
                backgroundColor: d.count === 0 ? "hsl(var(--muted))" : `rgba(34, 197, 94, ${Math.min(1, 0.2 + d.count * 0.2)})`,
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
