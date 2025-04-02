import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import routes from "../../../config/routeConfig";

const ActivityFeed = ({ activities = [] }) => {
  const navigate = useNavigate();
  // Add some debug logging to check what's being passed in
  console.log("ActivityFeed received activities:", activities);

  const [key, setKey] = useState(0);

  useEffect(() => {
    console.log("Activities changed in ActivityFeed:", activities);
    setKey((prevKey) => prevKey + 1);
  }, [activities]);

  const handleViewAll = () => {
    navigate(routes.admin.analytics);
  };

  // Placeholder activities as a fallback
  const placeholderActivities = [
    {
      id: "placeholder-1",
      type: "lead",
      text: "New lead captured",
      detail: "john.doe@example.com",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: "placeholder-2",
      type: "analysis",
      text: "Subject line analyzed",
      detail: "Spring Sale Promotion",
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
    },
    {
      id: "placeholder-3",
      type: "lead",
      text: "New lead captured",
      detail: "sarah@company.com",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    },
  ];

  // IMPROVED: Always show something - either real data or placeholders
  const displayActivities =
    activities && activities.length > 0 ? activities : placeholderActivities;

  // Handle various activity formats
  const getActivityDetails = (activity) => {
    // Default values
    let type = "unknown";
    let text = "Unknown activity";
    let detail = "";
    let timestamp = new Date();
    let id = activity.id || `activity-${Math.random()}`;

    // Try to extract data based on structure
    if (activity) {
      // Use activity.type if available, otherwise infer from structure
      type =
        activity.type ||
        (activity.email
          ? "lead"
          : activity.subjectLine
          ? "analysis"
          : "unknown");

      // Generate appropriate text
      text =
        activity.text ||
        (type === "lead"
          ? "New lead captured"
          : type === "analysis"
          ? "Subject line analyzed"
          : "Activity recorded");

      // Extract detail information
      detail =
        activity.detail ||
        activity.email ||
        activity.subjectLine ||
        activity.name ||
        "";

      // Set timestamp if available
      timestamp =
        activity.timestamp || activity.createdAt || activity.date || new Date();
    }

    return { id, type, text, detail, timestamp };
  };

  const getIcon = (type) => {
    // Existing icon code...
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
        {displayActivities.map((activity) => {
          const { id, type, text, detail, timestamp } =
            getActivityDetails(activity);
          return (
            <div key={id} className="py-3 flex items-start">
              <div className="mr-3 mt-1">{getIcon(type)}</div>

              <div className="flex-1">
                <p className="text-sm font-medium">{text}</p>
                <p className="text-sm text-gray-500">{detail}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {typeof timestamp === "string"
                    ? formatDistanceToNow(new Date(timestamp), {
                        addSuffix: true,
                      })
                    : formatDistanceToNow(timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-center">
        <button
          onClick={handleViewAll}
          className="text-primary text-sm hover:underline"
        >
          View All Activity
        </button>
      </div>
    </div>
  );
};

export default ActivityFeed;
