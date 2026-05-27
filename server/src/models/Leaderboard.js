import mongoose from "mongoose";

const leaderboardSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    points: { type: Number, default: 0 },
    challengesSolved: { type: Number, default: 0 },
    lessonsCompleted: { type: Number, default: 0 },
  },
  { timestamps: true }
);

leaderboardSchema.index({ points: -1 });

export default mongoose.model("Leaderboard", leaderboardSchema);
