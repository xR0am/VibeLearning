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
        const content = response.data;
        
        // Check if content is XML-based (unusual but possible for llms.txt)
        if (content.includes("<?xml") || content.trim().startsWith("<")) {
          return `URL: ${llmsTxtUrl}\n\nXML Content Type: llms.txt (XML format)\n\nContent Summary:\nThis appears to be an XML-based llms.txt file. This is unusual, as XML format is typically used for llms-full.txt files.\n\nContent Preview:\n${content.substring(0, 1000)}...`;
        }
        
        return `URL: ${llmsTxtUrl}\n\nLLMS.TXT Content:\n${content}`;
      } catch (error) {
        // If failed, try /llms-full.txt
        try {
          const llmsFullTxtUrl = `${targetUrl}/llms-full.txt`;
          const response = await axios.get(llmsFullTxtUrl);
          
          // Check if content is XML-based
          const content = response.data;
          if (content.includes("<?xml") || content.trim().startsWith("<")) {
            return `URL: ${llmsFullTxtUrl}\n\nXML Content Type: llms-full.txt (XML format)\n\nContent Summary:\nThis is an XML-based llms-full.txt file that uses structured XML tags to define language model specifications. XML format allows for more detailed and hierarchical organization of information.\n\nContent Preview:\n${content.substring(0, 1000)}...`;
          }
          
          return `URL: ${llmsFullTxtUrl}\n\nLLMS-FULL.TXT Content:\n${content}`;
        } catch (innerError) {
          // Both attempts failed
          throw new Error("Could not find llms.txt or llms-full.txt at the provided URL");
        }
      }
    } else {
      // The URL already points to a llms.txt file
      const response = await axios.get(targetUrl);
      
      // Check if content is XML-based
      const content = response.data;
      if (targetUrl.endsWith("llms-full.txt") && (content.includes("<?xml") || content.trim().startsWith("<"))) {
        return `URL: ${targetUrl}\n\nXML Content Type: llms-full.txt (XML format)\n\nContent Summary:\nThis is an XML-based llms-full.txt file that uses structured XML tags to define language model specifications. XML format allows for more detailed and hierarchical organization of information.\n\nContent Preview:\n${content.substring(0, 1000)}...`;
      }
      
      return `URL: ${targetUrl}\n\nContent:\n${content}`;
    }
  } catch (error) {
    console.error("Error fetching llms.txt content:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Error fetching llms.txt: ${error.response.status} - ${error.response.statusText}`);
    }
    throw new Error("Failed to fetch llms.txt content");
  }
}