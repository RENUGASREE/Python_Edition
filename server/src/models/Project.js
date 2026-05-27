import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    difficulty: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
    description: String,
    objectives: [String],
    starterCode: String,
    hints: [String],
    solutionOutline: String,
    estimatedHours: { type: Number, default: 2 },
    tags: [String],
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
