import mongoose from "mongoose";

const challengeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    challengeType: { type: String, default: "general" },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "easy" },
    estimatedMinutes: { type: Number, default: 15 },
    description: String,
    starterCode: { type: String, default: "# Write your solution here\n" },
    hints: [{ type: String }],
    testCases: [
      {
        input: { type: String, default: "" },
        expectedOutput: { type: String, default: "" },
        hidden: { type: Boolean, default: false },
      },
    ],
    points: { type: Number, default: 10 },
    daily: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Challenge", challengeSchema);
