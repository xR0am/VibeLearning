import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Github, FileText, Sparkles, Zap, Code, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface CourseGenerationProgressProps {
  sourceType: "github" | "llms-txt";
  onComplete?: () => void;
}

export default function CourseGenerationProgress({ sourceType, onComplete }: CourseGenerationProgressProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showViewButton, setShowViewButton] = useState(false);
  
  // Stages of course generation - adjusted durations for better UX
  const stages = [
    {
      title: sourceType === "github" ? "Analyzing repository" : "Analyzing llms.txt content",
      description: sourceType === "github" 
        ? "Scanning repository structure, code files, README, and documentation..." 
        : "Parsing llms.txt file contents, extracting key information...",
      icon: sourceType === "github" ? Github : FileText,
      durationMs: 3000
    },
    {
      title: "Organizing course structure",
      description: "Creating a logical learning path based on dependency relationships...",
      icon: Code,
      durationMs: 3000
    },
    {
      title: "Generating tutorial content",
      description: "Crafting detailed explanations, code samples, and step-by-step instructions...",
      icon: Bot,
      durationMs: 5000
    },
    {
      title: "Finalizing course",
      description: "Wrapping up and preparing the interactive learning experience...",
      icon: Sparkles,
      durationMs: 3000
    },
    {
      title: "Course ready!",
      description: "Your custom learning course has been generated successfully.",
      icon: CheckCircle2,
      durationMs: 1500
    }
  ];

  // Auto-advance through stages for visual effect
  useEffect(() => {
    const totalStages = stages.length;
    let timer: NodeJS.Timeout;
    let intervalId: NodeJS.Timeout;
    
    if (currentStage < totalStages) {
      const currentDuration = stages[currentStage].durationMs;
      
      // Progress bar animation
      const startTime = Date.now();
      intervalId = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min(100, (elapsed / currentDuration) * 100);
        setProgress(newProgress);
        
        if (newProgress >= 100 && currentStage < totalStages - 1) {
          clearInterval(intervalId);
          setCurrentStage(prev => prev + 1);
          setProgress(0);
        }
      }, 50);
      
      // Move to next stage after duration
      timer = setTimeout(() => {
        clearInterval(intervalId);
        
        if (currentStage < totalStages - 1) {
          setCurrentStage(prev => prev + 1);
          setProgress(0);
        } else if (currentStage === totalStages - 1) {
          // When we reach the final stage, mark as completed
          setIsCompleted(true);
          
          // Add a delay before showing the view button
          setTimeout(() => {
            setShowViewButton(true);
          }, 1500); // Give user time to see 100% complete
        }
      }, currentDuration);
    }
    
    return () => {
      clearTimeout(timer);
      clearInterval(intervalId);
    };
  }, [currentStage, stages]);

  // Handle view course button click
  const handleViewCourse = () => {
    if (onComplete) {
      onComplete();
    }
  };

  // Safeguard against out-of-bounds currentStage index
  const stage = stages[currentStage < stages.length ? currentStage : 0] || stages[0];
  const CurrentIcon = stage?.icon || FileText; // Default to FileText if icon not available
  
  return (
    <div className="w-full max-w-md mx-auto px-4 py-8 text-center">
      <div className="mb-6">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mx-auto bg-primary/10 rounded-full p-5 flex items-center justify-center mb-6 w-24 h-24"
        >
          <CurrentIcon className={`h-12 w-12 text-primary ${isCompleted ? '' : 'animate-pulse'}`} />
        </motion.div>
        
        <h2 className="text-2xl font-bold mb-2">{stage.title}</h2>
        <p className="text-muted-foreground mb-4">{stage.description}</p>
      </div>
      
      <div className="space-y-5 mb-6 w-full">
        <Progress value={isCompleted ? 100 : progress} className="h-2 w-full" />
        <div className="text-sm text-muted-foreground flex items-center justify-between">
          <span>Progress</span>
          <span className="font-medium">{isCompleted ? 100 : Math.round(progress)}%</span>
        </div>
      </div>
      
      {showViewButton && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Button 
            variant="default" 
            className="w-full"
            onClick={handleViewCourse}
          >
            View Your Course
          </Button>
        </motion.div>
      )}
      
      <div className="flex justify-center space-x-1 text-xs text-muted-foreground">
        <Zap className="h-3.5 w-3.5 mr-1" />
        <span>Powered by OpenRouter AI</span>
      </div>
    </div>
  );
}