import mongoose from "mongoose";

const learningStyleSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    styleProfile: {
      theoryOriented: { type: Number, default: 0.5 }, // 0-1
      handsOn: { type: Number, default: 0.5 }, // 0-1
      guided: { type: Number, default: 0.5 }, // 0-1
      visual: { type: Number, default: 0.5 }, // 0-1
      auditory: { type: Number, default: 0.5 }, // 0-1
      reading: { type: Number, default: 0.5 }, // 0-1
    },
    behaviorMetrics: {
      theoryTimeRatio: { type: Number, default: 0.5 }, // Time spent on theory vs practice
      codeTimeRatio: { type: Number, default: 0.5 }, // Time spent coding
      aiUsageFrequency: { type: Number, default: 0 }, // AI interactions per session
      quizAttemptRate: { type: Number, default: 0 }, // Quiz attempts per lesson
      challengeAttemptRate: { type: Number, default: 0 }, // Challenge attempts per lesson
    },
    dominantStyle: {
      type: String,
      enum: ["theory-oriented", "hands-on", "guided", "visual", "auditory", "reading", "balanced"],
      default: "balanced",
    },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

learningStyleSchema.index({ user: 1 });

export default mongoose.model("LearningStyle", learningStyleSchema);
