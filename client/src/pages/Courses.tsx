import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { BookOpen, Layers } from "lucide-react";
import { PageLoader } from "@/components/PageLoader";
import { EmptyState } from "@/components/EmptyState";
import { Layout } from "@/components/Layout";
import { GlassCard } from "@/components/GlassCard";
import { apiFetch } from "@/lib/api";
import type { Lesson } from "@/types";

const CATEGORIES = [
  { id: "beginner", label: "Beginner", desc: "Foundations from variables to strings", color: "from-emerald-500/20" },
  { id: "intermediate", label: "Intermediate", desc: "Files, OOP, APIs, decorators", color: "from-blue-500/20" },
  { id: "advanced", label: "Advanced", desc: "Async, NumPy, Flask, ML basics", color: "from-violet-500/20" },
  { id: "projects", label: "Projects", desc: "Hands-on apps and mini AI builds", color: "from-amber-500/20" },
] as const;

export default function Courses() {
  const { data: counts, isLoading: countsLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiFetch<Record<string, number>>("/lessons/categories"),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["lessons"],
    queryFn: () => apiFetch<{ lessons: Lesson[] }>("/lessons"),
  });

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold flex items-center gap-2">
          <BookOpen className="text-primary" /> Python Courses
        </h1>
        <p className="text-muted-foreground">Structured paths from beginner to advanced</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-10">
        {CATEGORIES.map((cat, i) => (
          <Link key={cat.id} href={`/courses/${cat.id}`}>
            <GlassCard delay={i * 0.05} className={`p-6 cursor-pointer bg-gradient-to-br ${cat.color} to-transparent hover:border-primary/40`}>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{cat.label}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{cat.desc}</p>
                </div>
                <span className="text-2xl font-bold text-primary">{counts?.[cat.id] ?? "—"}</span>
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Layers className="w-5 h-5" /> All lessons
      </h2>
      {isLoading || countsLoading ? (
        <PageLoader label="Loading curriculum..." />
      ) : !(data?.lessons?.length) ? (
        <EmptyState icon={BookOpen} title="No lessons yet" description="Run npm run seed on the server to load curriculum." />
      ) : (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {(data?.lessons || []).map((lesson) => (
          <Link key={lesson.slug} href={`/lessons/${lesson.slug}`}>
            <GlassCard className="p-4 hover:border-primary/30 cursor-pointer h-full">
              <span className="text-xs text-primary uppercase">{lesson.category}</span>
              <h3 className="font-medium mt-1">{lesson.title}</h3>
              <p className="text-xs text-muted-foreground mt-2">{lesson.estimated_time} · {lesson.difficulty}</p>
            </GlassCard>
          </Link>
        ))}
      </div>
      )}
    </Layout>
  );
}
