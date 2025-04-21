import { Example } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Code, ExternalLink, Layers } from "lucide-react";

export default function ExampleShowcase() {
  const examples: Example[] = [
    {
      title: "ElizaOS for Custom CLI Development",
      repoUrl: "github.com/eliza-os/eliza",
      model: "Gemini 2.5 Pro MAX",
      tags: ["Architecture", "CLI", "System Integration"],
      url: "https://hackmd.io/@metadreamer/ryne2Tekex"
    },
    {
      title: "Building with React 18 Suspense",
      repoUrl: "github.com/facebook/react",
      model: "Claude 3 Opus",
      tags: ["Frontend", "Data Fetching", "Performance"]
    },
    {
      title: "Understanding llms.txt Standard",
      repoUrl: "llmstxt.org/llms.txt",
      model: "GPT-4o",
      tags: ["Documentation", "LLM", "Standards", "llms.txt"],
      url: "https://llmstxt.org"
    }
  ];
  
  return (
    <Card className="border shadow-lg card-shadow mb-8">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Example Generated Courses
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {examples.map((example, index) => (
            <Card key={index} className="border overflow-hidden">
              <CardHeader className="p-4 pb-3 border-b">
                <CardTitle className="text-base font-medium">{example.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1 truncate flex items-center gap-1">
                  <Code className="h-3.5 w-3.5" />
                  {example.repoUrl}
                </p>
              </CardHeader>
              <CardContent className="p-4 pt-3">
                <div className="flex items-center mb-3">
                  <Badge variant="outline" className="bg-purple-50/30 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-xs">
                    <Layers className="mr-1 h-3 w-3" />
                    {example.model}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {example.tags.map((tag, tagIndex) => (
                    <Badge key={tagIndex} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                {example.url ? (
                  <a 
                    href={example.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center mt-3"
                  >
                    <span>View example</span>
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                ) : (
                  <button className="text-sm text-primary hover:underline flex items-center mt-3">
                    <span>View example</span>
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
