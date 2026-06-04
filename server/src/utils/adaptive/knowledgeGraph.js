/**
 * Knowledge Graph - Concept Relationships and Prerequisite System
 */

import KnowledgeGraph from "../../models/KnowledgeGraph.js";

/**
 * Check if a topic's prerequisites are mastered
 */
export async function checkPrerequisiteMastery(userId, topicKey, profile) {
  const topic = await KnowledgeGraph.findOne({ topicKey });
  if (!topic || !topic.prerequisites || topic.prerequisites.length === 0) {
    return { allMet: true, missing: [] };
  }

  const missing = [];
  const masteryMap = new Map(
    (profile.topicMastery || []).map((m) => [m.topicKey, m])
  );

  for (const prereq of topic.prerequisites) {
    const mastery = masteryMap.get(prereq);
    if (!mastery || mastery.masteryScore < 50) {
      missing.push({
        topicKey: prereq,
        currentMastery: mastery?.masteryScore || 0,
        required: 50,
      });
    }
  }

  return {
    allMet: missing.length === 0,
    missing,
  };
}

/**
 * Get topics that depend on a given topic
 */
export async function getDependentTopics(topicKey) {
  const topic = await KnowledgeGraph.findOne({ topicKey });
  if (!topic) return [];
  return topic.dependents || [];
}

/**
 * Recommend prerequisite review if mastery is weak
 */
export function recommendPrerequisiteReview(prereqCheck) {
  if (prereqCheck.allMet) return null;

  const recommendations = prereqCheck.missing.map((m) => ({
    topicKey: m.topicKey,
    reason: `Prerequisite mastery is ${m.currentMastery}% (need 50%)`,
    priority: m.currentMastery < 30 ? "high" : "medium",
  }));

  return recommendations;
}

/**
 * Check if a topic should be blocked due to weak prerequisites
 */
export function shouldBlockTopic(prereqCheck) {
  if (prereqCheck.allMet) return false;

  // Block if any prerequisite has very low mastery (<30%)
  const hasCriticalGap = prereqCheck.missing.some((m) => m.currentMastery < 30);
  return hasCriticalGap;
}

/**
 * Explain why a recommendation exists
 */
export function explainRecommendation(topicKey, prereqCheck) {
  if (prereqCheck.allMet) {
    return `You're ready to learn ${topicKey}. All prerequisites are mastered.`;
  }

  const missingTopics = prereqCheck.missing.map((m) => m.topicKey).join(", ");
  return `We recommend reviewing ${missingTopics} before ${topicKey} to ensure you have the foundational knowledge needed.`;
}

/**
 * Get learning path based on knowledge graph
 */
export async function getKnowledgeGraphPath(startTopicKey) {
  const visited = new Set();
  const path = [];

  async function dfs(topicKey) {
    if (visited.has(topicKey)) return;
    visited.add(topicKey);

    const topic = await KnowledgeGraph.findOne({ topicKey });
    if (!topic) return;

    // First, visit prerequisites
    for (const prereq of topic.prerequisites) {
      await dfs(prereq);
    }

    path.push(topic);
  }

  await dfs(startTopicKey);
  return path;
}

/**
 * Get all topics at a given difficulty level
 */
export async function getTopicsByCategory(category) {
  return KnowledgeGraph.find({ category }).sort({ difficulty: 1 });
}

/**
 * Get weak topics that should be reviewed
 */
export function getWeakTopics(profile, threshold = 50) {
  return (profile.topicMastery || [])
    .filter((m) => m.masteryScore < threshold)
    .sort((a, b) => a.masteryScore - b.masteryScore);
}

/**
 * Get strong topics that can be built upon
 */
export function getStrongTopics(profile, threshold = 70) {
  return (profile.topicMastery || [])
    .filter((m) => m.masteryScore >= threshold)
    .sort((a, b) => b.masteryScore - a.masteryScore);
}
