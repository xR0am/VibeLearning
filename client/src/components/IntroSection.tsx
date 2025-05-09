import { Github, FileText, Sparkles, BarChart3, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

// Rotating keyword component with CSS animation
function RotatingKeyword() {
  const keywords = [
    { text: "Tool", color: "text-blue-400" },
    { text: "Package", color: "text-indigo-400" },
    { text: "Repo", color: "text-purple-400" },
    { text: "llms.txt", color: "text-blue-300" }
  ];
  
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      
      // After animation completes, update the current word
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % keywords.length);
        setIsAnimating(false);
      }, 500);
      
    }, 3000);
    
    return () => clearInterval(interval);
  }, [keywords.length]);
  
  return (
    <div className="inline-block relative overflow-hidden h-[1.2em] min-w-[110px] text-left">
      <div 
        className={`${keywords[current].color} ${isAnimating ? 'slide-down' : ''}`}
      >
        {keywords[current].text}
      </div>
      
      {isAnimating && (
        <div 
          className={`absolute top-0 left-0 ${keywords[(current + 1) % keywords.length].color} slide-up`}
        >
          {keywords[(current + 1) % keywords.length].text}
        </div>
      )}
    </div>
  );
}

export default function IntroSection() {
  return (
    <div className="text-center mb-16 max-w-4xl mx-auto">
      <div className="mb-6 inline-flex items-center justify-center">
        <div className="relative">
          <div className="absolute -inset-1 rounded-full blur-xl bg-gradient-to-r from-blue-400 to-purple-500 opacity-50 dark:opacity-70"></div>
          <Badge variant="outline" className="relative px-4 py-2 border-2 flex items-center gap-1.5 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>AI-Powered Learning</span>
          </Badge>
        </div>
      </div>
      
      <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight gradient-heading leading-tight">
        Learn Any Developer <span className="inline-block"><RotatingKeyword /></span>,<br />Your Way
      </h1>
      
      <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
        Generate customized step-by-step courses for any GitHub repository or website with llms.txt using powerful AI. 
        Tailor the learning path to your specific use case and context.
      </p>
      
      <div className="flex flex-wrap justify-center items-center gap-4 mt-6">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <Github className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>GitHub Repositories</span>
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1.5 px-4 py-1.5 bg-green-50/50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span>llms.txt Standard</span>
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1.5 px-4 py-1.5 bg-purple-50/50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
            <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span>Custom Learning Path</span>
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-50/50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <BarChart3 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span>Step-by-Step Progress</span>
          </Badge>
        </div>
      </div>
    </div>
  );
}
