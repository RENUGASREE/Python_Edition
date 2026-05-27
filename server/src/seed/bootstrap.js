/**
 * Idempotent database bootstrap for production (Render free tier — no shell).
 * - Never wipes user progress
 * - Only inserts missing curriculum
 * - Optional force=true for local dev reset (CLI only)
 */
import Lesson from "../models/Lesson.js";
import Project from "../models/Project.js";
import Challenge from "../models/Challenge.js";
import User from "../models/User.js";
import Leaderboard from "../models/Leaderboard.js";
import { generateAllLessons, PROJECTS } from "./lessonsData.js";
import { EXPANDED_CHALLENGES } from "./challengesExpanded.js";

export async function bootstrapDatabase(options = {}) {
  const { force = false } = options;
  const report = {
    lessons: { before: 0, added: 0, updated: 0 },
    projects: { before: 0, added: 0 },
    challenges: { before: 0, added: 0 },
    admin: { created: false, existed: false },
    force,
  };

  if (force) {
    console.log("[bootstrap] FORCE mode — clearing curriculum only (users/progress preserved)");
    await Promise.all([Lesson.deleteMany({}), Project.deleteMany({}), Challenge.deleteMany({})]);
  }

  report.lessons.before = await Lesson.countDocuments();
  report.projects.before = await Project.countDocuments();
  report.challenges.before = await Challenge.countDocuments();

  // Lessons
  if (report.lessons.before === 0 || force) {
    const lessons = generateAllLessons();
    await Lesson.insertMany(lessons);
    report.lessons.added = lessons.length;
    console.log(`[bootstrap] Inserted ${lessons.length} lessons`);
  } else {
    const catalog = generateAllLessons();
    for (const item of catalog) {
      const existing = await Lesson.findOne({ slug: item.slug });
      if (!existing) {
        await Lesson.create(item);
        report.lessons.added += 1;
      } else if (!existing.codingChallenge?.problemStatement && item.codingChallenge) {
        existing.codingChallenge = item.codingChallenge;
        await existing.save();
        report.lessons.updated += 1;
      }
    }
    if (report.lessons.added || report.lessons.updated) {
      console.log(`[bootstrap] Lessons +${report.lessons.added} new, ${report.lessons.updated} updated`);
    }
  }

  // Projects
  if (report.projects.before === 0 || force) {
    await Project.insertMany(PROJECTS);
    report.projects.added = PROJECTS.length;
    console.log(`[bootstrap] Inserted ${PROJECTS.length} projects`);
  } else {
    for (const p of PROJECTS) {
      const exists = await Project.findOne({ slug: p.slug });
      if (!exists) {
        await Project.create(p);
        report.projects.added += 1;
      }
    }
  }

  // Challenges
  if (report.challenges.before === 0 || force) {
    await Challenge.insertMany(EXPANDED_CHALLENGES);
    report.challenges.added = EXPANDED_CHALLENGES.length;
    console.log(`[bootstrap] Inserted ${EXPANDED_CHALLENGES.length} challenges`);
  } else if (report.challenges.before < EXPANDED_CHALLENGES.length) {
    for (const c of EXPANDED_CHALLENGES) {
      const exists = await Challenge.findOne({ title: c.title, category: c.category });
      if (!exists) {
        await Challenge.create(c);
        report.challenges.added += 1;
      }
    }
    if (report.challenges.added) {
      console.log(`[bootstrap] Challenges +${report.challenges.added} new`);
    }
  }

  // Admin user (never overwrite existing)
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@pythonedition.com").toLowerCase();
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: "Platform Admin",
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || "admin123",
      role: "admin",
    });
    await Leaderboard.findOneAndUpdate({ user: admin._id }, { user: admin._id }, { upsert: true });
    report.admin.created = true;
    console.log(`[bootstrap] Admin created: ${adminEmail}`);
  } else {
    report.admin.existed = true;
    if (admin.role !== "admin") {
      admin.role = "admin";
      await admin.save();
    }
  }

  report.lessons.after = await Lesson.countDocuments();
  report.projects.after = await Project.countDocuments();
  report.challenges.after = await Challenge.countDocuments();

  return report;
}
