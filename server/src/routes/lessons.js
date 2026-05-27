import { Router } from "express";
import Lesson from "../models/Lesson.js";
import Progress from "../models/Progress.js";
import User from "../models/User.js";
import { protect, adminOnly } from "../middleware/auth.js";
import { getRecommendations, computeSkillLevel } from "../utils/adaptive.js";
import {
  buildLessonMap,
  sanitizeChallengeForClient,
  progressMeetsRequirements,
} from "../utils/progression.js";
import { awardXp, QUIZ_PASS_THRESHOLD } from "../utils/xp.js";
import Leaderboard from "../models/Leaderboard.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { runPythonTestCase } from "../utils/pythonRunner.js";

const router = Router();

router.get("/", async (req, res) => {
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.published !== "false") filter.isPublished = true;
  const lessons = await Lesson.find(filter).sort({ category: 1, order: 1 });
  res.json({ lessons, count: lessons.length });
});

router.get("/categories", async (req, res) => {
  const categories = ["beginner", "intermediate", "advanced", "projects"];
  const result = {};
  for (const cat of categories) {
    result[cat] = await Lesson.countDocuments({ category: cat, isPublished: true });
  }
  res.json(result);
});

router.get(
  "/map",
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const lessons = await Lesson.find({ isPublished: true });
    const progress = await Progress.find({ user: user._id });
    const map = buildLessonMap(lessons, progress, user.selectedTrack || "beginner");
    res.json({
      selectedTrack: user.selectedTrack,
      xp: user.xp,
      level: user.level,
      lessons: map,
    });
  })
);

router.post(
  "/select-track",
  protect,
  asyncHandler(async (req, res) => {
    const { track } = req.body;
    if (!["beginner", "intermediate", "advanced"].includes(track)) {
      return res.status(400).json({ message: "Invalid track" });
    }
    const user = await User.findById(req.user._id);
    user.selectedTrack = track;
    await user.save();
    res.json({ selectedTrack: user.selectedTrack });
  })
);

router.get("/adaptive", protect, async (req, res) => {
  const lessons = await Lesson.find({ isPublished: true });
  const progress = await Progress.find({ user: req.user._id }).populate("lesson");
  const rec = getRecommendations({ lessons, progress, user: req.user });
  res.json(rec);
});

router.get(
  "/:slug",
  protect,
  asyncHandler(async (req, res) => {
    const lesson = await Lesson.findOne({ slug: req.params.slug, isPublished: true });
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    const user = await User.findById(req.user._id);
    const lessons = await Lesson.find({ isPublished: true });
    const progress = await Progress.find({ user: user._id });
    const map = buildLessonMap(lessons, progress, user.selectedTrack || "beginner");
    const entry = map.find((m) => m.slug === lesson.slug);
    if (entry && !entry.unlocked) {
      return res.status(403).json({ message: "Lesson locked. Complete the previous lesson first." });
    }

    const prog = await Progress.findOne({ user: user._id, lesson: lesson._id });
    const requirements = progressMeetsRequirements(prog);

    const lessonObj = lesson.toObject();
    lessonObj.codingChallenge = sanitizeChallengeForClient(lesson.codingChallenge);

    res.json({
      lesson: lessonObj,
      progress: prog,
      requirements,
      savedCode: prog?.savedCode || lesson.codingChallenge?.starterCode || "",
    });
  })
);

router.post(
  "/:slug/exercise/run",
  protect,
  asyncHandler(async (req, res) => {
    const lesson = await Lesson.findOne({ slug: req.params.slug });
    if (!lesson?.codingChallenge) return res.status(404).json({ message: "No exercise for this lesson" });
    const { code } = req.body;
    if (!code?.trim()) return res.status(400).json({ message: "Code is required" });

    const visible = (lesson.codingChallenge.testCases || []).filter((t) => !t.hidden);
    const results = [];
    for (const tc of visible) {
      const { output, error } = await runPythonTestCase(code, tc.input || "");
      results.push({
        input: tc.input,
        expected: tc.expectedOutput,
        output,
        error,
        passed: !error && output.trim() === (tc.expectedOutput || "").trim(),
      });
    }

    await Progress.findOneAndUpdate(
      { user: req.user._id, lesson: lesson._id },
      { savedCode: code, lastAccessedAt: new Date() },
      { upsert: true }
    );

    res.json({ results, mode: "run" });
  })
);

router.post(
  "/:slug/exercise/submit",
  protect,
  asyncHandler(async (req, res) => {
    const lesson = await Lesson.findOne({ slug: req.params.slug });
    if (!lesson?.codingChallenge) return res.status(404).json({ message: "No exercise for this lesson" });
    const { code } = req.body;
    if (!code?.trim()) return res.status(400).json({ message: "Code is required" });

    const tests = lesson.codingChallenge.testCases || [];
    if (!tests.length) return res.status(400).json({ message: "No test cases configured" });

    let passed = 0;
    const results = [];
    for (const tc of tests) {
      const { output, error } = await runPythonTestCase(code, tc.input || "");
      const ok = !error && output.trim() === (tc.expectedOutput || "").trim();
      if (ok) passed++;
      results.push({
        passed: ok,
        output,
        error,
        hidden: !!tc.hidden,
        expected: tc.hidden ? undefined : tc.expectedOutput,
      });
    }

    const allPassed = passed === tests.length;
    const existing = await Progress.findOne({ user: req.user._id, lesson: lesson._id });
    const wasPassed = !!existing?.challengePassed;

    const progress = await Progress.findOneAndUpdate(
      { user: req.user._id, lesson: lesson._id },
      {
        $inc: { challengeAttempts: 1 },
        savedCode: code,
        challengePassed: allPassed,
        lastAccessedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    let xpAwarded = 0;
    if (allPassed && !wasPassed) {
      const user = await User.findById(req.user._id);
      xpAwarded = lesson.codingChallenge.xpReward || 25;
      awardXp(user, xpAwarded);
      await user.save();
    }

    res.json({
      passed: allPassed,
      results,
      score: passed,
      total: tests.length,
      xpAwarded,
      requirements: progressMeetsRequirements({ ...progress.toObject(), challengePassed: allPassed }),
    });
  })
);

router.post(
  "/:slug/quiz",
  protect,
  asyncHandler(async (req, res) => {
    const lesson = await Lesson.findOne({ slug: req.params.slug });
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    const answers = req.body.answers || [];
    let correct = 0;
    const feedback = lesson.quiz.map((q, i) => {
      const userAns = (answers[i] || "").trim().toLowerCase();
      const right = (q.answer || "").trim().toLowerCase();
      const ok = userAns === right;
      if (ok) correct++;
      return {
        question: q.question,
        correct: ok,
        expected: ok ? undefined : q.answer,
        explanation: q.explanation || (ok ? "Correct!" : "Review the lesson and try again."),
      };
    });

    const score = lesson.quiz.length ? Math.round((correct / lesson.quiz.length) * 100) : 0;
    const quizPassed = score >= QUIZ_PASS_THRESHOLD;

    const progress = await Progress.findOneAndUpdate(
      { user: req.user._id, lesson: lesson._id },
      {
        $inc: { quizAttempts: 1 },
        quizScore: score,
        quizPassed,
        lastAccessedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    const user = await User.findById(req.user._id);
    user.performance.totalQuizzes += lesson.quiz.length;
    user.performance.correctAnswers += correct;
    const acc = user.performance.correctAnswers / Math.max(user.performance.totalQuizzes, 1);
    user.performance.skillLevel = computeSkillLevel(acc, user.performance.lessonsCompleted);
    if (score < 60 && !user.performance.weakTopics.includes(lesson.title)) {
      user.performance.weakTopics.push(lesson.title);
    }
    if (score >= 90 && !user.performance.strongTopics.includes(lesson.title)) {
      user.performance.strongTopics.push(lesson.title);
    }
    await user.save();

    const requirements = progressMeetsRequirements(progress);
    res.json({ score, correct, total: lesson.quiz.length, feedback, progress, requirements });
  })
);

router.post(
  "/:slug/complete",
  protect,
  asyncHandler(async (req, res) => {
    const lesson = await Lesson.findOne({ slug: req.params.slug });
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    const prog = await Progress.findOne({ user: req.user._id, lesson: lesson._id });
    const requirements = progressMeetsRequirements(prog);
    if (!requirements.canComplete) {
      return res.status(400).json({
        message: `Complete the coding challenge and score at least ${QUIZ_PASS_THRESHOLD}% on the quiz first.`,
        requirements,
      });
    }

    const progress = await Progress.findOneAndUpdate(
      { user: req.user._id, lesson: lesson._id },
      {
        completed: true,
        timeSpentMinutes: (prog?.timeSpentMinutes || 0) + (req.body.timeSpentMinutes || 10),
        lastAccessedAt: new Date(),
      },
      { new: true }
    );

    const user = await User.findById(req.user._id);
    const allProgress = await Progress.find({ user: user._id, completed: true });
    user.performance.lessonsCompleted = allProgress.length;
    awardXp(user, 15);
    if (allProgress.length === 1) user.badges.push({ name: "First Steps" });
    if (allProgress.length >= 10 && !user.badges.some((b) => b.name === "Dedicated Learner")) {
      user.badges.push({ name: "Dedicated Learner" });
    }
    await user.save();
    await Leaderboard.findOneAndUpdate(
      { user: user._id },
      { lessonsCompleted: allProgress.length, $inc: { points: 15 } },
      { upsert: true }
    );

    res.json({ progress, badges: user.badges, xp: user.xp, level: user.level, requirements });
  })
);

router.post("/:slug/bookmark", protect, async (req, res) => {
  const lesson = await Lesson.findOne({ slug: req.params.slug });
  if (!lesson) return res.status(404).json({ message: "Lesson not found" });
  const user = await User.findById(req.user._id);
  const idx = user.bookmarks.indexOf(lesson._id);
  if (idx >= 0) user.bookmarks.splice(idx, 1);
  else user.bookmarks.push(lesson._id);
  await user.save();
  res.json({ bookmarked: idx < 0, bookmarks: user.bookmarks });
});

router.post("/", protect, adminOnly, async (req, res) => {
  const lesson = await Lesson.create(req.body);
  res.status(201).json({ lesson });
});

router.put("/:slug", protect, adminOnly, async (req, res) => {
  const lesson = await Lesson.findOneAndUpdate({ slug: req.params.slug }, req.body, { new: true });
  if (!lesson) return res.status(404).json({ message: "Not found" });
  res.json({ lesson });
});

router.delete("/:slug", protect, adminOnly, async (req, res) => {
  await Lesson.deleteOne({ slug: req.params.slug });
  res.json({ message: "Deleted" });
});

export default router;
