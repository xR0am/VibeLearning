import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { generateCourseRequestSchema, courseContentSchema } from "@shared/schema";
import { fetchRepositoryInfo } from "./github";
import { fetchLlmsTxtContent } from "./llms-txt";
import { generateCourseWithOpenRouter } from "./openrouter";

export async function registerRoutes(app: Express): Promise<Server> {
  // API route to generate course
  app.post("/api/courses/generate", async (req, res) => {
    try {
      // Validate request body
      const validatedData = generateCourseRequestSchema.parse(req.body);
      const { sourceUrl, sourceType, context, model } = validatedData;
      
      // Fetch source information based on the source type
      let sourceInfo: string;
      if (sourceType === "github") {
        sourceInfo = await fetchRepositoryInfo(sourceUrl);
      } else if (sourceType === "llms-txt") {
        sourceInfo = await fetchLlmsTxtContent(sourceUrl);
      } else {
        throw new Error(`Unsupported source type: ${sourceType}`);
      }
      
      // Generate course content using OpenRouter
      const courseContentJson = await generateCourseWithOpenRouter(sourceInfo, context, model);
      
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
        
        // Save the course to the database
        await storage.saveCourse(validatedContent, model);
        console.log("Course saved to database successfully");
        
        // Return the course content
        res.json(validatedContent);
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
  
  // API route to get all courses
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
  
  // API route to get a course by ID
  app.get("/api/courses/:id", async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      if (isNaN(courseId)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }
      
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      res.json(course);
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
