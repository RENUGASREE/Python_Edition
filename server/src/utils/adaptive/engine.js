import AdaptiveProfile from "../../models/AdaptiveProfile.js";
import SpacedReview from "../../models/SpacedReview.js";
import LearningEvent from "../../models/LearningEvent.js";
import {
  updateAbility,
  clampTheta,
  thetaToSkillLabel,
  thetaToTargetDifficulty,
  lessonDifficultyToB,
  expectedQuizPercent,
  probabilityCorrect,
} from "./irt.js";
import { quizScoreToQuality, sm2NextInterval, retentionEstimate } from "./spacedRepetition.js";
import { buildPersonalizedPath, rankLessonsByDifficultyFit, topicKeyForLesson } from "./pathPlanner.js";
import { computeSkillLevel } from "../adaptive.js";

function getQuizItems(lesson) {
  const diff = lesson.difficulty || "easy";
  const baseB = lessonDifficultyToB(diff);
  return (lesson.quiz || []).map((q, i) => ({
    index: i,
    b: q.itemDifficulty ?? baseB + (i * 0.05),
    a: q.discrimination ?? 1.1,
    question: q.question,
  }));
}

export async function getOrCreateProfile(userId) {
  let profile = await AdaptiveProfile.findOne({ user: userId });
  if (!profile) {
    profile = await AdaptiveProfile.create({ user: userId });
  }
  return profile;
}

function upsertTopicMastery(profile, topicKey, deltaCorrect, deltaAttempts) {
  const list = profile.topicMastery || [];
  let entry = list.find((m) => m.topicKey === topicKey);
  if (!entry) {
    entry = { topicKey, theta: 0, attempts: 0, correct: 0, lastUpdated: new Date() };
    list.push(entry);
  }
  entry.attempts += deltaAttempts;
  entry.correct += deltaCorrect;
  const acc = entry.correct / Math.max(entry.attempts, 1);
  entry.theta = clampTheta((acc - 0.5) * 2.5);
  entry.lastUpdated = new Date();
  profile.topicMastery = list;
}

async function logEvent(userId, payload) {
  await LearningEvent.create({ user: userId, ...payload });
  await AdaptiveProfile.updateOne({ user: userId }, { $inc: { totalLearningEvents: 1 } });
}

/**
 * IRT update from quiz answers + spaced repetition schedule.
 */
export async function recordQuizAttempt(userId, lesson, { answers, scorePercent, correct, total }) {
  const profile = await getOrCreateProfile(userId);
  const items = getQuizItems(lesson);
  const topicKey = topicKeyForLesson(lesson);

  const responses = items.map((it, i) => {
    const userAns = (answers[i] || "").trim().toLowerCase();
    const right = (lesson.quiz[i]?.answer || "").trim().toLowerCase();
    const ok = userAns === right;
    return { correct: ok, b: it.b, a: it.a };
  });

  for (let i = 0; i < responses.length; i++) {
    if (!responses[i].correct) {
      await logEvent(userId, {
        lesson: lesson._id,
        lessonSlug: lesson.slug,
        lessonTitle: lesson.title,
        topicKey,
        eventType: "quiz_item_wrong",
        itemIndex: i,
        difficulty: lesson.difficulty,
        metadata: { question: items[i]?.question?.slice(0, 120) },
      });
    }
  }

  profile.abilityTheta = updateAbility(profile.abilityTheta, responses);
  profile.targetDifficulty = thetaToTargetDifficulty(profile.abilityTheta);
  profile.skillLevel = thetaToSkillLabel(profile.abilityTheta);

  upsertTopicMastery(profile, topicKey, correct, total);
  await profile.save();

  await logEvent(userId, {
    lesson: lesson._id,
    lessonSlug: lesson.slug,
    lessonTitle: lesson.title,
    topicKey,
    eventType: "quiz_submit",
    scorePercent,
    difficulty: lesson.difficulty,
  });

  const quality = quizScoreToQuality(scorePercent);
  let review = await SpacedReview.findOne({ user: userId, lesson: lesson._id });
  const prev = review
    ? {
        easeFactor: review.easeFactor,
        intervalDays: review.intervalDays,
        repetitions: review.repetitions,
      }
    : { easeFactor: 2.5, intervalDays: 0, repetitions: 0 };

  const next = sm2NextInterval({ ...prev, quality });

  await SpacedReview.findOneAndUpdate(
    { user: userId, lesson: lesson._id },
    {
      user: userId,
      lesson: lesson._id,
      lessonSlug: lesson.slug,
      lessonTitle: lesson.title,
      ...next,
      lastReviewAt: new Date(),
    },
    { upsert: true, new: true }
  );

  await rebuildPath(userId);

  return {
    abilityTheta: profile.abilityTheta,
    targetDifficulty: profile.targetDifficulty,
    expectedScore: expectedQuizPercent(profile.abilityTheta, items),
    irtItems: items.length,
  };
}

export async function recordChallengeAttempt(userId, lesson, { passed, attemptCount }) {
  const topicKey = topicKeyForLesson(lesson);
  const profile = await getOrCreateProfile(userId);

  if (passed) {
    profile.abilityTheta = clampTheta(profile.abilityTheta + 0.08);
    upsertTopicMastery(profile, topicKey, 1, 1);
    await logEvent(userId, {
      lesson: lesson._id,
      lessonSlug: lesson.slug,
      lessonTitle: lesson.title,
      topicKey,
      eventType: "challenge_pass",
      difficulty: lesson.difficulty,
    });
  } else {
    profile.abilityTheta = clampTheta(profile.abilityTheta - 0.12);
    upsertTopicMastery(profile, topicKey, 0, 1);
    profile.remediationCount += 1;
    await logEvent(userId, {
      lesson: lesson._id,
      lessonSlug: lesson.slug,
      lessonTitle: lesson.title,
      topicKey,
      eventType: "challenge_fail",
      difficulty: lesson.difficulty,
      metadata: { attemptCount },
    });
  }

  profile.targetDifficulty = thetaToTargetDifficulty(profile.abilityTheta);
  profile.skillLevel = thetaToSkillLabel(profile.abilityTheta);
  await profile.save();
  await rebuildPath(userId);

  return { abilityTheta: profile.abilityTheta, targetDifficulty: profile.targetDifficulty };
}

export async function recordLessonComplete(userId, lesson) {
  await logEvent(userId, {
    lesson: lesson._id,
    lessonSlug: lesson.slug,
    lessonTitle: lesson.title,
    topicKey: topicKeyForLesson(lesson),
    eventType: "lesson_complete",
    difficulty: lesson.difficulty,
  });
  const profile = await getOrCreateProfile(userId);
  profile.abilityTheta = clampTheta(profile.abilityTheta + 0.05);
  await profile.save();
  await rebuildPath(userId);
}

async function rebuildPath(userId) {
  const profile = await getOrCreateProfile(userId);
  const User = (await import("../../models/User.js")).default;
  const Lesson = (await import("../../models/Lesson.js")).default;
  const Progress = (await import("../../models/Progress.js")).default;

  const user = await User.findById(userId);
  const lessons = await Lesson.find({ isPublished: true });
  const progress = await Progress.find({ user: userId });

  const since = new Date();
  since.setDate(since.getDate() - 14);

  const recentMistakes = await LearningEvent.find({
    user: userId,
    eventType: { $in: ["quiz_item_wrong", "challenge_fail"] },
    createdAt: { $gte: since },
  })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  const dueReviews = await SpacedReview.find({
    user: userId,
    nextReviewAt: { $lte: new Date() },
  })
    .sort({ nextReviewAt: 1 })
    .limit(10)
    .lean();

  const path = buildPersonalizedPath({
    lessons,
    progressRecords: progress,
    profile,
    recentMistakes,
    dueReviews,
    selectedTrack: user?.selectedTrack || "beginner",
  });

  profile.pathSlugs = path.filter((p) => p.unlocked && !p.completed).slice(0, 30).map((p) => p.slug);
  profile.pathReasons = path.slice(0, 40).map((p) => ({
    slug: p.slug,
    reason: p.reason,
    type: p.type,
  }));
  profile.pathUpdatedAt = new Date();
  await profile.save();

  return path;
}

/**
 * Full adaptive plan for dashboard / API.
 */
export async function getAdaptivePlan(userId, { lessons, progressRecords, user }) {
  const profile = await getOrCreateProfile(userId);

  if (profile.abilityTheta === 0 && user?.performance) {
    const acc =
      user.performance.correctAnswers / Math.max(user.performance.totalQuizzes, 1);
    const legacy = computeSkillLevel(acc, user.performance.lessonsCompleted);
    profile.abilityTheta =
      legacy === "advanced" ? 1.2 : legacy === "intermediate" ? 0.4 : -0.2;
    profile.skillLevel = thetaToSkillLabel(profile.abilityTheta);
    profile.targetDifficulty = thetaToTargetDifficulty(profile.abilityTheta);
    await profile.save();
  }

  const progressByLesson = Object.fromEntries(
    progressRecords.map((p) => [p.lesson.toString(), p])
  );

  const since = new Date();
  since.setDate(since.getDate() - 14);
  const recentMistakes = await LearningEvent.find({
    user: userId,
    eventType: { $in: ["quiz_item_wrong", "challenge_fail"] },
    createdAt: { $gte: since },
  })
    .sort({ createdAt: -1 })
    .limit(15)
    .lean();

  const dueReviews = await SpacedReview.find({
    user: userId,
    nextReviewAt: { $lte: new Date(Date.now() + 86400000) },
  })
    .sort({ nextReviewAt: 1 })
    .limit(12)
    .lean();

  const fullPath = buildPersonalizedPath({
    lessons,
    progressRecords,
    profile,
    recentMistakes,
    dueReviews,
    selectedTrack: user?.selectedTrack || "beginner",
  });

  if (!profile.pathUpdatedAt || Date.now() - profile.pathUpdatedAt > 3600000) {
    profile.pathSlugs = fullPath.filter((p) => p.unlocked && !p.completed).slice(0, 30).map((p) => p.slug);
    profile.pathReasons = fullPath.slice(0, 40).map((p) => ({
      slug: p.slug,
      reason: p.reason,
      type: p.type,
    }));
    profile.pathUpdatedAt = new Date();
    await profile.save();
  }

  const ranked = rankLessonsByDifficultyFit(lessons, profile.abilityTheta, {
    incompleteOnly: true,
    progressByLesson,
  });

  const continueItem =
    fullPath.find((p) => p.type === "continue" && p.unlocked) ||
    fullPath.find((p) => p.unlocked && !p.completed);

  const recommended = ranked.slice(0, 8).map((r) => ({
    slug: r.lesson.slug,
    title: r.lesson.title,
    category: r.lesson.category,
    difficulty: r.lesson.difficulty,
    estimated_time: r.lesson.estimated_time,
    fitScore: r.fit,
    recommendedDifficulty: r.targetDifficulty,
  }));

  const revisionTopics = dueReviews.map((r) => ({
    slug: r.lessonSlug,
    title: r.lessonTitle,
    nextReviewAt: r.nextReviewAt,
    intervalDays: r.intervalDays,
    retention: retentionEstimate(
      r.lastReviewAt
        ? (Date.now() - new Date(r.lastReviewAt).getTime()) / 86400000
        : r.intervalDays,
      r.intervalDays
    ),
  }));

  const remediation = fullPath.filter((p) => p.type === "remediation" || p.type === "spaced_review");

  return {
    profile: {
      abilityTheta: Math.round(profile.abilityTheta * 100) / 100,
      targetDifficulty: profile.targetDifficulty,
      skillLevel: profile.skillLevel,
      remediationCount: profile.remediationCount,
    },
    irt: {
      description: "Ability estimate (θ) from item-response theory on quiz items",
      theta: profile.abilityTheta,
      expectedPerformance: expectedQuizPercent(
        profile.abilityTheta,
        lessons[0] ? getQuizItems(lessons[0]) : []
      ),
    },
    spacedRepetition: {
      dueNow: dueReviews.filter((r) => new Date(r.nextReviewAt) <= new Date()).length,
      dueSoon: dueReviews.length,
      schedule: revisionTopics,
    },
    personalizedPath: fullPath.filter((p) => p.unlocked).slice(0, 25),
    continueLearning: continueItem
      ? {
          slug: continueItem.slug,
          title: continueItem.title,
          category: continueItem.category,
          reason: continueItem.reason,
        }
      : recommended[0]
        ? {
            slug: recommended[0].slug,
            title: recommended[0].title,
            category: recommended[0].category,
            reason: "Best difficulty match for your level",
          }
        : null,
    recommended,
    revisionTopics: revisionTopics.map((r) => ({
      slug: r.slug,
      title: r.title,
      category: "review",
      estimated_time: "10 min",
    })),
    remediation,
    suggestEasier: profile.abilityTheta < -0.3,
    suggestHarder: profile.abilityTheta > 1.1,
    recentMistakeCount: recentMistakes.length,
  };
}

export function getLessonAdaptiveContext(profile, lesson) {
  const items = getQuizItems(lesson);
  const topicKey = topicKeyForLesson(lesson);
  const mastery = profile?.topicMastery?.find((m) => m.topicKey === topicKey);
  const target = profile?.targetDifficulty || "easy";
  const lessonRank = { easy: 0, medium: 1, hard: 2 }[lesson.difficulty] ?? 1;
  const targetRank = { easy: 0, medium: 1, hard: 2 }[target] ?? 0;
  const adjustment =
    lessonRank > targetRank + 1
      ? "challenging"
      : lessonRank < targetRank - 1
        ? "review"
        : "optimal";

  return {
    targetDifficulty: target,
    abilityTheta: profile?.abilityTheta ?? 0,
    topicMastery: mastery?.theta ?? 0,
    difficultyAdjustment: adjustment,
    predictedQuizScore: expectedQuizPercent(profile?.abilityTheta ?? 0, items),
    perItemDifficulty: items.map((it) => ({
      index: it.index,
      difficulty: it.b,
      passProbability: Math.round(
        probabilityCorrect(profile?.abilityTheta ?? 0, it.b, it.a) * 100
      ),
    })),
  };
}
