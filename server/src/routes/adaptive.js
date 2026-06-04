import { Router } from "express";
import Lesson from "../models/Lesson.js";
import Progress from "../models/Progress.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { getAdaptivePlan, getOrCreateProfile } from "../utils/adaptive/engine.js";
import SpacedReview from "../models/SpacedReview.js";
import { updateLearningVelocity } from "../utils/adaptive/learningVelocity.js";
import { updateLearningStyle } from "../utils/adaptive/learningStyle.js";
import { generateAdaptiveLesson } from "../utils/adaptive/lessonGenerator.js";
import { categorizeReviews } from "../utils/adaptive/advancedSpacedRepetition.js";
import LearningVelocity from "../models/LearningVelocity.js";
import LearningStyle from "../models/LearningStyle.js";
import KnowledgeGraph from "../models/KnowledgeGraph.js";
import { checkPrerequisiteMastery, getWeakTopics, getStrongTopics } from "../utils/adaptive/knowledgeGraph.js";

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

router.get(
  "/velocity",
  protect,
  asyncHandler(async (req, res) => {
    const velocity = await updateLearningVelocity(req.user._id);
    res.json(velocity);
  })
);

router.get(
  "/learning-style",
  protect,
  asyncHandler(async (req, res) => {
    const style = await updateLearningStyle(req.user._id);
    res.json(style);
  })
);

router.get(
  "/knowledge-graph",
  protect,
  asyncHandler(async (req, res) => {
    const topics = await KnowledgeGraph.find({}).sort({ category: 1, difficulty: 1 });
    res.json(topics);
  })
);

router.get(
  "/mastery-map",
  protect,
  asyncHandler(async (req, res) => {
    const profile = await getOrCreateProfile(req.user._id);
    const weakTopics = getWeakTopics(profile);
    const strongTopics = getStrongTopics(profile);
    res.json({
      topicMastery: profile.topicMastery,
      weakTopics,
      strongTopics,
    });
  })
);

router.get(
  "/review-center",
  protect,
  asyncHandler(async (req, res) => {
    const reviews = await SpacedReview.find({ user: req.user._id }).sort({ nextReviewAt: 1 });
    const categorized = categorizeReviews(reviews);
    res.json(categorized);
  })
);

router.post(
  "/generate-lesson",
  protect,
  asyncHandler(async (req, res) => {
    const { lessonSlug } = req.body;
    const lesson = await Lesson.findOne({ slug: lessonSlug });
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    const profile = await getOrCreateProfile(req.user._id);
    const velocity = await LearningVelocity.findOne({ user: req.user._id });
    const learningStyle = await LearningStyle.findOne({ user: req.user._id });

    const adaptiveContent = generateAdaptiveLesson(lesson, profile, learningStyle, velocity);
    res.json(adaptiveContent);
  })
);

export default router;
