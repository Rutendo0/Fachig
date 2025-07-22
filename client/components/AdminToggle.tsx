import { useState } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings, Lock, Unlock, Shield, Loader2 } from "lucide-react";

export function AdminToggle() {
  const { isAdmin, toggleAdmin, setAdmin } = useAdmin();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLogin = async () => {
    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse auth response as JSON:", parseError);
        throw new Error("Server returned an invalid response format");
      }

      if (data.success) {
        setAdmin(true);
        setShowPasswordDialog(false);
        setPassword("");
        setError("");
      } else {
        setError(data.message || "Invalid password");
      }
    } catch (error) {
      console.error("Auth error:", error);
      setError("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogout = () => {
    setAdmin(false);
    setPassword("");
    setError("");
  };

  if (isAdmin) {
    return (
      <div className="flex items-center gap-3">
        <Badge variant="default" className="flex items-center gap-1">
          <Shield className="w-3 h-3" />
          Admin Mode
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAdminLogout}
          className="flex items-center gap-2"
        >
          <Lock className="w-4 h-4" />
          Exit Admin
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <Settings className="w-4 h-4" />
          Admin
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Unlock className="w-5 h-5" />
            Admin Access
          </DialogTitle>
          <DialogDescription>
            Enter the admin password to access editing features.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAdminLogin();
                }
              }}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordDialog(false);
                setPassword("");
                setError("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdminLogin}
              disabled={!password || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
