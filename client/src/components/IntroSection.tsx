import { Github, FileText, Sparkles, BarChart3, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

// Rotating keyword component with vertical rotation (flip up) animation
function RotatingKeyword() {
  const keywords = ["Tool", "Package", "Repo", "llms.txt"];
  const colors = ["text-blue-400", "text-indigo-400", "text-purple-400", "text-blue-300"];
  const [items, setItems] = useState(keywords.map((text, i) => ({
    text,
    color: colors[i],
    state: i === 0 ? "visible" : "hidden",
    key: `item-${i}`
  })));
  
  useEffect(() => {
    const rotationInterval = setInterval(() => {
      setItems(prevItems => {
        // Find current visible item
        const visibleIndex = prevItems.findIndex(item => item.state === "visible");
        // Calculate next index
        const nextIndex = (visibleIndex + 1) % prevItems.length;
        
        // Create a new array with updated states
        return prevItems.map((item, i) => {
          if (i === visibleIndex) {
            return { ...item, state: "leaving" };
          } else if (i === nextIndex) {
            return { ...item, state: "entering" };
          } else {
            return { ...item, state: "hidden" };
          }
        });
      });
      
      // After animation completes, reset states for the next cycle
      setTimeout(() => {
        setItems(prevItems => {
          return prevItems.map(item => ({
            ...item,
            state: item.state === "entering" ? "visible" : 
                  item.state === "leaving" ? "hidden" : item.state
          }));
        });
      }, 500); // Match this to the CSS animation duration
      
    }, 3000); // Change every 3 seconds
    
    return () => clearInterval(rotationInterval);
  }, []);
  
  return (
    <div className="relative inline-block h-[1.2em] overflow-hidden">
      {items.map(item => (
        <div
          key={item.key}
          className={`
            absolute inset-0 w-full text-left
            transition-all duration-300 ease-in-out
            ${item.color}
            ${item.state === "leaving" ? "-translate-y-full opacity-0" : 
              item.state === "entering" ? "translate-y-0 opacity-100" : 
              item.state === "visible" ? "translate-y-0 opacity-100" : 
              "translate-y-full opacity-0"}
          `}
          style={{
            transitionDelay: item.state === "entering" ? "120ms" : "0ms"
          }}
        >
          {item.text}
        </div>
      ))}
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
