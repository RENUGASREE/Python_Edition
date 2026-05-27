import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "", maxlength: 500 },
    socialLinks: {
      github: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      website: { type: String, default: "" },
    },
    selectedTrack: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },
    lastActiveDate: { type: Date },
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
    performance: {
      totalQuizzes: { type: Number, default: 0 },
      correctAnswers: { type: Number, default: 0 },
      lessonsCompleted: { type: Number, default: 0 },
      timeSpentMinutes: { type: Number, default: 0 },
      skillLevel: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
      weakTopics: [String],
      strongTopics: [String],
    },
    badges: [{ name: String, earnedAt: { type: Date, default: Date.now } }],
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    refreshTokenHash: { type: String, select: false },
    refreshTokenExpires: { type: Date, select: false },
    solvedChallenges: [{ type: mongoose.Schema.Types.ObjectId, ref: "Challenge" }],
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("User", userSchema);
