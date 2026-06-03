import { Router } from "express";
import Lesson from "../models/Lesson.js";
import Progress from "../models/Progress.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { getAdaptivePlan, getOrCreateProfile } from "../utils/adaptive/engine.js";
import SpacedReview from "../models/SpacedReview.js";

const router = Router();

router.get(
  "/plan",
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const lessons = await Lesson.find({ isPublished: true });
    const progress = await Progress.find({ user: req.user._id });

    const plan = await getAdaptivePlan(req.user._id, {
      lessons,
      progressRecords: progress,
      user,
    });

    if (plan.profile?.skillLevel && user.performance.skillLevel !== plan.profile.skillLevel) {
      user.performance.skillLevel = plan.profile.skillLevel;
      await user.save();
    }

    res.json(plan);
  })
);

router.get(
  "/profile",
  protect,
  asyncHandler(async (req, res) => {
    const profile = await getOrCreateProfile(req.user._id);
    const dueCount = await SpacedReview.countDocuments({
      user: req.user._id,
      nextReviewAt: { $lte: new Date() },
    });
    res.json({
      abilityTheta: profile.abilityTheta,
      targetDifficulty: profile.targetDifficulty,
      skillLevel: profile.skillLevel,
      topicMastery: profile.topicMastery,
      pathUpdatedAt: profile.pathUpdatedAt,
      reviewsDue: dueCount,
    });
  })
);

export default router;
