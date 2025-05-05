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
    { id: "google/gemini-2.5-pro-exp-03-25", name: "Gemini 2.5 Pro" }
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

  try {
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
        }
      }
    );

    if (response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error("No response content from OpenRouter");
    }
  } catch (error) {
    console.error("Error calling OpenRouter API:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`OpenRouter API error: ${error.response.status} - ${error.response.data.message || JSON.stringify(error.response.data)}`);
    }
    throw new Error("Failed to generate course content");
  }
}
