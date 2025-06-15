import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CourseContent from "@/components/CourseContent";
import GamefiedStepTracker from "@/components/GamefiedStepTracker";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeLoader } from "@/components/ui/code-loader";
import { CourseContent as CourseContentType } from "@/types";
import { useAuth } from "@/hooks/useAuth";

export default function Course() {
  const [, params] = useRoute("/course/:id");
  const courseId = params?.id;
  const [, setLocation] = useLocation();
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const { user } = useAuth();

  const { data: course, isLoading } = useQuery<any>({
    queryKey: [`/api/courses/${courseId}`],
    enabled: !!courseId,
  });

  const { data: userProgress } = useQuery<any>({
    queryKey: [`/api/progress/${courseId}`],
    enabled: !!courseId && !!user,
  });

  const [courseContent, setCourseContent] = useState<CourseContentType | null>(null);

  useEffect(() => {
    if (course) {
      try {
        // Handle course content parsing, accounting for different possible structures
        let parsedSteps = [];
        
        // Check if content is already an object with steps property
        if (typeof course.content === 'object' && course.content !== null && Array.isArray(course.content.steps)) {
          // Content is already an object with the steps array
          parsedSteps = course.content.steps;
        } else {
          // Try to parse content as JSON if it's a string
          try {
            const content = typeof course.content === 'string' 
              ? course.content 
              : JSON.stringify(course.content);
              
            const parsed = JSON.parse(content);
            
            // Check if the parsed result has a steps array
            if (Array.isArray(parsed.steps)) {
              parsedSteps = parsed.steps;
            } else if (Array.isArray(parsed)) {
              // If parsed result is an array, use it directly
              parsedSteps = parsed;
            }
          } catch (error) {
            console.log("Initial JSON parse failed, attempting to extract valid JSON...");
            try {
              // If it fails, try to extract valid JSON using regex
              const content = typeof course.content === 'string'
                ? course.content
                : JSON.stringify(course.content);
                
              const jsonMatch = content.match(/(\{[\s\S]*\})/);
              if (jsonMatch && jsonMatch[0]) {
                const extracted = JSON.parse(jsonMatch[0]);
                parsedSteps = Array.isArray(extracted.steps) ? extracted.steps : [];
                console.log("Successfully extracted JSON from response");
              } else {
                console.error("Failed to extract valid JSON");
                parsedSteps = [];
              }
            } catch (secondError) {
              console.error("Failed to extract valid JSON", secondError);
              parsedSteps = [];
            }
          }
        }
        
        // Ensure we have valid steps with required properties
        const validatedSteps = Array.isArray(parsedSteps) ? parsedSteps.filter(step => 
          step && typeof step === 'object' && 
          'id' in step && 
          'title' in step && 
          'content' in step
        ) : [];
        
        // Create properly formatted course content
        const content: CourseContentType = {
          title: course.title,
          repoUrl: course.repoUrl || '',
          context: course.context || '',
          steps: validatedSteps.length > 0 ? validatedSteps : []
        };
        
        setCourseContent(content);
      } catch (error) {
        console.error("Error parsing course content:", error);
      }
    }
  }, [course]);
  
  const handleBackToHome = () => {
    // Check if we came from the same domain (internal navigation)
    const referrer = document.referrer;
    const currentDomain = window.location.origin;
    
    // If there's history and we came from the same domain, use browser back
    if (window.history.length > 1 && referrer.startsWith(currentDomain)) {
      window.history.back();
    } else {
      // Otherwise navigate to home page
      setLocation("/");
    }
    
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
        <CodeLoader variant="code" size="lg" text="Loading course content..." />
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
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="order-2 lg:order-1">
                <CourseContent 
                  content={courseContent} 
                  activeStepIndex={activeStepIndex} 
                  setActiveStepIndex={setActiveStepIndex} 
                />
              </div>
              
              {user && (
                <div className="order-1 lg:order-2">
                  <GamefiedStepTracker
                    courseId={parseInt(courseId!)}
                    steps={courseContent.steps}
                    completedSteps={userProgress?.completedSteps || []}
                    currentStepId={userProgress?.currentStepId || 1}
                    completionPercentage={userProgress?.completionPercentage || 0}
                    onStepComplete={(stepId, newAchievements) => {
                      // Update active step index when step is completed
                      const stepIndex = courseContent.steps.findIndex(s => s.id === stepId);
                      if (stepIndex !== -1 && stepIndex < courseContent.steps.length - 1) {
                        setActiveStepIndex(stepIndex + 1);
                      }
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}