const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="bg-danger/10 border-l-4 border-danger px-4 py-3 rounded-lg w-full max-w-2xl mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {/* Error icon */}
          <svg
            className="h-5 w-5 text-danger"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-danger font-medium">{message}</p>
        </div>
      </div>
      {onRetry && (
        <div className="mt-2">
          <button
            onClick={onRetry}
            className="text-sm text-danger underline hover:text-danger/80"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
};

export default ErrorMessage;
