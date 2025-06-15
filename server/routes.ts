import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { generateCourseRequestSchema, courseContentSchema } from "@shared/schema";
import { fetchRepositoryInfo } from "./github";
import { fetchLlmsTxtContent } from "./llms-txt";
import { generateCourseWithOpenRouter, getAvailableFreeModels, getAllAvailableModels } from "./openrouter";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  getAllSystemPrompts, 
  getSystemPrompt, 
  updateSystemPrompt, 
  resetSystemPrompt 
} from "./admin";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);
  
  // User auth and API key routes
  app.get("/api/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // Update user's OpenRouter API key
  app.post("/api/user/openrouter-key", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { apiKey } = req.body;
      
      if (!apiKey) {
        return res.status(400).json({ message: "API key is required" });
      }
      
      const updatedUser = await storage.updateUserApiKey(userId, apiKey);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating API key:", error);
      res.status(500).json({ message: "Failed to update API key" });
    }
  });
  
  // Get all available OpenRouter models
  app.get("/api/models", async (req, res) => {
    try {
      const models = await getAllAvailableModels();
      res.json(models);
    } catch (error) {
      console.error("Error fetching models:", error);
      res.status(500).json({ message: "Failed to fetch models" });
    }
  });
  // API route to generate course
  app.post("/api/courses/generate", isAuthenticated, async (req: any, res) => {
    try {
      // Validate request body
      const validatedData = generateCourseRequestSchema.parse(req.body);
      const { sourceUrl, sourceType, context, model, isPublic = false } = validatedData;
      const userId = req.user.claims.sub;
      
      // Get user to retrieve API key
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      if (!user.openrouterApiKey) {
        return res.status(400).json({ 
          message: "OpenRouter API key is required. Please add your API key in account settings."
        });
      }
      
      // Fetch source information based on the source type
      let sourceInfo: string;
      if (sourceType === "github") {
        sourceInfo = await fetchRepositoryInfo(sourceUrl);
      } else if (sourceType === "llms-txt") {
        sourceInfo = await fetchLlmsTxtContent(sourceUrl);
      } else {
        throw new Error(`Unsupported source type: ${sourceType}`);
      }
      
      // Generate course content using OpenRouter with user's API key
      const courseContentJson = await generateCourseWithOpenRouter(
        sourceInfo, 
        context, 
        model, 
        user.openrouterApiKey,
        sourceType
      );
      
      // Parse the JSON response from OpenRouter
      try {
        // Attempt to parse the JSON response
        let courseContent;
        try {
          courseContent = JSON.parse(courseContentJson);
        } catch (jsonError) {
          // Try to extract valid JSON from the response if it contains extra text
          console.log("Initial JSON parse failed, attempting to extract valid JSON...");
          
          // Try different regex patterns to extract JSON
          const jsonMatch = courseContentJson.match(/(\{[\s\S]*\})/);
          if (jsonMatch && jsonMatch[0]) {
            try {
              courseContent = JSON.parse(jsonMatch[0]);
              console.log("Successfully extracted JSON from response");
            } catch (innerError) {
              console.log("Extracted JSON is still invalid, trying to fix it...");
              console.log("Raw response:", courseContentJson);
              
              // Handle potential XML content in the response by creating a course that explains the XML structure
              if (sourceType === "llms-txt" && (sourceUrl.endsWith("llms-full.txt") || courseContentJson.includes("<xml") || courseContentJson.includes("<?xml"))) {
                // Create a course about XML-based llms-full.txt
                const filename = sourceUrl.split('/').pop() || "llms-full.txt";
                courseContent = {
                  title: `Understanding ${filename}: XML Format for LLM Standards`,
                  repoUrl: sourceUrl,
                  context: context || "Understanding XML-based LLM standards",
                  steps: [
                    {
                      id: 1,
                      title: "Introduction to XML-based LLM Standards",
                      content: "XML-based llms-full.txt files provide a structured way to define language model specifications. Unlike the simple text-based llms.txt format, the XML version offers more detailed and hierarchical organization of information."
                    },
                    {
                      id: 2,
                      title: "Analyzing the Structure",
                      content: "The file contains XML tags that organize the content into sections and attributes. This structured format allows for more precise definition of model capabilities and requirements."
                    }
                  ]
                };
              } else {
                // If the JSON is still not valid, attempt to create a more meaningful structure
                const filename = sourceUrl.split('/').pop() || "";
                const subjectMatter = sourceType === "llms-txt" ? "Using " + filename.replace(/\.txt$/, "") : "About " + filename;
                
                courseContent = {
                  title: `Guide to ${subjectMatter}`,
                  steps: []
                };
              }
            }
          } else {
            // If no JSON-like structure was found, create a minimal valid structure with better title
            console.log("No JSON structure found, creating minimal valid course");
            const filename = sourceUrl.split('/').pop() || "";
            const subjectMatter = sourceType === "llms-txt" ? 
              "Understanding " + filename.replace(/\.txt$/, "") : 
              "Learning About " + filename;
              
            courseContent = {
              title: subjectMatter,
              steps: []
            };
          }
        }
        
        // Add the source URL and context to the course content
        courseContent.repoUrl = sourceUrl; // Still using repoUrl for compatibility
        courseContent.context = context;
        
        // Handle case where the AI returns 'step' instead of 'steps'
        if (!courseContent.steps && courseContent.step && Array.isArray(courseContent.step)) {
          console.log("Converting 'step' array to 'steps' array");
          courseContent.steps = courseContent.step;
          delete courseContent.step;
        }
        
        // Print the raw response for debugging
        console.log("Raw response:", JSON.stringify(courseContent, null, 2));

        // Further normalize content to ensure it matches our schema
        if (!courseContent.steps || !Array.isArray(courseContent.steps)) {
          console.log("No steps array found, creating empty steps array");
          courseContent.steps = [];
        } else {
          console.log(`Found ${courseContent.steps.length} steps in course content`);
          
          // Ensure steps array contains valid objects with required properties
          courseContent.steps = courseContent.steps.map((step: any, index: number) => {
            return {
              id: step.id || index + 1,
              title: step.title || `Step ${index + 1}`,
              content: step.content || 'No content available for this step.'
            };
          });
        }
        
        // Variable to hold our validated/normalized content
        let courseStructure;
        
        try {
          // Validate the course content structure
          courseStructure = courseContentSchema.parse(courseContent);
        } catch (validationError) {
          console.error("Error parsing OpenRouter response:", validationError);
          console.log("Raw response:", JSON.stringify(courseContent, null, 2));
          
          // Create a normalized structure that will pass validation
          courseStructure = {
            title: courseContent.title || "Generated Course",
            repoUrl: sourceUrl,
            context: context,
            steps: courseContent.steps || []
          };
        }
        
        // Save the course to the database with user ID and public/private setting
        const savedCourse = await storage.saveCourse(courseStructure, model, userId, isPublic);
        console.log("Course saved to database successfully");
        
        // Auto-generate tags for the course using simple string matching
        const possibleTags = [
          "frontend", "backend", "fullstack", "react", "vue", "angular", "javascript", 
          "typescript", "python", "node", "express", "database", "api", "web", "mobile",
          "ios", "android", "cloud", "devops", "aws", "azure", "google", "firebase",
          "machine learning", "ai", "security", "testing", "css", "html"
        ];
        
        const courseTitle = courseStructure.title.toLowerCase();
        const courseContext = courseStructure.context.toLowerCase();
        const matchedTags = possibleTags.filter(tag => 
          courseTitle.includes(tag.toLowerCase()) || 
          courseContext.includes(tag.toLowerCase())
        ).slice(0, 3); // Limit to 3 tags
        
        // Add tags to the course
        for (const tag of matchedTags) {
          await storage.addTagToCourse(savedCourse.id, tag);
        }
        
        // Get the course with tags
        const courseWithTags = await storage.getCourseWithTags(savedCourse.id);
        
        // Return the course content with tags
        res.json({
          ...courseStructure,
          id: savedCourse.id,
          tags: courseWithTags.tags,
          isPublic
        });
      } catch (parseError) {
        console.error("Error parsing OpenRouter response:", parseError);
        console.error("Raw response:", courseContentJson);
        res.status(500).json({ 
          message: "Failed to parse course content from AI model",
          error: parseError instanceof Error ? parseError.message : "Unknown error"
        });
      }
    } catch (error) {
      console.error("Error generating course:", error);
      res.status(error instanceof z.ZodError ? 400 : 500).json({ 
        message: "Failed to generate course",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // API route to get public courses
  app.get("/api/courses/public", async (req, res) => {
    try {
      const courses = await storage.getPublicCourses();
      
      // Get tags for each course
      const coursesWithTags = await Promise.all(
        courses.map(async (course) => {
          const courseWithTags = await storage.getCourseWithTags(course.id);
          return {
            ...course,
            tags: courseWithTags.tags
          };
        })
      );
      
      res.json(coursesWithTags);
    } catch (error) {
      console.error("Error fetching public courses:", error);
      res.status(500).json({
        message: "Failed to fetch public courses",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // API route to get user's courses
  app.get("/api/courses/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const courses = await storage.getUserCourses(userId);
      
      // Get tags for each course
      const coursesWithTags = await Promise.all(
        courses.map(async (course) => {
          const courseWithTags = await storage.getCourseWithTags(course.id);
          return {
            ...course,
            tags: courseWithTags.tags
          };
        })
      );
      
      res.json(coursesWithTags);
    } catch (error) {
      console.error("Error fetching user courses:", error);
      res.status(500).json({
        message: "Failed to fetch user courses",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // API route to get all courses 
  // For authenticated users: returns personal and public courses
  // For unauthenticated users: returns only public courses
  app.get("/api/courses", async (req: any, res) => {
    try {
      let courses;
      
      if (req.isAuthenticated()) {
        // Get all the user's personal courses plus public courses
        const userId = req.user.claims.sub;
        const userCourses = await storage.getUserCourses(userId);
        const publicCourses = await storage.getPublicCourses();
        
        // Filter public courses to remove duplicates already in user courses
        const userCourseIds = new Set(userCourses.map(course => course.id));
        const filteredPublicCourses = publicCourses.filter(course => !userCourseIds.has(course.id));
        
        courses = [...userCourses, ...filteredPublicCourses];
      } else {
        // For unauthenticated users, return only public courses
        courses = await storage.getPublicCourses();
      }
      
      // Add tags to each course
      const coursesWithTags = await Promise.all(
        courses.map(async (course) => {
          const courseWithTags = await storage.getCourseWithTags(course.id);
          return {
            ...course,
            tags: courseWithTags.tags
          };
        })
      );
      
      res.json(coursesWithTags);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({
        message: "Failed to fetch courses",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // API route to get a course by ID - must be defined after the specific /public and /user routes
  app.get("/api/courses/:id([0-9]+)", async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      if (isNaN(courseId)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }
      
      const courseWithTags = await storage.getCourseWithTags(courseId);
      if (!courseWithTags.course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Check if course is private and user has access
      if (!courseWithTags.course.isPublic && req.isAuthenticated()) {
        const user = req.user as any;
        if (courseWithTags.course.userId !== user.claims.sub) {
          return res.status(403).json({ message: "You don't have access to this course" });
        }
      } else if (!courseWithTags.course.isPublic && !req.isAuthenticated()) {
        return res.status(403).json({ message: "You don't have access to this course" });
      }
      
      res.json({
        ...courseWithTags.course,
        tags: courseWithTags.tags
      });
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({
        message: "Failed to fetch course",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // API route to delete a course
  app.delete("/api/courses/:id([0-9]+)", isAuthenticated, async (req: any, res) => {
    try {
      const courseId = parseInt(req.params.id);
      if (isNaN(courseId)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }
      
      const userId = req.user.claims.sub;
      
      // Check if course exists and belongs to the user
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Only allow users to delete their own courses or admin to delete any course
      if (course.userId !== userId && userId !== ADMIN_USER_ID) {
        return res.status(403).json({ message: "You don't have permission to delete this course" });
      }
      
      // Delete the course
      const success = await storage.deleteCourse(courseId);
      
      if (success) {
        res.json({ success: true, message: "Course deleted successfully" });
      } else {
        res.status(500).json({ success: false, message: "Failed to delete the course" });
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({
        message: "Failed to delete course",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Admin routes
  const ADMIN_USER_ID = "38352714"; // xr0am's ID
  
  // Check if user is admin middleware
  const isAdmin = async (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const userId = req.user.claims.sub;
    if (userId !== ADMIN_USER_ID) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    next();
  };
  
  // Get all system prompts
  app.get("/api/admin/prompts", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const prompts = getAllSystemPrompts();
      res.json(prompts);
    } catch (error) {
      console.error("Error fetching system prompts:", error);
      res.status(500).json({
        message: "Failed to fetch system prompts",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Update system prompt
  app.post("/api/admin/prompts", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { type, prompt } = req.body;
      
      if (!type || !prompt) {
        return res.status(400).json({ message: "Type and prompt are required" });
      }
      
      if (type !== "github" && type !== "llmsTxt") {
        return res.status(400).json({ message: "Invalid prompt type" });
      }
      
      updateSystemPrompt(type, prompt);
      res.json({ success: true, type, prompt });
    } catch (error) {
      console.error("Error updating system prompt:", error);
      res.status(500).json({
        message: "Failed to update system prompt",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Reset system prompt to default
  app.post("/api/admin/prompts/reset", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { type } = req.body;
      
      if (!type) {
        return res.status(400).json({ message: "Type is required" });
      }
      
      if (type !== "github" && type !== "llmsTxt") {
        return res.status(400).json({ message: "Invalid prompt type" });
      }
      
      const prompt = resetSystemPrompt(type);
      res.json({ success: true, type, prompt });
    } catch (error) {
      console.error("Error resetting system prompt:", error);
      res.status(500).json({
        message: "Failed to reset system prompt",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
