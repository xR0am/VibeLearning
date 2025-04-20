export default function IntroSection() {
  return (
    <div className="text-center mb-12">
      <h2 className="text-4xl font-bold text-gray-900 mb-4">Learn Any Developer Tool, Your Way</h2>
      <p className="text-lg text-gray-600 max-w-3xl mx-auto">
        Generate customized step-by-step courses for any GitHub repository or website with llms.txt using powerful AI. 
        Tailor the learning path to your specific use case and context.
      </p>
      <div className="flex justify-center items-center mt-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mr-3">
          <i className="fab fa-github mr-1"></i> GitHub Repos
        </span>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <i className="fas fa-file-alt mr-1"></i> llms.txt
        </span>
      </div>
    </div>
  );
}
