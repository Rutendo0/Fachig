// Serverless function for Vercel
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { Pool } from "pg";

// Load environment variables
dotenv.config();

// Create database connection
let pool = null;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }
  return pool;
}

// Create express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const db = getPool();
    await db.query('SELECT 1');
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// Blog posts endpoint
app.get('/api/blog', async (req, res) => {
  try {
    const db = getPool();
    const result = await db.query(`
      SELECT id, title, excerpt, author, published_at, tags, featured, reading_time, featured_image, image_alt
      FROM blog_posts 
      ORDER BY published_at DESC
    `);
    // Transform database response to match frontend interface
    const transformedPosts = result.rows.map(post => ({
      id: post.id.toString(),
      title: post.title,
      excerpt: post.excerpt,
      author: post.author,
      publishedAt: post.published_at,
      updatedAt: post.updated_at || post.published_at,
      tags: post.tags || [],
      featured: post.featured,
      readingTime: post.reading_time,
      featuredImage: post.featured_image,
      imageAlt: post.image_alt,
      content: post.content || post.excerpt
    }));

    res.json({
      posts: transformedPosts,
      total: transformedPosts.length,
      page: 1,
      limit: 100
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

// Single blog post endpoint
app.get('/api/blog/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getPool();
    const result = await db.query('SELECT * FROM blog_posts WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    
    // Transform database response to match frontend interface
    const post = result.rows[0];
    const transformedPost = {
      id: post.id.toString(),
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      author: post.author,
      publishedAt: post.published_at,
      updatedAt: post.updated_at || post.published_at,
      tags: post.tags || [],
      featured: post.featured,
      readingTime: post.reading_time,
      featuredImage: post.featured_image,
      imageAlt: post.image_alt
    };
    
    res.json({ post: transformedPost });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ error: 'Failed to fetch blog post' });
  }
});

// Admin authentication endpoint
app.post('/api/auth/admin', async (req, res) => {
  try {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminPassword) {
      return res.status(500).json({ error: 'Admin password not configured' });
    }
    
    if (password === adminPassword) {
      res.json({ success: true, message: 'Authentication successful' });
    } else {
      res.status(401).json({ success: false, error: 'Invalid password' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Create blog post endpoint
app.post('/api/blog', async (req, res) => {
  try {
    const { title, content, excerpt, author, tags, featured, readingTime, featuredImage, imageAlt } = req.body;
    const db = getPool();
    
    const result = await db.query(`
      INSERT INTO blog_posts (title, content, excerpt, author, tags, featured, reading_time, featured_image, image_alt)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [title, content, excerpt, author, tags, featured || false, readingTime || 1, featuredImage, imageAlt]);
    
    // Transform database response to match frontend interface
    const post = result.rows[0];
    const transformedPost = {
      id: post.id.toString(),
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      author: post.author,
      publishedAt: post.published_at,
      updatedAt: post.updated_at || post.published_at,
      tags: post.tags || [],
      featured: post.featured,
      readingTime: post.reading_time,
      featuredImage: post.featured_image,
      imageAlt: post.image_alt
    };
    
    res.status(201).json(transformedPost);
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ error: 'Failed to create blog post' });
  }
});

// Update blog post endpoint
app.put('/api/blog/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, author, tags, featured, readingTime, featuredImage, imageAlt } = req.body;
    const db = getPool();
    
    const result = await db.query(`
      UPDATE blog_posts 
      SET title = $1, content = $2, excerpt = $3, author = $4, tags = $5, 
          featured = $6, reading_time = $7, featured_image = $8, image_alt = $9,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *
    `, [title, content, excerpt, author, tags, featured || false, readingTime || 1, featuredImage, imageAlt, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    
    // Transform database response to match frontend interface
    const post = result.rows[0];
    const transformedPost = {
      id: post.id.toString(),
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      author: post.author,
      publishedAt: post.published_at,
      updatedAt: post.updated_at || post.published_at,
      tags: post.tags || [],
      featured: post.featured,
      readingTime: post.reading_time,
      featuredImage: post.featured_image,
      imageAlt: post.image_alt
    };
    
    res.json(transformedPost);
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ error: 'Failed to update blog post' });
  }
});

// Delete blog post endpoint
app.delete('/api/blog/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getPool();
    
    const result = await db.query('DELETE FROM blog_posts WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    
    res.json({ success: true, message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
});

// Upload endpoint - Note: File uploads don't work well in Vercel serverless functions
// This will return a helpful error message directing users to use direct URLs
app.post('/api/upload', (req, res) => {
  res.status(501).json({ 
    success: false,
    error: 'File upload is not supported in serverless deployment. Please use direct image URLs from external services like Unsplash, Imgur, or other image hosting platforms.',
    message: 'Use direct image URLs instead of file uploads',
    serverless: true
  });
});

// Also handle GET request for upload endpoint
app.get('/api/upload', (req, res) => {
  res.json({ 
    message: 'Upload endpoint is available for POST requests only',
    supported: false,
    reason: 'File uploads are not supported in serverless deployment'
  });
});

// Default handler for all API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Export for Vercel
export default app;