import { useState, useEffect } from "react";
import {
  BlogPost,
  GetBlogPostsResponse,
  CreateBlogPostRequest,
  UpdateBlogPostRequest,
  BlogPostResponse,
  DeleteBlogPostResponse,
} from "@shared/blog";
import { BlogPostCard } from "@/components/BlogPostCard";
import { BlogPostEditor } from "@/components/BlogPostEditor";
import { AdminToggle } from "@/components/AdminToggle";
import { useAdmin } from "@/contexts/AdminContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Search, Sparkles, BookOpen, Users, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Index() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { isAdmin } = useAdmin();

  // Fetch posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedTag) params.append("tag", selectedTag);

      const response = await fetch(`/api/blog?${params}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 503) {
          throw new Error(errorData.message || "Blog service is temporarily unavailable");
        } else {
          throw new Error(errorData.message || "Failed to fetch blog posts");
        }
      }

      let data: GetBlogPostsResponse;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse blog posts response as JSON:", parseError);
        throw new Error("Server returned an invalid response format");
      }

      setPosts(data.posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch blog posts";

      toast({
        title: "Unable to Load Posts",
        description: errorMessage,
        variant: "destructive",
      });

      // Set empty posts array to show "no posts" state instead of loading indefinitely
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [searchTerm, selectedTag]);

  // Handle create/update post
  const handleSavePost = async (
    postData: CreateBlogPostRequest | UpdateBlogPostRequest,
  ) => {
    try {
      setSaving(true);
      const isUpdate = "id" in postData;
      const url = isUpdate ? `/api/blog/${postData.id}` : "/api/blog";
      const method = isUpdate ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      let data: BlogPostResponse;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse save post response as JSON:", parseError);
        throw new Error("Server returned an invalid response format");
      }

      if (response.ok) {
        toast({
          title: "Success",
          description: data.message,
        });
        setShowEditor(false);
        setEditingPost(null);
        fetchPosts();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error saving post:", error);
      toast({
        title: "Error",
        description: "Failed to save blog post",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle delete post
  const handleDeletePost = async () => {
    if (!postToDelete) return;

    try {
      const response = await fetch(`/api/blog/${postToDelete}`, {
        method: "DELETE",
      });

      let data: DeleteBlogPostResponse;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse delete post response as JSON:", parseError);
        throw new Error("Server returned an invalid response format");
      }

      if (response.ok) {
        toast({
          title: "Success",
          description: data.message,
        });
        fetchPosts();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete blog post",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };

  // Get all unique tags
  const allTags = [...new Set(posts.flatMap((post) => post.tags))];

  // Filter featured posts
  const featuredPosts = posts.filter((post) => post.featured);

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setShowEditor(true);
  };

  const handleDeleteClick = (postId: string) => {
    setPostToDelete(postId);
    setDeleteDialogOpen(true);
  };

  const handleNewPost = () => {
    setEditingPost(null);
    setShowEditor(true);
  };

  if (showEditor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4 sm:p-6">
        <BlogPostEditor
          post={editingPost || undefined}
          onSave={handleSavePost}
          onCancel={() => {
            setShowEditor(false);
            setEditingPost(null);
          }}
          isLoading={saving}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5" />
        <div className="container mx-auto px-4 sm:px-6 pt-8 sm:pt-16 pb-6 sm:pb-8 relative">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <BookOpen className="w-8 h-8 text-primary" />
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                FACHIG Blog
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {isAdmin
                ? "Share stories of sustainable agriculture, community empowerment, and environmental restoration. Built for farmers, changemakers, and earth stewards."
                : "Discover inspiring stories of sustainable agriculture, agroecology, and community-driven environmental restoration from across our network."}
            </p>
            <div className="mt-6 flex justify-center">
              <AdminToggle />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="text-center p-6 rounded-lg bg-card border shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold">{posts.length}</div>
              <div className="text-sm text-muted-foreground">Total Posts</div>
            </div>
            <div className="text-center p-6 rounded-lg bg-card border shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold">{featuredPosts.length}</div>
              <div className="text-sm text-muted-foreground">Featured</div>
            </div>
            <div className="text-center p-6 rounded-lg bg-card border shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold">{allTags.length}</div>
              <div className="text-sm text-muted-foreground">Topics</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 pb-8 sm:pb-16">
        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between mb-8">
          <div className="flex-1 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedTag === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTag(null)}
                >
                  All Topics
                </Button>
                {allTags.slice(0, 5).map((tag) => (
                  <Button
                    key={tag}
                    variant={selectedTag === tag ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setSelectedTag(selectedTag === tag ? null : tag)
                    }
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {isAdmin && (
            <Button
              onClick={handleNewPost}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              New Post
            </Button>
          )}
        </div>

        {/* Active Filters */}
        {(searchTerm || selectedTag) && (
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-muted-foreground">
              Active filters:
            </span>
            {searchTerm && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: {searchTerm}
                <button
                  onClick={() => setSearchTerm("")}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
            {selectedTag && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Tag: {selectedTag}
                <button
                  onClick={() => setSelectedTag(null)}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Posts Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-64 bg-card border rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No posts found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || selectedTag
                ? "No posts match your current filters."
                : isAdmin
                  ? "Get started by creating your first blog post."
                  : "No blog posts are available at the moment."}
            </p>
            {isAdmin && (
              <Button
                onClick={handleNewPost}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Your First Post
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <BlogPostCard
                key={post.id}
                post={post}
                onEdit={isAdmin ? handleEditPost : undefined}
                onDelete={isAdmin ? handleDeleteClick : undefined}
                showActions={isAdmin}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this blog post? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePost}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
