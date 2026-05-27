/**
 * CLI seed — local development only.
 * Use --force to wipe curriculum (NOT users/progress).
 */
import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { bootstrapDatabase } from "./bootstrap.js";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/python_edition";
const force = process.argv.includes("--force");

async function main() {
  await connectDB(uri);
  const report = await bootstrapDatabase({ force });
  console.log("Seed complete:", JSON.stringify(report, null, 2));
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
