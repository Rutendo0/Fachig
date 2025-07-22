import { RequestHandler } from "express";
import { initializeDatabase } from "../db/neon";

let dbInitialized = false;
let dbAvailable = false;

export const ensureDatabaseMiddleware: RequestHandler = async (req, res, next) => {
  // Skip database initialization for non-database routes
  if (!req.path.startsWith('/api/blog') && !req.path.startsWith('/api/upload')) {
    return next();
  }

  // If we've already checked database, use cached result
  if (dbInitialized) {
    if (!dbAvailable) {
      return res.status(503).json({
        message: "Database is currently unavailable. Please try again later.",
        error: "SERVICE_UNAVAILABLE"
      });
    }
    return next();
  }

  try {
    // Check if database URL is available
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('placeholder')) {
      console.log("⚠️ DATABASE_URL not configured");
      dbInitialized = true;
      dbAvailable = false;
      return res.status(503).json({
        message: "Database configuration is missing. Please contact the administrator.",
        error: "DATABASE_NOT_CONFIGURED"
      });
    }

    // Try to initialize database
    console.log("🔄 Initializing database...");
    const success = await initializeDatabase();
    
    dbInitialized = true;
    dbAvailable = success;

    if (success) {
      console.log("✅ Database initialized successfully");
      next();
    } else {
      console.log("❌ Database initialization failed");
      res.status(503).json({
        message: "Database is currently unavailable. Please try again later.",
        error: "DATABASE_INITIALIZATION_FAILED"
      });
    }
  } catch (error) {
    console.error("💥 Database initialization error:", error);
    dbInitialized = true;
    dbAvailable = false;
    
    res.status(503).json({
      message: "Database service is temporarily unavailable. Please try again later.",
      error: "DATABASE_CONNECTION_FAILED"
    });
  }
};
