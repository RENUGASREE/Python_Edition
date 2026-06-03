/**
 * SM-2 spaced repetition (SuperMemo 2 simplified).
 * quality: 0–5 (we map quiz % to quality bands)
 */

export function quizScoreToQuality(scorePercent) {
  if (scorePercent >= 90) return 5;
  if (scorePercent >= 75) return 4;
  if (scorePercent >= 60) return 3;
  if (scorePercent >= 40) return 2;
  if (scorePercent >= 20) return 1;
  return 0;
}

export function sm2NextInterval({ easeFactor, intervalDays, repetitions, quality }) {
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

  return {
    easeFactor: Math.round(ef * 100) / 100,
    intervalDays: interval,
    repetitions: reps,
    nextReviewAt,
    lastQuality: quality,
  };
}

/** Retention estimate from days since review and interval (forgetting curve). */
export function retentionEstimate(daysSinceReview, intervalDays) {
  if (intervalDays <= 0) return 1;
  const t = daysSinceReview / intervalDays;
  return Math.exp(-0.4 * Math.max(0, t));
}
