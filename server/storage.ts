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

  // Progress tracking methods
  async getUserProgress(userId: string, courseId: number): Promise<UserProgress | undefined> {
    const [progress] = await db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.courseId, courseId)));
    return progress || undefined;
  }

  async createUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    const [newProgress] = await db
      .insert(userProgress)
      .values({
        ...progress,
        completedSteps: progress.completedSteps || [],
        timeSpentMinutes: progress.timeSpentMinutes || 0
      })
      .returning();
    return newProgress;
  }

  async updateUserProgress(userId: string, courseId: number, updates: Partial<UserProgress>): Promise<UserProgress> {
    const [updatedProgress] = await db
      .update(userProgress)
      .set({ ...updates, lastActivityAt: new Date() })
      .where(and(eq(userProgress.userId, userId), eq(userProgress.courseId, courseId)))
      .returning();
    return updatedProgress;
  }

  async getUserProgressList(userId: string): Promise<UserProgress[]> {
    return await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId))
      .orderBy(desc(userProgress.lastActivityAt));
  }

  async markStepComplete(userId: string, courseId: number, stepId: number): Promise<UserProgress> {
    const currentProgress = await this.getUserProgress(userId, courseId);
    
    if (!currentProgress) {
      // Create new progress if it doesn't exist
      const course = await this.getCourse(courseId);
      if (!course) throw new Error("Course not found");
      
      const courseContent = course.content as CourseContent;
      const totalSteps = courseContent.steps?.length || 0;
      
      return await this.createUserProgress({
        userId,
        courseId,
        completedSteps: [stepId],
        currentStepId: stepId + 1,
        totalSteps,
        completionPercentage: Math.round((1 / totalSteps) * 100)
      });
    }

    // Update existing progress
    const completedSteps = currentProgress.completedSteps || [];
    const newCompletedSteps = Array.from(new Set([...completedSteps, stepId])); // Remove duplicates
    const completionPercentage = Math.round((newCompletedSteps.length / currentProgress.totalSteps) * 100);
    const isCompleted = newCompletedSteps.length === currentProgress.totalSteps;

    return await this.updateUserProgress(userId, courseId, {
      completedSteps: newCompletedSteps,
      currentStepId: stepId + 1,
      completionPercentage,
      completedAt: isCompleted ? new Date() : null
    });
  }

  // Achievement methods
  async getAchievements(): Promise<Achievement[]> {
    return await db
      .select()
      .from(achievements)
      .where(eq(achievements.isActive, true))
      .orderBy(achievements.name);
  }

  async getUserAchievements(userId: string): Promise<(UserAchievement & { achievement: Achievement })[]> {
    return await db
      .select({
        id: userAchievements.id,
        userId: userAchievements.userId,
        achievementId: userAchievements.achievementId,
        earnedAt: userAchievements.earnedAt,
        achievement: achievements
      })
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userId))
      .orderBy(desc(userAchievements.earnedAt));
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const [newAchievement] = await db
      .insert(achievements)
      .values({
        ...achievement,
        iconColor: achievement.iconColor || "#3b82f6",
        isActive: achievement.isActive !== undefined ? achievement.isActive : true
      })
      .returning();
    return newAchievement;
  }

  async awardAchievement(userId: string, achievementId: number): Promise<UserAchievement> {
    const [userAchievement] = await db
      .insert(userAchievements)
      .values({ userId, achievementId })
      .onConflictDoNothing()
      .returning();
    return userAchievement;
  }

  async checkAndAwardAchievements(userId: string): Promise<UserAchievement[]> {
    const allAchievements = await this.getAchievements();
    const userAchievementList = await this.getUserAchievements(userId);
    const earnedAchievementIds = new Set(userAchievementList.map(ua => ua.achievementId));
    
    const newAchievements: UserAchievement[] = [];
    
    for (const achievement of allAchievements) {
      if (earnedAchievementIds.has(achievement.id)) continue;
      
      const criteria = achievement.criteria;
      let shouldAward = false;
      
      switch (criteria.type) {
        case "course_completion": {
          const completedCourses = await db.select({ count: sql<number>`count(*)` })
            .from(userProgress)
            .where(and(
              eq(userProgress.userId, userId),
              eq(userProgress.completionPercentage, 100)
            ));
          shouldAward = (completedCourses[0]?.count || 0) >= criteria.value;
          break;
        }
        case "streak": {
          const progressList = await this.getUserProgressList(userId);
          const maxStreak = Math.max(...progressList.map(p => p.streakDays || 0), 0);
          shouldAward = maxStreak >= criteria.value;
          break;
        }
        case "time_spent": {
          const totalTime = await db.select({ total: sql<number>`sum(time_spent_minutes)` })
            .from(userProgress)
            .where(eq(userProgress.userId, userId));
          shouldAward = (totalTime[0]?.total || 0) >= criteria.value;
          break;
        }
        case "courses_count": {
          const courseCount = await db.select({ count: sql<number>`count(*)` })
            .from(userProgress)
            .where(eq(userProgress.userId, userId));
          shouldAward = (courseCount[0]?.count || 0) >= criteria.value;
          break;
        }
      }
      
      if (shouldAward) {
        const newAchievement = await this.awardAchievement(userId, achievement.id);
        if (newAchievement) {
          newAchievements.push(newAchievement);
        }
      }
    }
    
    return newAchievements;
  }
}

export const storage = new DatabaseStorage();
