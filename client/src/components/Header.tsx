export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <span className="text-accent text-3xl mr-2">
              <i className="fas fa-code-branch"></i>
            </span>
            <h1 className="text-2xl font-bold text-gray-800">DevCourse</h1>
          </div>
          <div className="flex items-center text-sm">
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center">
              <span className="h-2 w-2 bg-green-500 rounded-full mr-1"></span>
              OpenRouter Connected
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
