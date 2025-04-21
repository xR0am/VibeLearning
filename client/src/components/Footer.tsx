import { Code, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <div className="flex items-center mb-4 md:mb-0">
            <span className="text-primary text-xl mr-2 flex items-center">
              <Code className="h-5 w-5" />
            </span>
            <span className="font-semibold gradient-heading">DevCourse</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <span>Built with</span>
            <Heart className="h-3 w-3 mx-1 text-red-500 fill-red-500" />
            <a 
              href="https://openrouter.ai" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary hover:underline mx-1 transition-colors"
            >
              OpenRouter
            </a>
            <span className="mx-1">•</span>
            <a href="#" className="text-muted-foreground hover:text-foreground mx-2 transition-colors">Terms</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
