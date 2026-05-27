import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { User, Award, Flame, BookOpen, Save } from "lucide-react";
import { Layout } from "@/components/Layout";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { PageLoader } from "@/components/PageLoader";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => apiFetch<{ profile: Record<string, unknown> }>("/profile"),
  });

  const profile = data?.profile as {
    name?: string;
    email?: string;
    avatar?: string;
    bio?: string;
    joinedAt?: string;
    level?: number;
    xp?: number;
    streak?: number;
    lessonsCompleted?: number;
    badges?: { name: string }[];
    socialLinks?: { github?: string; linkedin?: string; website?: string };
    levelInfo?: { xpInLevel?: number; xpToNext?: number };
  } | undefined;
  const [form, setForm] = useState({
    name: "",
    avatar: "",
    bio: "",
    github: "",
    linkedin: "",
    website: "",
  });

  useEffect(() => {
    if (!profile) return;
    setForm({
      name: String(profile.name || ""),
      avatar: String(profile.avatar || ""),
      bio: String(profile.bio || ""),
      github: String((profile.socialLinks as { github?: string })?.github || ""),
      linkedin: String((profile.socialLinks as { linkedin?: string })?.linkedin || ""),
      website: String((profile.socialLinks as { website?: string })?.website || ""),
    });
  }, [profile]);

  const save = useMutation({
    mutationFn: () =>
      apiFetch("/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name: form.name,
          avatar: form.avatar,
          bio: form.bio,
          socialLinks: { github: form.github, linkedin: form.linkedin, website: form.website },
        }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["auth", "me"] });
      toast({ title: "Profile saved" });
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <PageLoader />
      </Layout>
    );
  }

  const levelInfo = profile?.levelInfo;
  const xpPct = levelInfo?.xpToNext
    ? Math.round(((levelInfo.xpInLevel || 0) / ((levelInfo.xpInLevel || 0) + (levelInfo.xpToNext || 1))) * 100)
    : 0;

  return (
    <Layout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-6">
        <GlassCard className="p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 overflow-hidden">
            {form.avatar ? (
              <img src={form.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-primary" />
            )}
          </div>
          <h1 className="text-2xl font-bold">{profile?.name || user?.name}</h1>
          <p className="text-muted-foreground text-sm">{profile?.email}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Joined {profile?.joinedAt ? new Date(String(profile.joinedAt)).toLocaleDateString() : "—"}
          </p>
          <div className="mt-4">
            <p className="text-sm font-medium">
              Level {profile?.level} · {profile?.xp} XP
            </p>
            <Progress value={xpPct} className="h-2 mt-2" />
          </div>
        </GlassCard>

        <div className="grid grid-cols-3 gap-3">
          <GlassCard className="p-4 text-center">
            <BookOpen className="w-5 h-5 mx-auto text-primary mb-1" />
            <p className="text-xl font-bold">{String(profile?.lessonsCompleted ?? 0)}</p>
            <p className="text-xs text-muted-foreground">Lessons</p>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <Flame className="w-5 h-5 mx-auto text-orange-400 mb-1" />
            <p className="text-xl font-bold">{profile?.streak ?? 0}</p>
            <p className="text-xs text-muted-foreground">Streak</p>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <Award className="w-5 h-5 mx-auto text-accent mb-1" />
            <p className="text-xl font-bold">{(profile?.badges as unknown[])?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground">Badges</p>
          </GlassCard>
        </div>

        <GlassCard className="p-6 space-y-4">
          <h2 className="font-semibold">Edit profile</h2>
          <div>
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>Avatar URL</Label>
            <Input value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} placeholder="https://..." />
          </div>
          <div>
            <Label>Bio</Label>
            <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} />
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <Label>GitHub</Label>
              <Input value={form.github} onChange={(e) => setForm({ ...form, github: e.target.value })} />
            </div>
            <div>
              <Label>LinkedIn</Label>
              <Input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} />
            </div>
            <div>
              <Label>Website</Label>
              <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            </div>
          </div>
          <Button onClick={() => save.mutate()} disabled={save.isPending} className="gap-2">
            <Save className="w-4 h-4" /> Save changes
          </Button>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="font-semibold mb-3">Achievements</h2>
          <div className="flex flex-wrap gap-2">
            {(profile?.badges || []).map((b) => (
              <span key={b.name} className="px-3 py-1 rounded-full bg-accent/20 text-accent text-sm">
                {b.name}
              </span>
            ))}
            {!profile?.badges?.length ? (
              <p className="text-sm text-muted-foreground">Complete lessons to earn badges</p>
            ) : null}
          </div>
        </GlassCard>
      </motion.div>
    </Layout>
  );
}
