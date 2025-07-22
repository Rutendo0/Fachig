import { RequestHandler } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";
import { uploadToCloudinary, isCloudinaryConfigured } from "../services/cloudinary";

// Get current directory for file uploads (fallback for local development)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "../../uploads");

// Ensure uploads directory exists (for local development)
async function ensureUploadsDir() {
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
  }
}

// Configure multer for local file uploads (fallback)
const localStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await ensureUploadsDir();
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(file.originalname);
    const filename = `${timestamp}-${random}${ext}`;
    cb(null, filename);
  },
});

// File filter for images only
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.",
      ),
    );
  }
};

// Configure multer for local storage (fallback)
const localUpload = multer({
  storage: localStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Choose upload method based on configuration
const uploadSingle = isCloudinaryConfigured()
  ? uploadToCloudinary.single("image")
  : localUpload.single("image");

// POST /api/upload - Upload image file
export const uploadImage: RequestHandler = (req, res) => {
  // Check if Cloudinary is configured
  const hasCloudinary = isCloudinaryConfigured();
  const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY;

  // If in serverless environment without Cloudinary, return helpful error
  if (isServerless && !hasCloudinary) {
    return res.status(501).json({
      error: "File upload not supported in serverless deployment without cloud storage",
      message: "Please configure Cloudinary for image uploads or use external image URLs.",
      suggestion: "To enable uploads:\n1. Sign up for free Cloudinary account\n2. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET to environment variables\n\nOr use external URLs from:\n• Unsplash (https://unsplash.com)\n• Imgur (https://imgur.com)"
    });
  }

  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          error: hasCloudinary ? "File too large. Maximum size is 10MB." : "File too large. Maximum size is 5MB.",
        });
      }
      return res.status(400).json({
        error: `Upload error: ${err.message}`,
      });
    } else if (err) {
      return res.status(400).json({
        error: err.message,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
      });
    }

    // Return file information - Cloudinary files have different structure
    const isCloudinaryFile = !!(req.file as any).path;
    const fileUrl = isCloudinaryFile ? (req.file as any).path : `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      filename: req.file.filename,
      url: fileUrl,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      storage: hasCloudinary ? 'cloudinary' : 'local',
    });
  });
};
