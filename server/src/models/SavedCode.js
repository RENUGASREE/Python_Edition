import mongoose from "mongoose";

const savedCodeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, default: "Untitled" },
    code: { type: String, required: true },
    language: { type: String, default: "python" },
  },
  { timestamps: true }
);

export default mongoose.model("SavedCode", savedCodeSchema);
