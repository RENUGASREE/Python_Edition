import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema(
  {
    input: { type: String, default: "" },
    expectedOutput: { type: String, required: true },
    hidden: { type: Boolean, default: false },
  },
  { _id: false }
);

const codingChallengeSchema = new mongoose.Schema(
  {
    problemStatement: String,
    examples: [{ input: String, output: String }],
    constraints: [String],
    hints: [String],
    starterCode: { type: String, default: "# Write your solution\n" },
    testCases: [testCaseSchema],
    xpReward: { type: Number, default: 25 },
    timeEstimate: { type: String, default: "10 min" },
    difficultyLabel: { type: String, default: "easy" },
  },
  { _id: false }
);

const quizQuestionSchema = new mongoose.Schema(
  {
    question: String,
    type: { type: String, enum: ["mcq", "output", "fill"], default: "mcq" },
    options: [String],
    answer: String,
    explanation: String,
  },
  { _id: false }
);

const lessonSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "projects"],
      required: true,
    },
    order: { type: Number, default: 0 },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "easy" },
    estimated_time: { type: String, default: "15 min" },
    objectives: [String],
    theory: String,
    real_world_example: String,
    syntax: String,
    code_example: String,
    output_example: String,
    common_mistakes: [String],
    tips: [String],
    exercise: String,
    codingChallenge: codingChallengeSchema,
    quiz: [quizQuestionSchema],
    summary: String,
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Lesson", lessonSchema);
