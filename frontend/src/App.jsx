import { useState } from "react";
import Header from "./components/layout/Header";
import SubjectLineInput from "./components/forms/SubjectLineInput";
import AnalysisResults from "./components/analysis/AnalysisResults";
import LeadCaptureForm from "./components/forms/LeadCaptureForm";
import { analyzeSubjectLine } from "./services/analysisService";

function App() {
  const [analysisResults, setAnalysisResults] = useState(null);
  const [subjectLine, setSubjectLine] = useState("");
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  const handleAnalyze = (text) => {
    setSubjectLine(text);
    const results = analyzeSubjectLine(text);
    setAnalysisResults(results);
  };

  const handleLeadSubmit = (formData) => {
    // In MVP, we just log the data
    console.log("Lead submitted:", formData);
    setLeadSubmitted(true);

    // In a real app, this would call an API endpoint
    // saveLeadData(formData, subjectLine, analysisResults);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="container mx-auto px-4 py-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-center mb-8">
          Email Subject Line Analyzer
        </h1>

        <p className="text-gray-600 text-center max-w-2xl mb-8">
          Improve your email open rates with our free subject line analyzer. Get
          instant feedback on spam triggers, length optimization, and
          effectiveness.
        </p>

        <SubjectLineInput onAnalyze={handleAnalyze} />

        {analysisResults && (
          <>
            <AnalysisResults
              results={analysisResults}
              subjectLine={subjectLine}
            />

            {!leadSubmitted && <LeadCaptureForm onSubmit={handleLeadSubmit} />}
          </>
        )}
      </main>

      <footer className="bg-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>
            © {new Date().getFullYear()} Subject Line Pro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
