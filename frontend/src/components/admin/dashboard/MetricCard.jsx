const MetricCard = ({
  title,
  value,
  icon,
  change,
  trend,
  color = "blue",
  suffix = "",
  prefix = "",
  isInverted = false,
  period = "last month",
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-500 border-blue-200",
    green: "bg-green-50 text-green-500 border-green-200",
    yellow: "bg-yellow-50 text-yellow-500 border-yellow-200",
    red: "bg-red-50 text-red-500 border-red-200",
    purple: "bg-purple-50 text-purple-500 border-purple-200",
  };

  // Handle both string-based trends ('up'/'down') and numeric trends
  let trendDirection = trend;
  let trendValue = change;

  // If trend is a number, determine direction
  if (typeof trend === "number" || !isNaN(parseFloat(trend))) {
    const numericTrend = parseFloat(trend);

    if (!isInverted) {
      // Normal metrics (higher is better)
      trendDirection =
        numericTrend > 0 ? "up" : numericTrend < 0 ? "down" : null;
    } else {
      // Inverted metrics (lower is better, like spam score)
      trendDirection =
        numericTrend < 0 ? "up" : numericTrend > 0 ? "down" : null;
    }

    // Store absolute value for display
    trendValue = Math.abs(numericTrend).toFixed(2) + "%";
  }

  const trendIcon =
    trendDirection === "up" ? (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    ) : (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 14l-7 7m0 0l-7-7m7 7V3"
        />
      </svg>
    );

  return (
    <div className={`rounded-lg border p-4 shadow-sm ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className="text-lg">{icon}</div>
      </div>

      <div className="text-2xl font-bold mb-2">
        {prefix}
        {value}
        {suffix}
      </div>

      {(change || trendDirection) && (
        <div className="flex items-center text-sm">
          {trendDirection && (
            <span
              className={`mr-1 ${
                trendDirection === "up" ? "text-green-500" : "text-red-500"
              }`}
            >
              {trendIcon}
            </span>
          )}
          <span
            className={
              trendDirection === "up" ? "text-green-500" : "text-red-500"
            }
          >
            {trendValue || change}
          </span>
          {period && <span className="text-gray-500 ml-1">from {period}</span>}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
