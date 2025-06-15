import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Flame, 
  Clock, 
  BookOpen, 
  Star, 
  Target,
  Zap,
  Award,
  CheckCircle2,
  Circle,
  PlayCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Achievement {
  id: number;
  name: string;
  description: string;
  iconName: string;
  iconColor: string;
  earnedAt?: string;
}

interface CourseProgress {
  id: number;
  courseId: number;
  completedSteps: number[];
  currentStepId: number;
  totalSteps: number;
  completionPercentage: number;
  startedAt: string;
  lastActivityAt: string;
  completedAt?: string;
  streakDays: number;
  timeSpentMinutes: number;
  course: {
    id: number;
    title: string;
    content: any;
  };
}

interface DashboardData {
  progress: CourseProgress[];
  achievements: Achievement[];
  stats: {
    totalCourses: number;
    completedCourses: number;
    totalTimeSpent: number;
    currentStreak: number;
  };
}

const iconMap = {
  Trophy, Flame, Clock, BookOpen, Star, Target, Zap, Award, CheckCircle2, Circle, PlayCircle
};

export default function LearningPathVisualization() {
  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
    enabled: true
  });

  const [selectedCourse, setSelectedCourse] = useState<CourseProgress | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Start Your Learning Journey</h3>
          <p className="text-muted-foreground mb-4">
            Create your first course to see your progress visualization here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { progress, achievements, stats } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Courses Started"
          value={stats.totalCourses}
          icon={BookOpen}
          color="bg-blue-500"
        />
        <StatsCard
          title="Completed"
          value={stats.completedCourses}
          icon={Trophy}
          color="bg-green-500"
        />
        <StatsCard
          title="Learning Streak"
          value={`${stats.currentStreak} days`}
          icon={Flame}
          color="bg-orange-500"
        />
        <StatsCard
          title="Time Spent"
          value={`${Math.round(stats.totalTimeSpent / 60)}h ${stats.totalTimeSpent % 60}m`}
          icon={Clock}
          color="bg-purple-500"
        />
      </div>

      {/* Learning Path Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Your Learning Path
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {progress.map((courseProgress) => (
              <CourseProgressCard
                key={courseProgress.id}
                progress={courseProgress}
                isSelected={selectedCourse?.id === courseProgress.id}
                onClick={() => setSelectedCourse(courseProgress)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {achievements.map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Course View */}
      <AnimatePresence>
        {selectedCourse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <DetailedCourseView 
              progress={selectedCourse}
              onClose={() => setSelectedCourse(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, color }: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className={cn("p-3 rounded-full", color)}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CourseProgressCard({ progress, isSelected, onClick }: {
  progress: CourseProgress;
  isSelected: boolean;
  onClick: () => void;
}) {
  const isCompleted = progress.completionPercentage === 100;
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-md",
          isSelected && "ring-2 ring-primary",
          isCompleted && "bg-green-50 border-green-200"
        )}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold truncate flex-1 mr-2">
              {progress.course.title}
            </h3>
            <div className="flex items-center gap-2">
              {isCompleted && (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
              <Badge variant={isCompleted ? "default" : "secondary"}>
                {progress.completedSteps.length}/{progress.totalSteps} steps
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{progress.completionPercentage}%</span>
            </div>
            <Progress value={progress.completionPercentage} className="h-2" />
          </div>

          <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{Math.round(progress.timeSpentMinutes / 60)}h {progress.timeSpentMinutes % 60}m</span>
              </div>
              {progress.streakDays > 0 && (
                <div className="flex items-center gap-1">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span>{progress.streakDays} days</span>
                </div>
              )}
            </div>
            <Button variant="ghost" size="sm">
              <PlayCircle className="h-4 w-4 mr-1" />
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function AchievementBadge({ achievement }: { achievement: Achievement }) {
  const IconComponent = iconMap[achievement.iconName as keyof typeof iconMap] || Star;
  const isEarned = !!achievement.earnedAt;
  
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className={cn(
        "text-center p-4 transition-all duration-200",
        isEarned ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200" : "bg-gray-50 border-gray-200"
      )}>
        <div className={cn(
          "inline-flex p-3 rounded-full mb-3",
          isEarned ? "text-white" : "text-gray-400"
        )} style={{ backgroundColor: isEarned ? achievement.iconColor : "#d1d5db" }}>
          <IconComponent className="h-6 w-6" />
        </div>
        <h4 className={cn(
          "font-semibold text-sm mb-1",
          isEarned ? "text-gray-900" : "text-gray-500"
        )}>
          {achievement.name}
        </h4>
        <p className={cn(
          "text-xs",
          isEarned ? "text-gray-600" : "text-gray-400"
        )}>
          {achievement.description}
        </p>
        {isEarned && (
          <Badge variant="secondary" className="mt-2 text-xs">
            Earned
          </Badge>
        )}
      </Card>
    </motion.div>
  );
}

function DetailedCourseView({ progress, onClose }: {
  progress: CourseProgress;
  onClose: () => void;
}) {
  const steps = progress.course.content?.steps || [];
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{progress.course.title}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm">
            <Badge>{progress.completedSteps.length}/{progress.totalSteps} completed</Badge>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{Math.round(progress.timeSpentMinutes / 60)}h {progress.timeSpentMinutes % 60}m spent</span>
            </div>
          </div>
          
          <Progress value={progress.completionPercentage} className="h-3" />
          
          <div className="grid gap-2 max-h-64 overflow-y-auto">
            {steps.map((step: any, index: number) => {
              const isCompleted = progress.completedSteps.includes(step.id);
              const isCurrent = progress.currentStepId === step.id;
              
              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                    isCompleted && "bg-green-50 border-green-200",
                    isCurrent && "bg-blue-50 border-blue-200",
                    !isCompleted && !isCurrent && "bg-gray-50 border-gray-200"
                  )}
                >
                  <div className={cn(
                    "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center",
                    isCompleted ? "bg-green-500 text-white" : 
                    isCurrent ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-600"
                  )}>
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <span className="text-xs font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <span className={cn(
                    "flex-1 text-sm",
                    isCompleted && "line-through text-muted-foreground"
                  )}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}