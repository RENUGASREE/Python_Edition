import { Router } from "express";
import Lesson from "../models/Lesson.js";
import Progress from "../models/Progress.js";
import ChatMessage from "../models/ChatMessage.js";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

const KNOWLEDGE = {
  variable: "Variables label values in memory. Example: `count = 10`.",
  loop: "Loops repeat work. `for i in range(n):` runs n times.",
  function: "Functions package logic: `def add(a,b): return a+b`.",
  list: "Lists hold ordered items: `nums = [1,2,3]`.",
  dict: "Dicts map keys to values: `data = {'id': 1}`.",
  error: "Use try/except to handle failures gracefully.",
  oop: "Classes model real objects with attributes and methods.",
};

function buildReply(message, { lesson, mode, user, progress }) {
  const lower = (message || "").toLowerCase();

  if (mode === "hint") {
    const hint = lesson?.codingChallenge?.hints?.[0] || lesson?.tips?.[0] || "Break the problem into smaller steps.";
    return `Hint: ${hint}\n\nI won't give the full solution yet — try applying this and run your code.`;
  }

  if (mode === "debug") {
    return (
      "Debug checklist:\n" +
      "1. Read the last line of the error\n" +
      "2. Check indentation and spelling\n" +
      "3. Print variables before the failing line\n" +
      "4. Run visible tests only, then submit\n\n" +
      (progress?.challengePassed ? "Your challenge is already passing — nice work!" : "Paste the error message for more specific help.")
    );
  }

  if (mode === "revision") {
    const weak = user?.performance?.weakTopics?.slice(0, 3).join(", ") || "recent lessons";
    return `Revision plan: review ${weak}. Re-do quizzes under 70% and redo coding challenges without peeking at solutions.`;
  }

  if (lower.includes("hint") || lower.includes("stuck")) {
    return buildReply(message, { lesson, mode: "hint", user, progress });
  }

  for (const [key, text] of Object.entries(KNOWLEDGE)) {
    if (lower.includes(key)) {
      let reply = `**${key}**: ${text}`;
      if (lesson) reply += `\n\nIn *${lesson.title}*, focus on the objectives and try the coding challenge yourself.`;
      return reply;
    }
  }

  if (lesson) {
    return (
      `You're on **${lesson.title}** (${lesson.difficulty}).\n\n` +
      `${lesson.summary?.slice(0, 250) || ""}\n\n` +
      `Ask for a **hint**, **debug** help, or **revision** plan. Skill: ${user?.performance?.skillLevel || "beginner"}.`
    );
  }

  return "I'm your Python Edition tutor. Ask about a concept, or open a lesson. Modes: tutor, hint, debug, revision.";
}

router.get(
  "/history",
  protect,
  asyncHandler(async (req, res) => {
    const messages = await ChatMessage.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ messages: messages.reverse() });
  })
);

router.post(
  "/chat",
  protect,
  asyncHandler(async (req, res) => {
    const { message, lessonSlug, mode = "tutor" } = req.body;
    let lesson = null;
    let progress = null;
    if (lessonSlug) {
      lesson = await Lesson.findOne({ slug: lessonSlug }).select(
        "title difficulty summary objectives tips codingChallenge"
      );
      progress = await Progress.findOne({ user: req.user._id, lesson: lesson?._id });
    }

    const reply = buildReply(message, { lesson, mode, user: req.user, progress });

    await ChatMessage.create({ user: req.user._id, role: "user", content: message, mode, lessonSlug });
    await ChatMessage.create({ user: req.user._id, role: "assistant", content: reply, mode, lessonSlug });

    res.json({ reply, lessonTitle: lesson?.title, mode, timestamp: new Date().toISOString() });
  })
);

router.delete(
  "/history",
  protect,
  asyncHandler(async (req, res) => {
    await ChatMessage.deleteMany({ user: req.user._id });
    res.json({ message: "Chat cleared" });
  })
);

export default router;
