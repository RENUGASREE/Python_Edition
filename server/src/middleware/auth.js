import jwt from "jsonwebtoken";
import User from "../models/User.js";

/** Verify JWT and attach user to request */
export async function protect(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized" });
  }
  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) return res.status(401).json({ message: "User not found" });
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

/** Restrict to admin role */
export function adminOnly(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}
