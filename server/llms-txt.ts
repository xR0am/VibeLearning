import axios from "axios";

/**
 * Fetches llms.txt content from a URL
 * @param url - URL of the llms.txt file or website that might have a llms.txt file
 * @returns Promise with llms.txt content
 */
export async function fetchLlmsTxtContent(url: string): Promise<string> {
  try {
    // Normalize the URL
    let targetUrl = url.trim();
    
    // If it's just a domain without protocol, add https://
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = `https://${targetUrl}`;
    }
    
    // If URL doesn't end with llms.txt or similar, try to append /llms.txt
    if (!targetUrl.endsWith("llms.txt") && !targetUrl.endsWith("llms-full.txt")) {
      // Remove trailing slash if present
      targetUrl = targetUrl.replace(/\/$/, "");
      
      // Try to fetch /llms.txt first
      try {
        const llmsTxtUrl = `${targetUrl}/llms.txt`;
        const response = await axios.get(llmsTxtUrl);
        return `URL: ${llmsTxtUrl}\n\nLLMS.TXT Content:\n${response.data}`;
      } catch (error) {
        // If failed, try /llms-full.txt
        try {
          const llmsFullTxtUrl = `${targetUrl}/llms-full.txt`;
          const response = await axios.get(llmsFullTxtUrl);
          return `URL: ${llmsFullTxtUrl}\n\nLLMS-FULL.TXT Content:\n${response.data}`;
        } catch (innerError) {
          // Both attempts failed
          throw new Error("Could not find llms.txt or llms-full.txt at the provided URL");
        }
      }
    } else {
      // The URL already points to a llms.txt file
      const response = await axios.get(targetUrl);
      return `URL: ${targetUrl}\n\nContent:\n${response.data}`;
    }
  } catch (error) {
    console.error("Error fetching llms.txt content:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Error fetching llms.txt: ${error.response.status} - ${error.response.statusText}`);
    }
    throw new Error("Failed to fetch llms.txt content");
  }
}