import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Loader2, FileText, Code, Binary, Check } from "lucide-react";

interface CourseGenerationProgressProps {
  sourceType: "github" | "llms-txt";
}

export default function CourseGenerationProgress({ sourceType }: CourseGenerationProgressProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [progressValue, setProgressValue] = useState(0);

  // Define the stages of course generation
  const stages = [
    { 
      id: 1, 
      title: sourceType === "github" ? "Analyzing repository..." : "Processing llms.txt...",
      icon: sourceType === "github" ? Code : FileText,
      duration: 1500 
    },
    { 
      id: 2, 
      title: "Extracting key concepts...", 
      icon: Binary,
      duration: 3000 
    },
    { 
      id: 3, 
      title: "Structuring course content...", 
      icon: FileText,
      duration: 2500 
    },
    { 
      id: 4, 
      title: "Generating step-by-step instructions...", 
      icon: Binary,
      duration: 4000 
    },
    { 
      id: 5, 
      title: "Finalizing course...", 
      icon: Loader2,
      duration: 2000 
    }
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const totalDuration = stages.reduce((acc, stage) => acc + stage.duration, 0);
    let elapsed = 0;

    const updateProgress = () => {
      if (elapsed < totalDuration) {
        // Find current stage
        let durationSum = 0;
        let currentStageIndex = 0;
        
        for (let i = 0; i < stages.length; i++) {
          durationSum += stages[i].duration;
          if (elapsed < durationSum) {
            currentStageIndex = i;
            break;
          }
        }
        
        setCurrentStage(currentStageIndex);
        
        // Calculate progress percentage (0-100)
        const progressPercentage = (elapsed / totalDuration) * 100;
        setProgressValue(Math.min(progressPercentage, 99)); // Cap at 99% until completion
        
        elapsed += 100; // Increment by 100ms
        timer = setTimeout(updateProgress, 100);
      } else {
        // Ensure the last stage is active and progress is at 99%
        setCurrentStage(stages.length - 1);
        setProgressValue(99);
      }
    };

    // Start the progress animation
    timer = setTimeout(updateProgress, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="space-y-8 max-w-md mx-auto">
      <h3 className="text-xl font-semibold text-center">Preparing Your Course</h3>
      
      <Progress value={progressValue} className="h-2 w-full" />
      
      <div className="space-y-3">
        {stages.map((stage, index) => {
          const StageIcon = stage.icon;
          const isActive = index === currentStage;
          const isCompleted = index < currentStage;
          
          return (
            <div 
              key={stage.id} 
              className={`flex items-center gap-3 p-3 rounded-md transition-colors ${
                isActive ? "bg-primary/10 text-primary" : 
                isCompleted ? "text-muted-foreground" : 
                "text-muted-foreground/50"
              }`}
            >
              <div className="rounded-full w-8 h-8 flex items-center justify-center">
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <StageIcon className={`h-5 w-5 ${isActive ? "animate-pulse" : ""}`} />
                )}
              </div>
              <span className={isActive ? "font-medium" : ""}>{stage.title}</span>
            </div>
          );
        })}
      </div>
      
      <p className="text-center text-sm text-muted-foreground">
        This process typically takes 30-60 seconds depending on repository size and complexity.
      </p>
    </div>
  );
}