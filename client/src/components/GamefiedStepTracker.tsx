import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  Circle, 
  PlayCircle, 
  Trophy,
  Star,
  Sparkles,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Step {
  id: number;
  title: string;
  content: string;
}

interface Achievement {
  id: number;
  name: string;
  description: string;
  iconName: string;
  iconColor: string;
}

interface StepTrackerProps {
  courseId: number;
  steps: Step[];
  completedSteps: number[];
  currentStepId: number;
  completionPercentage: number;
  onStepComplete?: (stepId: number, newAchievements: Achievement[]) => void;
}

export default function GamefiedStepTracker({ 
  courseId, 
  steps, 
  completedSteps, 
  currentStepId, 
  completionPercentage,
  onStepComplete
}: StepTrackerProps) {
  const [celebratingStep, setCelebratingStep] = useState<number | null>(null);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const markStepCompleteMutation = useMutation({
    mutationFn: async (stepId: number) => {
      const response = await fetch(`/api/progress/${courseId}/step/${stepId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to mark step complete");
      }
      
      return response.json();
    },
    onSuccess: (data, stepId) => {
      setCelebratingStep(stepId);
      
      if (data.newAchievements && data.newAchievements.length > 0) {
        setNewAchievements(data.newAchievements);
        data.newAchievements.forEach((achievement: Achievement) => {
          toast({
            title: "🏆 Achievement Unlocked!",
            description: `${achievement.name}: ${achievement.description}`,
            duration: 5000
          });
        });
      }

      // Show celebration for step completion
      setTimeout(() => {
        setCelebratingStep(null);
        if (data.newAchievements.length === 0) {
          toast({
            title: "Step Completed! 🎉",
            description: "Great job! Keep learning to unlock achievements.",
            duration: 3000
          });
        }
      }, 2000);

      onStepComplete?.(stepId, data.newAchievements);
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to mark step as complete. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleCompleteStep = (stepId: number) => {
    markStepCompleteMutation.mutate(stepId);
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Learning Progress</h3>
            <Badge variant="secondary">
              {completedSteps.length}/{steps.length} completed
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Overall Progress</span>
              <span>{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
          </div>

          {completionPercentage === 100 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg text-center"
            >
              <Trophy className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="font-semibold text-green-800">Course Completed! 🎉</p>
              <p className="text-sm text-green-600">Amazing work! You've mastered this course.</p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Step List */}
      <div className="space-y-3">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStepId === step.id;
          const isNext = !isCompleted && !isCurrent && index === 0; // Next available step
          const isLocked = !isCompleted && !isCurrent && index > 0 && !completedSteps.includes(steps[index - 1]?.id);
          const isCelebrating = celebratingStep === step.id;

          return (
            <motion.div
              key={step.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={cn(
                "transition-all duration-300",
                isCompleted && "bg-green-50 border-green-200",
                isCurrent && "bg-blue-50 border-blue-200 ring-2 ring-blue-500/20",
                isNext && "border-orange-200",
                isLocked && "bg-gray-50 border-gray-200 opacity-60"
              )}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Step Status Icon */}
                    <div className="flex-shrink-0 relative">
                      <motion.div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                          isCompleted && "bg-green-500 border-green-500 text-white",
                          isCurrent && "bg-blue-500 border-blue-500 text-white",
                          isNext && "bg-orange-100 border-orange-300 text-orange-600",
                          isLocked && "bg-gray-200 border-gray-300 text-gray-500"
                        )}
                        whileHover={!isLocked ? { scale: 1.1 } : {}}
                        animate={isCelebrating ? { 
                          scale: [1, 1.2, 1], 
                          rotate: [0, 10, -10, 0],
                          transition: { duration: 0.6, repeat: 2 }
                        } : {}}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : isCurrent ? (
                          <PlayCircle className="h-5 w-5" />
                        ) : (
                          <span className="text-sm font-semibold">{index + 1}</span>
                        )}
                      </motion.div>

                      {/* Celebration Effects */}
                      <AnimatePresence>
                        {isCelebrating && (
                          <>
                            <motion.div
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0 }}
                              className="absolute -top-2 -right-2"
                            >
                              <Sparkles className="h-6 w-6 text-yellow-500" />
                            </motion.div>
                            <motion.div
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0 }}
                              className="absolute -bottom-2 -left-2"
                            >
                              <Star className="h-4 w-4 text-blue-500" />
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className={cn(
                        "font-medium mb-1",
                        isCompleted && "line-through text-muted-foreground",
                        isLocked && "text-gray-500"
                      )}>
                        {step.title}
                      </h4>
                      
                      <p className={cn(
                        "text-sm text-muted-foreground line-clamp-2 mb-3",
                        isLocked && "text-gray-400"
                      )}>
                        {step.content.substring(0, 100)}...
                      </p>

                      {/* Action Button */}
                      {!isCompleted && !isLocked && (
                        <Button
                          size="sm"
                          variant={isCurrent ? "default" : "outline"}
                          onClick={() => handleCompleteStep(step.id)}
                          disabled={markStepCompleteMutation.isPending}
                          className="transition-all duration-200"
                        >
                          {markStepCompleteMutation.isPending ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Completing...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Mark Complete
                            </>
                          )}
                        </Button>
                      )}

                      {isLocked && (
                        <Badge variant="secondary" className="text-xs">
                          Complete previous steps to unlock
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Achievement Notifications */}
      <AnimatePresence>
        {newAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed bottom-4 right-4 z-50 space-y-2"
          >
            {newAchievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-lg shadow-lg max-w-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-full">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Achievement Unlocked!</h4>
                    <p className="text-sm opacity-90">{achievement.name}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}