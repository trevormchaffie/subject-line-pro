import { formatDistanceToNow } from "date-fns";

const ActivityFeed = ({ activities = [] }) => {
  // If no activities provided, show placeholders
  const placeholderActivities = [
    {
      id: 1,
      type: "lead",
      text: "New lead captured",
      detail: "john.doe@example.com",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    },
    {
      id: 2,
      type: "analysis",
      text: "Subject line analyzed",
      detail: "Spring Sale Promotion",
      timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
    },
    {
      id: 3,
      type: "lead",
      text: "New lead captured",
      detail: "sarah@company.com",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    },
  ];

  const displayActivities = activities.length
    ? activities
    : placeholderActivities;

  const getIcon = (type) => {
    switch (type) {
      case "lead":
        return (
          <div className="bg-blue-100 p-2 rounded-full">
            <svg
              className="w-4 h-4 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
        );
      case "analysis":
        return (
          <div className="bg-green-100 p-2 rounded-full">
            <svg
              className="w-4 h-4 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 p-2 rounded-full">
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-medium mb-4">Recent Activity</h3>

      <div className="divide-y">
        {displayActivities.map((activity) => (
          <div key={activity.id} className="py-3 flex items-start">
            <div className="mr-3 mt-1">{getIcon(activity.type)}</div>

            <div className="flex-1">
              <p className="text-sm font-medium">{activity.text}</p>
              <p className="text-sm text-gray-500">{activity.detail}</p>
              <p className="text-xs text-gray-400 mt-1">
                {formatDistanceToNow(new Date(activity.timestamp), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <button className="text-primary text-sm hover:underline">
          View All Activity
        </button>
      </div>
    </div>
  );
};

export default ActivityFeed;
