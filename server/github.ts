import axios from "axios";

/**
 * Fetches repository information from GitHub
 * @param repoUrl - GitHub repository URL
 * @returns Promise with repository information
 */
export async function fetchRepositoryInfo(repoUrl: string): Promise<string> {
  // If not a GitHub URL, return original input
  if (!repoUrl.includes("github.com")) {
    return repoUrl;
  }
  
  try {
    // Parse GitHub URL to extract owner and repo
    const urlSegments = repoUrl.replace(/\/$/, "").split("/");
    const owner = urlSegments[urlSegments.indexOf("github.com") + 1];
    const repo = urlSegments[urlSegments.indexOf("github.com") + 2];
    
    if (!owner || !repo) {
      return repoUrl;
    }
    
    // GitHub API endpoints
    const repoEndpoint = `https://api.github.com/repos/${owner}/${repo}`;
    const readmeEndpoint = `https://api.github.com/repos/${owner}/${repo}/readme`;
    
    // Make parallel requests
    const [repoRes, readmeRes] = await Promise.all([
      axios.get(repoEndpoint, {
        headers: {
          Accept: "application/vnd.github.v3+json",
          ...(process.env.GITHUB_TOKEN && { Authorization: `token ${process.env.GITHUB_TOKEN}` })
        }
      }).catch(() => null),
      axios.get(readmeEndpoint, {
        headers: {
          Accept: "application/vnd.github.v3+json",
          ...(process.env.GITHUB_TOKEN && { Authorization: `token ${process.env.GITHUB_TOKEN}` })
        }
      }).catch(() => null)
    ]);
    
    let repoInfo = "";
    
    // Extract repository metadata
    if (repoRes && repoRes.data) {
      const { name, description, topics, language, stargazers_count, default_branch } = repoRes.data;
      repoInfo += `Repository: ${name}\n`;
      repoInfo += `URL: ${repoUrl}\n`;
      if (description) repoInfo += `Description: ${description}\n`;
      if (language) repoInfo += `Primary Language: ${language}\n`;
      if (topics && topics.length) repoInfo += `Topics: ${topics.join(", ")}\n`;
      if (stargazers_count) repoInfo += `Stars: ${stargazers_count}\n`;
      repoInfo += `Default Branch: ${default_branch || 'master'}\n\n`;
    }
    
    // Extract README content
    if (readmeRes && readmeRes.data && readmeRes.data.content) {
      const content = Buffer.from(readmeRes.data.content, 'base64').toString('utf-8');
      repoInfo += `README Content:\n${content}`;
    }
    
    return repoInfo || repoUrl;
  } catch (error) {
    console.error("Error fetching GitHub repository info:", error);
    // Return original URL if anything fails
    return repoUrl;
  }
}
