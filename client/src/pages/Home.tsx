import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Header from "@/components/Header";
import IntroSection from "@/components/IntroSection";
import RepoInputForm from "@/components/RepoInputForm";
import CourseContent from "@/components/CourseContent";
import PublicCourseLibrary from "@/components/PublicCourseLibrary";

import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import { CourseContent as CourseContentType, SourceType } from "@/types";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [courseContent, setCourseContent] = useState<CourseContentType | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSourceType, setCurrentSourceType] = useState<SourceType>("github");
  const [view, setView] = useState<'home' | 'course' | 'generating'>('home');
  const [formData, setFormData] = useState<any>(null);
  
  // Reset active step when course content changes
  useEffect(() => {
    if (courseContent) {
      setActiveStepIndex(0);
      setView('course');
    }
  }, [courseContent]);

  const handleCourseSelect = (course: CourseContentType, sourceType: SourceType, formValues?: any) => {
    setCurrentSourceType(sourceType);
    
    // Store form data if provided
    if (formValues) {
      setFormData(formValues);
    }
    
    // If the course has empty steps, it means we're starting generation
    if (course.steps.length === 0) {
      setIsGenerating(true);
      setView('generating');
      
      // Scroll to top
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      return;
    }
    
    // If course has steps, the generation is complete
    setIsGenerating(false);
    setCourseContent(course);
    setView('course');
    
    // Scroll to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleGenerationError = () => {
    // Reset to home view when generation fails
    setIsGenerating(false);
    setView('home');
    
    // Scroll to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
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
        {view === 'generating' ? (
          <motion.div 
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-grow flex items-center justify-center py-20"
          >
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold mb-2">Generating Course</h2>
              <p className="text-muted-foreground">This may take a few moments...</p>
            </div>
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
              <RepoInputForm 
                onCourseGenerated={handleCourseSelect} 
                onError={handleGenerationError}
                preservedFormData={formData}
              />
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
