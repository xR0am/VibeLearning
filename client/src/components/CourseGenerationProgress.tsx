import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Github, FileText, Sparkles, Zap, Code, CheckCircle2, Server, BrainCircuit } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CourseGenerationProgressProps {
  sourceType: "github" | "llms-txt";
  onComplete?: () => void;
}

export default function CourseGenerationProgress({ sourceType, onComplete }: CourseGenerationProgressProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showViewButton, setShowViewButton] = useState(false);
  const [statusLogs, setStatusLogs] = useState<string[]>([]);
  const [isError, setIsError] = useState(false);
  
  // Add log entry with timestamp
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setStatusLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };
  
  // Stages of course generation - adjusted durations for better UX
  const stages = [
    {
      title: sourceType === "github" ? "Analyzing repository" : "Analyzing llms.txt content",
      description: sourceType === "github" 
        ? "Scanning repository structure, code files, README, and documentation..." 
        : "Parsing llms.txt file contents, extracting key information...",
      icon: sourceType === "github" ? Github : FileText,
      durationMs: 3000,
      logs: sourceType === "github" 
        ? [
            "Initiating connection to GitHub API...",
            "Fetching repository metadata...",
            "Scanning repository structure...",
            "Analyzing main files and directories...",
            "Processing README and documentation...",
            "Categorizing code files by language...",
            "Repository analysis complete!"
          ]
        : [
            "Establishing connection to source server...",
            "Downloading llms.txt content...",
            "Parsing content format...",
            "Extracting key information and sections...",
            "Analyzing document structure...",
            "llms.txt analysis complete!"
          ]
    },
    {
      title: "Preparing AI model",
      description: "Initializing the AI model with source content for course generation...",
      icon: BrainCircuit,
      durationMs: 3000,
      logs: [
        "Initializing OpenRouter model...",
        "Preparing source content for processing...",
        "Creating system prompt with context...",
        "Sending initial request to AI model...",
        "Waiting for model response..."
      ]
    },
    {
      title: "Generating tutorial content",
      description: "Crafting detailed explanations, code samples, and step-by-step instructions...",
      icon: Bot,
      durationMs: 5000,
      logs: [
        "AI model processing content...",
        "Generating course outline...",
        "Creating step-by-step instructions...",
        "Writing code examples and explanations...",
        "Formatting and optimizing content...",
        "Tutorial content generation complete!"
      ]
    },
    {
      title: "Processing response",
      description: "Parsing and validating the generated course structure...",
      icon: Server,
      durationMs: 3000,
      logs: [
        "Receiving model response...",
        "Parsing JSON structure...",
        "Validating course format...",
        "Processing code snippets...",
        "Optimizing content for display...",
        "Content processing complete!"
      ]
    },
    {
      title: "Course ready!",
      description: "Your custom learning course has been generated successfully.",
      icon: CheckCircle2,
      durationMs: 1500,
      logs: [
        "Finalizing course structure...",
        "Saving content to database...",
        "Generating course preview...",
        "Course generation complete! Ready to view."
      ]
    }
  ];

  // Process logs from current stage
  useEffect(() => {
    if (currentStage < stages.length && stages[currentStage].logs) {
      // Get logs for the current stage
      const logs = stages[currentStage].logs || [];
      const logCount = logs.length;
      
      if (logCount > 0) {
        // Calculate delays between log entries
        const duration = stages[currentStage].durationMs;
        const logInterval = duration / (logCount + 1); // +1 to leave space at the end
        
        // Add logs in sequence with delay
        logs.forEach((log, index) => {
          setTimeout(() => {
            addLog(log);
          }, logInterval * (index + 1));
        });
      }
    }
  }, [currentStage, stages]);

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
      <div className="mb-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mx-auto bg-primary/10 rounded-full p-5 flex items-center justify-center mb-5 w-20 h-20"
        >
          <CurrentIcon className={`h-10 w-10 text-primary ${isCompleted ? '' : 'animate-pulse'}`} />
        </motion.div>
        
        <h2 className="text-xl font-bold mb-2">{stage.title}</h2>
        <p className="text-sm text-muted-foreground mb-3">{stage.description}</p>
      </div>
      
      <div className="space-y-4 mb-4 w-full">
        <Progress value={isCompleted ? 100 : progress} className="h-2 w-full" />
        <div className="text-xs text-muted-foreground flex items-center justify-between">
          <span>Progress</span>
          <span className="font-medium">{isCompleted ? 100 : Math.round(progress)}%</span>
        </div>
      </div>
      
      {/* Status log display */}
      <div className="mb-5 border rounded-md overflow-hidden bg-muted/10">
        <div className="bg-muted/30 px-3 py-1.5 border-b flex items-center justify-between">
          <div className="flex items-center text-sm font-medium">
            <Server className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <span>Process Logs</span>
          </div>
          <Badge variant="outline" className="text-xs h-5 px-1.5">
            live
          </Badge>
        </div>
        <div className="max-h-[160px] overflow-y-auto p-3 text-left">
          {statusLogs.length > 0 ? (
            <div className="space-y-1.5">
              {statusLogs.map((log, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-xs font-mono text-muted-foreground"
                >
                  {log}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground text-center py-4">
              Waiting for process to start...
            </div>
          )}
        </div>
      </div>
      
      {showViewButton && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4"
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