import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Course } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { getQueryFn } from "@/lib/queryClient";

export default function SavedCourses({ onSelectCourse }: { onSelectCourse: (course: any) => void }) {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);

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
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex justify-between items-center w-full"
      >
        <h2 className="text-lg font-semibold text-gray-800">
          Saved Courses {courses?.length ? `(${courses.length})` : ""}
        </h2>
        <span className="text-gray-500">
          <i className={`fas fa-chevron-${isExpanded ? "up" : "down"}`}></i>
        </span>
      </button>

      {isExpanded && (
        <div className="mt-4">
          {isLoading ? (
            <div className="py-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : courses && courses.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleCourseSelect(course)}
                >
                  <h3 className="font-medium text-gray-800">{course.title}</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      <i className="mr-1 text-xs fas fa-calendar-alt"></i>
                      {new Date(course.createdAt).toLocaleDateString()}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                      <i className="mr-1 text-xs fas fa-robot"></i>
                      {course.modelUsed.split("/").pop()?.replace(":free", " (Free)")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-gray-500">
              {error ? (
                <p>Failed to load courses. Please try again later.</p>
              ) : (
                <p>No saved courses yet. Generate a course to see it here!</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}