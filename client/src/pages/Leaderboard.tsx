import { useQuery } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import { Layout } from "@/components/Layout";
import { GlassCard } from "@/components/GlassCard";
import { apiFetch } from "@/lib/api";

export default function Leaderboard() {
  const { data } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => apiFetch<{ leaderboard: { rank: number; name: string; points: number; challengesSolved: number }[] }>("/leaderboard"),
  });

  return (
    <Layout>
      <h1 className="text-3xl font-display font-bold flex items-center gap-2 mb-8">
        <Trophy className="text-accent" /> Leaderboard
      </h1>
      <GlassCard className="divide-y divide-border">
        {(data?.leaderboard || []).map((entry) => (
          <div key={entry.rank} className="flex items-center gap-4 p-4">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${entry.rank <= 3 ? "bg-accent/30 text-accent" : "bg-muted"}`}>
              {entry.rank}
            </span>
            <div className="flex-1">
              <p className="font-medium">{entry.name}</p>
              <p className="text-xs text-muted-foreground">{entry.challengesSolved} challenges solved</p>
            </div>
            <span className="font-bold text-primary">{entry.points} pts</span>
          </div>
        ))}
        {!data?.leaderboard?.length && (
          <p className="p-8 text-center text-muted-foreground">Complete challenges to appear on the board!</p>
        )}
      </GlassCard>
    </Layout>
  );
}
