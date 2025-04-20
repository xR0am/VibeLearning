import { Example } from "@/types";

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
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Example Generated Courses</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {examples.map((example, index) => (
          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h4 className="font-medium text-gray-900">{example.title}</h4>
              <p className="text-sm text-gray-500 mt-1 truncate">{example.repoUrl}</p>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-3">Generated with {example.model}</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {example.tags.map((tag, tagIndex) => (
                  <span key={tagIndex} className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    {tag}
                  </span>
                ))}
              </div>
              {example.url ? (
                <a 
                  href={example.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center mt-3"
                >
                  View example <i className="fas fa-external-link-alt ml-1 text-xs"></i>
                </a>
              ) : (
                <button className="text-sm text-primary hover:underline flex items-center mt-3">
                  View example <i className="fas fa-external-link-alt ml-1 text-xs"></i>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
