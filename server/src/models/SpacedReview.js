import mongoose from "mongoose";

const spacedReviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true },
    lessonSlug: { type: String, required: true },
    lessonTitle: { type: String, default: "" },
    easeFactor: { type: Number, default: 2.5 },
    intervalDays: { type: Number, default: 1 },
    repetitions: { type: Number, default: 0 },
    nextReviewAt: { type: Date, required: true },
    lastReviewAt: { type: Date },
    lastQuality: { type: Number, default: 0 },
    retentionPrediction: { type: Number, default: 100 },
    confidencePrediction: { type: Number, default: 50 },
    weakTopicAlert: { type: Boolean, default: false },
    reviewPriorityScore: { type: Number, default: 0 },
    historicalRetention: [{ type: Number }],
    forgettingCurve: { type: Number, default: 0.4 },
  },
  { timestamps: true }
);

spacedReviewSchema.index({ user: 1, lesson: 1 }, { unique: true });
spacedReviewSchema.index({ user: 1, nextReviewAt: 1 });

export default mongoose.model("SpacedReview", spacedReviewSchema);
