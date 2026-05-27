import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { GraduationCap, Rocket, Zap } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const TRACKS = [
  {
    id: "beginner",
    label: "Beginner",
    desc: "Start from fundamentals — variables, loops, functions",
    icon: GraduationCap,
    color: "text-emerald-400",
  },
  {
    id: "intermediate",
    label: "Intermediate",
    desc: "Files, OOP, APIs, and problem solving",
    icon: Zap,
    color: "text-blue-400",
  },
  {
    id: "advanced",
    label: "Advanced / Pro",
    desc: "Async, data science, web frameworks, projects",
    icon: Rocket,
    color: "text-violet-400",
  },
] as const;

export function TrackSelector({ current }: { current?: string }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const select = useMutation({
    mutationFn: (track: string) =>
      apiFetch("/lessons/select-track", { method: "POST", body: JSON.stringify({ track }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lesson-map"] });
      qc.invalidateQueries({ queryKey: ["auth", "me"] });
      toast({ title: "Learning track updated" });
    },
  });

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {TRACKS.map((t, i) => (
        <motion.button
          key={t.id}
          type="button"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => select.mutate(t.id)}
          className="text-left"
        >
          <GlassCard
            className={`p-5 h-full transition-all hover:border-primary/40 ${
              current === t.id ? "ring-2 ring-primary border-primary/50" : ""
            }`}
          >
            <t.icon className={`w-8 h-8 mb-3 ${t.color}`} />
            <h3 className="font-semibold">{t.label}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t.desc}</p>
            {current === t.id && <p className="text-xs text-primary mt-2">Current track</p>}
          </GlassCard>
        </motion.button>
      ))}
    </div>
  );
}
