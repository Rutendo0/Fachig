import { RequestHandler } from "express";

export interface AdminLoginRequest {
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  message: string;
}

// POST /api/auth/admin - Verify admin password
export const verifyAdminPassword: RequestHandler = (req, res) => {
  try {
    const { password } = req.body as AdminLoginRequest;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error("ADMIN_PASSWORD environment variable not set");
      return res.status(500).json({
        success: false,
        message: "Authentication service is not properly configured. Please contact the administrator.",
      });
    }

    const isValid = password === adminPassword;

    const response: AdminLoginResponse = {
      success: isValid,
      message: isValid ? "Authentication successful" : "Invalid password",
    };

    // Use 200 status for both success and failure to avoid leaking info
    res.status(200).json(response);
  } catch (error) {
    console.error("Admin auth error:", error);
    res.status(500).json({
      success: false,
      message: "Authentication failed due to a server error. Please try again.",
    });
  }
};
