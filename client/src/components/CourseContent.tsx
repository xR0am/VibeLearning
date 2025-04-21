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
  X
} from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

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
  const contentRef = useRef<HTMLDivElement>(null);
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
  
  return (
    <div ref={contentRef} className="w-full mx-auto">
      {/* Course Header */}
      <Card className="border shadow-lg card-shadow mb-4">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold gradient-heading">{content.title}</h2>
              <div className="flex items-center text-sm text-muted-foreground flex-wrap gap-2">
                <div className="flex items-center">
                  <Code className="mr-1 h-4 w-4" />
                  <a 
                    href={content.repoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary hover:underline inline-flex items-center"
                  >
                    {content.repoUrl.replace(/^https?:\/\//i, '')}
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </div>
                <Badge variant="outline" className="flex items-center">
                  <FileText className="mr-1 h-3 w-3" />
                  {content.context}
                </Badge>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exportAsMD}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </div>
          
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Progress</span>
              <span className="text-muted-foreground">
                Step {activeStepIndex + 1} of {content.steps.length}
              </span>
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>
        </CardHeader>
      </Card>
      
      {/* Mobile menu button - only shown on small screens */}
      <div className="md:hidden mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-full flex items-center justify-center gap-2"
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
          {sidebarOpen ? "Hide Course Outline" : "Show Course Outline"}
        </Button>
      </div>
      
      {/* Main layout - sidebar with steps and content area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Sidebar / Course Outline */}
        <div className={cn(
          "md:col-span-3 transition-all duration-300 ease-in-out",
          sidebarOpen ? "block" : "hidden md:block"
        )}>
          <Card className="border shadow-lg card-shadow sticky top-24">
            <CardHeader className="py-3 px-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-medium">Course Outline</h3>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-280px)] md:h-[70vh] custom-scrollbar">
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
            </CardContent>
          </Card>
        </div>
        
        {/* Main content area */}
        <div className={cn(
          "md:col-span-9",
          sidebarOpen ? "block" : "block"
        )}>
          <Card className="border shadow-lg card-shadow">
            <CardHeader className="pb-2 px-6">
              <h3 className="text-2xl font-bold text-foreground">
                {activeStep.title}
              </h3>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4 px-6">
              <ScrollArea className="custom-scrollbar h-[calc(100vh-280px)] md:h-[70vh]">
                <div className="pr-4">
                  <div className="prose dark:prose-invert max-w-none">
                    <ReactMarkdown>
                      {activeStep.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="flex justify-between pt-2 pb-6 px-6 border-t mt-4">
              <Button 
                onClick={handlePrevious}
                disabled={activeStepIndex === 0}
                variant="outline"
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button 
                onClick={handleNext}
                disabled={activeStepIndex === content.steps.length - 1}
                className="flex items-center gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
