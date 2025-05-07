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

export function getAvailableFreeModels(): { id: string, name: string }[] {
  return [
    { id: "deepseek/deepseek-chat-v3-0324:free", name: "DeepSeek Chat v3" },
    { id: "deepseek/deepseek-r1:free", name: "DeepSeek R1" },
    { id: "meta-llama/llama-4-maverick:free", name: "Llama 4 Maverick" },
    { id: "google/gemini-1.5-pro", name: "Gemini 1.5 Pro" }
  ];
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
          throw new Error(`OpenRouter API error (after ${MAX_RETRIES} retries): ${error.response.status} - ${error.response.data?.message || JSON.stringify(error.response.data)}`);
        } else if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
          throw new Error(`OpenRouter API timeout after ${MAX_RETRIES} retries. The request took too long to complete.`);
        }
        throw new Error(`Failed to generate course content after ${MAX_RETRIES} retries`);
      }
    }
  }
  
  // This should not be reached, but TypeScript needs a return
  throw lastError || new Error("Failed to generate course content");
}
