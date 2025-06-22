import { useState } from "react";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  HelpCircle, 
  Lightbulb, 
  Bot, 
  Github, 
  FileText, 
  Sparkles, 
  Key, 
  Code,
  BookOpen,
  Globe,
  User,
  AlertCircle
} from "lucide-react";
import ComplexityBadge from "@/components/ComplexityBadge";

export default function HowTo() {
  const [tab, setTab] = useState("getting-started");
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2 gradient-heading flex items-center justify-center gap-2">
            <HelpCircle className="h-7 w-7" />
            How to Use VibeLearning
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Learn how to get the most out of VibeLearning, from setting up your API key to understanding course complexity levels.
          </p>
        </div>
        
        <Tabs defaultValue="getting-started" value={tab} onValueChange={setTab} className="mb-12">
          <div className="flex justify-center mb-6">
            <TabsList className="grid grid-cols-1 md:grid-cols-4 w-full max-w-xl">
              <TabsTrigger value="getting-started" className="flex items-center gap-1">
                <Lightbulb className="h-3.5 w-3.5" />
                Getting Started
              </TabsTrigger>
              <TabsTrigger value="api-key" className="flex items-center gap-1">
                <Key className="h-3.5 w-3.5" />
                API Key Setup
              </TabsTrigger>
              <TabsTrigger value="complexity" className="flex items-center gap-1">
                <Code className="h-3.5 w-3.5" />
                Complexity Levels
              </TabsTrigger>
              <TabsTrigger value="faq" className="flex items-center gap-1">
                <HelpCircle className="h-3.5 w-3.5" />
                FAQ
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Getting Started Tab */}
          <TabsContent value="getting-started">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Getting Started with VibeLearning
                </CardTitle>
                <CardDescription>
                  Learn the basics of generating and exploring personalized courses.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 shadow-md">
                      <Github className="h-7 w-7" />
                    </div>
                    <h3 className="font-medium text-lg mb-2">1. Choose Your Source</h3>
                    <p className="text-sm text-muted-foreground">
                      Select a GitHub repository or website with an llms.txt file as your learning source.
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 shadow-md">
                      <Bot className="h-7 w-7" />
                    </div>
                    <h3 className="font-medium text-lg mb-2">2. Describe Your Use Case</h3>
                    <p className="text-sm text-muted-foreground">
                      Tell us what you want to learn about – be specific about your goals and technical level.
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 shadow-md">
                      <BookOpen className="h-7 w-7" />
                    </div>
                    <h3 className="font-medium text-lg mb-2">3. Learn at Your Pace</h3>
                    <p className="text-sm text-muted-foreground">
                      Work through your personalized course step-by-step, at your own convenience.
                    </p>
                  </div>
                </div>
                
                <div className="bg-muted/40 rounded-lg p-5 border">
                  <h3 className="font-medium text-lg mb-3 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Pro Tip: Be Specific
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    The more specific you are about your learning goals and technical level in the "context" field, the more tailored your course will be. Examples:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
                      <span>"I'm a beginner programmer looking to understand the basics of this database ORM"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
                      <span>"I'm building a React app and need to learn how to integrate this authentication library"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
                      <span>"I have experience with Python but need to understand how to use this ML library for text classification"</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-center border-t pt-5">
                <Button asChild>
                  <Link href="/">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Your First Course
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* API Key Setup Tab */}
          <TabsContent value="api-key">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Key className="h-5 w-5 text-primary" />
                  Setting Up Your OpenRouter API Key
                </CardTitle>
                <CardDescription>
                  Learn how to get and add your API key to use DevCourse.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg mb-1 flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Step 1: Sign Up for OpenRouter
                    </h3>
                    <ol className="space-y-3 list-decimal pl-5 text-sm">
                      <li>Visit <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OpenRouter.ai</a></li>
                      <li>Create a free account or sign in</li>
                      <li>Navigate to the API Keys section</li>
                      <li>Create a new API key with a name like "DevCourse"</li>
                      <li>Copy your API key (it will start with "sk-")</li>
                    </ol>
                    
                    <div className="bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 p-4 rounded-md border border-amber-200 dark:border-amber-900 mt-4 text-sm">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Free Credits Available</p>
                          <p className="mt-1">OpenRouter provides free credits when you sign up, which you can use to generate courses without any cost.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg mb-1 flex items-center gap-2">
                      <Key className="h-5 w-5 text-primary" />
                      Step 2: Add API Key to VibeLearning
                    </h3>
                    <ol className="space-y-3 list-decimal pl-5 text-sm">
                      <li>Sign in to VibeLearning using the login button in the top right corner</li>
                      <li>Navigate to your Profile by clicking your username in the top right</li>
                      <li>Look for the "API Key Settings" section</li>
                      <li>Paste your OpenRouter API key into the field</li>
                      <li>Click "Save API Key" to store it securely</li>
                    </ol>
                    
                    <div className="bg-muted/40 rounded-lg p-4 border text-sm">
                      <h4 className="font-medium mb-2 flex items-center gap-1.5">
                        <Key className="h-4 w-4 text-primary" />
                        Automatic Prompting
                      </h4>
                      <p>If you try to generate a course without an API key, you'll be prompted to add one automatically. You can enter it at that time instead of going to your profile.</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300 p-4 rounded-md border border-green-200 dark:border-green-900 mt-4">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Your API Key is Stored Securely</p>
                      <p className="mt-1 text-sm">Your OpenRouter API key is stored securely and only used to generate courses. We never share your key with third parties.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Complexity Levels Tab */}
          <TabsContent value="complexity">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  Understanding Complexity Levels
                </CardTitle>
                <CardDescription>
                  Learn about the complexity ratings and what they mean for your learning journey.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Each course in VibeLearning is automatically analyzed and assigned a complexity level. This helps you understand the difficulty level and estimated knowledge required before beginning.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-lg border p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium flex items-center gap-1.5">
                        <ComplexityBadge complexity="beginner" size="sm" />
                        <span className="ml-1">Beginner Level</span>
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Basic concepts and introductory material. Suitable for those new to the subject or technology. Limited code complexity and focuses on fundamentals.
                    </p>
                    <div className="text-xs text-muted-foreground mt-2">
                      <span className="font-medium">Good for:</span> Newcomers to programming or the specific technology
                    </div>
                  </div>
                  
                  <div className="rounded-lg border p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium flex items-center gap-1.5">
                        <ComplexityBadge complexity="intermediate" size="sm" />
                        <span className="ml-1">Intermediate Level</span>
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      More advanced concepts building on fundamentals. Assumes basic knowledge of programming and the technology. Includes moderate code complexity.
                    </p>
                    <div className="text-xs text-muted-foreground mt-2">
                      <span className="font-medium">Good for:</span> Developers with some experience looking to expand their skills
                    </div>
                  </div>
                  
                  <div className="rounded-lg border p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium flex items-center gap-1.5">
                        <ComplexityBadge complexity="advanced" size="sm" />
                        <span className="ml-1">Advanced Level</span>
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Complex implementations and architecture patterns. Assumes solid experience with programming and related technologies. Includes sophisticated code examples.
                    </p>
                    <div className="text-xs text-muted-foreground mt-2">
                      <span className="font-medium">Good for:</span> Experienced developers seeking deeper understanding
                    </div>
                  </div>
                  
                  <div className="rounded-lg border p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium flex items-center gap-1.5">
                        <ComplexityBadge complexity="expert" size="sm" />
                        <span className="ml-1">Expert Level</span>
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      High-level concepts, optimization techniques, and advanced architectural patterns. Assumes extensive experience with the technology and related systems.
                    </p>
                    <div className="text-xs text-muted-foreground mt-2">
                      <span className="font-medium">Good for:</span> Senior developers and architects looking for mastery
                    </div>
                  </div>
                </div>
                
                <div className="bg-muted/40 rounded-lg p-5 border mt-4">
                  <h3 className="font-medium text-lg mb-3 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    How Complexity is Calculated
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Our system analyzes multiple factors to determine the complexity level:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                      <span><strong>Content Length:</strong> Longer, more detailed steps often indicate higher complexity</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                      <span><strong>Code Blocks:</strong> The number and complexity of code examples</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                      <span><strong>Technical Terms:</strong> Frequency of advanced technical terminology</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                      <span><strong>Course Structure:</strong> Number of steps and learning progression</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* FAQ Tab */}
          <TabsContent value="faq">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  Frequently Asked Questions
                </CardTitle>
                <CardDescription>
                  Common questions and answers about using VibeLearning effectively.
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>What is VibeLearning and how does it work?</AccordionTrigger>
                    <AccordionContent>
                      VibeLearning is an AI-powered learning platform that automatically generates personalized courses based on GitHub repositories or llms.txt files. It uses large language models (LLMs) to analyze the source material and create step-by-step learning content tailored to your specific needs and technical level.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Do I need to pay for using VibeLearning?</AccordionTrigger>
                    <AccordionContent>
                      VibeLearning itself is free to use, but it requires an OpenRouter API key to generate courses. OpenRouter provides free credits when you sign up, which may be sufficient for your needs. If you need to generate more courses, you'll need to add funds to your OpenRouter account.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3">
                    <AccordionTrigger>What is llms.txt and where can I find it?</AccordionTrigger>
                    <AccordionContent>
                      llms.txt is a growing standard for providing LLM-friendly documentation on websites. It's a markdown file that offers concise information about a product, library, or service for large language models to understand. Not all websites have an llms.txt file yet. You can learn more at <a href="https://llmstxt.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">llmstxt.org</a>.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-4">
                    <AccordionTrigger>Can I save courses for later?</AccordionTrigger>
                    <AccordionContent>
                      Yes! When you're logged in, all courses you generate are automatically saved to your account. You can access them anytime from your profile page. You can also choose to make courses public or keep them private.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-5">
                    <AccordionTrigger>Which language models does VibeLearning use?</AccordionTrigger>
                    <AccordionContent>
                      VibeLearning uses OpenRouter to provide access to various large language models, including free models like DeepSeek, Llama, and more. When you add your OpenRouter API key, you'll have access to all the models available on your account, including any premium models you've enabled.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-6">
                    <AccordionTrigger>How accurate are the generated courses?</AccordionTrigger>
                    <AccordionContent>
                      Course quality depends on the source material and the language model used. The system does its best to create accurate, helpful content, but may occasionally contain errors or misunderstandings. Always verify critical information, especially for production code. We recommend using the most advanced model available for the best results.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-7">
                    <AccordionTrigger>Can I contribute to the public course library?</AccordionTrigger>
                    <AccordionContent>
                      Yes! When generating a course, logged-in users have an option to make the course public. Public courses appear in the library for all users to access. This is a great way to share knowledge with the community about libraries, frameworks, or projects you find useful.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-8">
                    <AccordionTrigger>Is my OpenRouter API key secure?</AccordionTrigger>
                    <AccordionContent>
                      Yes, your API key is stored securely and is only used to make API calls to OpenRouter when you generate courses. We never share your API key with third parties or use it for any purpose other than generating courses at your request.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
              
              <CardFooter className="flex flex-col items-center border-t pt-5 gap-4">
                <p className="text-sm text-muted-foreground text-center max-w-xl">
                  Have more questions? Feel free to reach out to us or check out our GitHub repository for more information.
                </p>
                <div className="flex gap-4">
                  <Button variant="outline" asChild>
                    <a href="https://github.com/username/devcourse" target="_blank" rel="noopener noreferrer">
                      <Github className="mr-2 h-4 w-4" />
                      GitHub Repository
                    </a>
                  </Button>
                  <Button asChild>
                    <Link href="/">
                      <Globe className="mr-2 h-4 w-4" />
                      Back to Home
                    </Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}