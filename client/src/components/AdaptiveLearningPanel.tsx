import { Link } from "wouter";
import { Brain, Route, CalendarClock, Target, AlertCircle, ChevronRight } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { AdaptivePlan } from "@/types";

interface Props {
  plan: AdaptivePlan | undefined;
  compact?: boolean;
}

export function AdaptiveLearningPanel({ plan, compact }: Props) {
  if (!plan?.profile) return null;

  const theta = plan.profile.abilityTheta;
  const thetaPct = Math.round(((theta + 3) / 6) * 100);
  const due = plan.spacedRepetition?.dueNow ?? 0;
  const path = plan.personalizedPath?.slice(0, compact ? 5 : 12) ?? [];

  return (
    <div className="space-y-4">
      <GlassCard className="p-6 border-primary/20">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-xl bg-primary/15">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Adaptive learning engine</h2>
            <p className="text-xs text-muted-foreground mt-1">
              IRT assessment · spaced repetition · dynamic path · live difficulty
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          <div className="rounded-lg bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Target className="w-3 h-3" /> Ability (θ)
            </p>
            <p className="text-xl font-bold mt-1">{theta.toFixed(2)}</p>
            <Progress value={thetaPct} className="h-1 mt-2" />
            <p className="text-[10px] text-muted-foreground mt-1 capitalize">
              {plan.profile.skillLevel} · target: {plan.profile.targetDifficulty}
            </p>
          </div>
          <div className="rounded-lg bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <CalendarClock className="w-3 h-3" /> Spaced review
            </p>
            <p className="text-xl font-bold mt-1">{due}</p>
            <p className="text-[10px] text-muted-foreground mt-1">due now (forgetting curve)</p>
          </div>
          <div className="rounded-lg bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Route className="w-3 h-3" /> Path updates
            </p>
            <p className="text-xl font-bold mt-1">{plan.recentMistakeCount ?? 0}</p>
            <p className="text-[10px] text-muted-foreground mt-1">recent mistakes tracked</p>
          </div>
        </div>

        {plan.suggestEasier && (
          <p className="text-xs text-amber-400 flex items-center gap-1 mb-3">
            <AlertCircle className="w-3.5 h-3.5" />
            System suggests easier lessons until mastery improves.
          </p>
        )}
        {plan.suggestHarder && (
          <p className="text-xs text-primary flex items-center gap-1 mb-3">
            You&apos;re ready for harder material — path includes advanced fits.
          </p>
        )}
      </GlassCard>

      {!compact && path.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Route className="w-4 h-4 text-primary" />
            Your personalized path
          </h3>
          <ul className="space-y-2">
            {path.map((step) => (
              <li
                key={`${step.slug}-${step.type}`}
                className="flex items-center justify-between gap-2 text-sm p-2 rounded-lg border border-border/60 hover:border-primary/30"
              >
                <div className="min-w-0">
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {step.type.replace(/_/g, " ")}
                  </span>
                  <p className="font-medium truncate">{step.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{step.reason}</p>
                </div>
                {step.unlocked && !step.completed && (
                  <Link href={`/lessons/${step.slug}`}>
                    <Button size="sm" variant="ghost" className="shrink-0">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </GlassCard>
      )}
    </div>
  );
}
