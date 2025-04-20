export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <div className="flex items-center mb-4 md:mb-0">
            <span className="text-accent text-xl mr-2">
              <i className="fas fa-code-branch"></i>
            </span>
            <span className="font-semibold text-gray-800">DevCourse</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <span>Built with</span>
            <a 
              href="https://openrouter.ai" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary hover:underline mx-1"
            >
              OpenRouter
            </a>
            <span>•</span>
            <a href="#" className="text-gray-600 hover:text-gray-900 mx-2">Terms</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">Privacy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
