/**
 * Advanced Spaced Repetition System
 * Enhanced SM-2 with retention prediction, confidence prediction, and priority scoring
 */

import { retentionEstimate } from "./spacedRepetition.js";

/**
 * Predict retention using personalized forgetting curve
 */
export function predictRetention(daysSinceReview, intervalDays, forgettingCurve = 0.4) {
  if (intervalDays <= 0) return 100;
  const t = daysSinceReview / intervalDays;
  return Math.round(Math.exp(-forgettingCurve * Math.max(0, t)) * 100);
}

/**
 * Predict confidence from response patterns
 */
export function predictConfidence(quality, easeFactor, repetitions) {
  // Base confidence from quality
  const qualityConfidence = (quality / 5) * 100;

  // Boost from ease factor (higher ease = more confident)
  const easeBoost = ((easeFactor - 1.3) / 2.7) * 20;

  // Boost from repetitions (more reviews = more confident)
  const repetitionBoost = Math.min(20, repetitions * 2);

  const confidence = qualityConfidence + easeBoost + repetitionBoost;
  return Math.max(0, Math.min(100, Math.round(confidence)));
}

/**
 * Calculate review priority score (0-100)
 * Higher score = more urgent review needed
 */
export function calculateReviewPriority(
  retentionPrediction,
  confidencePrediction,
  daysUntilDue,
  weakTopic
) {
  let priority = 0;

  // Low retention adds significant priority
  if (retentionPrediction < 40) priority += 40;
  else if (retentionPrediction < 60) priority += 25;
  else if (retentionPrediction < 80) priority += 10;

  // Low confidence adds priority
  if (confidencePrediction < 40) priority += 30;
  else if (confidencePrediction < 60) priority += 15;

  // Overdue or due soon adds priority
  if (daysUntilDue < 0) priority += 30; // Overdue
  else if (daysUntilDue <= 1) priority += 20; // Due today/tomorrow
  else if (daysUntilDue <= 3) priority += 10; // Due soon

  // Weak topic alert adds priority
  if (weakTopic) priority += 25;

  return Math.min(100, priority);
}

/**
 * Calculate personalized forgetting curve based on historical performance
 */
export function calculatePersonalizedForgettingCurve(historicalRetention) {
  if (!historicalRetention || historicalRetention.length < 3) return 0.4; // Default

  // Calculate average decay rate from history
  const avgRetention = historicalRetention.reduce((a, b) => a + b, 0) / historicalRetention.length;

  // Lower average retention = steeper forgetting curve (higher value)
  // Higher average retention = flatter forgetting curve (lower value)
  if (avgRetention > 80) return 0.3;
  if (avgRetention > 60) return 0.35;
  if (avgRetention > 40) return 0.4;
  return 0.5;
}

/**
 * Generate weak topic alert based on mastery and retention
 */
export function generateWeakTopicAlert(masteryScore, retentionPrediction, confidencePrediction) {
  const lowMastery = masteryScore < 50;
  const lowRetention = retentionPrediction < 60;
  const lowConfidence = confidencePrediction < 50;

  return lowMastery || lowRetention || lowConfidence;
}

/**
 * Enhanced SM-2 next interval with predictions
 */
export function advancedSm2NextInterval({
  easeFactor,
  intervalDays,
  repetitions,
  quality,
  historicalRetention = [],
}) {
  // Standard SM-2 calculation
  let ef = easeFactor;
  let interval = intervalDays;
  let reps = repetitions;

  if (quality < 3) {
    reps = 0;
    interval = 1;
  } else {
    if (reps === 0) interval = 1;
    else if (reps === 1) interval = 3;
    else interval = Math.round(interval * ef);
    reps += 1;
  }

  ef = Math.max(1.3, ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + interval);
  nextReviewAt.setHours(8, 0, 0, 0);

  // Calculate personalized forgetting curve
  const forgettingCurve = calculatePersonalizedForgettingCurve(historicalRetention);

  // Predict retention at next review date
  const predictedRetention = predictRetention(interval, interval, forgettingCurve);

  // Predict confidence
  const predictedConfidence = predictConfidence(quality, ef, reps);

  return {
    easeFactor: Math.round(ef * 100) / 100,
    intervalDays: interval,
    repetitions: reps,
    nextReviewAt,
    lastQuality: quality,
    retentionPrediction: predictedRetention,
    confidencePrediction: predictedConfidence,
    forgettingCurve,
  };
}

/**
 * Update spaced review with advanced predictions
 */
export async function updateAdvancedSpacedReview(review, quality) {
  const historicalRetention = review.historicalRetention || [];

  // Calculate current retention before update
  const daysSinceLastReview = review.lastReviewAt
    ? (Date.now() - new Date(review.lastReviewAt).getTime()) / (1000 * 60 * 60 * 24)
    : 0;
  const currentRetention = predictRetention(
    daysSinceLastReview,
    review.intervalDays,
    review.forgettingCurve
  );

  // Add to history
  historicalRetention.push(currentRetention);
  if (historicalRetention.length > 10) historicalRetention.shift(); // Keep last 10

  // Calculate next interval with predictions
  const next = advancedSm2NextInterval({
    easeFactor: review.easeFactor,
    intervalDays: review.intervalDays,
    repetitions: review.repetitions,
    quality,
    historicalRetention,
  });

  // Calculate review priority
  const daysUntilDue = Math.ceil(
    (new Date(next.nextReviewAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const priorityScore = calculateReviewPriority(
    next.retentionPrediction,
    next.confidencePrediction,
    daysUntilDue,
    review.weakTopicAlert
  );

  return {
    ...next,
    historicalRetention,
    reviewPriorityScore: priorityScore,
  };
}

/**
 * Get review schedule sorted by priority
 */
export function getReviewScheduleByPriority(reviews) {
  return reviews
    .map((review) => ({
      ...review.toObject(),
      daysUntilDue: Math.ceil(
        (new Date(review.nextReviewAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ),
    }))
    .sort((a, b) => {
      // First sort by priority score (higher = more urgent)
      if (b.reviewPriorityScore !== a.reviewPriorityScore) {
        return b.reviewPriorityScore - a.reviewPriorityScore;
      }
      // Then sort by days until due (sooner = more urgent)
      return a.daysUntilDue - b.daysUntilDue;
    });
}

/**
 * Categorize reviews for the Review Center
 */
export function categorizeReviews(reviews) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  return {
    dueToday: reviews.filter((r) => new Date(r.nextReviewAt) <= tomorrow),
    dueThisWeek: reviews.filter(
      (r) => new Date(r.nextReviewAt) > tomorrow && new Date(r.nextReviewAt) <= nextWeek
    ),
    highRisk: reviews.filter((r) => r.retentionPrediction < 50 || r.weakTopicAlert),
    forgotten: reviews.filter((r) => r.retentionPrediction < 40),
    recommended: reviews
      .filter((r) => r.reviewPriorityScore > 50)
      .sort((a, b) => b.reviewPriorityScore - a.reviewPriorityScore)
      .slice(0, 10),
  };
}
