import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true },
    completed: { type: Boolean, default: false },
    quizScore: { type: Number, default: 0 },
    quizAttempts: { type: Number, default: 0 },
    timeSpentMinutes: { type: Number, default: 0 },
    exerciseSubmitted: { type: Boolean, default: false },
    challengePassed: { type: Boolean, default: false },
    quizPassed: { type: Boolean, default: false },
    savedCode: { type: String, default: "" },
    challengeAttempts: { type: Number, default: 0 },
    lastAccessedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

progressSchema.index({ user: 1, lesson: 1 }, { unique: true });
progressSchema.index({ user: 1, completed: 1 });
progressSchema.index({ user: 1, lastAccessedAt: -1 });

export default mongoose.model("Progress", progressSchema);
