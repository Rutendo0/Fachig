# Vercel Deployment Guide

This guide will help you deploy your FACHIG blog to Vercel with proper environment variable configuration.

## Prerequisites

1. A Vercel account
2. A Neon PostgreSQL database (or any PostgreSQL database with SSL support)
3. Your project connected to a Git repository

## Step 1: Environment Variables Setup

Before deploying, you need to configure the following environment variables in your Vercel project:

### Required Environment Variables

1. **DATABASE_URL**

   - Your PostgreSQL connection string
   - Example: `postgresql://username:password@host:port/database?sslmode=require`
   - For Neon: Get this from your Neon dashboard → Connection Details

2. **ADMIN_PASSWORD**

   - A secure password for admin access
   - Example: `MySecurePassword123!`
   - Choose something strong and unique

3. **NODE_ENV**
   - Set to `production`

### Optional Environment Variables (for Image Uploads)

4. **CLOUDINARY_CLOUD_NAME** (Optional but recommended)
   - Your Cloudinary cloud name
   - Sign up free at: https://cloudinary.com
   - Find in Cloudinary Dashboard → Settings → Product Environment

5. **CLOUDINARY_API_KEY** (Optional but recommended)
   - Your Cloudinary API key
   - From Cloudinary Dashboard → Settings → Product Environment

6. **CLOUDINARY_API_SECRET** (Optional but recommended)
   - Your Cloudinary API secret
   - From Cloudinary Dashboard → Settings → Product Environment

**Note**: Without Cloudinary configuration, you can only use external image URLs. With Cloudinary, you can upload images directly from your computer.

### How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:

   - **Name**: `DATABASE_URL`
   - **Value**: Your database connection string
   - **Environments**: Production, Preview, Development (all checked)
   - **Name**: `ADMIN_PASSWORD`
   - **Value**: Your chosen admin password
   - **Environments**: Production, Preview, Development (all checked)
   - **Name**: `NODE_ENV`
   - **Value**: `production`
   - **Environments**: Production (only)

## Step 2: Database Setup

Your Neon database should automatically initialize with the required tables when the application starts. The initialization includes:

- Creating the `blog_posts` table
- Setting up indexes for performance
- Inserting sample FACHIG content

If you need to manually verify or recreate the database:

```sql
-- Create the blog_posts table
CREATE TABLE blog_posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  excerpt VARCHAR(500) NOT NULL,
  author VARCHAR(100) NOT NULL,
  published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tags TEXT[],
  featured BOOLEAN DEFAULT FALSE,
  reading_time INTEGER DEFAULT 1,
  featured_image TEXT,
  image_alt VARCHAR(255)
);

-- Create indexes
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX idx_blog_posts_featured ON blog_posts(featured);
```

## Step 3: Deploy

1. Push your code to your Git repository
2. Vercel should automatically trigger a deployment
3. Or manually trigger deployment from the Vercel dashboard

## Step 4: Verify Deployment

After deployment:

1. **Check System Health**: Visit `https://your-domain.vercel.app/api/health` to see system status
   - `status: "healthy"` = Everything working
   - `status: "degraded"` = Database issues but app functional
   - `status: "unhealthy"` = Major issues

2. **Check Blog Posts**: Visit your deployed URL to see if blog posts load

3. **Test Admin Login**:
   - Click "Admin" button
   - Enter the password you set in `ADMIN_PASSWORD`
   - Verify you can create/edit posts

## Troubleshooting

### Issue: "Failed to fetch blog posts"

- **Cause**: Database connection issues or serverless environment limitations
- **Solution**:
  - Verify `DATABASE_URL` is correctly set in Vercel environment variables
  - Check your database is accessible and SSL is enabled
  - Check Vercel function logs for specific database errors
  - The app now includes better error handling for serverless environments
  - Use `/api/health` endpoint to check database connectivity status

### Issue: "Authentication failed. Please try again"

- **Cause**: Admin password environment variable not set
- **Solution**:
  - Verify `ADMIN_PASSWORD` is set in Vercel environment variables
  - Make sure the variable is available in the correct environments
  - Check function logs for "ADMIN_PASSWORD environment variable not set" errors

### Issue: "Image upload not supported"

- **Cause**: Serverless environment needs cloud storage for file uploads
- **Solutions**:

  **Option 1: Enable Image Uploads (Recommended)**
  1. Sign up for free Cloudinary account: https://cloudinary.com
  2. Get your credentials from Dashboard → Settings → Product Environment
  3. Add these environment variables in Vercel:
     - `CLOUDINARY_CLOUD_NAME`
     - `CLOUDINARY_API_KEY`
     - `CLOUDINARY_API_SECRET`
  4. Redeploy your application
  5. Now you can upload images directly from your computer! 📸

  **Option 2: Use External URLs**
  - Unsplash (https://unsplash.com) for stock photos
  - Imgur (https://imgur.com) for personal images
  - Paste direct image URLs in the image URL field

### Issue: API routes not working

- **Cause**: Serverless function configuration issues
- **Solution**:
  - Verify `vercel.json` configuration is correct
  - Check that `api/index.js` exists and exports the Express app
  - Review Vercel function logs for deployment errors
  - Check `/api/health` endpoint for service status

## Environment Variables Summary

Here's a quick checklist of what you need:

```bash
# Required for Vercel deployment
DATABASE_URL=postgresql://...          # Your Neon/PostgreSQL connection string
ADMIN_PASSWORD=YourSecurePassword      # Your chosen admin password
NODE_ENV=production                    # Set to production
```

## Security Notes

- Never commit your actual environment variables to Git
- Use strong, unique passwords for `ADMIN_PASSWORD`
- Ensure your database connection uses SSL (`sslmode=require`)
- Consider rotating your admin password periodically

## Support

If you continue to have issues:

1. Check Vercel function logs in your dashboard
2. Verify your Neon database is running and accessible
3. Test your environment variables in Vercel's environment variable section
4. Ensure all dependencies are properly installed during build

For database-specific issues, refer to your Neon dashboard for connection details and status.
