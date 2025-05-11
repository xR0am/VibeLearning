import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Lock, Globe, Trash2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CodeLoader } from "@/components/ui/code-loader";
import { CourseContent } from "@/types";
import { CourseWithTags } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function UserCourses() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<CourseContent | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: courses = [], isLoading: coursesLoading } = useQuery<CourseWithTags[]>({
    queryKey: ["/api/courses/user"],
    enabled: isAuthenticated,
  });
  
  // Delete course mutation
  const deleteMutation = useMutation({
    mutationFn: async (courseId: number) => {
      return await apiRequest("DELETE", `/api/courses/${courseId}`);
    },
    onSuccess: () => {
      // Invalidate the courses query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/courses/user"] });
      toast({
        title: "Course deleted",
        description: "The course has been successfully deleted.",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error("Error deleting course:", error);
      toast({
        title: "Error",
        description: "Failed to delete the course. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteCourse = (courseId: number) => {
    deleteMutation.mutate(courseId);
    setCourseToDelete(null);
  };

  const isLoading = authLoading || coursesLoading || deleteMutation.isPending;

  // If still loading, show loading indicator
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CodeLoader variant="spinner" size="lg" text="Loading your courses..." />
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
              {courses.map((course: CourseWithTags) => (
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
                  <CardFooter className="pt-2 flex flex-col gap-2">
                    <div className="flex gap-2 w-full">
                      <Button 
                        variant="default" 
                        className="flex-1"
                        onClick={() => {
                          // Handle view course - will redirect or open in a modal
                          let parsedSteps;
                          try {
                            // Try standard JSON parsing first
                            const content = course.content as string;
                            parsedSteps = JSON.parse(content);
                          } catch (error) {
                            console.log("Initial JSON parse failed, attempting to extract valid JSON...");
                            try {
                              // If it fails, try to extract valid JSON using regex
                              const content = course.content as string;
                              const jsonMatch = content.match(/(\{[\s\S]*\})/);
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
                          
                          // Store course ID in sessionStorage for persistence
                          sessionStorage.setItem('current_course_id', String(course.id));
                          
                          // Use router navigation instead of direct browser navigation
                          setLocation(`/course/${course.id}`);
                        }}
                      >
                        View Course
                      </Button>
                      
                      <AlertDialog open={courseToDelete === course.id} onOpenChange={(open) => !open && setCourseToDelete(null)}>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="icon"
                            className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => setCourseToDelete(course.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-destructive" />
                              Delete Course
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this course? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteCourse(course.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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