/**
 * Learning Velocity - Track improvement speed and classify users
 */

import LearningVelocity from "../../models/LearningVelocity.js";
import LearningEvent from "../../models/LearningEvent.js";
import AdaptiveProfile from "../../models/AdaptiveProfile.js";
import SpacedReview from "../../models/SpacedReview.js";

/**
 * Calculate improvement rate (theta change per week)
 */
export function calculateImprovementRate(currentTheta, events) {
  if (!events || events.length < 2) return 0;

  // Get events from the last 7 days
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const recentEvents = events.filter((e) => new Date(e.createdAt) >= oneWeekAgo);
  if (recentEvents.length < 2) return 0;

  // Calculate theta change based on quiz and challenge performance
  let thetaChange = 0;
  for (const event of recentEvents) {
    if (event.eventType === "quiz_submit") {
      thetaChange += (event.scorePercent - 50) / 1000; // Small increment
    } else if (event.eventType === "challenge_pass") {
      thetaChange += 0.02;
    } else if (event.eventType === "challenge_fail") {
      thetaChange -= 0.03;
    }
  }

  return thetaChange;
}

/**
 * Track challenge success trend (last 10)
 */
export async function getChallengeSuccessTrend(userId) {
  const events = await LearningEvent.find({
    user: userId,
    eventType: { $in: ["challenge_pass", "challenge_fail"] },
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  const trend = [];
  let passCount = 0;
  let totalCount = 0;

  for (const event of events) {
    totalCount++;
    if (event.eventType === "challenge_pass") passCount++;
    trend.push(totalCount > 0 ? passCount / totalCount : 0);
  }

  return trend.reverse(); // Oldest to newest
}

/**
 * Track quiz trend (last 10)
 */
export async function getQuizTrend(userId) {
  const events = await LearningEvent.find({
    user: userId,
    eventType: "quiz_submit",
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return events.map((e) => e.scorePercent || 0).reverse();
}

/**
 * Track retention trend (last 10)
 */
export async function getRetentionTrend(userId) {
  const reviews = await SpacedReview.find({ user: userId })
    .sort({ lastReviewAt: -1 })
    .limit(10)
    .lean();

  const trend = [];
  for (const review of reviews) {
    const daysSince = review.lastReviewAt
      ? (Date.now() - new Date(review.lastReviewAt).getTime()) / (1000 * 60 * 60 * 24)
      : 0;
    const retention = Math.exp(-0.4 * Math.max(0, daysSince / Math.max(1, review.intervalDays)));
    trend.push(Math.round(retention * 100));
  }

  return trend.reverse();
}

/**
 * Classify user based on velocity metrics
 */
export function classifyUser(improvementRate, challengeTrend, quizTrend, retentionTrend) {
  const avgChallengeSuccess =
    challengeTrend.length > 0
      ? challengeTrend.reduce((a, b) => a + b, 0) / challengeTrend.length
      : 0;
  const avgQuizScore =
    quizTrend.length > 0 ? quizTrend.reduce((a, b) => a + b, 0) / quizTrend.length : 0;
  const avgRetention =
    retentionTrend.length > 0
      ? retentionTrend.reduce((a, b) => a + b, 0) / retentionTrend.length
      : 0;

  // Expert: High improvement, high success, high retention
  if (
    improvementRate > 0.05 &&
    avgChallengeSuccess > 0.8 &&
    avgQuizScore > 85 &&
    avgRetention > 80
  ) {
    return "expert";
  }

  // Accelerating: Positive improvement, good success rates
  if (
    improvementRate > 0.02 &&
    avgChallengeSuccess > 0.6 &&
    avgQuizScore > 70 &&
    avgRetention > 60
  ) {
    return "accelerating";
  }

  // Struggling: Negative improvement, low success rates
  if (
    improvementRate < -0.02 ||
    avgChallengeSuccess < 0.4 ||
    avgQuizScore < 50 ||
    avgRetention < 40
  ) {
    return "struggling";
  }

  // Default: Stable
  return "stable";
}

/**
 * Calculate weekly velocity score (0-100)
 */
export function calculateWeeklyVelocity(improvementRate, challengeTrend, quizTrend, retentionTrend) {
  const avgChallengeSuccess =
    challengeTrend.length > 0
      ? challengeTrend.reduce((a, b) => a + b, 0) / challengeTrend.length
      : 0.5;
  const avgQuizScore =
    quizTrend.length > 0 ? quizTrend.reduce((a, b) => a + b, 0) / quizTrend.length : 50;
  const avgRetention =
    retentionTrend.length > 0
      ? retentionTrend.reduce((a, b) => a + b, 0) / retentionTrend.length
      : 50;

  // Normalize improvement rate (-0.1 to 0.1 -> 0 to 100)
  const improvementScore = ((improvementRate + 0.1) / 0.2) * 100;

  const velocity =
    improvementScore * 0.3 +
    avgChallengeSuccess * 100 * 0.25 +
    avgQuizScore * 0.25 +
    avgRetention * 0.2;

  return Math.max(0, Math.min(100, Math.round(velocity)));
}

/**
 * Update learning velocity for a user
 */
export async function updateLearningVelocity(userId) {
  const profile = await AdaptiveProfile.findOne({ user: userId });
  if (!profile) return null;

  const events = await LearningEvent.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const challengeTrend = await getChallengeSuccessTrend(userId);
  const quizTrend = await getQuizTrend(userId);
  const retentionTrend = await getRetentionTrend(userId);

  const improvementRate = calculateImprovementRate(profile.abilityTheta, events);
  const velocityClass = classifyUser(improvementRate, challengeTrend, quizTrend, retentionTrend);
  const weeklyVelocity = calculateWeeklyVelocity(
    improvementRate,
    challengeTrend,
    quizTrend,
    retentionTrend
  );

  const velocity = await LearningVelocity.findOneAndUpdate(
    { user: userId },
    {
      user: userId,
      velocityClass,
      improvementRate,
      challengeSuccessTrend: challengeTrend,
      quizTrend,
      retentionTrend,
      weeklyVelocity,
      lastCalculated: new Date(),
    },
    { upsert: true, new: true }
  );

  return velocity;
}

/**
 * Get velocity description for UI
 */
export function getVelocityDescription(velocityClass) {
  const descriptions = {
    accelerating:
      "You're learning faster than average. Keep up the great momentum with challenging content.",
    stable: "You're making steady progress. Continue with consistent practice to maintain growth.",
    struggling:
      "You're facing some challenges. Consider reviewing fundamentals and taking easier lessons.",
    expert:
      "You've mastered the fundamentals. Focus on advanced topics and complex projects to grow further.",
  };
  return descriptions[velocityClass] || descriptions.stable;
}

/**
 * Get velocity color for UI
 */
export function getVelocityColor(velocityClass) {
  const colors = {
    accelerating: "text-green-500",
    stable: "text-blue-500",
    struggling: "text-orange-500",
    expert: "text-purple-500",
  };
  return colors[velocityClass] || colors.stable;
}
