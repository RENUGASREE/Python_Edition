import { Router } from "express";
import Leaderboard from "../models/Leaderboard.js";

const router = Router();

router.get("/", async (req, res) => {
  const entries = await Leaderboard.find()
    .populate("user", "name avatar")
    .sort({ points: -1 })
    .limit(50);
  res.json({
    leaderboard: entries.map((e, i) => ({
      rank: i + 1,
      name: e.user?.name || "Anonymous",
      avatar: e.user?.avatar,
      points: e.points,
      challengesSolved: e.challengesSolved,
      lessonsCompleted: e.lessonsCompleted,
    })),
  });
});

export default router;
