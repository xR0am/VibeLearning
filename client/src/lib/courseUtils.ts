import { CourseContent, ComplexityLevel } from "@shared/schema";

/**
 * Maps complexity levels to emoji representations
 */
export const complexityEmojis: Record<ComplexityLevel, string> = {
  beginner: "🌱", // Sprout - for beginners
  intermediate: "🌟", // Star - for intermediate
  advanced: "🔥", // Fire - for advanced
  expert: "🚀", // Rocket - for expert level
};

/**
 * Computes the complexity score of a course by analyzing its content
 * Uses factors like:
 * - Number of steps
 * - Detected complexity keywords
 * - Code complexity in the steps
 * - Step length
 */
export function computeCourseComplexity(course: CourseContent): ComplexityLevel {
  if (!course?.steps?.length) return "beginner";
  
  // If already computed, return existing complexity
  if (course.complexity) return course.complexity;
  
  const totalSteps = course.steps.length;
  let complexityScore = 0;
  
  // Factor 1: Number of steps
  if (totalSteps <= 5) complexityScore += 1;
  else if (totalSteps <= 10) complexityScore += 2;
  else if (totalSteps <= 15) complexityScore += 3;
  else complexityScore += 4;

  // Factor 2: Content length
  const totalContentLength = course.steps.reduce((sum, step) => sum + step.content.length, 0);
  const avgContentLength = totalContentLength / totalSteps;
  
  if (avgContentLength < 500) complexityScore += 1; 
  else if (avgContentLength < 1000) complexityScore += 2;
  else if (avgContentLength < 2000) complexityScore += 3;
  else complexityScore += 4;

  // Factor 3: Complexity keywords in content
  const complexityKeywords = {
    beginner: ["basic", "simple", "introduction", "getting started", "beginner"],
    intermediate: ["implementation", "extend", "moderate", "function", "intermediate"],
    advanced: ["complex", "optimize", "advanced", "algorithm", "architecture"],
    expert: ["expert", "mastery", "high performance", "scalable", "production-grade"]
  };

  // Check for complexity keywords in title and context
  let keywordScore = 0;
  const combinedText = (course.title + " " + course.context).toLowerCase();
  
  for (const keyword of complexityKeywords.beginner) {
    if (combinedText.includes(keyword)) keywordScore = Math.max(keywordScore, 1);
  }
  
  for (const keyword of complexityKeywords.intermediate) {
    if (combinedText.includes(keyword)) keywordScore = Math.max(keywordScore, 2);
  }
  
  for (const keyword of complexityKeywords.advanced) {
    if (combinedText.includes(keyword)) keywordScore = Math.max(keywordScore, 3);
  }
  
  for (const keyword of complexityKeywords.expert) {
    if (combinedText.includes(keyword)) keywordScore = Math.max(keywordScore, 4);
  }
  
  complexityScore += keywordScore;
  
  // Factor 4: Code complexity based on likely presence of code blocks
  const codeBlockCount = course.steps.reduce((count, step) => {
    const codeBlockMatches = step.content.match(/```[a-zA-Z]*\n[\s\S]*?\n```/g);
    return count + (codeBlockMatches ? codeBlockMatches.length : 0);
  }, 0);
  
  if (codeBlockCount <= 3) complexityScore += 1;
  else if (codeBlockCount <= 8) complexityScore += 2;
  else if (codeBlockCount <= 15) complexityScore += 3;
  else complexityScore += 4;
  
  // Calculate average score and map to complexity level
  const avgScore = complexityScore / 4; // We used 4 factors
  
  if (avgScore < 1.5) return "beginner";
  if (avgScore < 2.5) return "intermediate";
  if (avgScore < 3.5) return "advanced";
  return "expert";
}

/**
 * Returns the emoji representation of a complexity level
 */
export function getComplexityEmoji(complexity?: ComplexityLevel | string | null): string {
  if (!complexity) return complexityEmojis.beginner;
  
  // Handle string type
  if (typeof complexity === 'string' && complexity in complexityEmojis) {
    return complexityEmojis[complexity as ComplexityLevel];
  }
  
  return complexityEmojis.beginner;
}

/**
 * Returns a formatted complexity label with emoji
 */
export function getComplexityLabel(complexity?: ComplexityLevel | string | null): string {
  if (!complexity) return `${complexityEmojis.beginner} Beginner`;
  
  const emoji = getComplexityEmoji(complexity as ComplexityLevel);
  
  // Format complexity string
  if (typeof complexity === 'string') {
    const formattedComplexity = complexity.charAt(0).toUpperCase() + complexity.slice(1);
    return `${emoji} ${formattedComplexity}`;
  }
  
  return `${emoji} Unknown`;
}