import { Router } from "express";
import Progress from "../models/Progress.js";
import Lesson from "../models/Lesson.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { levelFromXp } from "../utils/xp.js";

const router = Router();

router.get(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const progress = await Progress.find({ user: req.user._id }).populate("lesson");
    const lessons = await Lesson.find({ isPublished: true });
    const completed = progress.filter((p) => p.completed);
    const totalTime = progress.reduce((s, p) => s + (p.timeSpentMinutes || 0), 0);
    const quizAttempts = progress.filter((p) => p.quizAttempts > 0);
    const avgScore = quizAttempts.reduce((s, p) => s + p.quizScore, 0) / Math.max(quizAttempts.length, 1);

    const byCategory = {};
    for (const cat of ["beginner", "intermediate", "advanced", "projects"]) {
      const catLessons = lessons.filter((l) => l.category === cat);
      const catDone = completed.filter((p) => p.lesson && catLessons.some((l) => l._id.equals(p.lesson._id)));
      byCategory[cat] = {
        total: catLessons.length,
        completed: catDone.length,
        percent: catLessons.length ? Math.round((catDone.length / catLessons.length) * 100) : 0,
      };
    }

    const weeklyActivity = [];
    const challengeWeekly = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
      const dayProgress = progress.filter((p) => p.updatedAt >= d && p.updatedAt < next);
      weeklyActivity.push({
        day: dayLabel,
        lessons: dayProgress.filter((p) => p.completed).length,
        activity: dayProgress.length,
      });
      challengeWeekly.push({
        day: dayLabel,
        passed: dayProgress.filter((p) => p.challengePassed).length,
      });
    }

    const accuracyTrend = progress
      .filter((p) => p.quizAttempts > 0 && p.lesson)
      .sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt))
      .slice(-12)
      .map((p, i) => ({
        index: i + 1,
        title: p.lesson.title?.slice(0, 12) || "Lesson",
        score: p.quizScore,
      }));

    const heatmap = [];
    for (let i = 27; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const count = progress.filter((p) => p.updatedAt >= d && p.updatedAt < next).length;
      heatmap.push({ date: d.toISOString().slice(0, 10), count });
    }

    const topicTime = {};
    for (const p of progress) {
      if (!p.lesson) continue;
      const cat = p.lesson.category || "other";
      topicTime[cat] = (topicTime[cat] || 0) + (p.timeSpentMinutes || 0);
    }

    const user = await User.findById(req.user._id);
    const levelInfo = levelFromXp(user.xp || 0);

    res.json({
      stats: {
        lessonsCompleted: completed.length,
        totalLessons: lessons.length,
        accuracy: Math.round(avgScore),
        timeSpentMinutes: totalTime,
        streak: user.streak,
        xp: user.xp,
        level: user.level,
        challengesPassed: progress.filter((p) => p.challengePassed).length,
        quizzesTaken: quizAttempts.length,
      },
      levelInfo,
      byCategory,
      weeklyActivity,
      challengeWeekly,
      accuracyTrend,
      heatmap,
      topicTime: Object.entries(topicTime).map(([topic, minutes]) => ({ topic, minutes })),
      xpGrowth: [{ week: "This week", xp: user.xp }],
      recent: progress
        .sort((a, b) => new Date(b.lastAccessedAt) - new Date(a.lastAccessedAt))
        .slice(0, 5),
      badges: user.badges,
    });
  })
);

export default router;
