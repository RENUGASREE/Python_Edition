import { useQuery } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { Lock, CheckCircle, Play } from "lucide-react";
import { Layout } from "@/components/Layout";
import { GlassCard } from "@/components/GlassCard";
import { PageLoader } from "@/components/PageLoader";
import { apiFetch } from "@/lib/api";
import type { LessonMapItem } from "@/types";

export default function CourseCategory() {
  const [, params] = useRoute("/courses/:category");
  const category = params?.category || "beginner";

  const { data, isLoading } = useQuery({
    queryKey: ["lesson-map"],
    queryFn: () =>
      apiFetch<{ lessons: LessonMapItem[]; xp: number; level: number }>("/lessons/map"),
  });

  const lessons = (data?.lessons || []).filter((l) => l.category === category);

  return (
    <Layout>
      <h1 className="text-3xl font-display font-bold capitalize mb-2">{category} track</h1>
      <p className="text-muted-foreground mb-2">
        <Link href="/courses" className="text-primary hover:underline">
          ← All courses
        </Link>
        {data && (
          <span className="ml-3">
            Level {data.level} · {data.xp} XP
          </span>
        )}
      </p>
      <p className="text-sm text-muted-foreground mb-8">
        Complete each lesson&apos;s coding challenge and quiz (70%+) to unlock the next.
      </p>

      {isLoading ? (
        <PageLoader />
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson, i) => (
            <GlassCard
              key={lesson.slug}
              delay={i * 0.02}
              className={`p-5 flex justify-between items-center ${
                lesson.unlocked ? "hover:border-primary/30" : "opacity-60"
              }`}
            >
              <div className="flex items-start gap-3">
                {lesson.completed ? (
                  <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                ) : lesson.unlocked ? (
                  <Play className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                ) : (
                  <Lock className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                )}
                <div>
                  <h3 className="font-semibold">{lesson.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {lesson.estimated_time} · {lesson.difficulty}
                  </p>
                  {lesson.unlocked && !lesson.completed && (
                    <p className="text-xs mt-1 text-muted-foreground">
                      Challenge: {lesson.challengePassed ? "✓" : "—"} · Quiz:{" "}
                      {lesson.quizPassed ? "✓" : lesson.quizScore ? `${lesson.quizScore}%` : "—"}
                    </p>
                  )}
                </div>
              </div>
              {lesson.unlocked ? (
                <Link href={`/lessons/${lesson.slug}`}>
                  <span className="text-sm px-3 py-1.5 rounded-lg bg-primary text-primary-foreground">
                    {lesson.completed ? "Review" : "Start"}
                  </span>
                </Link>
              ) : (
                <span className="text-xs text-muted-foreground">Locked</span>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </Layout>
  );
}
