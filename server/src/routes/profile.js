import { Router } from "express";
import User from "../models/User.js";
import Progress from "../models/Progress.js";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { levelFromXp } from "../utils/xp.js";

const router = Router();

function profileResponse(user, stats = {}) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    bio: user.bio,
    socialLinks: user.socialLinks,
    role: user.role,
    selectedTrack: user.selectedTrack,
    xp: user.xp,
    level: user.level,
    levelInfo: levelFromXp(user.xp || 0),
    streak: user.streak,
    badges: user.badges,
    performance: user.performance,
    joinedAt: user.createdAt,
    ...stats,
  };
}

router.get(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const completed = await Progress.countDocuments({ user: req.user._id, completed: true });
    const challengesPassed = await Progress.countDocuments({ user: req.user._id, challengePassed: true });
    res.json({
      profile: profileResponse(req.user, { lessonsCompleted: completed, challengesPassed }),
    });
  })
);

router.get(
  "/:userId",
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId).select(
      "name avatar bio socialLinks xp level streak badges performance createdAt selectedTrack"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    const completed = await Progress.countDocuments({ user: user._id, completed: true });
    res.json({ profile: profileResponse(user, { lessonsCompleted: completed }) });
  })
);

router.patch(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const { name, avatar, bio, socialLinks } = req.body;
    const user = await User.findById(req.user._id);
    if (name) user.name = String(name).trim().slice(0, 80);
    if (avatar !== undefined) user.avatar = String(avatar).slice(0, 2000);
    if (bio !== undefined) user.bio = String(bio).slice(0, 500);
    if (socialLinks) {
      user.socialLinks = {
        github: String(socialLinks.github || "").slice(0, 200),
        linkedin: String(socialLinks.linkedin || "").slice(0, 200),
        website: String(socialLinks.website || "").slice(0, 200),
      };
    }
    await user.save();
    res.json({ profile: profileResponse(user) });
  })
);

export default router;
