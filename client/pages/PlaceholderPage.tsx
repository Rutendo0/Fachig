import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export default function PlaceholderPage({
  title,
  description,
}: PlaceholderPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30 p-4 sm:p-6">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-6">
          <Link to="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Button>
          </Link>
        </div>

        <Card className="text-center">
          <CardHeader className="pb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">{title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{description}</p>
            <p className="text-sm text-muted-foreground">
              This feature is coming soon! Continue prompting to have us build
              out this page with the specific functionality you need.
            </p>
            <Link to="/">
              <Button className="mt-4">Return to Main Blog</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
