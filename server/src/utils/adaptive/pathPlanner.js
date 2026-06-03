import { TRACK_CATEGORIES, progressMeetsRequirements } from "../progression.js";
import { lessonDifficultyToB } from "./irt.js";

const DIFF_RANK = { easy: 0, medium: 1, hard: 2 };

function topicKeyForLesson(lesson) {
  return lesson.slug || lesson.title;
}

function masteryForTopic(profile, topicKey) {
  const t = profile?.topicMastery?.find((m) => m.topicKey === topicKey);
  return t?.theta ?? 0;
}

/**
 * Build personalized learning path with remediation injected after mistakes.
 */
export function buildPersonalizedPath({
  lessons,
  progressRecords,
  profile,
  recentMistakes,
  dueReviews,
  selectedTrack = "beginner",
}) {
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

  const ordered = [];
  for (const cat of categories) {
    ordered.push(...(byCategory[cat] || []));
  }

  const remediationSlugs = new Set();
  for (const m of recentMistakes || []) {
    if (m.lessonSlug) remediationSlugs.add(m.lessonSlug);
  }
  for (const r of dueReviews || []) {
    if (r.lessonSlug) remediationSlugs.add(r.lessonSlug);
  }

  const path = [];
  const seen = new Set();

  for (const lesson of ordered) {
    const id = lesson._id.toString();
    const prog = progressByLesson[id];
    const req = progressMeetsRequirements(prog);
    const slug = lesson.slug;

    if (remediationSlugs.has(slug) && !seen.has(`rem-${slug}`)) {
      seen.add(`rem-${slug}`);
      const due = dueReviews?.find((d) => d.lessonSlug === slug);
      path.push({
        slug,
        title: lesson.title,
        category: lesson.category,
        difficulty: lesson.difficulty,
        type: due ? "spaced_review" : "remediation",
        reason: due
          ? "Spaced review due — strengthen long-term memory"
          : "Recent mistakes — revisit before moving on",
        unlocked: true,
        completed: !!prog?.completed,
      });
    }

    if (seen.has(slug)) continue;
    seen.add(slug);

    let unlocked = false;
    const idx = ordered.findIndex((l) => l.slug === slug);
    if (idx === 0 && lesson.category === categories[0]) unlocked = true;
    else if (idx > 0) {
      const prev = ordered[idx - 1];
      const prevProg = progressByLesson[prev._id.toString()];
      const prevReq = progressMeetsRequirements(prevProg);
      unlocked = prevReq.canComplete || !!prevProg?.completed;
    }

    if (!unlocked && idx === 0 && categories.indexOf(lesson.category) > 0) {
      const prevCat = categories[categories.indexOf(lesson.category) - 1];
      const prevList = byCategory[prevCat] || [];
      const last = prevList[prevList.length - 1];
      if (last) {
        const lp = progressByLesson[last._id.toString()];
        unlocked = progressMeetsRequirements(lp).canComplete || !!lp?.completed;
      }
    }

    let type = "new";
    let reason = "Next in your personalized track";
    if (prog?.completed) {
      type = "completed";
      reason = "Completed";
    } else if (req.canComplete) {
      type = "ready_to_complete";
      reason = "Ready to mark complete";
    } else if (prog?.lastAccessedAt) {
      type = "continue";
      reason = "Continue where you left off";
    }

    path.push({
      slug,
      title: lesson.title,
      category: lesson.category,
      difficulty: lesson.difficulty,
      type,
      reason,
      unlocked,
      completed: !!prog?.completed,
      quizScore: prog?.quizScore ?? 0,
      mastery: masteryForTopic(profile, topicKeyForLesson(lesson)),
    });
  }

  return path;
}

/**
 * Rank incomplete lessons by fit to learner ability (real-time difficulty targeting).
 */
export function rankLessonsByDifficultyFit(lessons, theta, { incompleteOnly = true, progressByLesson = {} }) {
  const target = theta >= 1 ? 2 : theta >= 0.2 ? 1 : 0;

  return [...lessons]
    .filter((l) => {
      if (!incompleteOnly) return true;
      const p = progressByLesson[l._id?.toString?.() || l._id];
      return !p?.completed;
    })
    .map((l) => {
      const rank = DIFF_RANK[l.difficulty] ?? 1;
      const fit = -Math.abs(rank - target);
      const b = lessonDifficultyToB(l.difficulty);
      return { lesson: l, fit, b, targetDifficulty: ["easy", "medium", "hard"][target] };
    })
    .sort((a, b) => b.fit - a.fit);
}

export { topicKeyForLesson };
