import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { generateCourseRequestSchema } from "@shared/schema";
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
        const courseContent = JSON.parse(courseContentJson);
        
        // Add the source URL and context to the course content
        courseContent.repoUrl = sourceUrl; // Still using repoUrl for compatibility
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
