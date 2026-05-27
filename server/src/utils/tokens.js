import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

export function signAccessToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  });
}

/** Returns compound refresh token: userId.randomHex */
export async function issueRefreshToken(user) {
  const raw = crypto.randomBytes(48).toString("hex");
  user.refreshTokenHash = await bcrypt.hash(raw, 10);
  user.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await user.save();
  return `${user._id}.${raw}`;
}

export async function verifyRefreshToken(user, raw) {
  if (!user?.refreshTokenHash || !user.refreshTokenExpires) return false;
  if (user.refreshTokenExpires < new Date()) return false;
  return bcrypt.compare(raw, user.refreshTokenHash);
}

export async function clearRefreshToken(user) {
  user.refreshTokenHash = undefined;
  user.refreshTokenExpires = undefined;
  await user.save();
}

export async function resolveRefreshToken(compound) {
  if (!compound || !compound.includes(".")) return null;
  const dot = compound.indexOf(".");
  const userId = compound.slice(0, dot);
  const raw = compound.slice(dot + 1);
  const user = await User.findById(userId).select("+refreshTokenHash +refreshTokenExpires");
  if (!user || !(await verifyRefreshToken(user, raw))) return null;
  return user;
}
