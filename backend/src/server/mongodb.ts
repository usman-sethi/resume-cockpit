import mongoose, { Schema } from "mongoose";
import { v2 as cloudinary } from "cloudinary";

// Configure MongoDB connection URI with fallback from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  if (!MONGODB_URI) {
    console.error("Error: MONGODB_URI environment variable is missing!");
    return;
  }
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected successfully for Resume Cockpit");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}

// Configure Cloudinary SDK using environment variables
const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudinaryCloudName && cloudinaryApiKey && cloudinaryApiSecret) {
  cloudinary.config({
    cloud_name: cloudinaryCloudName,
    api_key: cloudinaryApiKey,
    api_secret: cloudinaryApiSecret
  });
} else {
  console.warn("Cloudinary environment variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are partially or completely missing!");
}

export { cloudinary };

// MongoDB Schema for resumes to ensure production-ready persistence
const ResumeSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  userId: { type: String, default: "anonymous", index: true }, // Clerk user ID correlation
  title: { type: String, required: true },
  createdAt: { type: String, required: true },
  updatedAt: { type: String, required: true },
  isArchived: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  version: { type: Number, default: 1 },
  templateId: { type: String, default: "minimal" },
  customSections: { type: Array, default: [] },
  personalInfo: {
    name: { type: String, default: "" },
    title: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    github: { type: String, default: "" },
    portfolio: { type: String, default: "" },
    website: { type: String, default: "" },
    photoUrl: { type: String, default: "" }
  },
  targetJob: {
    title: { type: String, default: "" },
    company: { type: String, default: "" },
    industry: { type: String, default: "" },
    employmentType: { type: String, default: "Full-time" },
    experienceLevel: { type: String, default: "Mid-level" },
    desiredLocation: { type: String, default: "" },
    jobDescription: { type: String, default: "" }
  },
  summary: { type: String, default: "" },
  experience: { type: Array, default: [] },
  education: { type: Array, default: [] },
  projects: { type: Array, default: [] },
  skills: { type: Array, default: [] },
  certifications: { type: Array, default: [] },
  awards: { type: Array, default: [] },
  languages: { type: Array, default: [] },
  volunteer: { type: Array, default: [] },
  publications: { type: Array, default: [] },
  additionalNotes: { type: String, default: "" },
  score: {
    overall: { type: Number, default: 0 },
    content: { type: Number, default: 0 },
    ats: { type: Number, default: 0 },
    grammar: { type: Number, default: 0 },
    design: { type: Number, default: 30 },
    impact: { type: Number, default: 0 },
    skills: { type: Number, default: 0 },
    keywords: { type: Number, default: 0 },
    experience: { type: Number, default: 0 },
    suggestions: { type: [String], default: [] }
  },
  atsResult: {
    overallScore: { type: Number },
    formatting: Schema.Types.Mixed,
    length: Schema.Types.Mixed,
    sections: Schema.Types.Mixed,
    contactInfo: Schema.Types.Mixed,
    keywordDensity: Schema.Types.Mixed,
    actionVerbs: Schema.Types.Mixed,
    grammar: Schema.Types.Mixed,
    readability: Schema.Types.Mixed,
    suggestions: [String],
    warnings: [String],
    strengths: [String]
  }
}, { minimize: false });

export const ResumeModel = mongoose.models.Resume || mongoose.model("Resume", ResumeSchema);

const UserSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  firstName: { type: String, default: "" },
  imageUrl: { type: String, default: "/assets/image.jpg" },
  createdAt: { type: Date, default: Date.now },
  otp: { type: String, default: null },
  otpExpires: { type: Date, default: null },
  isVerified: { type: Boolean, default: false },
  otpAttempts: { type: Number, default: 0 },
  lastOtpSentAt: { type: Date, default: null }
});

export const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);

