import { CourseContent, ComplexityLevel } from "@shared/schema";

/**
 * Maps complexity levels to emoji representations
 */
export const complexityEmojis: Record<ComplexityLevel, string> = {
  beginner: "🌱",
  intermediate: "🌿",
  advanced: "🌲",
  expert: "🌳"
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
  if (!course || !course.steps || course.steps.length === 0) {
    return "beginner";
  }
  
  // Get all content as one string for analysis
  const allContent = course.steps.map(step => step.content).join(" ");
  
  // Base score starts from 0
  let complexityScore = 0;
  
  // Factor 1: Number of steps (more steps likely means more complexity)
  const stepCount = course.steps.length;
  if (stepCount <= 3) complexityScore += 0;
  else if (stepCount <= 5) complexityScore += 1;
  else if (stepCount <= 8) complexityScore += 2;
  else complexityScore += 3;
  
  // Factor 2: Average step length (longer steps typically contain more detailed/complex information)
  const averageStepLength = allContent.length / stepCount;
  if (averageStepLength < 500) complexityScore += 0;
  else if (averageStepLength < 1000) complexityScore += 1;
  else if (averageStepLength < 2000) complexityScore += 2;
  else complexityScore += 3;
  
  // Factor 3: Code block density
  const codeBlockMatches = allContent.match(/```[\s\S]*?```/g);
  const codeBlockCount = codeBlockMatches ? codeBlockMatches.length : 0;
  const codeBlockDensity = codeBlockCount / stepCount;
  
  if (codeBlockDensity < 0.5) complexityScore += 0;
  else if (codeBlockDensity < 1) complexityScore += 1;
  else if (codeBlockDensity < 2) complexityScore += 2;
  else complexityScore += 3;
  
  // Factor 4: Complexity keywords
  const beginnerKeywords = [
    "basic", "introduction", "getting started", "beginner", "simple",
    "fundamental", "overview", "elementary", "primer", "101"
  ];
  
  const intermediateKeywords = [
    "intermediate", "build upon", "develop", "extend", "improve",
    "practical", "implement", "create", "setup", "configure"
  ];
  
  const advancedKeywords = [
    "advanced", "complex", "optimize", "performance", "security",
    "scale", "architecture", "design patterns", "best practices", "efficient"
  ];
  
  const expertKeywords = [
    "expert", "mastery", "cutting-edge", "specialized", "sophisticated",
    "intricate", "comprehensive", "high-performance", "deep dive", "internals"
  ];
  
  // Count keyword occurrences (case insensitive)
  const lowerContent = allContent.toLowerCase();
  
  let beginnerCount = beginnerKeywords.reduce((count, keyword) => 
    count + (lowerContent.includes(keyword) ? 1 : 0), 0);
    
  let intermediateCount = intermediateKeywords.reduce((count, keyword) => 
    count + (lowerContent.includes(keyword) ? 1 : 0), 0);
    
  let advancedCount = advancedKeywords.reduce((count, keyword) => 
    count + (lowerContent.includes(keyword) ? 1 : 0), 0);
    
  let expertCount = expertKeywords.reduce((count, keyword) => 
    count + (lowerContent.includes(keyword) ? 1 : 0), 0);
  
  // Normalize keyword counts (0-3 scale)
  const keywordScore = (
    (beginnerCount * 0) + 
    (intermediateCount * 1) + 
    (advancedCount * 2) + 
    (expertCount * 3)
  ) / Math.max(1, beginnerCount + intermediateCount + advancedCount + expertCount);
  
  complexityScore += Math.round(keywordScore);
  
  // Factor 5: Technical terminology density
  const technicalTerms = [
    "algorithm", "runtime", "complexity", "middleware", "framework", 
    "architecture", "inheritance", "polymorphism", "encapsulation", 
    "asynchronous", "concurrent", "parallel", "optimization", "refactor",
    "dependency injection", "authentication", "authorization", "encryption",
    "serialization", "normalization", "transaction", "orchestration"
  ];
  
  let technicalTermCount = technicalTerms.reduce((count, term) => 
    count + (lowerContent.includes(term) ? 1 : 0), 0);
  
  if (technicalTermCount <= 2) complexityScore += 0;
  else if (technicalTermCount <= 5) complexityScore += 1;
  else if (technicalTermCount <= 10) complexityScore += 2;
  else complexityScore += 3;
  
  // Calculate final score (max possible is 15)
  // Map to complexity levels
  if (complexityScore <= 4) return "beginner";
  else if (complexityScore <= 8) return "intermediate";
  else if (complexityScore <= 12) return "advanced";
  else return "expert";
}

/**
 * Returns the emoji representation of a complexity level
 */
export function getComplexityEmoji(complexity?: ComplexityLevel | string | null): string {
  if (!complexity) return complexityEmojis.beginner;
  
  if (Object.keys(complexityEmojis).includes(complexity as string)) {
    return complexityEmojis[complexity as ComplexityLevel];
  }
  
  return complexityEmojis.beginner;
}

/**
 * Returns a formatted complexity label with emoji
 */
export function getComplexityLabel(complexity?: ComplexityLevel | string | null): string {
  if (!complexity) return `${complexityEmojis.beginner} Beginner`;
  
  const emoji = getComplexityEmoji(complexity);
  const label = complexity.charAt(0).toUpperCase() + complexity.slice(1);
  
  return `${emoji} ${label}`;
}