import { Link } from "wouter";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type LessonNavEntry = {
  slug: string;
  title: string;
  unlocked: boolean;
};

interface LessonNavigationProps {
  prev: LessonNavEntry | null;
  next: LessonNavEntry | null;
  position?: number;
  total?: number;
  className?: string;
}

export function LessonNavigation({ prev, next, position, total, className }: LessonNavigationProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card/40",
        className
      )}
    >
      <div className="min-w-[140px]">
        {prev ? (
          prev.unlocked ? (
            <Link href={`/lessons/${prev.slug}`}>
              <Button variant="outline" size="sm" className="gap-1 max-w-[220px]">
                <ChevronLeft className="w-4 h-4 shrink-0" />
                <span className="truncate">{prev.title}</span>
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled className="gap-1 opacity-60">
              <Lock className="w-3.5 h-3.5" />
              <span className="truncate max-w-[180px]">{prev.title}</span>
            </Button>
          )
        ) : (
          <span className="text-xs text-muted-foreground">First lesson</span>
        )}
      </div>

      {position != null && total != null && total > 0 && (
        <span className="text-xs text-muted-foreground tabular-nums">
          Lesson {position} of {total}
        </span>
      )}

      <div className="min-w-[140px] flex justify-end">
        {next ? (
          next.unlocked ? (
            <Link href={`/lessons/${next.slug}`}>
              <Button size="sm" className="gap-1 max-w-[220px]">
                <span className="truncate">{next.title}</span>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </Button>
            </Link>
          ) : (
            <Button size="sm" disabled className="gap-1 opacity-60 max-w-[220px]">
              <span className="truncate">{next.title}</span>
              <Lock className="w-3.5 h-3.5 shrink-0" />
            </Button>
          )
        ) : (
          <span className="text-xs text-muted-foreground">Last lesson</span>
        )}
      </div>
    </div>
  );
}
