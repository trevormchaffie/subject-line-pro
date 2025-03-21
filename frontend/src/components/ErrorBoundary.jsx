import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="p-8 bg-white rounded-lg shadow-md max-w-2xl mx-auto mt-10">
          <h2 className="text-2xl font-bold text-danger mb-4">
            Something went wrong
          </h2>
          <p className="mb-4 text-gray-700">
            We apologize for the inconvenience. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
          >
            Refresh Page
          </button>
          {process.env.NODE_ENV === "development" && (
            <details className="mt-4 p-4 bg-gray-100 rounded">
              <summary className="font-medium cursor-pointer">
                Error Details
              </summary>
              <pre className="mt-2 text-xs overflow-auto p-2 bg-gray-800 text-white rounded">
                {this.state.error && this.state.error.toString()}
              </pre>
              <pre className="mt-2 text-xs overflow-auto p-2 bg-gray-800 text-white rounded">
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
