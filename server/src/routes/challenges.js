import { Router } from "express";
import Challenge from "../models/Challenge.js";
import Leaderboard from "../models/Leaderboard.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { runPythonTestCase } from "../utils/pythonRunner.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.daily === "true") filter.daily = true;
    if (req.query.type) filter.challengeType = req.query.type;
    const challenges = await Challenge.find(filter).sort({ category: 1, difficulty: 1, points: 1 });
    res.json({ challenges });
  })
);

router.get(
  "/stats",
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const categories = ["beginner", "intermediate", "advanced"];
    const byCategory = {};
    for (const cat of categories) {
      const total = await Challenge.countDocuments({ category: cat });
      const solved = user.solvedChallenges?.length
        ? await Challenge.countDocuments({
            _id: { $in: user.solvedChallenges },
            category: cat,
          })
        : 0;
      byCategory[cat] = { total, solved, percent: total ? Math.round((solved / total) * 100) : 0 };
    }
    const recent = await Challenge.find({ _id: { $in: user.solvedChallenges || [] } })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select("title category points difficulty");
    res.json({ byCategory, recent, totalSolved: user.solvedChallenges?.length || 0 });
  })
);

router.get(
  "/daily",
  asyncHandler(async (req, res) => {
    let challenge = await Challenge.findOne({ daily: true }).sort({ createdAt: -1 });
    if (!challenge) challenge = await Challenge.findOne().sort({ createdAt: -1 });
    res.json({ challenge });
  })
);

router.post(
  "/:id/submit",
  protect,
  asyncHandler(async (req, res) => {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ message: "Challenge not found" });

    const { code } = req.body;
    if (!code?.trim()) return res.status(400).json({ message: "Code is required" });
    if (!challenge.testCases?.length) return res.status(400).json({ message: "No test cases" });

    let passed = 0;
    const results = [];
    for (const tc of challenge.testCases) {
      const { output, error } = await runPythonTestCase(code, tc.input || "");
      const ok = !error && output.trim() === (tc.expectedOutput || "").trim();
      if (ok) passed++;
      results.push({
        input: tc.hidden ? undefined : tc.input,
        expected: tc.hidden ? undefined : tc.expectedOutput,
        hidden: !!tc.hidden,
        output,
        error,
        passed: ok,
      });
    }

    const allPassed = passed === challenge.testCases.length;
    let pointsAwarded = 0;
    let alreadySolved = false;

    if (allPassed) {
      const user = await User.findById(req.user._id);
      alreadySolved = user.solvedChallenges?.some((id) => id.equals(challenge._id));
      if (!alreadySolved) {
        user.solvedChallenges.push(challenge._id);
        await user.save();
        pointsAwarded = challenge.points;
        await Leaderboard.findOneAndUpdate(
          { user: req.user._id },
          { $inc: { points: challenge.points, challengesSolved: 1 } },
          { upsert: true }
        );
      }
    }

    res.json({
      passed: allPassed,
      results,
      score: passed,
      total: challenge.testCases.length,
      scorePercent: challenge.testCases.length ? Math.round((passed / challenge.testCases.length) * 100) : 0,
      pointsAwarded,
      alreadySolved,
    });
  })
);

export default router;
