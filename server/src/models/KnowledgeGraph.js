import mongoose from "mongoose";

const knowledgeGraphSchema = new mongoose.Schema(
  {
    topicKey: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    category: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "projects"],
      required: true,
    },
    prerequisites: [{ type: String }], // Array of topicKeys
    dependents: [{ type: String }], // Topics that depend on this
    difficulty: { type: Number, default: 0.5 }, // 0-1
    description: { type: String, default: "" },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

knowledgeGraphSchema.index({ topicKey: 1 });
knowledgeGraphSchema.index({ category: 1 });

export default mongoose.model("KnowledgeGraph", knowledgeGraphSchema);
