import { useState, useEffect } from "react";
import {
  BlogPost,
  CreateBlogPostRequest,
  UpdateBlogPostRequest,
} from "@shared/blog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/ImageUpload";
import { X, Plus, Save, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlogPostEditorProps {
  post?: BlogPost;
  onSave: (postData: CreateBlogPostRequest | UpdateBlogPostRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function BlogPostEditor({
  post,
  onSave,
  onCancel,
  isLoading = false,
}: BlogPostEditorProps) {
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [author, setAuthor] = useState(post?.author || "");
  const [tags, setTags] = useState<string[]>(post?.tags || []);
  const [featured, setFeatured] = useState(post?.featured || false);
  const [featuredImage, setFeaturedImage] = useState(post?.featuredImage || "");
  const [imageAlt, setImageAlt] = useState(post?.imageAlt || "");
  const [newTag, setNewTag] = useState("");
  const [preview, setPreview] = useState(false);

  // Auto-generate excerpt from content if not provided
  useEffect(() => {
    if (!excerpt && content) {
      const plainText = content.replace(/[#*`]/g, "").trim();
      const firstParagraph = plainText.split("\n\n")[0];
      const truncated =
        firstParagraph.length > 160
          ? firstParagraph.substring(0, 160) + "..."
          : firstParagraph;
      setExcerpt(truncated);
    }
  }, [content, excerpt]);

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSave = () => {
    if (!title.trim() || !content.trim() || !excerpt.trim() || !author.trim()) {
      return;
    }

    const postData = {
      title: title.trim(),
      content: content.trim(),
      excerpt: excerpt.trim(),
      author: author.trim(),
      tags,
      featured,
      featuredImage: featuredImage.trim() || undefined,
      imageAlt: imageAlt.trim() || undefined,
    };

    if (post) {
      onSave({ ...postData, id: post.id } as UpdateBlogPostRequest);
    } else {
      onSave(postData as CreateBlogPostRequest);
    }
  };

  const isValid =
    title.trim() && content.trim() && excerpt.trim() && author.trim();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">
              {post ? "Edit Post" : "Create New Post"}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreview(!preview)}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                {preview ? "Edit" : "Preview"}
              </Button>
              <Button variant="outline" onClick={onCancel} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!isValid || isLoading}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isLoading ? "Saving..." : "Save Post"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!preview ? (
            <>
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your blog post title..."
                  className="text-lg"
                />
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt *</Label>
                <textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="A brief summary of your post..."
                  className={cn(
                    "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                  )}
                  rows={3}
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Content * (Markdown supported)</Label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your blog post content here... You can use markdown formatting."
                  className={cn(
                    "flex min-h-[400px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono",
                  )}
                />
              </div>

              {/* Author */}
              <div className="space-y-2">
                <Label htmlFor="author">Author *</Label>
                <Input
                  id="author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Author name"
                />
              </div>

              {/* Featured Image Upload */}
              <ImageUpload
                value={featuredImage}
                onChange={setFeaturedImage}
                onAltChange={setImageAlt}
                altValue={imageAlt}
              />

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTag}
                    disabled={!newTag.trim()}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </Button>
                </div>
              </div>

              {/* Featured */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={featured}
                  onCheckedChange={setFeatured}
                />
                <Label htmlFor="featured">Featured post</Label>
              </div>
            </>
          ) : (
            /* Preview */
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">{title}</h1>
                <p className="text-muted-foreground mt-2 text-lg">{excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
                  <span>by {author}</span>
                  {featured && <Badge variant="default">Featured</Badge>}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                {featuredImage && (
                  <div className="mt-6">
                    <img
                      src={featuredImage}
                      alt={imageAlt || title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    {imageAlt && (
                      <p className="text-sm text-muted-foreground text-center mt-2 italic">
                        {imageAlt}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans">{content}</pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
