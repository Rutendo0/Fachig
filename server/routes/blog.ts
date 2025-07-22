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

// In-memory storage for demo purposes
// In production, you would use a database
let blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "Welcome to FACHIG: Cultivating Sustainable Futures",
    content: `# Welcome to FACHIG: Cultivating Sustainable Futures

Welcome to The Farmers Association of Community Self-Help Investment Groups (FACHIG) blog! We are a values-driven organization dedicated to creating a sustainable, equitable future through community empowerment and environmental stewardship.

## Our Mission

FACHIG focuses on four key pillars that guide our work:

- **Entrepreneurial Agriculture**: Supporting farmers in developing sustainable, profitable farming enterprises
- **Agroecology**: Promoting farming practices that work in harmony with natural ecosystems
- **Biodiversity Conservation**: Protecting and restoring the rich variety of life in our agricultural landscapes
- **Ecological Restoration**: Healing damaged ecosystems and returning them to health

## Community-Driven Change

We believe that lasting change comes from within communities. Our approach empowers local farmers and community groups to:

1. **Build Self-Reliance**: Develop skills and resources for long-term sustainability
2. **Share Knowledge**: Learn from each other's successes and challenges
3. **Restore Ecosystems**: Work together to heal the land that sustains us
4. **Create Prosperity**: Build economic opportunities that benefit everyone

## Join Our Movement

Together, we're restoring harmony between humanity and the environment. Every story shared here represents a step toward a more sustainable, equitable world.

Welcome to the FACHIG community! 🌱`,
    excerpt:
      "Welcome to FACHIG! Discover our mission of sustainable agriculture, community empowerment, and environmental restoration through entrepreneurial farming and agroecology.",
    author: "FACHIG Team",
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ["welcome", "sustainability", "agroecology", "community"],
    featured: true,
    readingTime: 3,
    featuredImage:
      "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=800&h=400&fit=crop&crop=center",
    imageAlt:
      "Diverse group of farmers working together in sustainable agricultural fields",
  },
  {
    id: "2",
    title: "Building Biodiversity: Companion Planting for Resilient Farms",
    content: `# How to Create Engaging Blog Content

Creating content that resonates with your audience is both an art and a science. Here are some tips to help you write engaging blog posts.

## Know Your Audience

Understanding who you're writing for is the foundation of great content. Consider:

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

Remember, great content takes time to create, but the results are worth it!`,
    excerpt:
      "Learn the essential strategies for creating blog content that engages your audience and keeps them coming back for more.",
    author: "Content Creator",
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    tags: ["content", "writing", "tips"],
    featured: false,
    readingTime: 3,
    featuredImage:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=400&fit=crop&crop=center",
    imageAlt: "Person writing in a notebook with creative ideas",
  },
];

let nextId = 3;

// Helper function to calculate reading time
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

// GET /api/blog - Get all blog posts
export const getBlogPosts: RequestHandler = (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    tag,
    featured,
  } = req.query as BlogPostsQuery;

  let filteredPosts = [...blogPosts];

  // Filter by search term
  if (search) {
    const searchLower = search.toLowerCase();
    filteredPosts = filteredPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchLower) ||
        post.content.toLowerCase().includes(searchLower) ||
        post.excerpt.toLowerCase().includes(searchLower),
    );
  }

  // Filter by tag
  if (tag) {
    filteredPosts = filteredPosts.filter((post) =>
      post.tags.some((t) => t.toLowerCase() === tag.toLowerCase()),
    );
  }

  // Filter by featured status
  if (featured !== undefined) {
    const featuredBoolean = featured === "true" || featured === true;
    filteredPosts = filteredPosts.filter(
      (post) => post.featured === featuredBoolean,
    );
  }

  // Sort by publishedAt (newest first)
  filteredPosts.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  // Pagination
  const startIndex = (Number(page) - 1) * Number(limit);
  const endIndex = startIndex + Number(limit);
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

  const response: GetBlogPostsResponse = {
    posts: paginatedPosts,
    total: filteredPosts.length,
    page: Number(page),
    limit: Number(limit),
  };

  res.json(response);
};

// GET /api/blog/:id - Get a single blog post
export const getBlogPost: RequestHandler = (req, res) => {
  const { id } = req.params;
  const post = blogPosts.find((p) => p.id === id);

  if (!post) {
    return res.status(404).json({ message: "Blog post not found" });
  }

  const response: GetBlogPostResponse = { post };
  res.json(response);
};

// POST /api/blog - Create a new blog post
export const createBlogPost: RequestHandler = (req, res) => {
  const {
    title,
    content,
    excerpt,
    author,
    tags = [],
    featured = false,
  } = req.body as CreateBlogPostRequest;

  // Validation
  if (!title || !content || !excerpt || !author) {
    return res
      .status(400)
      .json({ message: "Title, content, excerpt, and author are required" });
  }

  const now = new Date().toISOString();
  const newPost: BlogPost = {
    id: String(nextId++),
    title,
    content,
    excerpt,
    author,
    publishedAt: now,
    updatedAt: now,
    tags: tags || [],
    featured: featured || false,
    readingTime: calculateReadingTime(content),
  };

  blogPosts.push(newPost);

  const response: BlogPostResponse = {
    post: newPost,
    message: "Blog post created successfully",
  };

  res.status(201).json(response);
};

// PUT /api/blog/:id - Update a blog post
export const updateBlogPost: RequestHandler = (req, res) => {
  const { id } = req.params;
  const updateData = req.body as UpdateBlogPostRequest;

  const postIndex = blogPosts.findIndex((p) => p.id === id);

  if (postIndex === -1) {
    return res.status(404).json({ message: "Blog post not found" });
  }

  const currentPost = blogPosts[postIndex];
  const updatedPost: BlogPost = {
    ...currentPost,
    ...updateData,
    id, // Ensure ID doesn't change
    updatedAt: new Date().toISOString(),
    readingTime: updateData.content
      ? calculateReadingTime(updateData.content)
      : currentPost.readingTime,
  };

  blogPosts[postIndex] = updatedPost;

  const response: BlogPostResponse = {
    post: updatedPost,
    message: "Blog post updated successfully",
  };

  res.json(response);
};

// DELETE /api/blog/:id - Delete a blog post
export const deleteBlogPost: RequestHandler = (req, res) => {
  const { id } = req.params;
  const postIndex = blogPosts.findIndex((p) => p.id === id);

  if (postIndex === -1) {
    return res.status(404).json({ message: "Blog post not found" });
  }

  blogPosts.splice(postIndex, 1);

  const response: DeleteBlogPostResponse = {
    message: "Blog post deleted successfully",
    deletedId: id,
  };

  res.json(response);
};
