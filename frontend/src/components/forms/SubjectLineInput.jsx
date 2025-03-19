import { useState } from "react";

const SubjectLineInput = ({ onAnalyze }) => {
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
          />
        </div>
        <button
          type="submit"
          className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/80 transition-colors"
        >
          Analyze Subject Line
        </button>
      </form>
    </div>
  );
};

export default SubjectLineInput;
