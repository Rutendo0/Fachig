import { sql } from "@vercel/postgres";

// Initialize database with schema if needed
export async function initializeDatabase() {
  try {
    // Check if the blog_posts table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'blog_posts'
      );
    `;

    if (!tableExists.rows[0].exists) {
      console.log("Creating blog_posts table...");

      // Create the table
      await sql`
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
      `;

      // Create indexes
      await sql`CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC);`;
      await sql`CREATE INDEX idx_blog_posts_featured ON blog_posts(featured);`;

      // Insert sample data
      await sql`
        INSERT INTO blog_posts (
          title, content, excerpt, author, tags, featured, reading_time, 
          featured_image, image_alt
        ) VALUES (
          'Welcome to Our Modern Blog',
          '# Welcome to Our Modern Blog

This is your first blog post! This modern blog platform allows you to create, edit, and delete posts with ease.

## Features

- **Rich Text Editing**: Write beautiful content with markdown support
- **Responsive Design**: Looks great on all devices
- **Embeddable**: Can be embedded into any website
- **Fast & Modern**: Built with the latest technologies

## Getting Started

Click the "New Post" button to create your first blog post. You can edit or delete any post at any time.

Happy blogging! 🚀',
          'Welcome to your new blog platform! This modern blogging system offers everything you need to create and manage beautiful content.',
          'Blog Admin',
          ARRAY['welcome', 'getting-started', 'blog'],
          true,
          2,
          'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop&crop=center',
          'Modern laptop with blog content on screen'
        );
      `;

      await sql`
        INSERT INTO blog_posts (
          title, content, excerpt, author, tags, featured, reading_time,
          featured_image, image_alt
        ) VALUES (
          'How to Create Engaging Blog Content',
          '# How to Create Engaging Blog Content

Creating content that resonates with your audience is both an art and a science. Here are some tips to help you write engaging blog posts.

## Know Your Audience

Understanding who you''re writing for is the foundation of great content. Consider:

- What are their interests?
- What problems do they face?
- What tone resonates with them?

## Structure Your Content

Good structure makes your content easy to read:

1. **Compelling headline** - Draw readers in
2. **Strong opening** - Hook them immediately  
3. **Clear sections** - Break up your content
4. **Call to action** - Tell them what to do next

## Use Visuals

Images, charts, and other visuals can make your content more engaging and easier to understand.

Remember, great content takes time to create, but the results are worth it!',
          'Learn the essential strategies for creating blog content that engages your audience and keeps them coming back for more.',
          'Content Creator',
          ARRAY['content', 'writing', 'tips'],
          false,
          3,
          'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=400&fit=crop&crop=center',
          'Person writing in a notebook with creative ideas'
        );
      `;

      console.log("Database initialized successfully");
    }
  } catch (error) {
    console.error("Database initialization error:", error);
    // In development, we can fall back to in-memory storage
    if (process.env.NODE_ENV !== "production") {
      console.log("Falling back to in-memory storage for development");
      return false;
    }
    throw error;
  }

  return true;
}

export { sql };
