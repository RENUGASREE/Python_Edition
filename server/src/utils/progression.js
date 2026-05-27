import { QUIZ_PASS_THRESHOLD } from "./xp.js";

/** Maps UI track choice to lesson categories unlocked in sequence */
export const TRACK_CATEGORIES = {
  beginner: ["beginner"],
  intermediate: ["beginner", "intermediate"],
  advanced: ["beginner", "intermediate", "advanced", "projects"],
};

export function progressMeetsRequirements(progress, quizThreshold = QUIZ_PASS_THRESHOLD) {
  if (!progress) return { challengePassed: false, quizPassed: false, canComplete: false };
  const challengePassed = !!progress.challengePassed;
  const quizPassed = (progress.quizScore || 0) >= quizThreshold && progress.quizAttempts > 0;
  return {
    challengePassed,
    quizPassed,
    canComplete: challengePassed && quizPassed,
    quizScore: progress.quizScore || 0,
    quizThreshold,
  };
}

/**
 * Lesson is unlocked if:
 * - Same category track contains it
 * - First lesson in category (order 0), OR
 * - Previous lesson in same category is completed with requirements met
 */
export function buildLessonMap(lessons, progressRecords, selectedTrack = "beginner") {
  const categories = TRACK_CATEGORIES[selectedTrack] || TRACK_CATEGORIES.beginner;
  const progressByLesson = Object.fromEntries(
    progressRecords.map((p) => [p.lesson.toString(), p])
  );

  const byCategory = {};
  for (const lesson of lessons) {
    if (!categories.includes(lesson.category)) continue;
    if (!byCategory[lesson.category]) byCategory[lesson.category] = [];
    byCategory[lesson.category].push(lesson);
  }

  for (const cat of Object.keys(byCategory)) {
    byCategory[cat].sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  const result = [];

  for (const cat of categories) {
    const list = byCategory[cat] || [];
    for (let i = 0; i < list.length; i++) {
      const lesson = list[i];
      const prog = progressByLesson[lesson._id.toString()];
      const req = progressMeetsRequirements(prog);
      const prev = i > 0 ? list[i - 1] : null;
      const prevProg = prev ? progressByLesson[prev._id.toString()] : null;
      const prevReq = progressMeetsRequirements(prevProg);

      let unlocked = false;
      if (i === 0 && cat === categories[0]) {
        unlocked = true;
      } else if (i === 0) {
        const prevCat = categories[categories.indexOf(cat) - 1];
        const prevList = byCategory[prevCat] || [];
        const lastPrev = prevList[prevList.length - 1];
        const lastProg = lastPrev ? progressByLesson[lastPrev._id.toString()] : null;
        unlocked = progressMeetsRequirements(lastProg).canComplete || !!lastProg?.completed;
      } else {
        unlocked = prevReq.canComplete || !!prevProg?.completed;
      }

      result.push({
        slug: lesson.slug,
        title: lesson.title,
        category: lesson.category,
        order: lesson.order,
        difficulty: lesson.difficulty,
        estimated_time: lesson.estimated_time,
        unlocked,
        completed: !!prog?.completed,
        ...req,
      });
    }
  }

  return result;
}

export function sanitizeChallengeForClient(codingChallenge) {
  if (!codingChallenge) return null;
  const obj = codingChallenge.toObject ? codingChallenge.toObject() : { ...codingChallenge };
  return {
    problemStatement: obj.problemStatement,
    examples: obj.examples,
    constraints: obj.constraints,
    hints: obj.hints,
    starterCode: obj.starterCode,
    xpReward: obj.xpReward,
    timeEstimate: obj.timeEstimate,
    difficultyLabel: obj.difficultyLabel,
    visibleTests: (obj.testCases || []).filter((t) => !t.hidden),
  };
}
