import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useOpenRouterSettings } from "@/hooks/useOpenRouterSettings";
import { Bot, Key, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ApiKeyPromptProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApiKeyPrompt({ isOpen, onClose }: ApiKeyPromptProps) {
  const [apiKey, setApiKey] = useState("");
  const { saveApiKey, isSaving } = useOpenRouterSettings();
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setError("Please enter a valid API key");
      return;
    }
    
    saveApiKey(apiKey, {
      onSuccess: () => {
        setApiKey("");
        setError("");
        onClose();
      },
      onError: () => {
        setError("Failed to save API key. Please try again.");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            OpenRouter API Key Required
          </DialogTitle>
          <DialogDescription>
            You need an OpenRouter API key to generate courses. This allows DevCourse to use AI models.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="apiKey">Your OpenRouter API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your OpenRouter API key"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Get your free API key at <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="underline text-primary">openrouter.ai</a>
            </p>
          </div>
          
          <div className="flex items-start space-x-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded">
            <Bot className="h-4 w-4 mt-0.5 text-primary" />
            <div>
              <p>DevCourse uses AI to generate personalized courses from repositories and llms.txt files.</p>
              <p className="mt-1">Your key is stored securely and used only for your requests.</p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save API Key"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}