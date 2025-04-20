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

export async function generateCourseWithOpenRouter(
  repoInfo: string,
  context: string,
  model: string
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error("OpenRouter API key is not configured");
  }
  
  const systemPrompt = `
You are an expert developer educator. Your task is to create a comprehensive, step-by-step learning course for a developer who wants to understand and implement a specific tool or repository.

Based on the provided repository information and user context, create a structured course with 5-7 logical steps. Each step should build on the previous one and help the user achieve their specific goals.

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
1. The content is technically accurate and focused on practical implementation
2. Each step has clear, executable instructions
3. You include code examples where appropriate
4. You explain concepts clearly for the user's level
5. The overall course helps the user achieve their specific use case
6. Your response is ONLY the JSON object with no additional text
`;

  const userPrompt = `
Repository/Tool Information:
${repoInfo}

User Context/Use Case:
${context}

Please create a custom learning course based on this information.
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
          Authorization: `Bearer ${apiKey}`,
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
