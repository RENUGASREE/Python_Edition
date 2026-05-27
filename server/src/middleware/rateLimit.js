/** Lightweight in-memory rate limiter (per IP + optional key) */
const buckets = new Map();

export function rateLimit({ windowMs = 60_000, max = 60, keyPrefix = "" }) {
  return (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();
    let bucket = buckets.get(key);
    if (!bucket || now > bucket.resetAt) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }
    bucket.count += 1;
    if (bucket.count > max) {
      return res.status(429).json({ message: "Too many requests. Please try again later." });
    }
    next();
  };
}
