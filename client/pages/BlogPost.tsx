import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { BlogPost as BlogPostType, GetBlogPostResponse } from "@shared/blog";
import { useAdmin } from "@/contexts/AdminContext";
import { AdminToggle } from "@/components/AdminToggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Star,
  Edit,
  Trash2,
  BookOpen,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { isAdmin } = useAdmin();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchPost(id);
    }
  }, [id]);

  const fetchPost = async (postId: string) => {
    try {
      setLoading(true);
      setError(false);
      const response = await fetch(`/api/blog/${postId}`);

      if (!response.ok) {
        throw new Error("Post not found");
      }

      const data: GetBlogPostResponse = await response.json();
      setPost(data.post);
    } catch (error) {
      console.error("Error fetching post:", error);
      setError(true);
      toast({
        title: "Error",
        description: "Failed to load blog post",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatContent = (content: string) => {
    // Simple markdown-like formatting
    return content.split("\n").map((line, index) => {
      if (line.startsWith("# ")) {
        return (
          <h1 key={index} className="text-3xl font-bold mt-8 mb-4 first:mt-0">
            {line.slice(2)}
          </h1>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h2 key={index} className="text-2xl font-semibold mt-6 mb-3">
            {line.slice(3)}
          </h2>
        );
      }
      if (line.startsWith("### ")) {
        return (
          <h3 key={index} className="text-xl font-semibold mt-4 mb-2">
            {line.slice(4)}
          </h3>
        );
      }
      if (line.startsWith("- ")) {
        return (
          <li key={index} className="ml-4">
            {line.slice(2)}
          </li>
        );
      }
      if (line.trim() === "") {
        return <br key={index} />;
      }

      // Handle bold text
      const boldFormatted = line.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>",
      );

      return (
        <p
          key={index}
          className="mb-4 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: boldFormatted }}
        />
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30 p-4 sm:p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6">
            <Link to="/">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Blog
              </Button>
            </Link>
          </div>
          <Card>
            <CardContent className="p-8">
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
                <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
                <div className="space-y-2 mt-8">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30 p-4 sm:p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6">
            <Link to="/">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Blog
              </Button>
            </Link>
          </div>
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-2xl font-semibold mb-2">Post Not Found</h1>
              <p className="text-muted-foreground mb-6">
                The blog post you're looking for doesn't exist or has been
                removed.
              </p>
              <Link to="/">
                <Button>Return to Blog</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Blog
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <AdminToggle />
              {isAdmin && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => {
                      // This would trigger edit mode - we'll implement this later if needed
                      toast({
                        title: "Edit Mode",
                        description: "Edit functionality coming soon!",
                      });
                    }}
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => {
                      // This would trigger delete - we'll implement this later if needed
                      toast({
                        title: "Delete",
                        description: "Delete functionality coming soon!",
                      });
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
        <article>
          {/* Article Header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              {post.featured && (
                <Badge variant="default" className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Featured
                </Badge>
              )}
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
              {post.title}
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-6 leading-relaxed">
              {post.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-l-4 border-l-primary pl-4 mb-8">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="font-medium text-foreground">
                  {post.author}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(post.publishedAt)}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {post.readingTime} min read
              </div>
            </div>

            {/* Featured Image */}
            {post.featuredImage && (
              <div className="mb-8">
                <img
                  src={post.featuredImage}
                  alt={post.imageAlt || post.title}
                  className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-lg shadow-lg"
                />
                {post.imageAlt && (
                  <p className="text-sm text-muted-foreground text-center mt-2 italic">
                    {post.imageAlt}
                  </p>
                )}
              </div>
            )}
          </header>

          {/* Article Body */}
          <Card>
            <CardContent className="p-6 sm:p-8">
              <div className="prose prose-lg max-w-none text-foreground">
                {formatContent(post.content)}
              </div>
            </CardContent>
          </Card>

          {/* Article Footer */}
          <footer className="mt-8 pt-6 border-t">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Tags:</span>
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                Last updated: {formatDate(post.updatedAt)}
              </div>
            </div>
          </footer>
        </article>

        {/* Navigation */}
        <div className="mt-12 text-center">
          <Link to="/">
            <Button size="lg" className="flex items-center gap-2 mx-auto">
              <ArrowLeft className="w-4 h-4" />
              Back to All Posts
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
