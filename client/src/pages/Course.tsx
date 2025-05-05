import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CourseContent from "@/components/CourseContent";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseContent as CourseContentType } from "@/types";

export default function Course() {
  const [, params] = useRoute("/course/:id");
  const courseId = params?.id;
  const [, setLocation] = useLocation();
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const { data: course, isLoading } = useQuery<any>({
    queryKey: [`/api/courses/${courseId}`],
    enabled: !!courseId,
  });

  const [courseContent, setCourseContent] = useState<CourseContentType | null>(null);

  useEffect(() => {
    if (course) {
      try {
        // Parse course content and set it
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
        
        const content: CourseContentType = {
          title: course.title,
          repoUrl: course.repoUrl,
          context: course.context,
          steps: parsedSteps
        };
        
        setCourseContent(content);
      } catch (error) {
        console.error("Error parsing course content:", error);
      }
    }
  }, [course]);
  
  const handleBackToHome = () => {
    setLocation("/");
    
    // Scroll to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // If loading, show spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // If no course found
  if (!course && !isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
            <p className="mb-6 text-muted-foreground">The course you're looking for doesn't exist or has been removed.</p>
            <Button onClick={handleBackToHome}>Return to Home</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow w-full mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto mb-6">
          <Button 
            variant="ghost" 
            onClick={handleBackToHome}
            className="mb-4 flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          
          {courseContent && (
            <CourseContent 
              content={courseContent} 
              activeStepIndex={activeStepIndex} 
              setActiveStepIndex={setActiveStepIndex} 
            />
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}