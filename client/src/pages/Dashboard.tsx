import { useAuth } from "@/hooks/useAuth";
import LearningPathVisualization from "@/components/LearningPathVisualization";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BookOpen, Plus } from "lucide-react";

export default function Dashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Welcome to DevCourse</h2>
            <p className="text-muted-foreground mb-4">
              Sign in to track your learning progress and earn achievements.
            </p>
            <Button asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Learning Dashboard</h1>
          <p className="text-muted-foreground">
            Track your progress and achievements
          </p>
        </div>
        <Button asChild>
          <Link href="/">
            <Plus className="h-4 w-4 mr-2" />
            Generate New Course
          </Link>
        </Button>
      </div>

      <LearningPathVisualization />
    </div>
  );
}