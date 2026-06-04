import { Router } from "express";
import Lesson from "../models/Lesson.js";
import Progress from "../models/Progress.js";
import ChatMessage from "../models/ChatMessage.js";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import {
  chatCompletion,
  isLlmEnabled,
  getAiStatus,
  streamChatCompletion,
  probeAiConnection,
} from "../utils/llm.js";
import { getOrCreateProfile } from "../utils/adaptive/engine.js";
import LearningVelocity from "../models/LearningVelocity.js";
import LearningStyle from "../models/LearningStyle.js";
import { getVelocityDescription } from "../utils/adaptive/learningVelocity.js";
import { getStyleBasedRecommendations } from "../utils/adaptive/learningStyle.js";
import { getWeakTopics } from "../utils/adaptive/knowledgeGraph.js";

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

function buildReply(message, { lesson, mode, user, progress, profile, velocity, learningStyle }) {
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
    const weakTopics = getWeakTopics(profile);
    const weak = weakTopics.slice(0, 3).map((t) => t.topicKey).join(", ") || "recent lessons";
    return `Revision plan: review ${weak}. Re-do quizzes under 70% and redo coding challenges without peeking at solutions.`;
  }

  if (mode === "explain-mistake") {
    return "Please share your code and the error you're getting. I'll analyze the mistake and explain what went wrong and how to fix it.";
  }

  if (mode === "review-code") {
    return "Please share your code and I'll review it for improvements, best practices, and potential issues.";
  }

  if (mode === "generate-practice") {
    return "I'll generate similar practice problems for you. What topic would you like to practice?";
  }

  if (mode === "quiz-me") {
    return "I'll quiz you on the current topic. Ready when you are!";
  }

  if (lower.includes("hint") || lower.includes("stuck")) {
    return buildReply(message, { lesson, mode: "hint", user, progress, profile, velocity, learningStyle });
  }

  for (const [key, text] of Object.entries(KNOWLEDGE)) {
    if (lower.includes(key)) {
      let reply = `**${key}**: ${text}`;
      if (lesson) reply += `\n\nIn *${lesson.title}*, focus on the objectives and try the coding challenge yourself.`;
      return reply;
    }
  }

  if (lesson) {
    const velocityDesc = velocity ? getVelocityDescription(velocity.velocityClass) : "";
    return (
      `You're on **${lesson.title}** (${lesson.difficulty}).\n\n` +
      `${lesson.summary?.slice(0, 250) || ""}\n\n` +
      `Skill: ${user?.performance?.skillLevel || "beginner"}. ${velocityDesc}\n\n` +
      `Ask for a **hint**, **debug** help, **revision** plan, **explain-mistake**, **review-code**, **generate-practice**, or **quiz-me**.`
    );
  }

  return "I'm your Python Edition tutor. Ask about a concept, or open a lesson. Modes: tutor, hint, debug, revision, explain-mistake, review-code, generate-practice, quiz-me.";
}

router.get(
  "/status",
  protect,
  asyncHandler(async (req, res) => {
    const status = getAiStatus();
    if (status.enabled && req.query.probe !== "0") {
      status.probe = await probeAiConnection();
    }
    res.json(status);
  })
);

async function buildMessages(req, { message, lessonSlug, mode }) {
  let lesson = null;
  let progress = null;
  if (lessonSlug) {
    lesson = await Lesson.findOne({ slug: lessonSlug }).select(
      "title difficulty summary objectives tips codingChallenge"
    );
    progress = await Progress.findOne({ user: req.user._id, lesson: lesson?._id });
  }

  const history = await ChatMessage.find({ user: req.user._id, lessonSlug: lessonSlug || null })
    .sort({ createdAt: -1 })
    .limit(12);

  // Get adaptive context
  const profile = await getOrCreateProfile(req.user._id);
  const velocity = await LearningVelocity.findOne({ user: req.user._id });
  const learningStyle = await LearningStyle.findOne({ user: req.user._id });

  // Adaptive behavior based on user level
  const skillLevel = profile.skillLevel || "beginner";
  const velocityClass = velocity?.velocityClass || "stable";
  
  let behaviorInstructions = "";
  if (velocityClass === "struggling" || skillLevel === "beginner") {
    behaviorInstructions = "Provide detailed explanations with step-by-step guidance. Use simple language and extra examples. Be patient and encouraging.";
  } else if (velocityClass === "expert" || skillLevel === "advanced") {
    behaviorInstructions = "Be concise and direct. Focus on advanced concepts and challenge-oriented coaching. Assume strong foundational knowledge.";
  } else if (velocityClass === "accelerating") {
    behaviorInstructions = "Provide balanced explanations with targeted hints. Challenge the user slightly to accelerate learning.";
  } else {
    behaviorInstructions = "Provide balanced explanations appropriate for intermediate level. Mix guidance with independence.";
  }

  // Learning style adaptations
  let styleInstructions = "";
  if (learningStyle) {
    const styleRecs = getStyleBasedRecommendations(learningStyle);
    if (learningStyle.dominantStyle === "hands-on") {
      styleInstructions = "Focus on code examples and practical applications. Minimize theory.";
    } else if (learningStyle.dominantStyle === "theory-oriented") {
      styleInstructions = "Provide thorough theoretical explanations before showing code.";
    } else if (learningStyle.dominantStyle === "guided") {
      styleInstructions = "Offer step-by-step guidance and frequent check-ins.";
    }
  }

  const system = [
    "You are Python Edition's AI tutor.",
    "Be concise, kind, and accurate.",
    behaviorInstructions,
    styleInstructions,
    "Prefer guiding questions and small steps over full solutions.",
    "If mode is 'hint', give a minimal hint (no full solution).",
    "If mode is 'debug', explain the likely error cause and propose 2-4 concrete fixes.",
    "If mode is 'revision', give a short plan: what to review + 2 practice actions.",
    "If mode is 'explain-mistake', analyze the specific error and explain the root cause.",
    "If mode is 'review-code', review for best practices, improvements, and potential issues.",
    "If mode is 'generate-practice', create similar practice problems for the topic.",
    "If mode is 'quiz-me', generate a quiz question on the current topic.",
    "When code is provided, review it and point out mistakes or improvements.",
    "Use markdown. Use fenced code blocks for Python examples.",
  ].join(" ");

  const contextLines = [];
  if (lesson) {
    contextLines.push(`Lesson: ${lesson.title} (${lesson.difficulty}).`);
    if (lesson.summary) contextLines.push(`Summary: ${lesson.summary}`);
    if (lesson.objectives?.length) contextLines.push(`Objectives: ${lesson.objectives.join(" | ")}`);
    if (lesson.codingChallenge?.problemStatement)
      contextLines.push(`Challenge: ${lesson.codingChallenge.problemStatement}`);
  }
  if (progress) {
    contextLines.push(`Progress: challengePassed=${!!progress.challengePassed}, quizPassed=${!!progress.quizPassed}.`);
  }
  contextLines.push(`User skill: ${skillLevel}.`);
  contextLines.push(`Velocity class: ${velocityClass}.`);
  contextLines.push(`Mode: ${mode}.`);

  // Enhanced adaptive context
  contextLines.push(
    `Adaptive engine: ability θ=${profile.abilityTheta.toFixed(2)}, target difficulty=${profile.targetDifficulty}, ` +
      `remediation events=${profile.remediationCount || 0}.`
  );
  
  if (profile.topicMastery?.length) {
    const weak = getWeakTopics(profile).slice(0, 5).map((t) => `${t.topicKey}(${t.masteryScore}%)`);
    if (weak.length) contextLines.push(`Weak topics: ${weak.join(", ")}.`);
    
    const strong = profile.topicMastery
      .filter((t) => t.masteryScore >= 70)
      .slice(0, 5)
      .map((t) => `${t.topicKey}(${t.masteryScore}%)`);
    if (strong.length) contextLines.push(`Strong topics: ${strong.join(", ")}.`);
  }

  if (learningStyle) {
    contextLines.push(`Learning style: ${learningStyle.dominantStyle}.`);
    contextLines.push(`Style profile: theory=${learningStyle.styleProfile.theoryOriented}, hands-on=${learningStyle.styleProfile.handsOn}, guided=${learningStyle.styleProfile.guided}.`);
  }

  const messages = [
    { role: "system", content: system },
    { role: "system", content: contextLines.join("\n") },
    ...history
      .reverse()
      .map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
    { role: "user", content: message },
  ];

  return { messages, lesson, progress, lessonSlug, mode, profile, velocity, learningStyle };
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
    const ctx = await buildMessages(req, { message, lessonSlug, mode });
    const { lesson, progress, profile, velocity, learningStyle } = ctx;

    let reply = "";
    let provider = "offline";
    let model = null;

    if (isLlmEnabled()) {
      try {
        const out = await chatCompletion({ messages: ctx.messages });
        reply = out.text?.trim() || "";
        provider = out.provider;
        model = out.model;
      } catch (e) {
        console.warn("[ai] LLM failed, using offline tutor:", e.message);
        reply = "";
      }
    }

    if (!reply) {
      reply = buildReply(message, { lesson, mode, user: req.user, progress, profile, velocity, learningStyle });
    }

    await ChatMessage.create({ user: req.user._id, role: "user", content: message, mode, lessonSlug });
    await ChatMessage.create({ user: req.user._id, role: "assistant", content: reply, mode, lessonSlug });

    res.json({
      reply,
      lessonTitle: lesson?.title,
      mode,
      provider,
      model,
      aiEnabled: isLlmEnabled(),
      timestamp: new Date().toISOString(),
    });
  })
);

router.post(
  "/chat/stream",
  protect,
  asyncHandler(async (req, res) => {
    const { message, lessonSlug, mode = "tutor" } = req.body;
    const ctx = await buildMessages(req, { message, lessonSlug, mode });
    const { lesson, progress, profile, velocity, learningStyle } = ctx;

    await ChatMessage.create({ user: req.user._id, role: "user", content: message, mode, lessonSlug });

    if (!isLlmEnabled()) {
      const reply = buildReply(message, { lesson, mode, user: req.user, progress, profile, velocity, learningStyle });
      await ChatMessage.create({ user: req.user._id, role: "assistant", content: reply, mode, lessonSlug });
      res.setHeader("Content-Type", "text/event-stream");
      res.write(`event: meta\ndata: ${JSON.stringify({ provider: "offline", model: null })}\n\n`);
      res.write(`event: token\ndata: ${JSON.stringify({ text: reply })}\n\n`);
      res.write(`event: done\ndata: ${JSON.stringify({ text: reply })}\n\n`);
      return res.end();
    }

    try {
      const out = await streamChatCompletion({ messages: ctx.messages, res });
      const text = out?.text?.trim() || "";
      if (text) {
        await ChatMessage.create({ user: req.user._id, role: "assistant", content: text, mode, lessonSlug });
      }
    } catch (e) {
      if (!res.headersSent) {
        const reply = buildReply(message, { lesson, mode, user: req.user, progress, profile, velocity, learningStyle });
        await ChatMessage.create({ user: req.user._id, role: "assistant", content: reply, mode, lessonSlug });
        res.setHeader("Content-Type", "text/event-stream");
        res.write(`event: meta\ndata: ${JSON.stringify({ provider: "offline", model: null })}\n\n`);
        res.write(`event: token\ndata: ${JSON.stringify({ text: reply })}\n\n`);
        res.write(`event: done\ndata: ${JSON.stringify({ text: reply })}\n\n`);
        res.end();
      }
    }
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
