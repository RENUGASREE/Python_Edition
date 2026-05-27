export interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin";
  avatar?: string;
  bio?: string;
  selectedTrack?: "beginner" | "intermediate" | "advanced";
  xp?: number;
  level?: number;
  streak: number;
  joinedAt?: string;
  performance: {
    totalQuizzes: number;
    correctAnswers: number;
    lessonsCompleted: number;
    timeSpentMinutes: number;
    skillLevel: "beginner" | "intermediate" | "advanced";
    weakTopics: string[];
    strongTopics: string[];
  };
  badges: { name: string; earnedAt: string }[];
  bookmarks: string[];
}

export interface QuizQuestion {
  question: string;
  type?: "mcq" | "output" | "fill";
  options: string[];
  answer: string;
  explanation?: string;
}

export interface CodingChallenge {
  problemStatement: string;
  examples: { input: string; output: string }[];
  constraints: string[];
  hints: string[];
  starterCode: string;
  xpReward: number;
  timeEstimate: string;
  difficultyLabel: string;
  visibleTests?: { input: string; expectedOutput: string }[];
}

export interface LessonRequirements {
  challengePassed: boolean;
  quizPassed: boolean;
  canComplete: boolean;
  quizScore: number;
  quizThreshold: number;
}

export interface Lesson {
  _id: string;
  slug: string;
  title: string;
  category: "beginner" | "intermediate" | "advanced" | "projects";
  order: number;
  difficulty: string;
  estimated_time: string;
  objectives: string[];
  theory: string;
  real_world_example: string;
  syntax: string;
  code_example: string;
  output_example: string;
  common_mistakes: string[];
  tips: string[];
  exercise: string;
  codingChallenge?: CodingChallenge;
  quiz: QuizQuestion[];
  summary: string;
}

export interface LessonMapItem {
  slug: string;
  title: string;
  category: string;
  order: number;
  difficulty: string;
  estimated_time: string;
  unlocked: boolean;
  completed: boolean;
  challengePassed: boolean;
  quizPassed: boolean;
  canComplete: boolean;
  quizScore: number;
}

export interface Project {
  _id: string;
  slug: string;
  title: string;
  difficulty: string;
  description: string;
  objectives: string[];
  starterCode: string;
  hints: string[];
  estimatedHours: number;
  tags: string[];
}

export interface Challenge {
  _id: string;
  title: string;
  category?: string;
  challengeType?: string;
  difficulty: string;
  description: string;
  starterCode: string;
  points: number;
  estimatedMinutes?: number;
}
