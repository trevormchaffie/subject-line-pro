import { useState, useEffect } from "react";
import Header from "./components/layout/Header";
import SubjectLineInput from "./components/forms/SubjectLineInput";
import AnalysisResults from "./components/analysis/AnalysisResults";
import LeadCaptureForm from "./components/forms/LeadCaptureForm";
import LoadingSpinner from "./components/ui/LoadingSpinner";
import ErrorMessage from "./components/ui/ErrorMessage";
import apiService from "./services/apiService";
import { analyzeSubjectLine } from "./services/analysisService"; // Local fallback

function App() {
  const [analysisResults, setAnalysisResults] = useState(null);
  const [subjectLine, setSubjectLine] = useState("");
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  /**
   * Analyzes a subject line using the backend API
   * Falls back to local analysis if API fails or offline
   */
  const handleAnalyze = async (text) => {
    setSubjectLine(text);
    setIsLoading(true);
    setError(null);

    // If offline, use local analysis immediately
    if (isOffline) {
      try {
        const results = analyzeSubjectLine(text);
        setAnalysisResults(results);
      } catch (localError) {
        setError("Unable to analyze subject line. Please try again.");
        console.error("Local analysis error:", localError);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Otherwise try API first, then fall back to local
    try {
      // Use backend API for analysis
      const response = await apiService.analyzeSubject(text);
      setAnalysisResults(response.data);
    } catch (error) {
      console.error("Analysis error:", error);
      setError(
        "Failed to connect to our servers. Using local analysis instead."
      );

      // Fallback to local analysis if API fails
      try {
        const results = analyzeSubjectLine(text);
        setAnalysisResults(results);
      } catch (localError) {
        setError("Unable to analyze subject line. Please try again later.");
        console.error("Local analysis error:", localError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Submits lead information to the backend API
   * In offline mode, data is stored temporarily
   */
  const handleLeadSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);

    // If offline, store data locally
    if (isOffline) {
      try {
        // Store in localStorage for later submission
        const offlineLeads = JSON.parse(
          localStorage.getItem("offlineLeads") || "[]"
        );
        const leadData = {
          ...formData,
          subjectLine,
          analysisResults: {
            overallScore: analysisResults.overallScore,
            spamScore: analysisResults.spamScore,
            suggestions: analysisResults.suggestions.length,
          },
          timestamp: new Date().toISOString(),
          pending: true,
        };

        offlineLeads.push(leadData);
        localStorage.setItem("offlineLeads", JSON.stringify(offlineLeads));
        setLeadSubmitted(true);
        setError(
          "You're offline. Your information will be submitted when you reconnect."
        );
      } catch (error) {
        console.error("Offline storage error:", error);
        setError(
          "Failed to store your information. Please try again when online."
        );
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // If online, submit to API
    try {
      // Add subject line and analysis results to lead data
      const leadData = {
        ...formData,
        subjectLine,
        analysisResults: {
          overallScore: analysisResults.overallScore,
          spamScore: analysisResults.spamScore,
          suggestions: analysisResults.suggestions.length,
        },
      };

      // Submit lead to API
      await apiService.submitLead(leadData);
      setLeadSubmitted(true);
    } catch (error) {
      console.error("Lead submission error:", error);
      setError("Failed to submit your information. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Retry after an error
   */
  const handleRetry = () => {
    setError(null);
    if (subjectLine) {
      handleAnalyze(subjectLine);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      {/* Offline Banner */}
      {isOffline && (
        <div className="bg-warning/20 border-warning text-warning px-4 py-2 text-center">
          You are currently offline. Some features may be limited.
        </div>
      )}

      <main className="container mx-auto px-4 py-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-center mb-8">
          Email Subject Line Analyzer
        </h1>

        <p className="text-gray-600 text-center max-w-2xl mb-8">
          Improve your email open rates with our free subject line analyzer. Get
          instant feedback on spam triggers, length optimization, and
          effectiveness.
        </p>

        {error && <ErrorMessage message={error} onRetry={handleRetry} />}

        <SubjectLineInput onAnalyze={handleAnalyze} isLoading={isLoading} />

        {/* Loading state */}
        {isLoading && !analysisResults && (
          <div className="mt-8 flex justify-center">
            <LoadingSpinner size="lg" text="Analyzing your subject line..." />
          </div>
        )}

        {/* Results and lead form */}
        {analysisResults && (
          <>
            <AnalysisResults
              results={analysisResults}
              subjectLine={subjectLine}
            />

            {!leadSubmitted && (
              <LeadCaptureForm
                onSubmit={handleLeadSubmit}
                isLoading={isLoading}
                isOffline={isOffline}
              />
            )}

            {leadSubmitted && (
              <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-2xl mt-6">
                <div className="text-center py-8">
                  <svg
                    className="h-12 w-12 text-success mx-auto mb-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="text-xl font-semibold text-success mb-2">
                    Thank You!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {isOffline
                      ? "Your information has been saved and will be submitted when you're back online."
                      : "Your information has been submitted successfully. We'll contact you soon with more email marketing tips!"}
                  </p>
                  <button
                    onClick={() => setLeadSubmitted(false)}
                    className="text-primary hover:underline"
                  >
                    Submit another email address
                  </button>
                </div>
              </div>
            )}
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
