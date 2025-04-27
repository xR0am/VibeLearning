import axios from "axios";

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
    { id: "google/gemini-2.5-pro-exp-03-25:free", name: "Gemini 2.5 Pro" }
  ];
}

export async function generateCourseWithOpenRouter(
  sourceInfo: string,
  context: string,
  model: string,
  apiKey?: string
): Promise<string> {
  // If no API key is provided, check for environment variable
  const effectiveApiKey = apiKey || process.env.OPENROUTER_API_KEY;
  
  if (!effectiveApiKey) {
    throw new Error("OpenRouter API key is required. Please add your API key in account settings.");
  }
  
  const systemPrompt = `
You are an expert developer educator. Your task is to create a comprehensive, step-by-step learning course for a developer who wants to understand and implement a specific tool, repository, or content from llms.txt.

Based on the provided source information (either repository details or llms.txt content) and user context, create a structured course with 5-7 logical steps. Each step should build on the previous one and help the user achieve their specific goals.

IMPORTANT: You must ONLY use information explicitly documented in the provided source. DO NOT invent, assume, or create features, functionalities, methods, or options that are not clearly mentioned in the documentation or repository content. If the source is incomplete, only teach what is actually documented.

Format your response as a JSON object with the following structure:
{
  "title": "A descriptive title for the course",
  "steps": [
    {
      "id": 1,
      "title": "Step 1 Title",
      "content": "Detailed markdown content for step 1..."
    },
    {
      "id": 2,
      "title": "Step 2 Title",
      "content": "Detailed markdown content for step 2..."
    }
    // ... more steps
  ]
}

Make sure:
1. The content is technically accurate and focused ONLY on what's explicitly documented
2. Each step has clear, executable instructions based on actual documentation
3. You include code examples directly from or closely based on the source content
4. You explain concepts clearly for the user's level
5. You never suggest features or options that aren't explicitly mentioned in the source
6. If information is lacking, acknowledge limitations rather than inventing functionality
7. The overall course helps the user achieve their specific use case within the constraints of what's documented
8. Your response is ONLY the JSON object with no additional text
`;

  const userPrompt = `
Source Information:
${sourceInfo}

User Context/Use Case:
${context}

Please create a custom learning course based on this information. Remember to strictly adhere to what's explicitly documented in the source information above. Do not invent or assume features that aren't clearly mentioned in the documentation. If the documentation is incomplete, acknowledge the limitations rather than filling in gaps with assumptions.
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
