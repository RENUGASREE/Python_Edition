/**
 * Learning Style Model - Infer and track learning preferences from behavior
 */

import LearningStyle from "../../models/LearningStyle.js";
import LearningEvent from "../../models/LearningEvent.js";
import Progress from "../../models/Progress.js";
import ChatMessage from "../../models/ChatMessage.js";

/**
 * Infer learning style from behavior metrics
 */
export function inferLearningStyle(metrics) {
  const { theoryTimeRatio, codeTimeRatio, aiUsageFrequency, quizAttemptRate, challengeAttemptRate } =
    metrics;

  // Calculate style scores
  const theoryOriented = theoryTimeRatio > 0.6 ? theoryTimeRatio : 1 - theoryTimeRatio;
  const handsOn = codeTimeRatio > 0.6 ? codeTimeRatio : 1 - codeTimeRatio;
  const guided = aiUsageFrequency > 0.5 ? aiUsageFrequency : 1 - aiUsageFrequency;

  // Determine dominant style
  const scores = {
    "theory-oriented": theoryOriented,
    "hands-on": handsOn,
    guided: guided,
  };

  const dominant = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];

  // If no clear preference, mark as balanced
  const maxScore = Math.max(...Object.values(scores));
  const minScore = Math.min(...Object.values(scores));
  const isBalanced = maxScore - minScore < 0.2;

  return {
    styleProfile: {
      theoryOriented: Math.round(theoryOriented * 100) / 100,
      handsOn: Math.round(handsOn * 100) / 100,
      guided: Math.round(guided * 100) / 100,
      visual: 0.5, // Would need eye-tracking or click data
      auditory: 0.5, // Would need audio interaction data
      reading: theoryOriented, // Correlated with theory-oriented
    },
    dominantStyle: isBalanced ? "balanced" : dominant,
  };
}

/**
 * Track behavior metrics from learning events
 */
export async function trackBehaviorMetrics(userId) {
  const events = await LearningEvent.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  const progress = await Progress.find({ user: userId }).lean();
  const chatMessages = await ChatMessage.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  // Calculate theory time vs practice time
  const theoryEvents = events.filter((e) => e.eventType === "lesson_complete").length;
  const practiceEvents =
    events.filter((e) => e.eventType === "challenge_pass" || e.eventType === "quiz_submit").length;
  const totalEvents = theoryEvents + practiceEvents;
  const theoryTimeRatio = totalEvents > 0 ? theoryEvents / totalEvents : 0.5;

  // Calculate code time ratio
  const codeEvents = events.filter(
    (e) => e.eventType === "challenge_pass" || e.eventType === "challenge_fail"
  ).length;
  const codeTimeRatio = totalEvents > 0 ? codeEvents / totalEvents : 0.5;

  // Calculate AI usage frequency
  const aiUsage = chatMessages.length;
  const sessions = Math.max(1, new Set(events.map((e) => e.createdAt.toDateString())).size);
  const aiUsageFrequency = aiUsage / sessions;

  // Calculate quiz attempt rate
  const quizAttempts = events.filter((e) => e.eventType === "quiz_submit").length;
  const quizAttemptRate = progress.length > 0 ? quizAttempts / progress.length : 0;

  // Calculate challenge attempt rate
  const challengeAttempts = events.filter(
    (e) => e.eventType === "challenge_pass" || e.eventType === "challenge_fail"
  ).length;
  const challengeAttemptRate = progress.length > 0 ? challengeAttempts / progress.length : 0;

  return {
    theoryTimeRatio: Math.round(theoryTimeRatio * 100) / 100,
    codeTimeRatio: Math.round(codeTimeRatio * 100) / 100,
    aiUsageFrequency: Math.round(aiUsageFrequency * 100) / 100,
    quizAttemptRate: Math.round(quizAttemptRate * 100) / 100,
    challengeAttemptRate: Math.round(challengeAttemptRate * 100) / 100,
  };
}

/**
 * Update learning style for a user
 */
export async function updateLearningStyle(userId) {
  const metrics = await trackBehaviorMetrics(userId);
  const inferred = inferLearningStyle(metrics);

  const style = await LearningStyle.findOneAndUpdate(
    { user: userId },
    {
      user: userId,
      styleProfile: inferred.styleProfile,
      behaviorMetrics: metrics,
      dominantStyle: inferred.dominantStyle,
      lastUpdated: new Date(),
    },
    { upsert: true, new: true }
  );

  return style;
}

/**
 * Get adaptive recommendations based on learning style
 */
export function getStyleBasedRecommendations(learningStyle) {
  const { dominantStyle, styleProfile } = learningStyle;

  const recommendations = {
    "theory-oriented": {
      content: "Provide detailed theory explanations with examples",
      exercises: "Include conceptual exercises and reading comprehension",
      hints: "Give detailed explanations when hints are requested",
      difficulty: "Start with theory, then apply to practice",
    },
    "hands-on": {
      content: "Focus on code-first approach with minimal theory",
      exercises: "Emphasize coding challenges and practical projects",
      hints: "Give code snippets and practical solutions",
      difficulty: "Jump into coding quickly, learn by doing",
    },
    guided: {
      content: "Provide step-by-step guidance with AI assistance",
      exercises: "Include guided exercises with clear instructions",
      hints: "Offer frequent hints and explanations",
      difficulty: "Progress gradually with support",
    },
    visual: {
      content: "Use diagrams, charts, and visual examples",
      exercises: "Include visual debugging and flowchart exercises",
      hints: "Provide visual explanations and diagrams",
      difficulty: "Use visual aids to explain concepts",
    },
    auditory: {
      content: "Include audio explanations and discussions",
      exercises: "Include verbal explanations and discussions",
      hints: "Provide verbal explanations and analogies",
      difficulty: "Use analogies and verbal explanations",
    },
    reading: {
      content: "Provide comprehensive reading materials",
      exercises: "Include reading comprehension and documentation exercises",
      hints: "Give detailed written explanations",
      difficulty: "Focus on reading and understanding documentation",
    },
    balanced: {
      content: "Provide balanced mix of theory and practice",
      exercises: "Include varied exercise types",
      hints: "Adapt hint style to context",
      difficulty: "Balance theory and practice appropriately",
    },
  };

  return recommendations[dominantStyle] || recommendations.balanced;
}

/**
 * Get style description for UI
 */
export function getStyleDescription(dominantStyle) {
  const descriptions = {
    "theory-oriented":
      "You prefer learning through reading and understanding concepts before applying them.",
    "hands-on": "You learn best by diving into code and solving practical problems.",
    guided: "You benefit from step-by-step guidance and AI assistance while learning.",
    visual: "You understand concepts better through diagrams and visual representations.",
    auditory: "You prefer verbal explanations and discussions to grasp concepts.",
    reading: "You learn effectively through comprehensive reading materials and documentation.",
    balanced: "You have a balanced learning style and adapt well to various teaching methods.",
  };
  return descriptions[dominantStyle] || descriptions.balanced;
}

/**
 * Get style color for UI
 */
export function getStyleColor(dominantStyle) {
  const colors = {
    "theory-oriented": "text-blue-500",
    "hands-on": "text-green-500",
    guided: "text-purple-500",
    visual: "text-pink-500",
    auditory: "text-orange-500",
    reading: "text-indigo-500",
    balanced: "text-gray-500",
  };
  return colors[dominantStyle] || colors.balanced;
}
