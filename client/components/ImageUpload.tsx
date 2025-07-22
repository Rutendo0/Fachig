import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onAltChange: (alt: string) => void;
  altValue?: string;
  className?: string;
}

interface UploadResponse {
  success: boolean;
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  storage?: 'cloudinary' | 'local';
  error?: string;
  message?: string;
}

export function ImageUpload({
  value,
  onChange,
  onAltChange,
  altValue = "",
  className,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, GIF, WebP)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      let data: UploadResponse;
      try {
        data = await response.json();
      } catch (parseError) {
        // If response is not JSON, create a generic error response
        console.error("Failed to parse response as JSON:", parseError);
        throw new Error("Server returned an invalid response. Please try again.");
      }

      if (response.ok && data.success) {
        onChange(data.url);
        if (!altValue) {
          // Auto-generate alt text from filename
          const nameWithoutExt = data.originalName.replace(/\.[^/.]+$/, "");
          const autoAlt = nameWithoutExt
            .replace(/[-_]/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());
          onAltChange(autoAlt);
        }
        const storageType = data.storage === 'cloudinary' ? 'cloud storage' : 'local storage';
        toast({
          title: "Image uploaded successfully",
          description: `${data.originalName} has been uploaded to ${storageType}`,
        });
      } else {
        // Handle serverless environment error specifically
        if (response.status === 501) {
          throw new Error("Image upload is not supported in this deployment environment. Please use direct image URLs from external services like Unsplash, Imgur, or other image hosting platforms.");
        } else {
          throw new Error(data.error || data.message || "Upload failed");
        }
      }
    } catch (error) {
      console.error("Upload error:", error);

      // Check if it's a serverless environment limitation
      if (error instanceof Error && error.message.includes("serverless")) {
        toast({
          title: "Upload not available",
          description: "File upload is not supported in this deployment. Please use direct image URLs instead.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Upload failed",
          description:
            error instanceof Error ? error.message : "Failed to upload image",
          variant: "destructive",
        });
      }
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const removeImage = () => {
    onChange("");
    onAltChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* URL Input */}
        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL or Upload File</Label>
          <div className="flex gap-2">
            <Input
              id="imageUrl"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://example.com/image.jpg or upload below"
              className="flex-1"
            />
            {value && (
              <Button
                variant="outline"
                size="sm"
                onClick={removeImage}
                className="px-3"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* File Upload Area */}
        <Card
          className={`border-2 border-dashed transition-colors cursor-pointer ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          } ${uploading ? "pointer-events-none opacity-50" : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <CardContent className="p-6 text-center">
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Uploading image...
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-medium">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-muted-foreground">
                    PNG, JPG, GIF, WebP up to 10MB
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Images uploaded to secure cloud storage
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Alt Text Input */}
        <div className="space-y-2">
          <Label htmlFor="imageAlt">Image Alt Text</Label>
          <Input
            id="imageAlt"
            value={altValue}
            onChange={(e) => onAltChange(e.target.value)}
            placeholder="Describe the image for accessibility"
          />
        </div>

        {/* Image Preview */}
        {value && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Preview</span>
              </div>
              <img
                src={value}
                alt={altValue || "Preview"}
                className="w-full max-w-sm h-32 object-cover rounded border"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              {altValue && (
                <p className="text-xs text-muted-foreground mt-2 italic">
                  Alt text: {altValue}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
