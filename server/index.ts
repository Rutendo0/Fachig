import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { handleDemo } from "./routes/demo";
import {
  getBlogPosts,
  getBlogPost,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from "./routes/blog-db";
import { uploadImage } from "./routes/upload";
import { verifyAdminPassword } from "./routes/auth";
import { closeDb } from "./db/neon";
import { ensureDatabaseMiddleware } from "./middleware/database";
import { healthCheck } from "./routes/health";

// Load environment variables
dotenv.config();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createServer() {
  const app = express();

  // Database will be initialized lazily on first request
  console.log("🚀 Server created, database will be initialized on first use");

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve uploaded files statically
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/health", healthCheck);
  app.get("/api/demo", handleDemo);

  // Database middleware for database-dependent routes
  app.use(ensureDatabaseMiddleware);

  // Blog API routes
  app.get("/api/blog", getBlogPosts);
  app.get("/api/blog/:id", getBlogPost);
  app.post("/api/blog", createBlogPost);
  app.put("/api/blog/:id", updateBlogPost);
  app.delete("/api/blog/:id", deleteBlogPost);

  // Upload API route
  app.post("/api/upload", uploadImage);

  // Auth API route
  app.post("/api/auth/admin", verifyAdminPassword);

  return app;
}

// Graceful shutdown handler
process.on("SIGTERM", async () => {
  console.log("🛑 Received SIGTERM, closing database connections...");
  await closeDb();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("🛑 Received SIGINT, closing database connections...");
  await closeDb();
  process.exit(0);
});
