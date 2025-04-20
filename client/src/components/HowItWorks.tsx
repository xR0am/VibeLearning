export default function HowItWorks() {
  const steps = [
    {
      icon: "fas fa-link",
      title: "1. Provide Source",
      description: "Enter a GitHub repository URL or website with llms.txt along with your specific use case."
    },
    {
      icon: "fas fa-robot",
      title: "2. AI Analysis",
      description: "OpenRouter's AI analyzes the repository or llms.txt content to understand the tool or concept."
    },
    {
      icon: "fas fa-graduation-cap",
      title: "3. Custom Course",
      description: "Receive a personalized learning path with step-by-step instructions tailored to your needs."
    }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">How It Works</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-primary mb-4">
              <i className={`${step.icon} text-lg`}></i>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">{step.title}</h4>
            <p className="text-sm text-gray-600">
              {step.description}
            </p>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="font-medium text-gray-900 mb-2">What is llms.txt?</h4>
        <p className="text-sm text-gray-600">
          llms.txt is a growing standard that provides LLM-friendly content on websites. 
          It's a markdown file that offers brief background information and guidance for large language models.
          Learn more at <a href="https://llmstxt.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">llmstxt.org</a>.
        </p>
      </div>
    </div>
  );
}
