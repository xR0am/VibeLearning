export default function HowItWorks() {
  const steps = [
    {
      icon: "fas fa-link",
      title: "1. Provide Repository",
      description: "Enter a GitHub URL or tool name along with your specific use case or learning goals."
    },
    {
      icon: "fas fa-robot",
      title: "2. AI Analysis",
      description: "OpenRouter's AI analyzes documentation, code, and best practices for the tool."
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
    </div>
  );
}
