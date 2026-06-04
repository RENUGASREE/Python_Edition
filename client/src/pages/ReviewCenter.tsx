import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Calendar, AlertTriangle, BookOpen, Clock, TrendingDown, CheckCircle2, ArrowRight } from "lucide-react";
import { Layout } from "@/components/Layout";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { apiFetch } from "@/lib/api";

interface ReviewItem {
  _id: string;
  lessonSlug: string;
  lessonTitle: string;
  nextReviewAt: string;
  retentionPrediction: number;
  confidencePrediction: number;
  weakTopicAlert: boolean;
  reviewPriorityScore: number;
  intervalDays: number;
}

interface CategorizedReviews {
  dueToday: ReviewItem[];
  dueThisWeek: ReviewItem[];
  highRisk: ReviewItem[];
  forgotten: ReviewItem[];
  recommended: ReviewItem[];
}

export default function ReviewCenter() {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ["review-center"],
    queryFn: () => apiFetch<CategorizedReviews>("/adaptive/review-center"),
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading review center...</div>
        </div>
      </Layout>
    );
  }

  const totalDue = (reviews?.dueToday?.length || 0) + (reviews?.dueThisWeek?.length || 0);
  const highRiskCount = reviews?.highRisk?.length || 0;
  const forgottenCount = reviews?.forgotten?.length || 0;

  return (
    <Layout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Review Center</h1>
          <p className="text-muted-foreground">
            Intelligent spaced repetition to strengthen long-term memory
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassCard className="p-5">
            <Calendar className="w-5 h-5 text-primary mb-2" />
            <p className="text-2xl font-bold">{totalDue}</p>
            <p className="text-sm text-muted-foreground">Due this week</p>
          </GlassCard>
          <GlassCard className="p-5">
            <AlertTriangle className="w-5 h-5 text-orange-500 mb-2" />
            <p className="text-2xl font-bold">{highRiskCount}</p>
            <p className="text-sm text-muted-foreground">High-risk topics</p>
          </GlassCard>
          <GlassCard className="p-5">
            <TrendingDown className="w-5 h-5 text-red-500 mb-2" />
            <p className="text-2xl font-bold">{forgottenCount}</p>
            <p className="text-sm text-muted-foreground">Forgotten concepts</p>
          </GlassCard>
          <GlassCard className="p-5">
            <BookOpen className="w-5 h-5 text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{reviews?.recommended?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Recommended</p>
          </GlassCard>
        </div>

        {/* Due Today */}
        {reviews?.dueToday && reviews.dueToday.length > 0 && (
          <GlassCard className="p-6 border-primary/30">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Due Today
            </h2>
            <div className="space-y-3">
              {reviews.dueToday.map((review) => (
                <ReviewCard key={review._id} review={review} priority="high" />
              ))}
            </div>
          </GlassCard>
        )}

        {/* High Risk Topics */}
        {reviews?.highRisk && reviews.highRisk.length > 0 && (
          <GlassCard className="p-6 border-orange-500/30">
            <h2 className="font-semibold mb-4 flex items-center gap-2 text-orange-400">
              <AlertTriangle className="w-5 h-5" />
              High-Risk Topics
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              These topics need attention to prevent forgetting
            </p>
            <div className="space-y-3">
              {reviews.highRisk.map((review) => (
                <ReviewCard key={review._id} review={review} priority="urgent" />
              ))}
            </div>
          </GlassCard>
        )}

        {/* Forgotten Concepts */}
        {reviews?.forgotten && reviews.forgotten.length > 0 && (
          <GlassCard className="p-6 border-red-500/30">
            <h2 className="font-semibold mb-4 flex items-center gap-2 text-red-400">
              <TrendingDown className="w-5 h-5" />
              Forgotten Concepts
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Retention below 40% - immediate review recommended
            </p>
            <div className="space-y-3">
              {reviews.forgotten.map((review) => (
                <ReviewCard key={review._id} review={review} priority="critical" />
              ))}
            </div>
          </GlassCard>
        )}

        {/* Due This Week */}
        {reviews?.dueThisWeek && reviews.dueThisWeek.length > 0 && (
          <GlassCard className="p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Due This Week
            </h2>
            <div className="space-y-3">
              {reviews.dueThisWeek.map((review) => (
                <ReviewCard key={review._id} review={review} priority="medium" />
              ))}
            </div>
          </GlassCard>
        )}

        {/* Recommended Review */}
        {reviews?.recommended && reviews.recommended.length > 0 && (
          <GlassCard className="p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Recommended Review
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Based on your learning patterns and mastery levels
            </p>
            <div className="space-y-3">
              {reviews.recommended.map((review) => (
                <ReviewCard key={review._id} review={review} priority="recommended" />
              ))}
            </div>
          </GlassCard>
        )}

        {/* Empty State */}
        {!reviews ||
          (reviews.dueToday.length === 0 &&
            reviews.dueThisWeek.length === 0 &&
            reviews.highRisk.length === 0 &&
            reviews.forgotten.length === 0 && (
              <GlassCard className="p-12 text-center">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">All caught up!</h3>
                <p className="text-muted-foreground mb-6">
                  You have no reviews due right now. Keep learning to build your review queue.
                </p>
                <Link href="/courses">
                  <Button>Browse Courses</Button>
                </Link>
              </GlassCard>
            ))}
      </motion.div>
    </Layout>
  );
}

function ReviewCard({ review, priority }: { review: ReviewItem; priority: "critical" | "urgent" | "high" | "medium" | "recommended" }) {
  const priorityColors: Record<string, string> = {
    critical: "border-red-500/50 bg-red-500/5",
    urgent: "border-orange-500/50 bg-orange-500/5",
    high: "border-primary/50 bg-primary/5",
    medium: "border-border/50",
    recommended: "border-green-500/50 bg-green-500/5",
  };

  const priorityLabels: Record<string, string> = {
    critical: "Critical - Review Now",
    urgent: "Urgent - High Risk",
    high: "Due Today",
    medium: "Due This Week",
    recommended: "Recommended",
  };

  const daysUntil = Math.ceil(
    (new Date(review.nextReviewAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className={`p-4 rounded-lg border ${priorityColors[priority]} hover:border-primary/50 transition-colors`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {priorityLabels[priority]}
            </span>
            {review.weakTopicAlert && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400">
                Weak Topic
              </span>
            )}
          </div>
          <h3 className="font-medium mb-1">{review.lessonTitle}</h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {daysUntil <= 0 ? "Overdue" : daysUntil === 0 ? "Today" : `In ${daysUntil} days`}
            </span>
            <span className="flex items-center gap-1">
              Retention: {review.retentionPrediction}%
            </span>
            <span className="flex items-center gap-1">
              Confidence: {review.confidencePrediction}%
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-1">Priority Score</div>
            <div className="text-lg font-bold">{review.reviewPriorityScore}</div>
          </div>
          <Link href={`/lessons/${review.lessonSlug}`}>
            <Button size="sm" className="gap-2">
              Review <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-16">Retention</span>
          <Progress value={review.retentionPrediction} className="h-1.5 flex-1" />
          <span className="text-xs w-8 text-right">{review.retentionPrediction}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-16">Confidence</span>
          <Progress value={review.confidencePrediction} className="h-1.5 flex-1" />
          <span className="text-xs w-8 text-right">{review.confidencePrediction}%</span>
        </div>
      </div>
    </div>
  );
}
