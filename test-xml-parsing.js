// Test XML parsing functionality
const axios = require('axios');

async function testXMLParsing() {
  try {
    // First, let's fetch the XML content directly
    const response = await axios.get('https://www.tip.md/llms-full.txt');
    const xmlContent = response.data;
    
    console.log('Raw XML content (first 500 chars):');
    console.log(xmlContent.substring(0, 500));
    console.log('\n---\n');
    
    // Now test our XML extraction function
    function extractContentFromXML(xmlContent) {
      try {
        // Remove XML declaration and comments
        let cleanContent = xmlContent.replace(/<\?xml[^>]*\?>/gi, '').replace(/<!--[\s\S]*?-->/g, '');
        
        // Extract text content from common XML tags while preserving structure
        const extractedSections = [];
        
        // Extract project title and summary from attributes
        const projectMatch = cleanContent.match(/<project[^>]*title="([^"]*)"[^>]*summary="([^"]*)"[^>]*>/i);
        if (projectMatch) {
          extractedSections.push(`Title: ${projectMatch[1]}`);
          extractedSections.push(`Summary: ${projectMatch[2]}`);
        }
        
        // Extract doc sections
        const docMatches = cleanContent.match(/<doc[^>]*title="([^"]*)"[^>]*desc="([^"]*)"[^>]*>([\s\S]*?)<\/doc>/gi);
        if (docMatches) {
          docMatches.forEach(match => {
            const titleMatch = match.match(/title="([^"]*)"/i);
            const descMatch = match.match(/desc="([^"]*)"/i);
            const contentMatch = match.match(/<doc[^>]*>([\s\S]*?)<\/doc>/i);
            
            if (titleMatch && descMatch && contentMatch) {
              const title = titleMatch[1];
              const desc = descMatch[1];
              const content = contentMatch[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
              
              extractedSections.push(`${title}:\n${desc}\n${content.substring(0, 200)}...`);
            }
          });
        }
        
        return extractedSections.join('\n\n') || 'XML file structure detected but no readable content extracted.';
      } catch (error) {
        // Fallback to simple text extraction
        return xmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 2000);
      }
    }
    
    const extractedContent = extractContentFromXML(xmlContent);
    console.log('Extracted content:');
    console.log(extractedContent);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testXMLParsing();