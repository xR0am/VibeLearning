import { Link, Bot, GraduationCap, ExternalLink, FileText, HelpCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function HowItWorks() {
  const steps = [
    {
      icon: Link,
      title: "1. Provide Source",
      description: "Enter a GitHub repository URL or website with llms.txt along with your specific use case."
    },
    {
      icon: Bot,
      title: "2. AI Analysis",
      description: "OpenRouter's AI analyzes the repository or llms.txt content to understand the tool or concept."
    },
    {
      icon: GraduationCap,
      title: "3. Custom Course",
      description: "Receive a personalized learning path with step-by-step instructions tailored to your needs."
    }
  ];
  
  return (
    <Card className="border shadow-lg card-shadow">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          How It Works
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 shadow-md">
                  <Icon className="h-7 w-7" />
                </div>
                <h4 className="font-medium text-lg mb-2">{step.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
      
      <CardFooter>
        <Alert className="w-full bg-card border-border">
          <FileText className="h-4 w-4" />
          <AlertTitle className="font-medium text-foreground">What is llms.txt?</AlertTitle>
          <AlertDescription className="text-sm text-muted-foreground">
            llms.txt is a growing standard that provides LLM-friendly content on websites. 
            It's a markdown file that offers brief background information and guidance for large language models.
            Learn more at{" "}
            <a 
              href="https://llmstxt.org" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary hover:underline inline-flex items-center"
            >
              llmstxt.org
              <ExternalLink className="h-3 w-3 ml-0.5" />
            </a>
          </AlertDescription>
        </Alert>
      </CardFooter>
    </Card>
  );
}
