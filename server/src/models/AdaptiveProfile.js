import mongoose from "mongoose";

const topicMasterySchema = new mongoose.Schema(
  {
    topicKey: { type: String, required: true },
    theta: { type: Number, default: 0 },
    masteryScore: { type: Number, default: 0 },
    confidenceScore: { type: Number, default: 50 },
    retentionScore: { type: Number, default: 100 },
    practiceCount: { type: Number, default: 0 },
    errorFrequency: { type: Number, default: 0 },
    attempts: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
    lastPracticed: { type: Date, default: Date.now },
    decayFactor: { type: Number, default: 0.95 },
  },
  { _id: false }
);

const adaptiveProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    abilityTheta: { type: Number, default: 0 },
    targetDifficulty: { type: String, enum: ["easy", "medium", "hard"], default: "easy" },
    skillLevel: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
    topicMastery: [topicMasterySchema],
    pathSlugs: [{ type: String }],
    pathReasons: [{ slug: String, reason: String, type: String }],
    pathUpdatedAt: { type: Date },
    totalLearningEvents: { type: Number, default: 0 },
    remediationCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("AdaptiveProfile", adaptiveProfileSchema);
