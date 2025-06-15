import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./components/ThemeProvider";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import UserCourses from "@/pages/UserCourses";
import PublicCourses from "@/pages/PublicCourses";
import Course from "@/pages/Course";
import Admin from "@/pages/Admin";
import LoaderDemo from "@/pages/LoaderDemo";
import HowTo from "@/pages/HowTo";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/profile" component={Profile} />
      <Route path="/courses/user" component={UserCourses} />
      <Route path="/courses/public" component={PublicCourses} />
      <Route path="/admin" component={Admin} />
      <Route path="/loader-demo" component={LoaderDemo} />
      <Route path="/how-to" component={HowTo} />
      <Route path="/course/:id" component={Course} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Set initial dark mode on body (this will be overridden by ThemeProvider)
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <ThemeProvider defaultTheme="dark">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <Toaster />
            <Router />
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
