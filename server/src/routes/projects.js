import { Router } from "express";
import Project from "../models/Project.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  const filter = req.query.difficulty ? { difficulty: req.query.difficulty } : {};
  const projects = await Project.find(filter).sort({ difficulty: 1 });
  res.json({ projects });
});

router.get("/:slug", async (req, res) => {
  const project = await Project.findOne({ slug: req.params.slug });
  if (!project) return res.status(404).json({ message: "Project not found" });
  res.json({ project });
});

router.post("/", protect, adminOnly, async (req, res) => {
  const project = await Project.create(req.body);
  res.status(201).json({ project });
});

export default router;
