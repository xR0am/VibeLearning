import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Header from "@/components/Header";
import IntroSection from "@/components/IntroSection";
import RepoInputForm from "@/components/RepoInputForm";
import CourseContent from "@/components/CourseContent";
import PublicCourseLibrary from "@/components/PublicCourseLibrary";
import CourseGenerationProgress from "@/components/CourseGenerationProgress";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import { CourseContent as CourseContentType, SourceType } from "@/types";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [courseContent, setCourseContent] = useState<CourseContentType | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSourceType, setCurrentSourceType] = useState<SourceType>("github");
  const [view, setView] = useState<'home' | 'course'>('home');
  
  // Reset active step when course content changes
  useEffect(() => {
    if (courseContent) {
      setActiveStepIndex(0);
      setView('course');
    }
  }, [courseContent]);

  const handleCourseSelect = (course: CourseContentType, sourceType: SourceType) => {
    setIsLoading(true);
    setCurrentSourceType(sourceType);
    
    // Simulate loading to provide better UX
    setTimeout(() => {
      setCourseContent(course);
      setIsLoading(false);
      
      // Scroll to top
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 13000); // Longer time to allow progress animation to play
  };
  
  const handleBackToHome = () => {
    setCourseContent(null);
    setActiveStepIndex(0);
    setView('home');
    
    // Scroll to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-grow flex items-center justify-center py-20"
          >
            <CourseGenerationProgress sourceType={currentSourceType} />
          </motion.div>
        ) : view === 'home' ? (
          <motion.main 
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8"
          >
            <IntroSection />
            
            <div className="mb-8">
              <RepoInputForm onCourseGenerated={handleCourseSelect} />
            </div>
            
            <PublicCourseLibrary />
            <HowItWorks />
          </motion.main>
        ) : (
          <motion.main 
            key="course"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex-grow w-full mx-auto px-4 py-6"
          >
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
          </motion.main>
        )}
      </AnimatePresence>
      
      <Footer />
    </div>
  );
}
