# 🚀 Vercel Deployment Guide - FIXED

Your FACHIG blog is now ready for production deployment on Vercel! The runtime error has been fixed.

## 🔧 **Runtime Error FIXED**

The "Function Runtimes must have a valid version" error has been resolved by:

- ✅ Simplified `vercel.json` configuration
- ✅ Created proper serverless API route (`api/index.js`)
- ✅ Updated build configuration for Vercel

## 📋 Prerequisites

1. **GitHub Repository**: Push your code to GitHub
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)

## 🛠️ Deployment Steps

### 1. Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel will auto-detect it as a Vite project
4. Click **Deploy**

### 2. Add Vercel Postgres Database

1. In your Vercel dashboard, go to your project
2. Click **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Click **Create**

This automatically adds all required environment variables:

- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### 3. Add Vercel Blob Storage

1. In your project dashboard, go to **Storage**
2. Click **Create Database** → **Blob**
3. Create the blob store

This automatically adds:

- `BLOB_READ_WRITE_TOKEN`

### 4. Redeploy

After adding storage, redeploy your project:

1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment

## ✅ What Happens After Deployment

### **Blog Posts**

- ✅ **Persistent**: Stored in Vercel Postgres
- ✅ **Survives Deployments**: Data is never lost
- ✅ **Fast**: Optimized database queries

### **Images**

- ✅ **Cloud Storage**: Uploaded to Vercel Blob
- ✅ **CDN**: Automatically served via global CDN
- ✅ **Persistent**: Files never lost on redeploy

### **Performance**

- ✅ **Global**: Deployed to Vercel's edge network
- ✅ **Fast**: Optimized for speed
- ✅ **Scalable**: Handles traffic spikes

## 🔗 Embed in Your Site

After deployment, you'll get a URL like:
\`https://your-blog.vercel.app\`

### Embed Options:

**Full Page Embed:**
\`\`\`html

<iframe 
  src="https://your-blog.vercel.app" 
  width="100%" 
  height="600px"
  frameborder="0">
</iframe>
\`\`\`

**Custom Domain:**

1. In Vercel dashboard → **Domains**
2. Add your custom domain (e.g., `blog.fachig.org`)
3. Update DNS records as instructed

## 🎨 Branding

The blog is already styled with:

- ✅ **Green**: Plant/nature theme primary color
- ✅ **Brown**: Soil/earth theme accent color
- ✅ **Professional**: Clean, modern design

## 🔧 Environment Variables (Auto-Set)

Vercel automatically provides these when you add storage:

\`\`\`
POSTGRES*URL=postgresql://...
BLOB_READ_WRITE_TOKEN=vercel_blob*...
NODE_ENV=production
\`\`\`

## 📱 Development vs Production

- **Development**: Uses in-memory storage (temporary)
- **Production**: Uses Vercel Postgres + Blob (persistent)

## 🆘 Troubleshooting

**Database Issues:**

- Check Storage tab shows Postgres database
- Redeploy after adding database

**Image Upload Issues:**

- Check Storage tab shows Blob storage
- Verify `BLOB_READ_WRITE_TOKEN` exists

**Build Issues:**

- Check build logs in Deployments tab
- Ensure all dependencies in `package.json`

## 🎯 Next Steps

1. ✅ Deploy to Vercel
2. ✅ Add Postgres + Blob storage
3. ✅ Test admin login (password: `admin123`)
4. ✅ Create your first blog post
5. ✅ Embed in your website
6. ✅ Share the link!

Your blog is production-ready! 🚀
