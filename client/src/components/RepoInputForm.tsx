import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SourceType } from "@/types";
import { CourseContent, ComplexityLevel } from "@shared/schema";
import { computeCourseComplexity } from "@/lib/courseUtils";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { useModels } from "@/hooks/useModels";
import ApiKeyPrompt from "./ApiKeyPrompt";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage, 
  FormDescription 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Github, FileText, Loader2, Sparkles, Bot, Globe, Lock } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const formSchema = z.object({
  sourceUrl: z.string()
    .min(1, { message: "Source URL is required" })
    .superRefine((url, ctx) => {
      // Different validation based on source type
      if (ctx.path[0] === 'sourceUrl' && ctx.data.sourceType === 'github') {
        // GitHub URL validation
        if (!(url.includes('github.com/') || url.includes('github.io/'))) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Must be a valid GitHub repository URL"
          });
        }
      } else if (ctx.path[0] === 'sourceUrl' && ctx.data.sourceType === 'llms-txt') {
        // llms.txt URL validation
        if (!(url.endsWith('llms.txt') || url.endsWith('llms-full.txt'))) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "URL must end with llms.txt or llms-full.txt"
          });
        }
      }
    }),
  sourceType: z.enum(["github", "llms-txt"], {
    required_error: "Source type is required",
  }),
  context: z.string().min(1, { message: "Context is required" }),
  model: z.string().min(1, { message: "Model selection is required" }),
  isPublic: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

interface RepoInputFormProps {
  onCourseGenerated: (course: CourseContent, sourceType: SourceType) => void;
}

export default function RepoInputForm({ onCourseGenerated }: RepoInputFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sourceType, setSourceType] = useState<SourceType>("github");
  const { user, isAuthenticated } = useAuth();
  const { models, isLoading: isLoadingModels } = useModels();
  const [isApiKeyPromptOpen, setIsApiKeyPromptOpen] = useState(false);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sourceUrl: "",
      sourceType: "github",
      context: "",
      model: "deepseek/deepseek-chat-v3-0324:free",
      isPublic: false,
    },
  });
  
  // Update the form value when the sourceType state changes
  const handleSourceTypeChange = (type: SourceType) => {
    setSourceType(type);
    form.setValue("sourceType", type);
  };
  
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: FormData) => {
      // Immediately notify parent component that generation has started
      // This lets the progress animation show immediately
      onCourseGenerated({
        title: "Generating...",
        repoUrl: data.sourceUrl,
        context: data.context,
        steps: []
      }, sourceType);
      
      const response = await apiRequest("POST", "/api/courses/generate", data);
      return response.json();
    },
    onSuccess: (data: CourseContent) => {
      // Compute complexity if not already set
      if (!data.complexity) {
        data.complexity = computeCourseComplexity(data);
      }
      
      onCourseGenerated(data, sourceType);
      toast({
        title: "Course generated successfully!",
        description: `Your custom course for ${data.repoUrl} has been created.`,
      });
      
      // Invalidate appropriate courses cache depending on visibility
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      
      if (isAuthenticated) {
        // Also invalidate user-specific courses
        queryClient.invalidateQueries({ queryKey: ["/api/courses/user"] });
        
        if (form.getValues("isPublic")) {
          // Also invalidate public courses if this course is public
          queryClient.invalidateQueries({ queryKey: ["/api/courses/public"] });
        }
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to generate course",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: FormData) => {
    // Check if user is authenticated but doesn't have an API key
    if (isAuthenticated && !user?.openrouterApiKey) {
      setIsApiKeyPromptOpen(true);
      return;
    }
    
    // Otherwise, proceed with the course generation
    mutate(data);
  };
  
  return (
    <>
      <Card className="border shadow-lg card-shadow mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold gradient-heading flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Generate Custom Course
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="text-sm font-medium mr-2">Source Type:</span>
                  <ToggleGroup type="single" value={sourceType} onValueChange={(value) => value && handleSourceTypeChange(value as SourceType)}>
                    <ToggleGroupItem value="github" aria-label="GitHub" className="flex items-center gap-1">
                      <Github className="h-3.5 w-3.5" />
                      <span>GitHub</span>
                    </ToggleGroupItem>
                    <ToggleGroupItem value="llms-txt" aria-label="llms.txt" className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      <span>llms.txt</span>
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
                
                <FormField
                  control={form.control}
                  name="sourceType"
                  render={({ field }) => (
                    <FormItem hidden>
                      <FormControl>
                        <Input {...field} type="hidden" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <Tabs defaultValue={sourceType} value={sourceType} onValueChange={(value) => handleSourceTypeChange(value as SourceType)}>
                <TabsContent value="github" className="mt-0 space-y-4">
                  <FormField
                    control={form.control}
                    name="sourceUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GitHub Repository URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://github.com/username/repo" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Enter a GitHub repository URL to generate a course about it.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                <TabsContent value="llms-txt" className="mt-0 space-y-4">
                  <FormField
                    control={form.control}
                    name="sourceUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website or llms.txt URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com or https://example.com/llms.txt" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Enter a website URL to fetch llms.txt or provide a direct link to an llms.txt file.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>
              
              <FormField
                control={form.control}
                name="context"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Use Case / Context</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your specific use case, technical requirements, or what you want to achieve with this tool."
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Provide context to make the generated course more specific to your needs.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select OpenRouter LLM</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingModels ? "Loading models..." : "Select a model"} />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingModels ? (
                            <div className="flex items-center justify-center py-2">
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              <span>Loading models...</span>
                            </div>
                          ) : models.length > 0 ? (
                            models.map((model) => (
                              <SelectItem 
                                key={model.id} 
                                value={model.id}
                                className="flex items-center gap-2"
                              >
                                <Bot className="h-4 w-4 text-blue-500" />
                                <span>{model.name}</span>
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="deepseek/deepseek-chat-v3-0324:free">
                              DeepSeek Chat v3 (Free)
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      {!isAuthenticated ? (
                        <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <Bot className="h-3.5 w-3.5" />
                          Log in and add your OpenRouter API key to use more models
                        </span>
                      ) : !user?.openrouterApiKey ? (
                        <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <Bot className="h-3.5 w-3.5" />
                          Add your OpenRouter API key in profile settings to use more models
                        </span>
                      ) : (
                        "Using available models from your OpenRouter account"
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {isAuthenticated && (
                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Share publicly</FormLabel>
                        <FormDescription>
                          {field.value ? (
                            <span className="flex items-center text-green-600 dark:text-green-400">
                              <Globe className="h-3.5 w-3.5 mr-1" />
                              Course will be visible to all users
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <Lock className="h-3.5 w-3.5 mr-1" />
                              Course will be private to your account
                            </span>
                          )}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
              
              <Button 
                type="submit" 
                disabled={isPending}
                className="w-full font-medium"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Custom Course
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        
        <CardFooter className="flex justify-center border-t pt-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Bot className="h-3 w-3" />
            Powered by OpenRouter API
          </p>
        </CardFooter>
      </Card>
      
      <ApiKeyPrompt 
        isOpen={isApiKeyPromptOpen} 
        onClose={() => setIsApiKeyPromptOpen(false)}
      />
    </>
  );
}
