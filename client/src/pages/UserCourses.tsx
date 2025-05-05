import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink, Lock, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CourseContent } from "@/types";
import { CourseWithTags } from "@shared/schema";

export default function UserCourses() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<CourseContent | null>(null);

  const { data: courses = [], isLoading: coursesLoading } = useQuery<CourseWithTags[]>({
    queryKey: ["/api/courses/user"],
    enabled: isAuthenticated,
  });

  const isLoading = authLoading || coursesLoading;

  // If still loading, show loading indicator
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // If not authenticated, redirect to home
  if (!isAuthenticated && !authLoading) {
    return <Redirect to="/" />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">My Courses</h1>
            <Button onClick={() => window.location.href = "/"}>
              Create New Course
            </Button>
          </div>

          {courses.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center p-10 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No courses yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't created any courses yet. Generate your first course by analyzing a GitHub repository.
                </p>
                <Button onClick={() => window.location.href = "/"}>
                  Create Your First Course
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course: any) => (
                <Card key={course.id} className="flex flex-col h-full transition-all hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                      {course.isPublic ? (
                        <Badge variant="outline" className="flex items-center gap-1 bg-green-50/50 dark:bg-green-900/20">
                          <Globe className="h-3 w-3" />
                          Public
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="flex items-center gap-1 bg-blue-50/50 dark:bg-blue-900/20">
                          <Lock className="h-3 w-3" />
                          Private
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="line-clamp-2 mt-1">{course.context}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow pb-2">
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center mb-2">
                        <span className="font-semibold mr-2">Source:</span>
                        <span className="truncate flex-1">{course.repoUrl}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-semibold mr-2">Model:</span>
                        <span>{course.modelUsed || "Unknown"}</span>
                      </div>
                    </div>

                    {course.tags && course.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {course.tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button 
                      variant="default" 
                      className="w-full"
                      onClick={() => {
                        // Handle view course - will redirect or open in a modal
                        let parsedSteps;
                        try {
                          // Try standard JSON parsing first
                          parsedSteps = JSON.parse(course.content);
                        } catch (error) {
                          console.log("Initial JSON parse failed, attempting to extract valid JSON...");
                          try {
                            // If it fails, try to extract valid JSON using regex
                            const jsonMatch = course.content.match(/(\{[\s\S]*\})/);
                            if (jsonMatch && jsonMatch[0]) {
                              parsedSteps = JSON.parse(jsonMatch[0]);
                              console.log("Successfully extracted JSON from response");
                            } else {
                              console.error("Failed to extract valid JSON", error);
                              // Default to empty array if all parsing attempts fail
                              parsedSteps = [];
                            }
                          } catch (secondError) {
                            console.error("Failed to extract valid JSON", secondError);
                            parsedSteps = [];
                          }
                        }
                        
                        const courseContent: CourseContent = {
                          title: course.title,
                          repoUrl: course.repoUrl,
                          context: course.context,
                          steps: parsedSteps
                        };
                        setSelectedCourse(courseContent);
                      }}
                    >
                      View Course
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}