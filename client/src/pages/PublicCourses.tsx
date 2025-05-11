import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, User, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CodeLoader } from "@/components/ui/code-loader";
import { CourseContent } from "@/types";
import { CourseWithTags } from "@shared/schema";

export default function PublicCourses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [, setLocation] = useLocation();

  const { data: courses = [], isLoading } = useQuery<CourseWithTags[]>({
    queryKey: ["/api/courses/public"],
  });

  // Filter courses based on search term
  const filteredCourses = searchTerm 
    ? courses.filter((course: CourseWithTags) => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.context.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.tags && course.tags.some((tag: string) => 
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      )
    : courses;

  // If still loading, show loading indicator
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CodeLoader variant="terminal" size="lg" text="Loading public courses..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Public Courses</h1>
              <p className="text-muted-foreground mt-1">
                Explore courses shared by the community
              </p>
            </div>

            <div className="relative w-full md:w-auto min-w-[280px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {filteredCourses.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center p-10 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No public courses found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm 
                    ? "No courses match your search criteria. Try different keywords."
                    : "There are no public courses available yet. Be the first to share a course!"}
                </p>
                <Button onClick={() => setLocation("/")}>
                  Create a Course
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course: CourseWithTags) => (
                <Card key={course.id} className="flex flex-col h-full transition-all hover:shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">{course.context}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow pb-2">
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center mb-2">
                        <span className="font-semibold mr-2">Source:</span>
                        <span className="truncate flex-1">{course.repoUrl}</span>
                      </div>
                      <div className="flex items-center mb-2">
                        <span className="font-semibold mr-2">Model:</span>
                        <span>{course.modelUsed || "Unknown"}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-semibold mr-2">Author:</span>
                        <div className="flex items-center">
                          <User className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          <span>{(course as any).username || "Anonymous"}</span>
                        </div>
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
                        // Navigate to the course page
                        try {
                          // Store the course data in sessionStorage to pass it to the course page
                          if (typeof window !== 'undefined') {
                            // Store course ID and navigate to the course page
                            sessionStorage.setItem('current_course_id', String(course.id));
                            setLocation(`/course/${course.id}`);
                          }
                        } catch (error) {
                          console.error("Error navigating to course:", error);
                        }
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