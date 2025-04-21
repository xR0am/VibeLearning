import { useRef, useEffect, useState } from "react";
import { CourseContent as CourseContentType } from "@/types";
import ReactMarkdown from 'react-markdown';
import { Download, ChevronLeft, ChevronRight, Code, FileText, ExternalLink } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    // Scroll to top of content when changing steps
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth' });
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
    <div ref={contentRef} className="mb-8 w-full max-w-5xl mx-auto">
      <Card className="border shadow-lg card-shadow">
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
        
        <Separator />
        
        <div className="px-6 pt-4 pb-2 overflow-x-auto">
          <div className="flex space-x-2">
            {content.steps.map((step, index) => (
              <Button 
                key={step.id}
                onClick={() => handleStepChange(index)}
                variant={index === activeStepIndex ? "default" : "outline"}
                size="sm"
                className={`whitespace-nowrap transition-all duration-200 ${
                  index === activeStepIndex ? "scale-105" : ""
                }`}
              >
                {index + 1}. {step.title.length > 20 ? `${step.title.substring(0, 20)}...` : step.title}
              </Button>
            ))}
          </div>
        </div>
        
        <Tabs defaultValue="content" className="px-6">
          <TabsList className="mb-2">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="focus-visible:outline-none focus-visible:ring-0">
            <CardContent className="p-0">
              <div className="step-card my-2 step-card-active">
                <h3 className="text-xl font-bold mb-4">{activeStep.title}</h3>
                
                <ScrollArea className="custom-scrollbar h-[400px] pr-4">
                  <div className="prose dark:prose-invert max-w-none">
                    <ReactMarkdown>
                      {activeStep.content}
                    </ReactMarkdown>
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </TabsContent>
          
          <TabsContent value="overview" className="focus-visible:outline-none focus-visible:ring-0">
            <CardContent className="p-0">
              <div className="my-2 space-y-4">
                <ScrollArea className="custom-scrollbar h-[400px] pr-4">
                  <div className="space-y-4">
                    {content.steps.map((step, index) => (
                      <div 
                        key={step.id} 
                        className={`step-card cursor-pointer transition-all ${
                          index === activeStepIndex ? "step-card-active" : ""
                        }`}
                        onClick={() => handleStepChange(index)}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Step {index + 1}: {step.title}</h4>
                          {index === activeStepIndex && (
                            <Badge variant="default">Current</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {step.content.substring(0, 150)}...
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>
        
        <CardFooter className="flex justify-between pt-2 pb-6">
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
  );
}
