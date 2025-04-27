import { pgTable, text, serial, integer, boolean, jsonb, timestamp, primaryKey, index, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => ({
    expireIdx: index("IDX_session_expire").on(table.expire),
  })
);

// Users table with Replit Auth fields
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Replit user ID as string
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  bio: text("bio"),
  profileImageUrl: text("profile_image_url"),
  openrouterApiKey: text("openrouter_api_key"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  id: true,
  username: true,
  email: true,
  firstName: true,
  lastName: true,
  bio: true,
  profileImageUrl: true,
  openrouterApiKey: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;

// Tags table
export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const insertTagSchema = createInsertSchema(tags).omit({
  id: true,
});

export type InsertTag = z.infer<typeof insertTagSchema>;
export type Tag = typeof tags.$inferSelect;

// Course Model
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  repoUrl: text("repo_url").notNull(),
  context: text("context").notNull(),
  content: jsonb("content").notNull(), // Store course content as JSON
  modelUsed: text("model_used").notNull(),
  userId: text("user_id").references(() => users.id),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Course tags junction table
export const courseTags = pgTable("course_tags", {
  courseId: integer("course_id").notNull().references(() => courses.id),
  tagId: integer("tag_id").notNull().references(() => tags.id),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.courseId, table.tagId] }),
  };
});

export const insertCourseTagSchema = createInsertSchema(courseTags);
export type InsertCourseTag = z.infer<typeof insertCourseTagSchema>;
export type CourseTag = typeof courseTags.$inferSelect;

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
  isPublic: z.boolean().default(false),
});

export type GenerateCourseRequest = z.infer<typeof generateCourseRequestSchema>;

// Course with tags response type
export const courseWithTagsSchema = z.object({
  course: z.any(), // Using any for simplicity, but ideally would be a specific course schema
  tags: z.array(z.string()),
});

export type CourseWithTags = typeof courses.$inferSelect & {
  tags?: string[];
  isPublic: boolean;
  modelUsed: string;
};
