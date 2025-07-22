import { RequestHandler } from "express";

export interface HealthCheckResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  services: {
    database: "connected" | "disconnected" | "not_configured";
    environment: "development" | "production" | "unknown";
  };
  version: string;
}

// GET /api/health - Health check endpoint
export const healthCheck: RequestHandler = async (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";
    const hasDatabase = !!(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('placeholder'));
    
    let databaseStatus: "connected" | "disconnected" | "not_configured" = "not_configured";
    
    if (hasDatabase) {
      try {
        const { getDbClient } = await import("../db/neon");
        const client = await getDbClient();
        await client.query('SELECT 1');
        client.release();
        databaseStatus = "connected";
      } catch (error) {
        console.error("Database health check failed:", error);
        databaseStatus = "disconnected";
      }
    }

    const response: HealthCheckResponse = {
      status: databaseStatus === "connected" ? "healthy" : (hasDatabase ? "degraded" : "healthy"),
      timestamp: new Date().toISOString(),
      services: {
        database: databaseStatus,
        environment: isProduction ? "production" : "development"
      },
      version: "1.0.0"
    };

    const statusCode = response.status === "healthy" ? 200 : 
                      response.status === "degraded" ? 206 : 503;

    res.status(statusCode).json(response);
  } catch (error) {
    console.error("Health check error:", error);
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      services: {
        database: "disconnected",
        environment: "unknown"
      },
      version: "1.0.0"
    });
  }
};
