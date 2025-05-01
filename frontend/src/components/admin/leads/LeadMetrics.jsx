// src/components/admin/leads/LeadMetrics.jsx
import { useState, useEffect } from "react";
import leadService from "../../../services/leadService";

const LeadMetrics = () => {
  const [metrics, setMetrics] = useState({
    totalLeads: 0,
    newLeads: 0,
    conversionRate: 0,
    averageScore: 0,
    businessTypeDistribution: [],
    statusDistribution: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch metrics data
  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const response = await leadService.getLeads({ limit: 1000 }); // Get all leads
        const leads = response.data;

        // Calculate metrics
        const totalLeads = leads.length;

        // New leads (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newLeads = leads.filter(
          (lead) => new Date(lead.createdAt) >= thirtyDaysAgo
        ).length;

        // Conversion rate
        const convertedLeads = leads.filter(
          (lead) => lead.status === "Converted"
        ).length;
        const conversionRate =
          totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

        // Average overall score
        const totalScore = leads.reduce((sum, lead) => {
          return sum + (lead.analysisResults?.overallScore || 0);
        }, 0);
        const averageScore = totalLeads > 0 ? totalScore / totalLeads : 0;

        // Business type distribution
        const businessTypes = {};
        leads.forEach((lead) => {
          const type = lead.businessType;
          businessTypes[type] = (businessTypes[type] || 0) + 1;
        });

        const businessTypeDistribution = Object.entries(businessTypes).map(
          ([type, count]) => ({
            type,
            count,
            percentage: (count / totalLeads) * 100,
          })
        );

        // Status distribution
        const statuses = {};
        leads.forEach((lead) => {
          const status = lead.status || "New";
          statuses[status] = (statuses[status] || 0) + 1;
        });

        const statusDistribution = Object.entries(statuses).map(
          ([status, count]) => ({
            status,
            count,
            percentage: (count / totalLeads) * 100,
          })
        );

        setMetrics({
          totalLeads,
          newLeads,
          conversionRate,
          averageScore,
          businessTypeDistribution,
          statusDistribution,
        });

        setError(null);
      } catch (err) {
        setError("Failed to load metrics. Please try again.");
        console.error("Error fetching metrics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-4">
        <svg
          className="animate-spin h-8 w-8 text-primary-600 mx-auto"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p className="mt-2 text-gray-500">Loading metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900">
          Lead Metrics Overview
        </h3>

        <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total leads metric */}
          <div className="bg-gray-50 pt-5 px-4 pb-4 sm:pt-6 sm:px-6 rounded-lg overflow-hidden">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Total Leads
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {metrics.totalLeads}
            </dd>
          </div>

          {/* New leads metric */}
          <div className="bg-gray-50 pt-5 px-4 pb-4 sm:pt-6 sm:px-6 rounded-lg overflow-hidden">
            <dt className="text-sm font-medium text-gray-500 truncate">
              New Leads (30 days)
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {metrics.newLeads}
            </dd>
          </div>

          {/* Conversion rate metric */}
          <div className="bg-gray-50 pt-5 px-4 pb-4 sm:pt-6 sm:px-6 rounded-lg overflow-hidden">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Conversion Rate
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {metrics.conversionRate.toFixed(1)}%
            </dd>
          </div>

          {/* Average score metric */}
          <div className="bg-gray-50 pt-5 px-4 pb-4 sm:pt-6 sm:px-6 rounded-lg overflow-hidden">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Average Score
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {metrics.averageScore.toFixed(1)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="px-6 py-5">
        <h4 className="text-sm font-medium text-gray-500">
          Status Distribution
        </h4>
        <div className="mt-2">
          {metrics.statusDistribution.map((item) => (
            <div key={item.status} className="mb-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <span
                    className={`inline-block w-3 h-3 rounded-full mr-2 ${
                      item.status === "Converted"
                        ? "bg-green-500"
                        : item.status === "Qualified"
                        ? "bg-blue-500"
                        : item.status === "New"
                        ? "bg-purple-500"
                        : item.status === "Contacted"
                        ? "bg-yellow-500"
                        : item.status === "Not Interested"
                        ? "bg-gray-500"
                        : "bg-red-500"
                    }`}
                  ></span>
                  <span>{item.status}</span>
                </div>
                <span>
                  {item.count} ({item.percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                <div
                  className={`h-1.5 rounded-full ${
                    item.status === "Converted"
                      ? "bg-green-500"
                      : item.status === "Qualified"
                      ? "bg-blue-500"
                      : item.status === "New"
                      ? "bg-purple-500"
                      : item.status === "Contacted"
                      ? "bg-yellow-500"
                      : item.status === "Not Interested"
                      ? "bg-gray-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 py-5">
        <h4 className="text-sm font-medium text-gray-500">
          Business Type Distribution
        </h4>
        <div className="mt-2">
          {metrics.businessTypeDistribution.map((item) => (
            <div key={item.type} className="mb-1">
              <div className="flex items-center justify-between text-sm">
                <span>
                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </span>
                <span>
                  {item.count} ({item.percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                <div
                  className="bg-primary-500 h-1.5 rounded-full"
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeadMetrics;
