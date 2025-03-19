const AnalysisResults = ({ results, subjectLine }) => {
  if (!results) return null;

  const getScoreColor = (score) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-danger";
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-2xl mt-6">
      <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>

      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-1">Your subject line:</p>
        <p className="text-md font-medium">{subjectLine}</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="text-center">
          <p className="text-sm text-gray-500">Overall Score</p>
          <p
            className={`text-3xl font-bold ${getScoreColor(
              results.overallScore
            )}`}
          >
            {results.overallScore}/100
          </p>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">Length</p>
          <p className="text-3xl font-bold text-gray-700">
            {results.length}
            <span className="text-sm ml-1 font-normal">chars</span>
          </p>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">Spam Risk</p>
          <p
            className={`text-3xl font-bold ${
              results.spamScore <= 20
                ? "text-success"
                : results.spamScore <= 50
                ? "text-warning"
                : "text-danger"
            }`}
          >
            {results.spamScore}%
          </p>
        </div>
      </div>

      {/* Issues and Suggestions */}
      <div className="mb-6">
        <h3 className="font-medium mb-2">Issues Found:</h3>
        {results.issues.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1">
            {results.issues.map((issue, index) => (
              <li key={index} className="text-gray-700">
                {issue.text}
                <span className="text-sm text-danger ml-1">
                  ({issue.impact} impact)
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-success">No issues found!</p>
        )}
      </div>

      <div className="mb-6">
        <h3 className="font-medium mb-2">Suggestions:</h3>
        <ul className="list-disc pl-5 space-y-1">
          {results.suggestions.map((suggestion, index) => (
            <li key={index} className="text-gray-700">
              {suggestion}
            </li>
          ))}
        </ul>
      </div>

      {/* Power Words */}
      <div>
        <h3 className="font-medium mb-2">Power Words:</h3>
        {results.powerWords.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {results.powerWords.map((word, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
              >
                {word}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">
            No power words detected. Consider adding some!
          </p>
        )}
      </div>
    </div>
  );
};

export default AnalysisResults;
