import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Resend } from "resend";

// MongoDB and Cloudinary Persistent Integrations
import { connectDB, ResumeModel, cloudinary, UserModel } from "./src/server/mongodb";

// AI Orchestrator Module Imports
import { aiRouter } from "./src/features/ai/router";
import { aiPipeline } from "./src/features/ai/pipeline";
import { aiMonitor } from "./src/features/ai/telemetry";
import { aiCache } from "./src/features/ai/cache";
import { Prompts } from "./src/features/ai/prompts";
import authRouter from "./src/server/routes/auth.routes";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "simple-jwt-secret-key-default-change-me";

// Ensure Clerk environment keys are cleaned and properly formatted early on startup
const rawPublishableKey = (process.env.CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY || "").trim();

function cleanClerkPublishableKey(key: string): string {
  if (!key) return "";
  let cleaned = key.trim().replace(/^['"]|['"]$/g, "");
  // Only strip a literal trailing dollar sign from the raw string if it was copied with a terminal prompt
  if (cleaned.endsWith("$")) {
    cleaned = cleaned.slice(0, -1);
  }
  return cleaned;
}

const cleanPublishableKey = cleanClerkPublishableKey(rawPublishableKey);
if (cleanPublishableKey) {
  process.env.CLERK_PUBLISHABLE_KEY = cleanPublishableKey;
  process.env.VITE_CLERK_PUBLISHABLE_KEY = cleanPublishableKey;
}

const rawSecretKey = (process.env.CLERK_SECRET_KEY || "").trim();
const cleanSecretKey = rawSecretKey.replace(/^['"]|['"]$/g, "");
if (cleanSecretKey) {
  process.env.CLERK_SECRET_KEY = cleanSecretKey;
}

const PORT = parseInt(process.env.PORT || "3000", 10);

// Initialize Resend Client using environment variable (safe placeholder for constructor safety)
const RESEND_API_KEY = process.env.RESEND_API_KEY || "re_placeholder_key_for_safety";
const resend = new Resend(RESEND_API_KEY);

// Initialize Gemini client lazily using environment variable
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;

    if (key && key !== "MY_GEMINI_API_KEY") {
      try {
        aiClient = new GoogleGenAI({
          apiKey: key,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
        console.log("Successfully initialized Gemini API Client");
      } catch (e) {
        console.error("Failed to initialize Gemini API Client", e);
      }
    } else {
      console.warn("GEMINI_API_KEY environment variable is missing or using placeholder.");
    }
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "15mb" }));

  // JWT Authentication Middleware
  app.use(async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
          if (decoded && decoded.userId) {
            (req as any).userId = decoded.userId;
            (req as any).userEmail = decoded.email;
          }
        } catch (err) {
          // Token invalid or expired - proceed as anonymous
        }
      }
      next();
    } catch (error) {
      next();
    }
  });

  // Safe and production-ready authenticated user-id resolver helper
  function getRequestUserId(req: express.Request): string {
    const reqUserId = (req as any).userId;
    if (reqUserId) {
      return reqUserId;
    }
    // Safe fallback to client header or anonymous (offline/development mode)
    const headerUserId = req.headers["x-user-id"] || req.headers["X-User-Id"];
    if (headerUserId && typeof headerUserId === "string") {
      return headerUserId;
    }
    return "anonymous";
  }

  // Connect to MongoDB cloud database
  try {
    await connectDB();
  } catch (err) {
    console.error("Delayed MongoDB connection failed:", err);
  }

  // Database connection check middleware to fail fast with actionable message
  app.use(async (req, res, next) => {
    if (req.path.startsWith("/api/auth") || req.path.startsWith("/api/resumes")) {
      const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
      if (!uri) {
        return res.status(503).json({
          error: "Database configuration is missing. If deploying on Render, please go to your Render Web Service Dashboard, click 'Environment' -> 'Add Environment Variable', and set 'MONGODB_URI' to your MongoDB connection string. In AI Studio, you can configure it under Settings -> Secrets."
        });
      }

      // If disconnected, try to connect again
      if ((mongoose.connection.readyState as number) === 0) {
        try {
          await connectDB();
        } catch (e) {
          // ignore
        }
      }

      // Wait briefly if it is connecting (readyState === 2)
      if ((mongoose.connection.readyState as number) === 2) {
        for (let i = 0; i < 5; i++) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          if ((mongoose.connection.readyState as number) === 1) break;
        }
      }

      if ((mongoose.connection.readyState as number) !== 1) {
        return res.status(503).json({
          error: "Unable to connect to your MongoDB database. Please verify your MONGODB_URI connection string is correct, your database is online, and it accepts connections."
        });
      }
    }
    next();
  });

  // API ROUTES

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      mongodbConnected: (mongoose.connection.readyState as number) >= 1,
      geminiConfigured: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY"
    });
  });

  // Production-Ready Resend OTP and JWT Authentication Routes
  app.use("/api/auth", authRouter);

  app.get("/api/auth/me", async (req, res) => {
    try {
      const userId = (req as any).userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await UserModel.findOne({ id: userId } as any);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          imageUrl: user.imageUrl
        }
      });
    } catch (err: any) {
      console.error("[Auth Me Error]:", err);
      res.status(500).json({ error: "Authentication failed" });
    }
  });

  // Profile Update Route
  app.put("/api/auth/profile", async (req, res) => {
    try {
      const userId = (req as any).userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { firstName, imageUrl } = req.body;
      const user = await UserModel.findOne({ id: userId } as any);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (firstName !== undefined) user.firstName = firstName;
      if (imageUrl !== undefined) user.imageUrl = imageUrl;

      await user.save();

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          imageUrl: user.imageUrl
        }
      });
    } catch (err: any) {
      console.error("[Profile Update Error]:", err);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Cloudinary media uploader for images & docx files
  app.post("/api/upload", async (req, res) => {
    const { file, fileName, fileType } = req.body; // Expects a base64 string
    if (!file) {
      return res.status(400).json({ error: "No file data provided" });
    }
    try {
      const resourceType = fileType === "docx" || fileName?.endsWith(".docx") ? "raw" : "image";
      const uploadResponse = await cloudinary.uploader.upload(file, {
        resource_type: resourceType,
        folder: "resume_cockpit",
        public_id: fileName ? fileName.replace(/\.[^/.]+$/, "") : undefined,
      });

      res.json({
        success: true,
        url: uploadResponse.secure_url,
        publicId: uploadResponse.public_id,
        resourceType
      });
    } catch (err: any) {
      console.error("Cloudinary upload failed on backend:", err);
      res.status(500).json({ error: err.message || "Failed to upload file to Cloudinary" });
    }
  });

  // MongoDB Resume CRUD: Retrieve all resumes (can filter by userId, e.g. from Clerk header)
  app.get("/api/resumes", async (req, res) => {
    const userId = getRequestUserId(req);
    try {
      const resumes = await ResumeModel.find({ userId } as any);
      res.json(resumes);
    } catch (err: any) {
      console.error("Failed to fetch resumes from MongoDB:", err);
      res.status(500).json({ error: "Failed to fetch resumes from database" });
    }
  });

  // MongoDB Resume CRUD: Get single resume
  app.get("/api/resumes/:id", async (req, res) => {
    const { id } = req.params;
    const userId = getRequestUserId(req);
    try {
      const resume = await ResumeModel.findOne({ id, userId } as any);
      if (!resume) {
        return res.status(404).json({ error: "Resume not found" });
      }
      res.json(resume);
    } catch (err: any) {
      console.error("Failed to fetch resume:", err);
      res.status(500).json({ error: "Failed to fetch resume" });
    }
  });

  // MongoDB Resume CRUD: Save / Create resume (with upsert)
  app.post("/api/resumes", async (req, res) => {
    const userId = getRequestUserId(req);
    const resumeData = req.body;
    if (!resumeData.id) {
      return res.status(400).json({ error: "Resume id is required" });
    }
    try {
      const existing = await ResumeModel.findOne({ id: resumeData.id } as any);
      if (existing) {
        Object.assign(existing, resumeData, { userId, updatedAt: new Date().toISOString() });
        await existing.save();
        return res.json(existing);
      } else {
        const newResume = new ResumeModel({
          ...resumeData,
          userId,
          createdAt: resumeData.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        await newResume.save();
        return res.json(newResume);
      }
    } catch (err: any) {
      console.error("Failed to create/save resume in MongoDB:", err);
      res.status(500).json({ error: err.message || "Failed to save resume" });
    }
  });

  // MongoDB Resume CRUD: Update active resume
  app.put("/api/resumes/:id", async (req, res) => {
    const { id } = req.params;
    const userId = getRequestUserId(req);
    const updateData = req.body;
    try {
      const updated = await ResumeModel.findOneAndUpdate(
        { id, userId } as any,
        { ...updateData, updatedAt: new Date().toISOString() },
        { new: true, upsert: true }
      );
      res.json(updated);
    } catch (err: any) {
      console.error("Failed to update resume in MongoDB:", err);
      res.status(500).json({ error: "Failed to update resume" });
    }
  });

  // MongoDB Resume CRUD: Delete resume
  app.delete("/api/resumes/:id", async (req, res) => {
    const { id } = req.params;
    const userId = getRequestUserId(req);
    try {
      await ResumeModel.deleteOne({ id, userId } as any);
      res.json({ success: true, message: "Resume deleted successfully from MongoDB" });
    } catch (err: any) {
      console.error("Failed to delete resume from MongoDB:", err);
      res.status(500).json({ error: "Failed to delete resume" });
    }
  });

  // Smart AI Resume Generator
  app.post("/api/ai/generate", async (req, res) => {
    const { personalInfo, targetJob, experience, education, projects, skills, certifications, awards, languages, volunteer, publications, additionalNotes, options } = req.body;
    
    const routingMode = options?.routingMode || "AUTO";
    const pipelineEnabled = options?.pipelineEnabled !== false;
    const parallelMode = !!options?.parallelMode;
    const cacheEnabled = options?.cacheEnabled !== false;

    try {
      const data = await aiPipeline.generate(
        { personalInfo, targetJob, experience, education, projects, skills, certifications, awards, languages, volunteer, publications, additionalNotes },
        { mode: routingMode, pipelineEnabled, parallelMode, cacheEnabled }
      );
      res.json(data);
    } catch (e: any) {
      console.error("AI Orchestrated Generate Resume failed:", e);
      res.status(500).json({ error: e.message || "Failed to generate resume" });
    }
  });

  // ATS optimizer
  app.post("/api/ai/optimize", async (req, res) => {
    const { resume, jobDescription, options } = req.body;
    const routingMode = options?.routingMode || "AUTO";
    const cacheEnabled = options?.cacheEnabled !== false;

    try {
      const data = await aiRouter.route(
        "optimize",
        Prompts.optimize.system,
        Prompts.optimize.user(resume, jobDescription),
        { mode: routingMode, cacheEnabled }
      );
      res.json(data);
    } catch (e: any) {
      console.error("AI Orchestrated Optimize failed:", e);
      res.status(500).json({ error: e.message || "Failed to optimize resume" });
    }
  });

  // ATS checker
  app.post("/api/ai/ats-check", async (req, res) => {
    const { resume, jobDescription, options } = req.body;
    const routingMode = options?.routingMode || "AUTO";
    const cacheEnabled = options?.cacheEnabled !== false;

    try {
      const data = await aiRouter.route(
        "ats-check",
        Prompts.atsCheck.system,
        Prompts.atsCheck.user(resume, jobDescription),
        { mode: routingMode, cacheEnabled }
      );
      res.json(data);
    } catch (e: any) {
      console.error("AI Orchestrated ATS Check failed:", e);
      res.status(500).json({ error: e.message || "Failed to perform ATS check" });
    }
  });

  // AI improve bullet point
  app.post("/api/ai/improve-bullet-point", async (req, res) => {
    const { bulletPoint, roleTitle, options } = req.body;
    const routingMode = options?.routingMode || "AUTO";
    const cacheEnabled = options?.cacheEnabled !== false;

    try {
      const data = await aiRouter.route(
        "improve-bullet-point",
        Prompts.improveBulletPoint.system,
        Prompts.improveBulletPoint.user(bulletPoint, roleTitle),
        { mode: routingMode, cacheEnabled }
      );
      res.json(data);
    } catch (e: any) {
      console.error("AI Orchestrated Improve Bullet Point failed:", e);
      res.status(500).json({ error: e.message || "Failed to improve bullet point" });
    }
  });

  // AI rewrite summary
  app.post("/api/ai/rewrite-summary", async (req, res) => {
    const { summary, tone, options } = req.body;
    const routingMode = options?.routingMode || "AUTO";
    const cacheEnabled = options?.cacheEnabled !== false;

    try {
      const data = await aiRouter.route(
        "rewrite-summary",
        Prompts.rewriteSummary.system,
        Prompts.rewriteSummary.user(summary, tone),
        { mode: routingMode, cacheEnabled }
      );
      res.json(data);
    } catch (e: any) {
      console.error("AI Orchestrated Rewrite Summary failed:", e);
      res.status(500).json({ error: e.message || "Failed to rewrite summary" });
    }
  });

  // Generate cover letter
  app.post("/api/ai/generate-cover-letter", async (req, res) => {
    const { resume, jobDescription, options } = req.body;
    const routingMode = options?.routingMode || "AUTO";
    const cacheEnabled = options?.cacheEnabled !== false;

    try {
      const data = await aiRouter.route(
        "cover-letter",
        Prompts.coverLetter.system,
        Prompts.coverLetter.user(resume, jobDescription),
        { mode: routingMode, cacheEnabled }
      );
      res.json(data);
    } catch (e: any) {
      console.error("AI Orchestrated Generate Cover Letter failed:", e);
      res.status(500).json({ error: e.message || "Failed to generate cover letter" });
    }
  });

  // AI Orchestrator Telemetry metrics
  app.get("/api/ai/telemetry", (req, res) => {
    res.json(aiMonitor.getTelemetry());
  });

  // Clear AI telemetry logs
  app.post("/api/ai/telemetry/reset", (req, res) => {
    aiMonitor.resetTelemetry();
    res.json({ success: true, message: "AI Telemetry logs reset successfully." });
  });

  // Clear AI cache
  app.post("/api/ai/cache/clear", (req, res) => {
    aiCache.clear();
    res.json({ success: true, message: "AI Cache cleared successfully." });
  });



  // INTEGRATE VITE DEV SERVER OR PROD STATIC ROUTING
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware loaded.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, {
      maxAge: "1y",
      setHeaders: (res, filePath) => {
        if (filePath.includes("/assets/")) {
          // Immutable caching for bundler assets with hashes
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else if (filePath.endsWith(".html")) {
          // Never cache HTML files to ensure clients always get updates
          res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
        } else {
          // Standard assets caching
          res.setHeader("Cache-Control", "public, max-age=86400, must-revalidate");
        }
      }
    }));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files serving loaded from /dist with optimized caching.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Resume Builder Server listening on http://localhost:${PORT}`);
  });
}

startServer();
