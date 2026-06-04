/**
 * Advanced Topic-Level Mastery Engine
 * Calculates composite mastery, confidence, retention, error frequency, and decay
 */

/**
 * Calculate composite mastery score (0-100) from multiple factors
 */
export function calculateMasteryScore(theta, attempts, retentionScore, errorFrequency) {
  // Theta contribution (0-100, normalized from -3 to +3)
  const thetaScore = ((theta + 3) / 6) * 100;
  
  // Practice volume contribution (diminishing returns)
  const practiceScore = Math.min(100, attempts * 5);
  
  // Retention contribution
  const retentionContribution = retentionScore;
  
  // Error penalty
  const errorPenalty = errorFrequency * 100;
  
  // Weighted composite
  const composite = (
    thetaScore * 0.4 +
    practiceScore * 0.2 +
    retentionContribution * 0.3 +
    (100 - errorPenalty) * 0.1
  );
  
  return Math.max(0, Math.min(100, Math.round(composite)));
}

/**
 * Calculate confidence score (0-100) from response patterns
 * Higher confidence = consistent correct answers, low variance
 */
export function calculateConfidenceScore(correct, attempts, recentCorrect) {
  if (attempts === 0) return 50;
  
  // Base accuracy
  const accuracy = correct / attempts;
  
  // Recent performance weight (last 5 attempts)
  const recentAccuracy = recentCorrect / Math.min(5, attempts);
  
  // Confidence increases with both accuracy and consistency
  const baseConfidence = accuracy * 100;
  const recentBoost = recentAccuracy * 20;
  
  // Volume bonus (more practice = more confident, up to a point)
  const volumeBonus = Math.min(20, attempts * 2);
  
  const confidence = baseConfidence * 0.6 + recentBoost * 0.2 + volumeBonus * 0.2;
  
  return Math.max(0, Math.min(100, Math.round(confidence)));
}

/**
 * Calculate retention score (0-100) from spaced repetition data
 * Based on time since last practice and interval
 */
export function calculateRetentionScore(lastPracticed, intervalDays, decayFactor = 0.95) {
  if (!lastPracticed) return 100;
  
  const daysSince = (Date.now() - new Date(lastPracticed).getTime()) / (1000 * 60 * 60 * 24);
  
  // If no interval set, use default decay
  const effectiveInterval = intervalDays || 7;
  
  // Exponential decay based on time since practice
  const timeRatio = daysSince / effectiveInterval;
  const retention = Math.pow(decayFactor, timeRatio) * 100;
  
  return Math.max(0, Math.min(100, Math.round(retention)));
}

/**
 * Calculate error frequency (0-1) from attempts and correct answers
 */
export function calculateErrorFrequency(attempts, correct) {
  if (attempts === 0) return 0;
  return Math.max(0, Math.min(1, (attempts - correct) / attempts));
}

/**
 * Apply mastery decay over time
 * Returns the decayed mastery score
 */
export function applyMasteryDecay(currentMastery, daysSinceLastPractice, decayFactor = 0.95) {
  if (daysSinceLastPractice <= 0) return currentMastery;
  
  // Decay accelerates with time
  const decayed = currentMastery * Math.pow(decayFactor, daysSinceLastPractice / 7);
  
  return Math.max(0, decayed);
}

/**
 * Update topic mastery with new learning event
 */
export function updateTopicMastery(masteryEntry, { correct, isReview = false }) {
  const now = new Date();
  const daysSinceLastPractice = masteryEntry.lastPracticed
    ? (now - new Date(masteryEntry.lastPracticed).getTime()) / (1000 * 60 * 60 * 24)
    : 0;
  
  // Update basic metrics
  masteryEntry.attempts += 1;
  if (correct) masteryEntry.correct += 1;
  masteryEntry.practiceCount += 1;
  masteryEntry.lastPracticed = now;
  masteryEntry.lastUpdated = now;
  
  // Recalculate error frequency
  masteryEntry.errorFrequency = calculateErrorFrequency(
    masteryEntry.attempts,
    masteryEntry.correct
  );
  
  // Update theta based on performance
  const accuracy = masteryEntry.correct / masteryEntry.attempts;
  const thetaDelta = (correct ? 0.05 : -0.08) * (isReview ? 0.5 : 1);
  masteryEntry.theta = Math.max(-3, Math.min(3, masteryEntry.theta + thetaDelta));
  
  // Calculate retention score (will be updated from SpacedReview data separately)
  masteryEntry.retentionScore = calculateRetentionScore(
    masteryEntry.lastPracticed,
    7, // Default interval, will be updated from SpacedReview
    masteryEntry.decayFactor
  );
  
  // Apply decay to existing mastery
  masteryEntry.masteryScore = applyMasteryDecay(
    masteryEntry.masteryScore || 0,
    daysSinceLastPractice,
    masteryEntry.decayFactor
  );
  
  // Recalculate composite mastery
  masteryEntry.masteryScore = calculateMasteryScore(
    masteryEntry.theta,
    masteryEntry.attempts,
    masteryEntry.retentionScore,
    masteryEntry.errorFrequency
  );
  
  // Update confidence
  const recentCorrect = correct ? 1 : 0;
  masteryEntry.confidenceScore = calculateConfidenceScore(
    masteryEntry.correct,
    masteryEntry.attempts,
    recentCorrect
  );
  
  // Adjust decay factor based on performance
  // Better performance = slower decay
  if (accuracy > 0.8 && masteryEntry.decayFactor < 0.98) {
    masteryEntry.decayFactor = Math.min(0.99, masteryEntry.decayFactor + 0.005);
  } else if (accuracy < 0.5 && masteryEntry.decayFactor > 0.9) {
    masteryEntry.decayFactor = Math.max(0.9, masteryEntry.decayFactor - 0.01);
  }
  
  return masteryEntry;
}

/**
 * Get mastery level label from mastery score
 */
export function getMasteryLevel(masteryScore) {
  if (masteryScore >= 80) return "expert";
  if (masteryScore >= 60) return "proficient";
  if (masteryScore >= 40) return "developing";
  if (masteryScore >= 20) return "beginner";
  return "novice";
}

/**
 * Get mastery color for UI
 */
export function getMasteryColor(masteryScore) {
  if (masteryScore >= 80) return "text-green-500";
  if (masteryScore >= 60) return "text-blue-500";
  if (masteryScore >= 40) return "text-yellow-500";
  if (masteryScore >= 20) return "text-orange-500";
  return "text-red-500";
}

/**
 * Check if topic needs review based on mastery and retention
 */
export function needsReview(masteryEntry) {
  const lowMastery = masteryEntry.masteryScore < 50;
  const lowRetention = masteryEntry.retentionScore < 60;
  const lowConfidence = masteryEntry.confidenceScore < 50;
  const highErrorRate = masteryEntry.errorFrequency > 0.4;
  
  return lowMastery || lowRetention || lowConfidence || highErrorRate;
}

/**
 * Get review priority score (0-100)
 * Higher score = more urgent review needed
 */
export function getReviewPriority(masteryEntry) {
  let priority = 0;
  
  // Low mastery adds priority
  if (masteryEntry.masteryScore < 30) priority += 40;
  else if (masteryEntry.masteryScore < 50) priority += 25;
  else if (masteryEntry.masteryScore < 70) priority += 10;
  
  // Low retention adds priority
  if (masteryEntry.retentionScore < 40) priority += 30;
  else if (masteryEntry.retentionScore < 60) priority += 15;
  
  // Low confidence adds priority
  if (masteryEntry.confidenceScore < 40) priority += 20;
  
  // High error rate adds priority
  if (masteryEntry.errorFrequency > 0.5) priority += 25;
  else if (masteryEntry.errorFrequency > 0.3) priority += 10;
  
  // Time since last practice adds priority
  const daysSince = masteryEntry.lastPracticed
    ? (Date.now() - new Date(masteryEntry.lastPracticed).getTime()) / (1000 * 60 * 60 * 24)
    : 0;
  if (daysSince > 14) priority += 15;
  else if (daysSince > 7) priority += 5;
  
  return Math.min(100, priority);
}
