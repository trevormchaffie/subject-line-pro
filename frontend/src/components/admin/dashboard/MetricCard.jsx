const MetricCard = ({ title, value, icon, change, trend, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-500 border-blue-200",
    green: "bg-green-50 text-green-500 border-green-200",
    yellow: "bg-yellow-50 text-yellow-500 border-yellow-200",
    red: "bg-red-50 text-red-500 border-red-200",
    purple: "bg-purple-50 text-purple-500 border-purple-200",
  };

  const trendIcon =
    trend === "up" ? (
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

      <div className="text-2xl font-bold mb-2">{value}</div>

      {change && (
        <div className="flex items-center text-sm">
          <span
            className={`mr-1 ${
              trend === "up" ? "text-green-500" : "text-red-500"
            }`}
          >
            {trendIcon}
          </span>
          <span className={trend === "up" ? "text-green-500" : "text-red-500"}>
            {change}
          </span>
          <span className="text-gray-500 ml-1">from last month</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
