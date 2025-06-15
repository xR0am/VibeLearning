import axios from "axios";
import { getSystemPrompt } from "./admin";

// Interface for OpenRouter API request
interface OpenRouterRequest {
  messages: {
    role: "system" | "user" | "assistant";
    content: string;
  }[];
  model: string;
}

// Interface for OpenRouter API response
interface OpenRouterResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
  }[];
}

// Cache for models to avoid excessive API calls
let cachedModels: { id: string, name: string }[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Interface for OpenRouter model response
interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length?: number;
  pricing?: {
    prompt: string;
    completion: string;
  };
}

export async function getAllAvailableModels(): Promise<{ id: string, name: string }[]> {
  const now = Date.now();
  
  // Return cached models if they're still fresh
  if (cachedModels.length > 0 && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedModels;
  }
  
  try {
    const response = await axios.get('https://openrouter.ai/api/v1/models', {
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (response.data && response.data.data) {
      // Transform the response to our expected format
      const models: { id: string, name: string }[] = response.data.data.map((model: OpenRouterModel) => ({
        id: model.id,
        name: model.name
      }));
      
      // Sort models alphabetically by name
      models.sort((a, b) => a.name.localeCompare(b.name));
      
      // Update cache
      cachedModels = models;
      lastFetchTime = now;
      
      return models;
    }
  } catch (error) {
    console.error('Failed to fetch models from OpenRouter:', error);
    
    // If we have cached models, return them even if they're stale
    if (cachedModels.length > 0) {
      return cachedModels;
    }
  }
  
  // Fallback to a basic set of known working models if API fails
  return getDefaultModels();
}

export function getDefaultModels(): { id: string, name: string }[] {
  return [
    { id: "deepseek/deepseek-chat-v3-0324:free", name: "DeepSeek Chat v3" },
    { id: "meta-llama/llama-4-maverick:free", name: "Llama 4 Maverick" },
    { id: "google/gemini-2.5-pro-exp-03-25", name: "Gemini 2.5 Pro" },
    { id: "anthropic/claude-3-5-sonnet", name: "Claude 3.5 Sonnet" },
    { id: "openai/gpt-4o", name: "GPT-4o" },
    { id: "openai/gpt-4o-mini", name: "GPT-4o Mini" }
  ];
}

// Legacy function for backward compatibility - now returns all models
export function getAvailableFreeModels(): { id: string, name: string }[] {
  return getDefaultModels();
}

export async function generateCourseWithOpenRouter(
  sourceInfo: string,
  context: string,
  model: string,
  apiKey?: string,
  sourceType: "github" | "llms-txt" = "github"
): Promise<string> {
  // If no API key is provided, check for environment variable
  const effectiveApiKey = apiKey || process.env.OPENROUTER_API_KEY;
  
  if (!effectiveApiKey) {
    throw new Error("OpenRouter API key is required. Please add your API key in account settings.");
  }
  
  // Get the appropriate system prompt from admin settings based on source type
  const systemPrompt = getSystemPrompt(sourceType === "github" ? "github" : "llmsTxt");

  const userPrompt = `
Source Information:
${sourceInfo}

User Context/Use Case:
${context}

Please create a custom learning course based on this ${sourceType === "github" ? "repository" : "llms.txt file"} and the user's specific needs. Remember to strictly adhere to what's explicitly documented in the source information above. Do not invent or assume features that aren't clearly mentioned in the documentation.
`;

  // Retry functionality
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1500; // 1.5 seconds delay between retries
  
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  let lastError: any;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${MAX_RETRIES} to call OpenRouter API...`);
      
      const response = await axios.post<OpenRouterResponse>(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          model
        },
        {
          headers: {
            Authorization: `Bearer ${effectiveApiKey}`,
            "Content-Type": "application/json"
          },
          timeout: 60000 // 60 seconds timeout
        }
      );

      if (response.data.choices && response.data.choices.length > 0) {
        console.log(`Successfully generated course content after ${attempt} attempt(s)`);
        return response.data.choices[0].message.content;
      } else {
        throw new Error("No response content from OpenRouter");
      }
    } catch (error) {
      lastError = error;
      
      if (attempt < MAX_RETRIES) {
        console.log(`Attempt ${attempt} failed. Retrying in ${RETRY_DELAY/1000} seconds...`);
        await sleep(RETRY_DELAY);
      } else {
        console.error("All retry attempts failed for OpenRouter API call:", error);
        
        if (axios.isAxiosError(error) && error.response) {
          const errorData = error.response.data;
          const errorMessage = errorData?.error?.message || errorData?.message || JSON.stringify(errorData);
          
          // Create a structured error with suggestions
          let suggestions: string[] = [];
          
          // Handle specific error types with suggestions
          if (errorMessage.includes('maximum context length') || errorMessage.includes('context length')) {
            suggestions = [
              'Try a model with larger context window like Claude 3.5 Sonnet or GPT-4 Turbo',
              'Use a smaller repository or provide more specific context',
              'Break down your request into smaller parts'
            ];
          } else if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
            suggestions = [
              'Try a different model that may have higher rate limits',
              'Wait a few minutes before trying again',
              'Consider using a free model if available'
            ];
          } else if (errorMessage.includes('unauthorized') || errorMessage.includes('authentication')) {
            suggestions = [
              'Check if your API key is valid and has sufficient credits',
              'Try logging out and back in to refresh your session'
            ];
          }
          
          const structuredError = {
            type: 'api_error',
            status: error.response.status,
            message: errorMessage,
            suggestions
          };
          
          throw new Error(JSON.stringify(structuredError));
        } else if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
          const timeoutError = {
            type: 'timeout_error',
            message: 'Request timed out after multiple attempts',
            suggestions: [
              'Try a faster model for quicker responses',
              'Reduce the size of your input content',
              'Check your internet connection'
            ]
          };
          throw new Error(JSON.stringify(timeoutError));
        }
        
        const genericError = {
          type: 'unknown_error',
          message: 'Failed to generate course content',
          suggestions: [
            'Try a different model',
            'Check your internet connection',
            'Try again in a few minutes'
          ]
        };
        throw new Error(JSON.stringify(genericError));
      }
    }
  }
  
  // This should not be reached, but TypeScript needs a return
  throw lastError || new Error("Failed to generate course content");
}
