import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { FolderKanban } from "lucide-react";
import { Layout } from "@/components/Layout";
import { GlassCard } from "@/components/GlassCard";
import { apiFetch } from "@/lib/api";
import type { Project } from "@/types";

export default function Projects() {
  const { data } = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiFetch<{ projects: Project[] }>("/projects"),
  });

  return (
    <Layout>
      <h1 className="text-3xl font-display font-bold flex items-center gap-2 mb-2">
        <FolderKanban className="text-primary" /> Projects
      </h1>
      <p className="text-muted-foreground mb-8">Build real apps from calculator to AI mini projects</p>
      <div className="grid md:grid-cols-2 gap-4">
        {(data?.projects || []).map((p, i) => (
          <Link key={p.slug} href={`/projects/${p.slug}`}>
            <GlassCard delay={i * 0.05} className="p-6 cursor-pointer hover:border-primary/40 h-full">
              <span className="text-xs uppercase text-primary">{p.difficulty}</span>
              <h2 className="text-xl font-semibold mt-1">{p.title}</h2>
              <p className="text-sm text-muted-foreground mt-2">{p.description}</p>
              <p className="text-xs text-muted-foreground mt-3">~{p.estimatedHours}h · {p.tags?.join(", ")}</p>
            </GlassCard>
          </Link>
        ))}
      </div>
    </Layout>
  );
}
