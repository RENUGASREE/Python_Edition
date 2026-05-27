import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    mode: { type: String, enum: ["tutor", "hint", "debug", "revision"], default: "tutor" },
    lessonSlug: String,
  },
  { timestamps: true }
);

export default mongoose.model("ChatMessage", chatMessageSchema);
