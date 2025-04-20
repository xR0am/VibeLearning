import { useState } from "react";
import Header from "@/components/Header";
import IntroSection from "@/components/IntroSection";
import RepoInputForm from "@/components/RepoInputForm";
import CourseContent from "@/components/CourseContent";
import ExampleShowcase from "@/components/ExampleShowcase";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import { CourseContent as CourseContentType } from "@/types";

export default function Home() {
  const [courseContent, setCourseContent] = useState<CourseContentType | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <IntroSection />
        <RepoInputForm onCourseGenerated={setCourseContent} />
        
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
