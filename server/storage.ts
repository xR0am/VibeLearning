import { users, courses, type User, type InsertUser, type Course, type InsertCourse, type CourseContent } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Course methods
  getCourse(id: number): Promise<Course | undefined>;
  getAllCourses(): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  saveCourse(courseData: CourseContent, modelUsed: string): Promise<Course>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
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
  
  // Course methods
  async getCourse(id: number): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course || undefined;
  }
  
  async getAllCourses(): Promise<Course[]> {
    return await db.select().from(courses);
  }
  
  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const [course] = await db
      .insert(courses)
      .values(insertCourse)
      .returning();
    return course;
  }
  
  async saveCourse(courseData: CourseContent, modelUsed: string): Promise<Course> {
    const now = new Date().toISOString();
    
    const insertCourse: InsertCourse = {
      title: courseData.title,
      repoUrl: courseData.repoUrl,
      context: courseData.context,
      content: courseData as any, // Store the full course content as JSON
      modelUsed: modelUsed,
      createdAt: now
    };
    
    return await this.createCourse(insertCourse);
  }
}

export const storage = new DatabaseStorage();
