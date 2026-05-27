import { useMutation, useQuery } from "@tanstack/react-query";
import { Shield, Users, BookOpen, BarChart2, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/Layout";
import { GlassCard } from "@/components/GlassCard";

export default function Admin() {
  const { toast } = useToast();
  const bootstrap = useMutation({
    mutationFn: () => apiFetch<{ message: string; report: Record<string, unknown> }>("/admin/bootstrap", { method: "POST", body: "{}" }),
    onSuccess: (res) => {
      toast({ title: "Curriculum synced", description: res.message });
    },
    onError: (e: Error) => toast({ title: "Sync failed", description: e.message, variant: "destructive" }),
  });

  const { data } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () =>
      apiFetch<{
        users: number;
        lessons: number;
        completions: number;
        recentUsers: { name: string; email: string; role: string }[];
      }>("/admin/analytics"),
  });

  return (
    <Layout>
      <h1 className="text-3xl font-display font-bold flex items-center gap-2 mb-8">
        <Shield className="text-primary" /> Admin Panel
      </h1>
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <GlassCard className="p-5 flex items-center gap-3">
          <Users className="text-primary" />
          <div>
            <p className="text-2xl font-bold">{data?.users ?? 0}</p>
            <p className="text-sm text-muted-foreground">Users</p>
          </div>
        </GlassCard>
        <GlassCard className="p-5 flex items-center gap-3">
          <BookOpen className="text-blue-400" />
          <div>
            <p className="text-2xl font-bold">{data?.lessons ?? 0}</p>
            <p className="text-sm text-muted-foreground">Lessons</p>
          </div>
        </GlassCard>
        <GlassCard className="p-5 flex items-center gap-3">
          <BarChart2 className="text-accent" />
          <div>
            <p className="text-2xl font-bold">{data?.completions ?? 0}</p>
            <p className="text-sm text-muted-foreground">Completions</p>
          </div>
        </GlassCard>
      </div>
      <GlassCard className="p-6">
        <h2 className="font-semibold mb-4">Recent users</h2>
        <div className="space-y-2 text-sm">
          {(data?.recentUsers || []).map((u) => (
            <div key={u.email} className="flex justify-between py-2 border-b border-border/50">
              <span>{u.name}</span>
              <span className="text-muted-foreground">{u.email}</span>
              <span className="text-xs uppercase">{u.role}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          <a href="/admin/lessons" className="text-sm text-primary hover:underline">
            Open lesson editor →
          </a>
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={() => bootstrap.mutate()}
            disabled={bootstrap.isPending}
          >
            <Database className="w-4 h-4" />
            {bootstrap.isPending ? "Syncing..." : "Sync curriculum (idempotent)"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Safe for Render free tier — adds missing lessons/challenges without deleting users or progress.
        </p>
      </GlassCard>
    </Layout>
  );
}
