import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { generateCourseRequestSchema } from "@shared/schema";
import { fetchRepositoryInfo } from "./github";
import { generateCourseWithOpenRouter } from "./openrouter";

export async function registerRoutes(app: Express): Promise<Server> {
  // API route to generate course
  app.post("/api/courses/generate", async (req, res) => {
    try {
      // Validate request body
      const validatedData = generateCourseRequestSchema.parse(req.body);
      const { repoUrl, context, model } = validatedData;
      
      // Fetch repository information from GitHub
      const repoInfo = await fetchRepositoryInfo(repoUrl);
      
      // Generate course content using OpenRouter
      const courseContentJson = await generateCourseWithOpenRouter(repoInfo, context, model);
      
      // Parse the JSON response from OpenRouter
      try {
        const courseContent = JSON.parse(courseContentJson);
        
        // Add the repo URL and context to the course content
        courseContent.repoUrl = repoUrl;
        courseContent.context = context;
        
        // Return the course content
        res.json(courseContent);
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
  
  const httpServer = createServer(app);
  return httpServer;
}
