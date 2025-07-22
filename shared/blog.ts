/**
 * Blog post interface for the blog application
 */
export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  tags: string[];
  featured: boolean;
  readingTime: number; // in minutes
  featuredImage?: string; // URL to featured image
  imageAlt?: string; // Alt text for the featured image
}

/**
 * API response for creating a blog post
 */
export interface CreateBlogPostRequest {
  title: string;
  content: string;
  excerpt: string;
  author: string;
  tags: string[];
  featured?: boolean;
  featuredImage?: string;
  imageAlt?: string;
}

/**
 * API response for updating a blog post
 */
export interface UpdateBlogPostRequest {
  id: string;
  title?: string;
  content?: string;
  excerpt?: string;
  author?: string;
  tags?: string[];
  featured?: boolean;
  featuredImage?: string;
  imageAlt?: string;
}

/**
 * API response for getting all blog posts
 */
export interface GetBlogPostsResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  limit: number;
}

/**
 * API response for getting a single blog post
 */
export interface GetBlogPostResponse {
  post: BlogPost;
}

/**
 * API response for creating/updating a blog post
 */
export interface BlogPostResponse {
  post: BlogPost;
  message: string;
}

/**
 * API response for deleting a blog post
 */
export interface DeleteBlogPostResponse {
  message: string;
  deletedId: string;
}

/**
 * Query parameters for getting blog posts
 */
export interface BlogPostsQuery {
  page?: number | string;
  limit?: number | string;
  search?: string;
  tag?: string;
  featured?: boolean | string;
}
