import { useState } from "react";

const SubjectLineInput = ({ onAnalyze, isLoading }) => {
  const [subjectLine, setSubjectLine] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (subjectLine.trim()) {
      onAnalyze(subjectLine);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-2xl">
      <h2 className="text-xl font-semibold mb-4">
        Analyze Your Email Subject Line
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="subjectLine"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Enter your subject line:
          </label>
          <input
            type="text"
            id="subjectLine"
            value={subjectLine}
            onChange={(e) => setSubjectLine(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g., Limited time offer: 50% off our services"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-primary text-white py-2 px-4 rounded-md transition-colors ${
            isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-primary/80"
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Analyzing...
            </span>
          ) : (
            "Analyze Subject Line"
          )}
        </button>
      </form>
    </div>
  );
};

export default SubjectLineInput;
