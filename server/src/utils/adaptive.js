/**
 * Adaptive learning helpers — suggest difficulty and revision topics
 * based on quiz accuracy and completed lessons.
 */

export function computeSkillLevel(accuracy, completedCount) {
  if (completedCount >= 20 && accuracy >= 0.75) return "advanced";
  if (completedCount >= 8 && accuracy >= 0.55) return "intermediate";
  return "beginner";
}

export function getRecommendations({ lessons, progress, user }) {
  const completedIds = new Set(
    progress.filter((p) => p.completed).map((p) => p.lesson.toString())
  );
  const scoresByLesson = Object.fromEntries(
    progress.map((p) => [p.lesson.toString(), p.quizScore])
  );

  const incomplete = lessons.filter((l) => !completedIds.has(l._id.toString()));
  const weak = progress
    .filter((p) => p.quizScore < 60 && p.quizAttempts > 0)
    .map((p) => p.lesson.toString());

  const revision = lessons.filter((l) => weak.includes(l._id.toString())).slice(0, 5);

  const skill = user?.performance?.skillLevel || "beginner";
  const categoryOrder =
    skill === "advanced"
      ? ["advanced", "intermediate", "beginner"]
      : skill === "intermediate"
        ? ["intermediate", "beginner", "advanced"]
        : ["beginner", "intermediate", "advanced"];

  const difficultyRank = { easy: 0, medium: 1, hard: 2 };
  const targetDifficulty =
    skill === "advanced" ? 2 : skill === "intermediate" ? 1 : 0;

  const sorted = [...incomplete].sort((a, b) => {
    const ca = categoryOrder.indexOf(a.category);
    const cb = categoryOrder.indexOf(b.category);
    if (ca !== cb) return ca - cb;
    const da = Math.abs((difficultyRank[a.difficulty] ?? 1) - targetDifficulty);
    const db = Math.abs((difficultyRank[b.difficulty] ?? 1) - targetDifficulty);
    if (da !== db) return da - db;
    return (a.order || 0) - (b.order || 0);
  });

  const lowScore = incomplete.filter((l) => {
    const s = scoresByLesson[l._id.toString()];
    return s !== undefined && s < 50;
  });

  return {
    continueLearning: sorted[0] || lessons[0],
    recommended: sorted.slice(0, 6),
    revisionTopics: revision,
    suggestEasier: lowScore.length >= 2,
    suggestHarder: (user?.performance?.correctAnswers || 0) / Math.max(user?.performance?.totalQuizzes || 1, 1) > 0.85,
  };
}
