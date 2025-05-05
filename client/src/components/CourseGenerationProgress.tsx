import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Github, FileText, Sparkles, Zap, Code, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface CourseGenerationProgressProps {
  sourceType: "github" | "llms-txt";
}

export default function CourseGenerationProgress({ sourceType }: CourseGenerationProgressProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  
  // Stages of course generation
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
      durationMs: 2000
    },
    {
      title: "Course ready!",
      description: "Your custom learning course has been generated successfully.",
      icon: CheckCircle2,
      durationMs: 1000
    }
  ];

  // Auto-advance through stages for visual effect
  useEffect(() => {
    const totalStages = stages.length;
    let timer: NodeJS.Timeout;
    
    if (currentStage < totalStages) {
      const currentDuration = stages[currentStage].durationMs;
      
      // Progress bar animation
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min(100, (elapsed / currentDuration) * 100);
        setProgress(newProgress);
        
        if (newProgress >= 100 && currentStage < totalStages - 1) {
          clearInterval(interval);
          setCurrentStage(prev => prev + 1);
          setProgress(0);
        }
      }, 50);
      
      // Move to next stage after duration
      timer = setTimeout(() => {
        clearInterval(interval);
        if (currentStage < totalStages - 1) {
          setCurrentStage(prev => prev + 1);
          setProgress(0);
        }
      }, currentDuration);
    }
    
    return () => {
      clearTimeout(timer);
    };
  }, [currentStage, stages]);

  const CurrentIcon = stages[currentStage].icon;
  
  return (
    <div className="w-full max-w-md mx-auto px-4 py-8 text-center">
      <div className="mb-6">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mx-auto bg-primary/10 rounded-full p-5 flex items-center justify-center mb-6 w-24 h-24"
        >
          <CurrentIcon className="h-12 w-12 text-primary animate-pulse" />
        </motion.div>
        
        <h2 className="text-2xl font-bold mb-2">{stages[currentStage].title}</h2>
        <p className="text-muted-foreground mb-4">{stages[currentStage].description}</p>
      </div>
      
      <div className="space-y-5 mb-6 w-full">
        <Progress value={progress} className="h-2 w-full" />
        <div className="text-sm text-muted-foreground flex items-center justify-between">
          <span>Progress</span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
      </div>
      
      <div className="flex justify-center space-x-1 text-xs text-muted-foreground">
        <Zap className="h-3.5 w-3.5 mr-1" />
        <span>Powered by OpenRouter AI</span>
      </div>
    </div>
  );
}