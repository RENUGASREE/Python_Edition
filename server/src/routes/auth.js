import { Router } from "express";
import crypto from "crypto";
import User from "../models/User.js";
import Leaderboard from "../models/Leaderboard.js";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { rateLimit } from "../middleware/rateLimit.js";
import {
  signAccessToken,
  issueRefreshToken,
  clearRefreshToken,
  resolveRefreshToken,
} from "../utils/tokens.js";

const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60_000, max: 20, keyPrefix: "auth" });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function userResponse(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    bio: user.bio,
    selectedTrack: user.selectedTrack,
    xp: user.xp,
    level: user.level,
    streak: user.streak,
    performance: user.performance,
    badges: user.badges,
    bookmarks: user.bookmarks,
    joinedAt: user.createdAt,
  };
}

async function issueSession(user, res, status = 200) {
  const dbUser = await User.findById(user._id).select("+refreshTokenHash +refreshTokenExpires");
  const token = signAccessToken(user._id);
  const refreshToken = await issueRefreshToken(dbUser);
  const payload = { token, refreshToken, user: userResponse(user) };
  if (status === 201) res.status(201).json(payload);
  else res.json(payload);
}

router.post(
  "/register",
  authLimiter,
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: "Name, email, and password required" });
    }
    if (!EMAIL_RE.test(email)) return res.status(400).json({ message: "Invalid email format" });
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({ name: name.trim(), email, password });
    await Leaderboard.create({ user: user._id });
    await updateStreak(user);
    await issueSession(user, res, 201);
  })
);

router.post(
  "/login",
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    await updateStreak(user);
    await issueSession(user, res);
  })
);

router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: "Refresh token required" });

    const matched = await resolveRefreshToken(refreshToken);
    if (!matched) return res.status(401).json({ message: "Invalid or expired refresh token" });

    const token = signAccessToken(matched._id);
    const newRefresh = await issueRefreshToken(matched);
    res.json({ token, refreshToken: newRefresh, user: userResponse(matched) });
  })
);

router.post(
  "/logout",
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("+refreshTokenHash +refreshTokenExpires");
    await clearRefreshToken(user);
    res.json({ message: "Logged out" });
  })
);

async function updateStreak(user) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const last = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
  if (last) last.setHours(0, 0, 0, 0);
  const diff = last ? (today - last) / (1000 * 60 * 60 * 24) : null;
  if (diff === 1) user.streak += 1;
  else if (diff !== 0) user.streak = 1;
  user.lastActiveDate = new Date();
  await user.save();
}

router.post(
  "/forgot-password",
  authLimiter,
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email?.toLowerCase() });
    if (!user) {
      return res.json({ message: "If that email exists, a reset link was sent." });
    }
    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();
    res.json({
      message: "If that email exists, a reset link was sent.",
      ...(process.env.ALLOW_RESET_TOKEN_RESPONSE === "true" ? { resetToken: token } : {}),
    });
  })
);

router.post(
  "/reset-password",
  authLimiter,
  asyncHandler(async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: "Token and password required" });
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+password");
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: "Password updated successfully" });
  })
);

router.get("/me", protect, asyncHandler(async (req, res) => {
  res.json({ user: userResponse(req.user) });
}));

router.patch(
  "/profile",
  protect,
  asyncHandler(async (req, res) => {
    const { name, avatar } = req.body;
    if (name) req.user.name = String(name).trim().slice(0, 80);
    if (avatar !== undefined) req.user.avatar = String(avatar).slice(0, 500);
    await req.user.save();
    res.json({ user: userResponse(req.user) });
  })
);

export default router;
