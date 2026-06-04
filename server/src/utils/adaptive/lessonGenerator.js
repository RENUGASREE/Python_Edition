/**
 * Adaptive Lesson Generation
 * Generate personalized content based on user mastery, learning style, and velocity
 */

import { getMasteryLevel, needsReview } from "./masteryEngine.js";
import { getStyleBasedRecommendations } from "./learningStyle.js";
import { getVelocityDescription } from "./learningVelocity.js";

/**
 * Generate simpler explanations for struggling users
 */
export function generateSimplerExplanation(concept, currentExplanation, masteryScore) {
  if (masteryScore >= 50) return currentExplanation;

  const simplifications = {
    variables: "Variables are like labeled boxes where you store data. You can put different types of data in these boxes and give them names to use later.",
    "data-types":
      "Data types tell Python what kind of data is in a variable. Think of it like labeling a box as 'for numbers only' or 'for text only'.",
    operators: "Operators are symbols that perform actions on data, like + for addition or == for comparison.",
    conditions:
      "Conditions let your code make decisions. Like 'if it's raining, take an umbrella'. The code checks if something is true and acts accordingly.",
    loops:
      "Loops let you repeat actions multiple times. Instead of writing the same code 10 times, you write it once and tell Python to repeat it.",
    functions:
      "Functions are reusable blocks of code. Like a recipe - you write it once, then you can use it whenever you need that dish.",
    strings: "Strings are text data in Python. They're always enclosed in quotes, like 'Hello World'.",
    lists: "Lists are collections of items in order. Like a shopping list - you can add, remove, or access items by their position.",
    dictionaries:
      "Dictionaries store data in key-value pairs. Like a real dictionary where you look up a word (key) to find its definition (value).",
  };

  return simplifications[concept.toLowerCase()] || currentExplanation;
}

/**
 * Generate extra examples for weak topics
 */
export function generateExtraExamples(topic, masteryScore) {
  if (masteryScore >= 60) return [];

  const examples = {
    variables: [
      "Example: age = 25 stores the number 25 in a variable named 'age'",
      "Example: name = 'Alice' stores text in a variable named 'name'",
    ],
    "data-types": [
      "Example: 42 is an integer (whole number)",
      "Example: 3.14 is a float (decimal number)",
      "Example: 'Hello' is a string (text)",
    ],
    operators: [
      "Example: 5 + 3 = 8 (addition)",
      "Example: 10 > 5 is True (comparison)",
      "Example: x = 5 assigns 5 to x (assignment)",
    ],
    conditions: [
      "Example: if age >= 18: print('You can vote')",
      "Example: if score > 90: grade = 'A'",
    ],
    loops: [
      "Example: for i in range(5): print(i) prints 0,1,2,3,4",
      "Example: while x < 10: x += 1 increases x until it reaches 10",
    ],
    functions: [
      "Example: def greet(name): return f'Hello {name}!'",
      "Example: def add(a, b): return a + b",
    ],
  };

  return examples[topic.toLowerCase()] || [];
}

/**
 * Generate additional practice for low retention
 */
export function generateAdditionalPractice(topic, retentionScore) {
  if (retentionScore >= 70) return [];

  const practice = {
    variables: [
      "Create 3 variables with different data types",
      "Print the value of a variable",
      "Update a variable's value",
    ],
    "data-types": [
      "Convert an integer to a string",
      "Check the type of a variable",
      "Create variables with int, float, and string types",
    ],
    operators: [
      "Use arithmetic operators (+, -, *, /)",
      "Use comparison operators (>, <, ==)",
      "Use logical operators (and, or, not)",
    ],
    conditions: [
      "Write an if-else statement",
      "Use nested conditions",
      "Check multiple conditions with elif",
    ],
    loops: [
      "Write a for loop with range()",
      "Write a while loop",
      "Loop through a list",
    ],
    functions: [
      "Write a function with parameters",
      "Write a function that returns a value",
      "Call a function multiple times",
    ],
  };

  return practice[topic.toLowerCase()] || [];
}

/**
 * Generate harder exercises for advanced users
 */
export function generateHarderExercises(topic, masteryScore) {
  if (masteryScore < 80) return [];

  const advanced = {
    variables: [
      "Use variable unpacking with multiple assignment",
      "Use global and local variables correctly",
      "Implement variable scope with nested functions",
    ],
    "data-types": [
      "Implement custom type checking",
      "Use type hints for function parameters",
      "Handle type conversion edge cases",
    ],
    operators: [
      "Implement operator overloading in a class",
      "Use bitwise operators for optimization",
      "Chain comparison operators (a < b < c)",
    ],
    conditions: [
      "Implement complex boolean logic",
      "Use ternary expressions for concise conditions",
      "Handle edge cases in conditional logic",
    ],
    loops: [
      "Use list comprehensions instead of loops",
      "Implement nested loops efficiently",
      "Use break, continue, and else in loops",
    ],
    functions: [
      "Use lambda functions for short operations",
      "Implement function decorators",
      "Use *args and **kwargs for flexible arguments",
    ],
  };

  return advanced[topic.toLowerCase()] || [];
}

/**
 * Generate challenge-first approach for experts
 */
export function generateChallengeFirstApproach(lesson, masteryScore) {
  if (masteryScore < 85) return null;

  return {
    approach: "challenge-first",
    description: "Start with the coding challenge to test your understanding, then review theory if needed.",
    challenge: lesson.codingChallenge?.problemStatement || "Complete the coding challenge first.",
    theoryAfter: "Review the theory after attempting the challenge to reinforce your understanding.",
  };
}

/**
 * Adjust hint frequency based on learning style
 */
export function adjustHintFrequency(learningStyle, baseHints) {
  const { dominantStyle } = learningStyle;

  const hintAdjustments = {
    "theory-oriented": { frequency: "low", reason: "You prefer understanding concepts independently." },
    "hands-on": { frequency: "medium", reason: "You learn by doing, hints when stuck." },
    guided: { frequency: "high", reason: "You benefit from step-by-step guidance." },
    visual: { frequency: "medium", reason: "Visual hints help your learning style." },
    auditory: { frequency: "medium", reason: "Verbal explanations support your learning." },
    reading: { frequency: "low", reason: "You prefer reading through materials." },
    balanced: { frequency: "medium", reason: "Balanced hint approach for your style." },
  };

  const adjustment = hintAdjustments[dominantStyle] || hintAdjustments.balanced;

  return {
    ...baseHints,
    frequency: adjustment.frequency,
    reason: adjustment.reason,
  };
}

/**
 * Generate adaptive lesson content
 */
export function generateAdaptiveLesson(lesson, profile, learningStyle, velocity) {
  const topicKey = lesson.slug || lesson.title;
  const masteryEntry = profile.topicMastery?.find((m) => m.topicKey === topicKey);
  const masteryScore = masteryEntry?.masteryScore || 0;
  const retentionScore = masteryEntry?.retentionScore || 100;
  const velocityClass = velocity?.velocityClass || "stable";

  const adaptiveContent = {
    originalLesson: lesson,
    adaptations: [],
  };

  // Simpler explanations for struggling users
  if (masteryScore < 50) {
    const simplerExplanation = generateSimplerExplanation(topicKey, lesson.theory || "", masteryScore);
    adaptiveContent.theory = simplerExplanation;
    adaptiveContent.adaptations.push({
      type: "simplified-theory",
      reason: "Mastery below 50% - using simplified explanations",
    });
  } else {
    adaptiveContent.theory = lesson.theory;
  }

  // Extra examples for weak topics
  if (masteryScore < 60) {
    const extraExamples = generateExtraExamples(topicKey, masteryScore);
    if (extraExamples.length > 0) {
      adaptiveContent.extraExamples = extraExamples;
      adaptiveContent.adaptations.push({
        type: "extra-examples",
        reason: "Mastery below 60% - added extra examples",
      });
    }
  }

  // Additional practice for low retention
  if (retentionScore < 70) {
    const additionalPractice = generateAdditionalPractice(topicKey, retentionScore);
    if (additionalPractice.length > 0) {
      adaptiveContent.additionalPractice = additionalPractice;
      adaptiveContent.adaptations.push({
        type: "additional-practice",
        reason: `Retention at ${retentionScore}% - added practice exercises`,
      });
    }
  }

  // Harder exercises for advanced users
  if (masteryScore >= 80) {
    const harderExercises = generateHarderExercises(topicKey, masteryScore);
    if (harderExercises.length > 0) {
      adaptiveContent.advancedExercises = harderExercises;
      adaptiveContent.adaptations.push({
        type: "advanced-exercises",
        reason: "Mastery above 80% - added advanced challenges",
      });
    }
  }

  // Challenge-first for experts
  if (velocityClass === "expert" || masteryScore >= 85) {
    const challengeFirst = generateChallengeFirstApproach(lesson, masteryScore);
    if (challengeFirst) {
      adaptiveContent.approach = challengeFirst;
      adaptiveContent.adaptations.push({
        type: "challenge-first",
        reason: "Expert level - challenge-first approach",
      });
    }
  }

  // Adjust hints based on learning style
  if (learningStyle) {
    const adjustedHints = adjustHintFrequency(learningStyle, lesson.codingChallenge?.hints || []);
    adaptiveContent.adaptiveHints = adjustedHints;
    adaptiveContent.adaptations.push({
      type: "adaptive-hints",
      reason: adjustedHints.reason,
    });
  }

  // Add style-based recommendations
  if (learningStyle) {
    const styleRecommendations = getStyleBasedRecommendations(learningStyle);
    adaptiveContent.styleRecommendations = styleRecommendations;
  }

  return adaptiveContent;
}

/**
 * Get adaptive difficulty adjustment
 */
export function getAdaptiveDifficultyAdjustment(profile, lessonDifficulty) {
  const theta = profile.abilityTheta || 0;
  const targetDifficulty = profile.targetDifficulty || "easy";

  const difficultyRank = { easy: 0, medium: 1, hard: 2 };
  const lessonRank = difficultyRank[lessonDifficulty] || 1;
  const targetRank = difficultyRank[targetDifficulty] || 0;

  // If lesson is much harder than target, suggest easier
  if (lessonRank > targetRank + 1) {
    return {
      adjustment: "easier",
      reason: `Current ability (${theta.toFixed(2)}) suggests starting with ${targetDifficulty} content`,
      suggestedDifficulty: targetDifficulty,
    };
  }

  // If lesson is much easier than target, suggest harder
  if (lessonRank < targetRank - 1 && theta > 0.5) {
    return {
      adjustment: "harder",
      reason: `Current ability (${theta.toFixed(2)}) suggests you're ready for harder content`,
      suggestedDifficulty: targetDifficulty,
    };
  }

  return {
    adjustment: "optimal",
    reason: "Lesson difficulty matches your current ability",
    suggestedDifficulty: lessonDifficulty,
  };
}
