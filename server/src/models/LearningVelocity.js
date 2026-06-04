import mongoose from "mongoose";

const learningVelocitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    velocityClass: {
      type: String,
      enum: ["accelerating", "stable", "struggling", "expert"],
      default: "stable",
    },
    improvementRate: { type: Number, default: 0 }, // Theta change per week
    challengeSuccessTrend: [{ type: Number }], // Last 10 challenge success rates
    quizTrend: [{ type: Number }], // Last 10 quiz scores
    retentionTrend: [{ type: Number }], // Last 10 retention estimates
    weeklyVelocity: { type: Number, default: 0 }, // Recent velocity score
    lastCalculated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

learningVelocitySchema.index({ user: 1 });

export default mongoose.model("LearningVelocity", learningVelocitySchema);
