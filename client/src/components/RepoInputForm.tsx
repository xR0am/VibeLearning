import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { CourseContent, SourceType } from "@/types";

const formSchema = z.object({
  sourceUrl: z.string().min(1, { message: "Source URL is required" }),
  sourceType: z.enum(["github", "llms-txt"], {
    required_error: "Source type is required",
  }),
  context: z.string().min(1, { message: "Context is required" }),
  model: z.string().min(1, { message: "Model selection is required" }),
});

type FormData = z.infer<typeof formSchema>;

interface RepoInputFormProps {
  onCourseGenerated: (course: CourseContent) => void;
}

export default function RepoInputForm({ onCourseGenerated }: RepoInputFormProps) {
  const { toast } = useToast();
  const [sourceType, setSourceType] = useState<SourceType>("github");
  
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sourceUrl: "",
      sourceType: "github",
      context: "",
      model: "anthropic/claude-3-opus",
    },
  });
  
  // Update the form value when the sourceType state changes
  const handleSourceTypeChange = (type: SourceType) => {
    setSourceType(type);
    setValue("sourceType", type);
  };
  
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/courses/generate", data);
      return response.json();
    },
    onSuccess: (data: CourseContent) => {
      onCourseGenerated(data);
      toast({
        title: "Course generated successfully!",
        description: `Your custom course for ${data.repoUrl} has been created.`,
      });
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
    mutate(data);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex space-x-2 mb-2">
          <button
            type="button"
            onClick={() => handleSourceTypeChange("github")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              sourceType === "github"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            GitHub Repository
          </button>
          <button
            type="button"
            onClick={() => handleSourceTypeChange("llms-txt")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              sourceType === "llms-txt"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            llms.txt
          </button>
          
          {/* Hidden field to store the source type */}
          <input 
            type="hidden" 
            {...register("sourceType")} 
          />
        </div>
        
        <div>
          <label htmlFor="sourceUrl" className="block text-sm font-medium text-gray-700 mb-1">
            {sourceType === "github" 
              ? "GitHub Repository URL" 
              : "Website or llms.txt URL"}
          </label>
          <input 
            id="sourceUrl"
            {...register("sourceUrl")}
            placeholder={
              sourceType === "github"
                ? "https://github.com/username/repo"
                : "https://example.com or https://example.com/llms.txt"
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          />
          {errors.sourceUrl && (
            <p className="mt-1 text-sm text-red-600">{errors.sourceUrl.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {sourceType === "github" 
              ? "Enter a GitHub repository URL to generate a course about it." 
              : "Enter a website URL to fetch llms.txt or provide a direct link to an llms.txt file."}
          </p>
        </div>
        
        <div>
          <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-1">
            Your Use Case / Context
          </label>
          <textarea 
            id="context"
            {...register("context")} 
            rows={4} 
            placeholder="Describe your specific use case, technical requirements, or what you want to achieve with this tool."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          />
          {errors.context && (
            <p className="mt-1 text-sm text-red-600">{errors.context.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
            Select OpenRouter LLM
          </label>
          <div className="relative">
            <select 
              id="model"
              {...register("model")}
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary appearance-none"
            >
              <option value="anthropic/claude-3-opus">Claude 3 Opus</option>
              <option value="anthropic/claude-3-sonnet">Claude 3 Sonnet</option>
              <option value="google/gemini-1.5-pro">Gemini 1.5 Pro</option>
              <option value="google/gemini-pro">Gemini Pro</option>
              <option value="anthropic/claude-3-haiku">Claude 3 Haiku</option>
              <option value="openai/gpt-4o">GPT-4o</option>
              <option value="openai/gpt-4-turbo">GPT-4 Turbo</option>
              <option value="meta-llama/llama-3-70b-instruct">Llama 3 70B</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <i className="fas fa-chevron-down text-xs"></i>
            </div>
          </div>
          {errors.model && (
            <p className="mt-1 text-sm text-red-600">{errors.model.message}</p>
          )}
        </div>
        
        <div>
          <button 
            type="submit" 
            disabled={isPending}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <span>{isPending ? "Generating..." : "Generate Custom Course"}</span>
            {isPending && (
              <span className="ml-2">
                <i className="fas fa-circle-notch fa-spin"></i>
              </span>
            )}
          </button>
        </div>
        
        <div className="text-xs text-gray-500 text-center">
          <p>Powered by OpenRouter API | Usage costs apply based on model selection</p>
        </div>
      </form>
    </div>
  );
}
