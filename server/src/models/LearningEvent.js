import mongoose from "mongoose";

const learningEventSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
    lessonSlug: { type: String, default: "" },
    lessonTitle: { type: String, default: "" },
    topicKey: { type: String, default: "" },
    eventType: {
      type: String,
      enum: [
        "quiz_item_wrong",
        "quiz_submit",
        "challenge_fail",
        "challenge_pass",
        "lesson_complete",
        "lesson_open",
      ],
      required: true,
    },
    difficulty: { type: String },
    scorePercent: { type: Number },
    itemIndex: { type: Number },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

learningEventSchema.index({ user: 1, createdAt: -1 });
learningEventSchema.index({ user: 1, topicKey: 1, eventType: 1 });

export default mongoose.model("LearningEvent", learningEventSchema);
