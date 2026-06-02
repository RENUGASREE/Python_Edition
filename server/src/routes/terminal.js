import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { rateLimit } from "../middleware/rateLimit.js";
import {
  startInteractiveSession,
  sendInteractiveInput,
  stopInteractiveSession,
} from "../utils/interactiveSession.js";

const router = Router();
const terminalLimiter = rateLimit({ windowMs: 60_000, max: 40, keyPrefix: "terminal" });

router.post(
  "/start",
  protect,
  terminalLimiter,
  asyncHandler(async (req, res) => {
    const { code } = req.body;
    const result = await startInteractiveSession(req.user._id.toString(), code);
    res.json(result);
  })
);

router.post(
  "/input",
  protect,
  terminalLimiter,
  asyncHandler(async (req, res) => {
    const { sessionId, line } = req.body;
    if (!sessionId) return res.status(400).json({ message: "sessionId is required" });
    const result = await sendInteractiveInput(sessionId, req.user._id.toString(), line ?? "");
    res.json(result);
  })
);

router.post(
  "/stop",
  protect,
  asyncHandler(async (req, res) => {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ message: "sessionId is required" });
    const result = stopInteractiveSession(sessionId, req.user._id.toString());
    res.json(result);
  })
);

export default router;
