/**
 * Item Response Theory (1PL / 2PL logistic) for quiz assessment.
 * theta: learner ability (~ -3 to +3)
 * b: item difficulty
 * a: item discrimination (2PL)
 */

export function probabilityCorrect(theta, b, a = 1.0) {
  const z = a * (theta - b);
  if (z > 20) return 1;
  if (z < -20) return 0;
  return 1 / (1 + Math.exp(-z));
}

/** Incremental ability update after one response (stochastic approximation to MLE). */
export function updateAbility(theta, responses) {
  let t = theta;
  const lr = 0.35;
  for (const { correct, b, a = 1.0 } of responses) {
    const p = probabilityCorrect(t, b, a);
    const observed = correct ? 1 : 0;
    t += lr * (observed - p);
  }
  return clampTheta(t);
}

export function clampTheta(theta) {
  return Math.max(-3, Math.min(3, theta));
}

export function thetaToSkillLabel(theta) {
  if (theta >= 1.2) return "advanced";
  if (theta >= 0.35) return "intermediate";
  return "beginner";
}

export function thetaToTargetDifficulty(theta) {
  if (theta >= 1.0) return "hard";
  if (theta >= 0.2) return "medium";
  return "easy";
}

const DIFFICULTY_B = { easy: -0.8, medium: 0, hard: 0.9 };

export function lessonDifficultyToB(difficulty) {
  return DIFFICULTY_B[difficulty] ?? 0;
}

/** Expected score (0–100) for a set of items at current theta. */
export function expectedQuizPercent(theta, items) {
  if (!items.length) return 0;
  const sum = items.reduce((s, it) => s + probabilityCorrect(theta, it.b, it.a ?? 1), 0);
  return Math.round((sum / items.length) * 100);
}
