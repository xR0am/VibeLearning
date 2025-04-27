import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { generateCourseRequestSchema, courseContentSchema } from "@shared/schema";
import { fetchRepositoryInfo } from "./github";
import { fetchLlmsTxtContent } from "./llms-txt";
import { generateCourseWithOpenRouter, getAvailableFreeModels } from "./openrouter";
import { setupAuth, isAuthenticated } from "./replitAuth";

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
  app.post("/api/user/apikey", isAuthenticated, async (req: any, res) => {
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
  
  // Get available free OpenRouter models
  app.get("/api/models", async (req, res) => {
    try {
      const models = getAvailableFreeModels();
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
        user.openrouterApiKey
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
          const jsonMatch = courseContentJson.match(/(\{[\s\S]*\})/);
          if (jsonMatch && jsonMatch[0]) {
            courseContent = JSON.parse(jsonMatch[0]);
            console.log("Successfully extracted JSON from response");
          } else {
            throw jsonError;
          }
        }
        
        // Add the source URL and context to the course content
        courseContent.repoUrl = sourceUrl; // Still using repoUrl for compatibility
        courseContent.context = context;
        
        // Validate the course content structure
        const validatedContent = courseContentSchema.parse(courseContent);
        
        // Save the course to the database with user ID and public/private setting
        const savedCourse = await storage.saveCourse(validatedContent, model, userId, isPublic);
        console.log("Course saved to database successfully");
        
        // Auto-generate tags for the course using simple string matching
        const possibleTags = [
          "frontend", "backend", "fullstack", "react", "vue", "angular", "javascript", 
          "typescript", "python", "node", "express", "database", "api", "web", "mobile",
          "ios", "android", "cloud", "devops", "aws", "azure", "google", "firebase",
          "machine learning", "ai", "security", "testing", "css", "html"
        ];
        
        const courseTitle = validatedContent.title.toLowerCase();
        const courseContext = validatedContent.context.toLowerCase();
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
          ...validatedContent,
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
  
  // API route to get all courses (admin or backward compatibility)
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getAllCourses();
      res.json(courses);
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
  
  const httpServer = createServer(app);
  return httpServer;
}
