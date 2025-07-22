import { BlogPost } from "@shared/blog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Edit, Trash2, Star } from "lucide-react";
import { Link } from "react-router-dom";

interface BlogPostCardProps {
  post: BlogPost;
  onEdit?: (post: BlogPost) => void;
  onDelete?: (postId: string) => void;
  showActions?: boolean;
}

export function BlogPostCard({
  post,
  onEdit,
  onDelete,
  showActions = true,
}: BlogPostCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/20 hover:border-l-primary cursor-pointer overflow-hidden">
      {post.featuredImage && (
        <div className="relative h-48 overflow-hidden">
          <Link to={`/post/${post.id}`}>
            <img
              src={post.featuredImage}
              alt={post.imageAlt || post.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
          {post.featured && (
            <div className="absolute top-3 left-3">
              <Badge
                variant="default"
                className="flex items-center gap-1 bg-primary/90 backdrop-blur-sm"
              >
                <Star className="w-3 h-3" />
                Featured
              </Badge>
            </div>
          )}
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Link to={`/post/${post.id}`} className="flex-1 block">
            <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {post.title}
              {post.featured && !post.featuredImage && (
                <Star className="inline-block w-4 h-4 ml-2 text-yellow-500 fill-current" />
              )}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(post.publishedAt)}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.readingTime} min read
              </div>
            </div>
          </Link>
          {showActions && (onEdit || onDelete) && (
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEdit(post);
                  }}
                  className="h-8 w-8 p-0"
                  title="Edit post"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(post.id);
                  }}
                  className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  title="Delete post"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <Link to={`/post/${post.id}`} className="block">
        <CardContent className="pt-0">
          <p className="text-muted-foreground mb-4 line-clamp-3">
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              by{" "}
              <span className="font-medium text-foreground">{post.author}</span>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
