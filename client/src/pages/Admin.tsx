import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ShieldAlert, Save, RotateCcw, CheckCircle2 } from "lucide-react";

// Admin user ID - replace with your actual Replit ID
const ADMIN_USER_ID = "38352714"; // xr0am's ID

export default function Admin() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("github");
  const [saving, setSaving] = useState(false);
  const [systemPrompts, setSystemPrompts] = useState({
    github: "",
    llmsTxt: ""
  });
  const [hasChanges, setHasChanges] = useState({
    github: false,
    llmsTxt: false
  });
  
  // Fetch current system prompts
  useEffect(() => {
    const fetchSystemPrompts = async () => {
      try {
        const response = await apiRequest("GET", "/api/admin/prompts");
        if (response.ok) {
          const data = await response.json();
          setSystemPrompts({
            github: data.github || "",
            llmsTxt: data.llmsTxt || ""
          });
        }
      } catch (error) {
        console.error("Failed to fetch system prompts:", error);
        toast({
          title: "Error",
          description: "Failed to load system prompts",
          variant: "destructive"
        });
      }
    };
    
    if (isAuthenticated && user?.id === ADMIN_USER_ID) {
      fetchSystemPrompts();
    }
  }, [isAuthenticated, user]);
  
  // Handle prompt changes
  const handlePromptChange = (type: "github" | "llmsTxt", value: string) => {
    setSystemPrompts(prev => ({
      ...prev,
      [type]: value
    }));
    
    setHasChanges(prev => ({
      ...prev,
      [type]: true
    }));
  };
  
  // Save updated prompt
  const savePrompt = async (type: "github" | "llmsTxt") => {
    setSaving(true);
    
    try {
      const response = await apiRequest("POST", "/api/admin/prompts", {
        type,
        prompt: systemPrompts[type]
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: `System prompt for ${type === "github" ? "GitHub" : "llms.txt"} updated successfully`,
        });
        
        setHasChanges(prev => ({
          ...prev,
          [type]: false
        }));
      } else {
        toast({
          title: "Error",
          description: "Failed to update system prompt",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Failed to save system prompt:", error);
      toast({
        title: "Error",
        description: "Failed to update system prompt",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Reset prompt to default
  const resetPromptToDefault = async (type: "github" | "llmsTxt") => {
    setSaving(true);
    
    try {
      const response = await apiRequest("POST", "/api/admin/prompts/reset", {
        type
      });
      
      if (response.ok) {
        const data = await response.json();
        
        setSystemPrompts(prev => ({
          ...prev,
          [type]: data.prompt
        }));
        
        setHasChanges(prev => ({
          ...prev,
          [type]: false
        }));
        
        toast({
          title: "Success",
          description: `System prompt for ${type === "github" ? "GitHub" : "llms.txt"} reset to default`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to reset system prompt",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Failed to reset system prompt:", error);
      toast({
        title: "Error",
        description: "Failed to reset system prompt",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }
  
  // Check if the user is authenticated and is an admin
  if (!isAuthenticated || (user && user.id !== ADMIN_USER_ID)) {
    return <Redirect to="/" />;
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <ShieldAlert className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Admin Settings</h1>
          </div>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>System Prompts Configuration</CardTitle>
              <CardDescription>
                Customize the prompts used by OpenRouter LLMs when generating courses. Changes apply to all new course generations.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="github" value={activeTab} onValueChange={(value) => setActiveTab(value as "github" | "llmsTxt")}>
                <TabsList className="mb-4">
                  <TabsTrigger value="github">GitHub Prompt</TabsTrigger>
                  <TabsTrigger value="llmsTxt">llms.txt Prompt</TabsTrigger>
                </TabsList>
                
                <TabsContent value="github" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="github-prompt">System Prompt for GitHub Repository Analysis</Label>
                    <Textarea 
                      id="github-prompt"
                      placeholder="Enter the system prompt for GitHub repository analysis..."
                      className="min-h-[300px] font-mono text-sm"
                      value={systemPrompts.github}
                      onChange={(e) => handlePromptChange("github", e.target.value)}
                    />
                  </div>
                  
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => resetPromptToDefault("github")}
                      disabled={saving}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reset to Default
                    </Button>
                    
                    <Button 
                      onClick={() => savePrompt("github")}
                      disabled={saving || !hasChanges.github}
                    >
                      {saving ? (
                        <>
                          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                          Saving...
                        </>
                      ) : hasChanges.github ? (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Saved
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="llmsTxt" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="llmstxt-prompt">System Prompt for llms.txt Analysis</Label>
                    <Textarea 
                      id="llmstxt-prompt"
                      placeholder="Enter the system prompt for llms.txt analysis..."
                      className="min-h-[300px] font-mono text-sm"
                      value={systemPrompts.llmsTxt}
                      onChange={(e) => handlePromptChange("llmsTxt", e.target.value)}
                    />
                  </div>
                  
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => resetPromptToDefault("llmsTxt")}
                      disabled={saving}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reset to Default
                    </Button>
                    
                    <Button 
                      onClick={() => savePrompt("llmsTxt")}
                      disabled={saving || !hasChanges.llmsTxt}
                    >
                      {saving ? (
                        <>
                          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                          Saving...
                        </>
                      ) : hasChanges.llmsTxt ? (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Saved
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}