import { useRef, useEffect, useState } from "react";
import { CourseContent as CourseContentType } from "@/types";
import ReactMarkdown from 'react-markdown';
import { 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Code, 
  FileText, 
  ExternalLink, 
  CheckCircle2,
  MenuIcon,
  BookOpen,
  X,
  ArrowLeft
} from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

interface CourseContentProps {
  content: CourseContentType;
  activeStepIndex: number;
  setActiveStepIndex: (index: number) => void;
}

export default function CourseContent({ 
  content, 
  activeStepIndex, 
  setActiveStepIndex 
}: CourseContentProps) {
  const [progressValue, setProgressValue] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  useEffect(() => {
    // Animate progress bar
    const progress = ((activeStepIndex + 1) / content.steps.length) * 100;
    const animationDuration = 400; // ms
    const frames = 20;
    const increment = (progress - progressValue) / frames;
    
    let frame = 0;
    const interval = setInterval(() => {
      if (frame < frames) {
        setProgressValue(prev => prev + increment);
        frame++;
      } else {
        setProgressValue(progress);
        clearInterval(interval);
      }
    }, animationDuration / frames);
    
    return () => clearInterval(interval);
  }, [activeStepIndex, content.steps.length, progressValue]);
  
  const handleStepChange = (index: number) => {
    setActiveStepIndex(index);
    // On mobile, close the sidebar after selection
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };
  
  const activeStep = content.steps[activeStepIndex];
  
  const handlePrevious = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex(activeStepIndex - 1);
    }
  };
  
  const handleNext = () => {
    if (activeStepIndex < content.steps.length - 1) {
      setActiveStepIndex(activeStepIndex + 1);
    }
  };
  
  // Function to export course as markdown
  const exportAsMD = () => {
    let markdown = `# ${content.title}\n\n`;
    markdown += `Repository: ${content.repoUrl}\n\n`;
    markdown += `Context: ${content.context}\n\n`;
    
    content.steps.forEach((step) => {
      markdown += `## ${step.title}\n\n${step.content}\n\n`;
    });
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${content.title.replace(/\s+/g, '-').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };
  
  // Add effect to hide body scrollbar when component mounts
  useEffect(() => {
    // Disable body scrolling when component mounts
    document.body.style.overflow = 'hidden';
    
    // Re-enable body scrolling when component unmounts
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="course-viewer fixed inset-0 z-50 bg-background flex flex-col overflow-hidden">
      {/* Fixed header */}
      <div className="course-header flex flex-col border-b shadow-sm bg-background">
        {/* Top navigation bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <div className="flex items-center gap-2">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-semibold truncate max-w-[200px] sm:max-w-[400px] md:max-w-full">
              {content.title}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exportAsMD}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <div className="md:hidden">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex items-center justify-center"
              >
                {sidebarOpen ? <X className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Progress bar with course details */}
        <div className="p-3 bg-muted/20">
          <div className="flex justify-between items-center text-sm mb-1.5">
            <div className="flex items-center gap-2">
              <span className="font-medium">Progress</span>
              <Badge variant="secondary" className="flex items-center text-xs">
                <FileText className="mr-1 h-3 w-3" />
                {content.context}
              </Badge>
            </div>
            <span className="text-muted-foreground">
              Step {activeStepIndex + 1} of {content.steps.length}
            </span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>
      </div>
      
      {/* Main content area with fixed height */}
      <div className="course-body flex flex-1 overflow-hidden">
        {/* Sidebar / Course Outline */}
        <div 
          className={cn(
            "course-sidebar border-r bg-muted/10",
            "transition-all duration-300 ease-in-out",
            "w-full md:w-72 lg:w-80 flex-shrink-0",
            sidebarOpen 
              ? "block absolute md:relative z-10 bg-background md:bg-transparent h-[calc(100vh-116px)] md:h-auto" 
              : "hidden md:block"
          )}
        >
          <div className="h-full flex flex-col">
            <div className="p-3 border-b">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-medium">Course Outline</h3>
              </div>
            </div>
            <ScrollArea className="flex-1 custom-scrollbar">
              <div className="p-2">
                {content.steps.map((step, index) => (
                  <div 
                    key={step.id} 
                    className={`flex items-start gap-2 p-2 rounded-md cursor-pointer mb-1 transition-all ${
                      index === activeStepIndex 
                        ? "bg-primary/10 text-primary" 
                        : "hover:bg-muted"
                    }`}
                    onClick={() => handleStepChange(index)}
                  >
                    <div className={`flex items-center justify-center h-5 w-5 rounded-full text-xs font-medium mt-0.5 ${
                      index < activeStepIndex 
                        ? "bg-primary/20" 
                        : index === activeStepIndex 
                          ? "bg-primary/20 text-primary" 
                          : "bg-muted text-muted-foreground"
                    }`}>
                      {index < activeStepIndex ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <div>
                      <div className={`text-sm font-medium ${
                        index === activeStepIndex ? "text-primary" : ""
                      }`}>
                        {step.title}
                      </div>
                      {index === activeStepIndex && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
        
        {/* Main content area with fixed header and footer */}
        <div className="course-content-wrapper flex-1 flex flex-col overflow-hidden">
          {/* Content header */}
          <div className="content-header border-b p-4">
            <h2 className="text-xl font-bold text-foreground">
              {activeStep.title}
            </h2>
          </div>
          
          {/* Scrollable content */}
          <div className="content-body flex-1 overflow-auto p-6">
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown>
                {activeStep.content}
              </ReactMarkdown>
            </div>
          </div>
          
          {/* Fixed footer with navigation buttons */}
          <div className="content-footer flex justify-between items-center p-4 border-t bg-background">
            <Button 
              onClick={handlePrevious}
              disabled={activeStepIndex === 0}
              variant="outline"
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="hidden md:block text-sm text-muted-foreground">
              {activeStepIndex + 1} of {content.steps.length}
            </div>
            <Button 
              onClick={handleNext}
              disabled={activeStepIndex === content.steps.length - 1}
              className="flex items-center gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
