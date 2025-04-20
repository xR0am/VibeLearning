import { useRef } from "react";
import { CourseContent as CourseContentType } from "@/types";
import ReactMarkdown from 'react-markdown';

interface CourseContentProps {
  content: CourseContentType;
  activeStepIndex: number;
  setActiveStepIndex: (index: number) => void;
}

export default function CourseContent({ 
  content, 
  activeStepIndex, 
  setActiveStepIndex 
}: CourseContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  
  const handleStepChange = (index: number) => {
    setActiveStepIndex(index);
    // Scroll to top of content when changing steps
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const activeStep = content.steps[activeStepIndex];
  const progressPercentage = ((activeStepIndex + 1) / content.steps.length) * 100;
  
  const handlePrevious = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex(activeStepIndex - 1);
    }
  };
  
  const handleNext = () => {
    if (activeStepIndex < content.steps.length - 1) {
      setActiveStepIndex(activeStepIndex + 1);
    }
  };
  
  // Function to export course as markdown
  const exportAsMD = () => {
    let markdown = `# ${content.title}\n\n`;
    markdown += `Repository: ${content.repoUrl}\n\n`;
    markdown += `Context: ${content.context}\n\n`;
    
    content.steps.forEach((step) => {
      markdown += `## ${step.title}\n\n${step.content}\n\n`;
    });
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${content.title.replace(/\s+/g, '-').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };
  
  return (
    <div ref={contentRef} className="bg-white rounded-lg shadow-md mb-8">
      {/* Course Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{content.title}</h2>
            <div className="mt-1 flex items-center text-sm text-gray-500">
              <span className="flex items-center">
                <i className="fas fa-code-branch mr-1"></i>
                <a href={content.repoUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {content.repoUrl.replace(/^https?:\/\//i, '')}
                </a>
              </span>
              <span className="mx-2">•</span>
              <span className="italic">{content.context}</span>
            </div>
          </div>
          <div>
            <button 
              onClick={exportAsMD}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <i className="fas fa-download mr-1"></i>
              <span className="text-sm">Export as MD</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Course Navigation */}
      <div className="border-b border-gray-200 bg-gray-50 overflow-x-auto">
        <div className="px-6 py-2 flex items-center">
          <div className="mr-4 whitespace-nowrap">
            <span className="text-sm font-medium text-gray-700">Progress:</span>
            <div className="mt-1 w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
          
          {content.steps.map((step, index) => (
            <button 
              key={step.id}
              onClick={() => handleStepChange(index)}
              className={`mr-2 px-3 py-1 text-sm rounded-md ${
                index === activeStepIndex 
                  ? 'bg-accent text-white font-medium' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Step {index + 1}
            </button>
          ))}
        </div>
      </div>
      
      {/* Course Step Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">{activeStep.title}</h3>
        
        <div className="prose max-w-none">
          <ReactMarkdown>
            {activeStep.content}
          </ReactMarkdown>
        </div>
        
        {/* Step Navigation */}
        <div className="mt-8 flex justify-between">
          <button 
            onClick={handlePrevious}
            disabled={activeStepIndex === 0}
            className={`px-4 py-2 border border-gray-300 rounded-md text-sm font-medium ${
              activeStepIndex === 0 
              ? 'opacity-50 cursor-not-allowed bg-white text-gray-400' 
              : 'text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            <i className="fas fa-arrow-left mr-1"></i> Previous
          </button>
          <button 
            onClick={handleNext}
            disabled={activeStepIndex === content.steps.length - 1}
            className={`px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
              activeStepIndex === content.steps.length - 1 
              ? 'opacity-50 cursor-not-allowed border-gray-300 bg-white text-gray-400' 
              : 'border-transparent text-white bg-primary hover:bg-blue-600'
            }`}
          >
            Next <i className="fas fa-arrow-right ml-1"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
