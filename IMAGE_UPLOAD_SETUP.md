# 📸 Local Image Upload Setup Guide

## Quick Setup (5 minutes)

### 1. **Sign up for Cloudinary (Free)**
   - Go to: https://cloudinary.com
   - Click "Sign Up for Free"
   - Complete registration

### 2. **Get Your Credentials**
   - After signup, go to your Cloudinary Dashboard
   - Navigate to: **Settings** → **Product Environment**
   - Copy these three values:
     - `Cloud Name`
     - `API Key`
     - `API Secret`

### 3. **Add Environment Variables**
   
   **For Vercel Deployment:**
   1. Go to your Vercel project dashboard
   2. Navigate to **Settings** → **Environment Variables**
   3. Add these three variables:
      - **Name**: `CLOUDINARY_CLOUD_NAME` **Value**: [Your Cloud Name]
      - **Name**: `CLOUDINARY_API_KEY` **Value**: [Your API Key]  
      - **Name**: `CLOUDINARY_API_SECRET` **Value**: [Your API Secret]
   4. Make sure to check all environments (Production, Preview, Development)
   5. **Redeploy** your application

   **For Local Development:**
   Add to your `.env` file:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

### 4. **Test Upload**
   - Go to your blog → Admin → New Post
   - Try uploading an image from your computer
   - You should see "uploaded to cloud storage" in the success message

## ✅ **What You Get:**

- **📱 Upload from your computer**: Drag & drop or click to upload
- **☁️ Cloud storage**: Images stored securely on Cloudinary
- **🚀 Fast loading**: Optimized images with CDN
- **📏 Auto-resize**: Large images automatically resized
- **🎨 Auto-format**: Best format chosen automatically (WebP when supported)
- **💾 10MB limit**: Larger file size limit than local storage

## 🆓 **Cloudinary Free Tier:**
- 25 GB storage
- 25 GB monthly bandwidth  
- 25,000 transformations/month
- More than enough for most blogs!

## ❌ **Without Cloudinary:**
- Can only use external image URLs
- No direct uploads from computer
- Must use services like Unsplash/Imgur

## 🔧 **Troubleshooting:**

**"Upload not supported" error:**
- Check that all 3 environment variables are set correctly
- Redeploy after adding variables
- Check Vercel function logs for specific errors

**"Invalid credentials" error:**
- Double-check Cloud Name, API Key, and API Secret
- Make sure no extra spaces when copying

**Images not loading:**
- Cloudinary images use HTTPS URLs and should work everywhere
- Check browser console for any errors
