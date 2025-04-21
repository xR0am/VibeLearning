import { Code, FileText, Bot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="bg-background border-b border-border sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <span className="text-primary text-3xl mr-2 flex items-center">
              <Code className="h-8 w-8" />
            </span>
            <h1 className="text-2xl font-bold gradient-heading">DevCourse</h1>
          </div>
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center text-sm">
              <Badge variant="outline" className="flex items-center bg-blue-50/50 dark:bg-blue-900/20">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-3.5 w-3.5 mr-1 fill-blue-600 dark:fill-blue-400">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </Badge>
            </div>
            <div className="hidden sm:flex items-center text-sm">
              <Badge variant="outline" className="flex items-center bg-green-50/50 dark:bg-green-900/20">
                <FileText className="h-3.5 w-3.5 mr-1 text-green-600 dark:text-green-400" />
                llms.txt
              </Badge>
            </div>
            <div className="flex items-center text-sm">
              <Badge variant="outline" className="flex items-center bg-purple-50/50 dark:bg-purple-900/20">
                <Bot className="h-3.5 w-3.5 mr-1 text-purple-600 dark:text-purple-400" />
                OpenRouter
              </Badge>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
