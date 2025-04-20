import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Course Model
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  repoUrl: text("repo_url").notNull(),
  context: text("context").notNull(),
  content: jsonb("content").notNull(), // Store course content as JSON
  modelUsed: text("model_used").notNull(),
  createdAt: text("created_at").notNull(),
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true
});

export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;

// Step Schema (not a table, used for validation)
export const stepSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
});

export type Step = z.infer<typeof stepSchema>;

// Course Content Schema (not a table, used for validation)
export const courseContentSchema = z.object({
  title: z.string(),
  repoUrl: z.string(),
  context: z.string(),
  steps: z.array(stepSchema),
});

export type CourseContent = z.infer<typeof courseContentSchema>;

// Source Type Enum
export const sourceTypeEnum = z.enum(["github", "llms-txt"]);
export type SourceType = z.infer<typeof sourceTypeEnum>;

// Generate Course Request Schema
export const generateCourseRequestSchema = z.object({
  sourceUrl: z.string().min(1, "Source URL is required"),
  sourceType: sourceTypeEnum,
  context: z.string().min(1, "Context is required"),
  model: z.string().min(1, "Model is required"),
});

export type GenerateCourseRequest = z.infer<typeof generateCourseRequestSchema>;
