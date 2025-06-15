import { 
  users, 
  courses, 
  tags, 
  courseTags,
  userProgress,
  achievements,
  userAchievements,
  type User, 
  type UpsertUser,
  type InsertUser, 
  type Course, 
  type InsertCourse, 
  type CourseContent, 
  type Tag,
  type InsertTag,
  type InsertCourseTag,
  type UserProgress,
  type InsertUserProgress,
  type Achievement,
  type InsertAchievement,
  type UserAchievement,
  type InsertUserAchievement
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserApiKey(userId: string, apiKey: string): Promise<User>;
  
  // Course methods
  getCourse(id: number): Promise<Course | undefined>;
  getAllCourses(): Promise<Course[]>;
  getPublicCourses(): Promise<Course[]>;
  getUserCourses(userId: string): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  saveCourse(courseData: CourseContent, modelUsed: string, userId?: string, isPublic?: boolean): Promise<Course>;
  deleteCourse(id: number): Promise<boolean>;
  deleteUserCourse(id: number, userId: string): Promise<boolean>;
  
  // Tag methods
  createTag(name: string): Promise<Tag>;
  getTagByName(name: string): Promise<Tag | undefined>;
  getCourseWithTags(courseId: number): Promise<{ course: Course, tags: string[] }>;
  addTagToCourse(courseId: number, tagName: string): Promise<void>;
  
  // Progress tracking methods
  getUserProgress(userId: string, courseId: number): Promise<UserProgress | undefined>;
  createUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  updateUserProgress(userId: string, courseId: number, updates: Partial<UserProgress>): Promise<UserProgress>;
  getUserProgressList(userId: string): Promise<UserProgress[]>;
  markStepComplete(userId: string, courseId: number, stepId: number): Promise<UserProgress>;
  
  // Achievement methods
  getAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: string): Promise<(UserAchievement & { achievement: Achievement })[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  awardAchievement(userId: string, achievementId: number): Promise<UserAchievement>;
  checkAndAwardAchievements(userId: string): Promise<UserAchievement[]>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
  
  async updateUserApiKey(userId: string, apiKey: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ openrouterApiKey: apiKey, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }
  
  // Course methods
  async getCourse(id: number): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course || undefined;
  }
  
  async getAllCourses(): Promise<Course[]> {
    return await db.select().from(courses).orderBy(desc(courses.createdAt));
  }
  
  async getPublicCourses(): Promise<Course[]> {
    return await db.select().from(courses).where(eq(courses.isPublic, true)).orderBy(desc(courses.createdAt));
  }
  
  async getUserCourses(userId: string): Promise<Course[]> {
    return await db.select().from(courses).where(eq(courses.userId, userId)).orderBy(desc(courses.createdAt));
  }
  
  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const [course] = await db
      .insert(courses)
      .values(insertCourse)
      .returning();
    return course;
  }
  
  async saveCourse(courseData: CourseContent, modelUsed: string, userId?: string, isPublic: boolean = false): Promise<Course> {
    // If complexity is not provided, we'll compute it in the front-end
    const insertCourse: InsertCourse = {
      title: courseData.title,
      repoUrl: courseData.repoUrl,
      context: courseData.context,
      content: courseData as any, // Store the full course content as JSON
      modelUsed: modelUsed,
      isPublic,
      userId,
      complexity: courseData.complexity
    };
    
    return await this.createCourse(insertCourse);
  }
  
  async deleteCourse(id: number): Promise<boolean> {
    try {
      // First delete related course tags
      await db.delete(courseTags).where(eq(courseTags.courseId, id));
      
      // Then delete the course
      const result = await db.delete(courses).where(eq(courses.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error("Error deleting course:", error);
      return false;
    }
  }
  
  async deleteUserCourse(id: number, userId: string): Promise<boolean> {
    try {
      // First check if the course belongs to the user
      const course = await this.getCourse(id);
      if (!course || course.userId !== userId) {
        return false;
      }
      
      // If the course belongs to the user, delete it
      return await this.deleteCourse(id);
    } catch (error) {
      console.error("Error deleting user's course:", error);
      return false;
    }
  }
  
  // Tag methods
  async createTag(name: string): Promise<Tag> {
    const existingTag = await this.getTagByName(name);
    if (existingTag) return existingTag;
    
    const [tag] = await db
      .insert(tags)
      .values({ name })
      .returning();
    return tag;
  }
  
  async getTagByName(name: string): Promise<Tag | undefined> {
    const [tag] = await db.select().from(tags).where(eq(tags.name, name));
    return tag;
  }
  
  async getCourseWithTags(courseId: number): Promise<{ course: Course, tags: string[] }> {
    const [course] = await db.select().from(courses).where(eq(courses.id, courseId));
    
    const tagMappings = await db
      .select({
        tag: tags.name
      })
      .from(courseTags)
      .innerJoin(tags, eq(courseTags.tagId, tags.id))
      .where(eq(courseTags.courseId, courseId));
    
    return {
      course,
      tags: tagMappings.map(t => t.tag)
    };
  }
  
  async addTagToCourse(courseId: number, tagName: string): Promise<void> {
    const tag = await this.createTag(tagName);
    
    const existingMapping = await db
      .select()
      .from(courseTags)
      .where(
        and(
          eq(courseTags.courseId, courseId),
          eq(courseTags.tagId, tag.id)
        )
      );
    
    if (existingMapping.length === 0) {
      await db
        .insert(courseTags)
        .values({
          courseId,
          tagId: tag.id
        });
    }
  }
}

export const storage = new DatabaseStorage();
