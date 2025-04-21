import { useState, useEffect } from "react";
import Header from "@/components/Header";
import IntroSection from "@/components/IntroSection";
import RepoInputForm from "@/components/RepoInputForm";
import CourseContent from "@/components/CourseContent";
import SavedCourses from "@/components/SavedCourses";
import ExampleShowcase from "@/components/ExampleShowcase";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import { CourseContent as CourseContentType } from "@/types";

export default function Home() {
  const [courseContent, setCourseContent] = useState<CourseContentType | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Reset active step when course content changes
  useEffect(() => {
    if (courseContent) {
      setActiveStepIndex(0);
    }
  }, [courseContent]);

  const handleCourseSelect = (course: CourseContentType) => {
    setCourseContent(course);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <IntroSection />
        
        <div className="grid md:grid-cols-12 gap-6">
          <div className="md:col-span-8">
            <RepoInputForm onCourseGenerated={setCourseContent} />
          </div>
          <div className="md:col-span-4">
            <SavedCourses onSelectCourse={handleCourseSelect} />
          </div>
        </div>
        
        {courseContent && (
          <CourseContent 
            content={courseContent} 
            activeStepIndex={activeStepIndex} 
            setActiveStepIndex={setActiveStepIndex} 
          />
        )}
        
        <ExampleShowcase />
        <HowItWorks />
      </main>
      
      <Footer />
    </div>
  );
}
