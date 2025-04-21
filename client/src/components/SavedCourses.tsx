import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Course } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { getQueryFn } from "@/lib/queryClient";
import { ChevronDown, ChevronUp, Calendar, Bot, Sparkles, BookOpen } from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function SavedCourses({ onSelectCourse }: { onSelectCourse: (course: any) => void }) {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(true);

  const { data: courses, isLoading, error } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    refetchOnWindowFocus: false,
  });

  const handleCourseSelect = (course: Course) => {
    // Extract the course content from the JSON field
    const courseContent = course.content as any;
    onSelectCourse(courseContent);
    
    toast({
      title: "Course loaded",
      description: `Loaded course: ${course.title}`,
    });
  };

  if (error) {
    console.error("Error loading saved courses:", error);
  }

  return (
    <Card className="border shadow-lg card-shadow mb-6">
      <CardHeader className="py-4 px-5">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span>Saved Courses {courses?.length ? `(${courses.length})` : ""}</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0 rounded-full"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="py-8 flex justify-center">
              <Sparkles className="h-8 w-8 animate-pulse text-primary" />
            </div>
          ) : courses && courses.length > 0 ? (
            <ScrollArea className="h-[280px] custom-scrollbar">
              <div className="space-y-3 pr-3">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="p-4 border border-border rounded-md hover:bg-accent/10 hover:border-primary/40 cursor-pointer transition-all duration-200 step-card"
                    onClick={() => handleCourseSelect(course)}
                  >
                    <h3 className="font-medium">{course.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline" className="flex items-center gap-1 bg-blue-50/30 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                        <Calendar className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        {new Date(course.createdAt).toLocaleDateString()}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1 bg-purple-50/30 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                        <Bot className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                        {course.modelUsed.split("/").pop()?.replace(":free", " (Free)")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="py-6 text-center text-muted-foreground">
              {error ? (
                <p>Failed to load courses. Please try again later.</p>
              ) : (
                <div className="space-y-2">
                  <BookOpen className="h-12 w-12 opacity-20 mx-auto" />
                  <p>No saved courses yet. Generate a course to see it here!</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}