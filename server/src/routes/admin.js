import { Router } from "express";
import User from "../models/User.js";
import Lesson from "../models/Lesson.js";
import Progress from "../models/Progress.js";
import { protect, adminOnly } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { bootstrapDatabase } from "../seed/bootstrap.js";

const router = Router();
router.use(protect, adminOnly);

/**
 * POST /api/admin/bootstrap — idempotent seed (no Render shell required).
 * Optional header x-seed-secret must match SEED_SECRET when set in production.
 */
router.post(
  "/bootstrap",
  asyncHandler(async (req, res) => {
    const secret = process.env.SEED_SECRET;
    if (secret && req.headers["x-seed-secret"] !== secret) {
      return res.status(403).json({ message: "Invalid seed secret" });
    }
    const force = req.body?.force === true;
    if (force && process.env.NODE_ENV === "production") {
      return res.status(400).json({
        message: "Force reset is disabled in production. Use local CLI: npm run seed -- --force",
      });
    }
    const report = await bootstrapDatabase({ force });
    res.json({
      message: "Bootstrap completed",
      report,
    });
  })
);

router.get(
  "/analytics",
  asyncHandler(async (req, res) => {
    const [users, lessons, progressCount] = await Promise.all([
      User.countDocuments(),
      Lesson.countDocuments(),
      Progress.countDocuments({ completed: true }),
    ]);
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("name email createdAt role streak");
    const byCategory = await Lesson.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    res.json({ users, lessons, completions: progressCount, recentUsers, byCategory });
  })
);

router.get(
  "/users",
  asyncHandler(async (req, res) => {
    const users = await User.find().select("name email role streak createdAt performance.lessonsCompleted").sort({ createdAt: -1 });
    res.json({ users });
  })
);

// PATCH — allowlisted fields only (no role/password mass assignment)
router.patch(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const allowed = ["name", "avatar", "role"];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (updates.role && !["student", "admin"].includes(updates.role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select(
      "name email role avatar streak"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  })
);

export default router;
