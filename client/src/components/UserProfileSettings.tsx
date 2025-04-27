import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useOpenRouterSettings } from "@/hooks/useOpenRouterSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function UserProfileSettings() {
  const { user, isAuthenticated } = useAuth();
  const { saveApiKey, isSaving } = useOpenRouterSettings();
  const [apiKey, setApiKey] = useState<string>(user?.openrouterApiKey || "");

  if (!isAuthenticated) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>
            Please log in to view and manage your profile settings
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <Button 
            onClick={() => window.location.href = "/api/login"}
            className="mt-4"
          >
            Log in with Replit
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveApiKey(apiKey);
  };

  const hasApiKey = !!user?.openrouterApiKey;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
        <CardDescription>
          Manage your account settings and API keys
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-6 mb-6">
          <Avatar className="w-24 h-24">
            <AvatarImage src={user?.profileImageUrl} alt={user?.username} />
            <AvatarFallback>{user?.username?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl font-semibold">{user?.username}</h3>
            <p className="text-muted-foreground">{user?.email || 'No email provided'}</p>
            {user?.bio && <p className="mt-2">{user.bio}</p>}
          </div>
        </div>

        {!hasApiKey && (
          <Alert variant="warning" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>OpenRouter API Key Required</AlertTitle>
            <AlertDescription>
              You need to add your OpenRouter API key to generate courses. Get a free key at <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="underline">openrouter.ai</a>.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="apiKey">OpenRouter API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your OpenRouter API key"
              className="mt-1"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Your key is stored securely and used only for your requests
            </p>
          </div>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save API Key"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}