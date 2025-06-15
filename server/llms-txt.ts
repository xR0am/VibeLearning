import axios from "axios";

/**
 * Extracts meaningful content from XML-formatted llms.txt files
 * @param xmlContent - Raw XML content
 * @returns Extracted and formatted content
 */
function extractContentFromXML(xmlContent: string): string {
  try {
    // Remove XML declaration and comments
    let cleanContent = xmlContent.replace(/<\?xml[^>]*\?>/gi, '').replace(/<!--[\s\S]*?-->/g, '');
    
    // Extract text content from common XML tags while preserving structure
    const extractedSections: string[] = [];
    
    // Common patterns in llms.txt XML files
    const patterns = [
      { tag: 'title', label: 'Title' },
      { tag: 'description', label: 'Description' },
      { tag: 'summary', label: 'Summary' },
      { tag: 'overview', label: 'Overview' },
      { tag: 'features', label: 'Features' },
      { tag: 'capabilities', label: 'Capabilities' },
      { tag: 'usage', label: 'Usage' },
      { tag: 'instructions', label: 'Instructions' },
      { tag: 'examples', label: 'Examples' },
      { tag: 'api', label: 'API Information' },
      { tag: 'endpoints', label: 'Endpoints' },
      { tag: 'parameters', label: 'Parameters' },
      { tag: 'documentation', label: 'Documentation' }
    ];
    
    patterns.forEach(({ tag, label }) => {
      const regex = new RegExp(`<${tag}[^>]*>([\s\S]*?)<\/${tag}>`, 'gi');
      const matches = cleanContent.match(regex);
      if (matches) {
        matches.forEach(match => {
          const content = match.replace(new RegExp(`<\/?${tag}[^>]*>`, 'gi'), '').trim();
          if (content && content.length > 0) {
            extractedSections.push(`${label}:\n${content}`);
          }
        });
      }
    });
    
    // If no structured content found, extract all text content
    if (extractedSections.length === 0) {
      const textContent = cleanContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      if (textContent.length > 0) {
        extractedSections.push(`Content:\n${textContent}`);
      }
    }
    
    return extractedSections.join('\n\n') || 'XML file structure detected but no readable content extracted.';
  } catch (error) {
    // Fallback to simple text extraction
    return xmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 2000);
  }
}

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
          const extractedContent = extractContentFromXML(content);
          return `URL: ${llmsTxtUrl}\n\nXML Content Type: llms.txt (XML format)\n\nExtracted Content:\n${extractedContent}`;
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
            const extractedContent = extractContentFromXML(content);
            return `URL: ${llmsFullTxtUrl}\n\nXML Content Type: llms-full.txt (XML format)\n\nExtracted Content:\n${extractedContent}`;
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
      if (content.includes("<?xml") || content.trim().startsWith("<")) {
        const extractedContent = extractContentFromXML(content);
        const fileType = targetUrl.endsWith("llms-full.txt") ? "llms-full.txt" : "llms.txt";
        return `URL: ${targetUrl}\n\nXML Content Type: ${fileType} (XML format)\n\nExtracted Content:\n${extractedContent}`;
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