import { RequestHandler } from "express";
import {
  BlogPost,
  CreateBlogPostRequest,
  UpdateBlogPostRequest,
  GetBlogPostsResponse,
  GetBlogPostResponse,
  BlogPostResponse,
  DeleteBlogPostResponse,
  BlogPostsQuery,
} from "@shared/blog";
import { getDbClient } from "../db/neon";

// Helper function to calculate reading time
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

// Helper function to convert database row to BlogPost
function dbRowToBlogPost(row: any): BlogPost {
  return {
    id: row.id.toString(),
    title: row.title,
    content: row.content,
    excerpt: row.excerpt,
    author: row.author,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    tags: row.tags || [],
    featured: row.featured,
    readingTime: row.reading_time,
    featuredImage: row.featured_image,
    imageAlt: row.image_alt,
  };
}

// GET /api/blog - Get all blog posts
export const getBlogPosts: RequestHandler = async (req, res) => {
  let client;
  try {
    const {
      page = 1,
      limit = 10,
      search,
      tag,
      featured,
    } = req.query as BlogPostsQuery;

    client = await getDbClient();

    let whereConditions: string[] = [];
    let queryParams: any[] = [];
    let paramCounter = 1;

    // Build WHERE conditions
    if (search) {
      whereConditions.push(`(
        title ILIKE $${paramCounter} OR 
        content ILIKE $${paramCounter} OR 
        excerpt ILIKE $${paramCounter}
      )`);
      queryParams.push(`%${search}%`);
      paramCounter++;
    }

    if (tag) {
      whereConditions.push(`$${paramCounter} = ANY(tags)`);
      queryParams.push(tag);
      paramCounter++;
    }

    if (featured !== undefined) {
      const featuredBoolean = featured === "true" || featured === true;
      whereConditions.push(`featured = $${paramCounter}`);
      queryParams.push(featuredBoolean);
      paramCounter++;
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM blog_posts ${whereClause}`;
    const countResult = await client.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // Get paginated posts
    const offset = (Number(page) - 1) * Number(limit);
    const postsQuery = `
      SELECT * FROM blog_posts 
      ${whereClause}
      ORDER BY published_at DESC 
      LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
    `;
    queryParams.push(Number(limit), offset);

    const postsResult = await client.query(postsQuery, queryParams);
    const posts = postsResult.rows.map(dbRowToBlogPost);

    const response: GetBlogPostsResponse = {
      posts,
      total,
      page: Number(page),
      limit: Number(limit),
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    res.status(500).json({
      message: "Unable to fetch blog posts at this time. Please try again later.",
      error: "FETCH_POSTS_FAILED"
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};

// GET /api/blog/:id - Get a single blog post
export const getBlogPost: RequestHandler = async (req, res) => {
  let client;
  try {
    const { id } = req.params;
    client = await getDbClient();

    const result = await client.query(
      "SELECT * FROM blog_posts WHERE id = $1",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Blog post not found" });
    }

    const post = dbRowToBlogPost(result.rows[0]);
    const response: GetBlogPostResponse = { post };
    res.json(response);
  } catch (error) {
    console.error("Error fetching blog post:", error);
    res.status(500).json({
      message: "Unable to fetch the requested blog post. Please try again later.",
      error: "FETCH_POST_FAILED"
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};

// POST /api/blog - Create a new blog post
export const createBlogPost: RequestHandler = async (req, res) => {
  let client;
  try {
    const {
      title,
      content,
      excerpt,
      author,
      tags = [],
      featured = false,
      featuredImage,
      imageAlt,
    } = req.body as CreateBlogPostRequest;

    // Validation
    if (!title || !content || !excerpt || !author) {
      return res
        .status(400)
        .json({ message: "Title, content, excerpt, and author are required" });
    }

    client = await getDbClient();
    const readingTime = calculateReadingTime(content);

    const result = await client.query(
      `
      INSERT INTO blog_posts (
        title, content, excerpt, author, tags, featured, reading_time,
        featured_image, image_alt
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `,
      [
        title,
        content,
        excerpt,
        author,
        tags,
        featured,
        readingTime,
        featuredImage || null,
        imageAlt || null,
      ],
    );

    const newPost = dbRowToBlogPost(result.rows[0]);

    const response: BlogPostResponse = {
      post: newPost,
      message: "Blog post created successfully",
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating blog post:", error);
    res.status(500).json({
      message: "Unable to create blog post. Please check your data and try again.",
      error: "CREATE_POST_FAILED"
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};

// PUT /api/blog/:id - Update a blog post
export const updateBlogPost: RequestHandler = async (req, res) => {
  let client;
  try {
    const { id } = req.params;
    const updateData = req.body as UpdateBlogPostRequest;

    client = await getDbClient();

    // Check if post exists
    const existingPost = await client.query(
      "SELECT * FROM blog_posts WHERE id = $1",
      [id],
    );

    if (existingPost.rows.length === 0) {
      return res.status(404).json({ message: "Blog post not found" });
    }

    // Build update query dynamically
    const updateFields: string[] = [];
    const queryParams: any[] = [];
    let paramCounter = 1;

    if (updateData.title !== undefined) {
      updateFields.push(`title = $${paramCounter}`);
      queryParams.push(updateData.title);
      paramCounter++;
    }

    if (updateData.content !== undefined) {
      updateFields.push(`content = $${paramCounter}`);
      queryParams.push(updateData.content);
      paramCounter++;

      updateFields.push(`reading_time = $${paramCounter}`);
      queryParams.push(calculateReadingTime(updateData.content));
      paramCounter++;
    }

    if (updateData.excerpt !== undefined) {
      updateFields.push(`excerpt = $${paramCounter}`);
      queryParams.push(updateData.excerpt);
      paramCounter++;
    }

    if (updateData.author !== undefined) {
      updateFields.push(`author = $${paramCounter}`);
      queryParams.push(updateData.author);
      paramCounter++;
    }

    if (updateData.tags !== undefined) {
      updateFields.push(`tags = $${paramCounter}`);
      queryParams.push(updateData.tags);
      paramCounter++;
    }

    if (updateData.featured !== undefined) {
      updateFields.push(`featured = $${paramCounter}`);
      queryParams.push(updateData.featured);
      paramCounter++;
    }

    if (updateData.featuredImage !== undefined) {
      updateFields.push(`featured_image = $${paramCounter}`);
      queryParams.push(updateData.featuredImage);
      paramCounter++;
    }

    if (updateData.imageAlt !== undefined) {
      updateFields.push(`image_alt = $${paramCounter}`);
      queryParams.push(updateData.imageAlt);
      paramCounter++;
    }

    // Always update the updated_at timestamp
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    // Add the ID parameter for WHERE clause
    queryParams.push(id);

    const updateQuery = `
      UPDATE blog_posts 
      SET ${updateFields.join(", ")}
      WHERE id = $${paramCounter}
      RETURNING *
    `;

    const result = await client.query(updateQuery, queryParams);
    const updatedPost = dbRowToBlogPost(result.rows[0]);

    const response: BlogPostResponse = {
      post: updatedPost,
      message: "Blog post updated successfully",
    };

    res.json(response);
  } catch (error) {
    console.error("Error updating blog post:", error);
    res.status(500).json({
      message: "Unable to update blog post. Please check your data and try again.",
      error: "UPDATE_POST_FAILED"
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};

// DELETE /api/blog/:id - Delete a blog post
export const deleteBlogPost: RequestHandler = async (req, res) => {
  let client;
  try {
    const { id } = req.params;
    client = await getDbClient();

    const result = await client.query(
      "DELETE FROM blog_posts WHERE id = $1 RETURNING id",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Blog post not found" });
    }

    const response: DeleteBlogPostResponse = {
      message: "Blog post deleted successfully",
      deletedId: id,
    };

    res.json(response);
  } catch (error) {
    console.error("Error deleting blog post:", error);
    res.status(500).json({
      message: "Unable to delete blog post. Please try again later.",
      error: "DELETE_POST_FAILED"
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};
