import { Router } from "express";
import SavedCode from "../models/SavedCode.js";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { runPython } from "../utils/pythonRunner.js";

const router = Router();
const runLimiter = rateLimit({ windowMs: 60_000, max: 30, keyPrefix: "compiler-run" });

// POST /api/compiler/run — authenticated to limit abuse
router.post(
  "/run",
  protect,
  runLimiter,
  asyncHandler(async (req, res) => {
    const { code, stdin } = req.body;
    if (!code?.trim()) return res.status(400).json({ message: "Code is required" });
    if (code.length > 50_000) return res.status(400).json({ message: "Code exceeds maximum length" });
    const result = await runPython(code, { stdin: stdin || "" });
    res.json(result);
  })
);

router.get(
  "/saved",
  protect,
  asyncHandler(async (req, res) => {
    const snippets = await SavedCode.find({ user: req.user._id }).sort({ updatedAt: -1 }).limit(50);
    res.json({ snippets });
  })
);

router.post(
  "/saved",
  protect,
  asyncHandler(async (req, res) => {
    const { title, code, id } = req.body;
    if (!code?.trim()) return res.status(400).json({ message: "Code is required" });
    if (id) {
      const snippet = await SavedCode.findOneAndUpdate(
        { _id: id, user: req.user._id },
        { title: (title || "Untitled").slice(0, 120), code },
        { new: true }
      );
      if (!snippet) return res.status(404).json({ message: "Snippet not found" });
      return res.json({ snippet });
    }
    const snippet = await SavedCode.create({
      user: req.user._id,
      title: (title || "Untitled").slice(0, 120),
      code,
    });
    res.status(201).json({ snippet });
  })
);

router.delete(
  "/saved/:id",
  protect,
  asyncHandler(async (req, res) => {
    await SavedCode.deleteOne({ _id: req.params.id, user: req.user._id });
    res.json({ message: "Deleted" });
  })
);

export default router;
