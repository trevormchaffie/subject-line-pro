const StatusIndicator = ({ systems = {} }) => {
  const defaultSystems = {
    api: { status: "operational", label: "API" },
    database: { status: "operational", label: "Database" },
    fileStorage: { status: "operational", label: "File Storage" },
    emailService: { status: "operational", label: "Email Service" },
  };

  const mergedSystems = { ...defaultSystems, ...systems };

  const getStatusColor = (status) => {
    switch (status) {
      case "operational":
        return "bg-green-500";
      case "degraded":
        return "bg-yellow-500";
      case "outage":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "operational":
        return "Operational";
      case "degraded":
        return "Degraded";
      case "outage":
        return "Outage";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-medium mb-4">System Status</h3>

      <div className="space-y-3">
        {Object.entries(mergedSystems).map(([key, { status, label }]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{label}</span>
            <div className="flex items-center">
              <span
                className={`h-3 w-3 rounded-full ${getStatusColor(
                  status
                )} mr-2`}
              ></span>
              <span className="text-sm">{getStatusText(status)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t text-xs text-gray-500">
        Last updated: {new Date().toLocaleString()}
      </div>
    </div>
  );
};

export default StatusIndicator;
