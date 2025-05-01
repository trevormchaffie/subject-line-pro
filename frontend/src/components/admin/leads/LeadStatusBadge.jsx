// src/components/admin/leads/LeadStatusBadge.jsx
const LeadStatusBadge = ({ status }) => {
  // Define styles for different statuses
  const statusStyles = {
    New: "bg-blue-100 text-blue-800",
    Contacted: "bg-yellow-100 text-yellow-800",
    Qualified: "bg-green-100 text-green-800",
    Converted: "bg-purple-100 text-purple-800",
    "Not Interested": "bg-gray-100 text-gray-800",
    Unsubscribed: "bg-red-100 text-red-800",
    // Default style if status doesn't match
    default: "bg-gray-100 text-gray-800",
  };

  // Get the style for the current status, or use default
  const badgeStyle = statusStyles[status] || statusStyles.default;

  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badgeStyle}`}
    >
      {status}
    </span>
  );
};

export default LeadStatusBadge;
