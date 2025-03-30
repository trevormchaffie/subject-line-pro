import { useState, useEffect } from "react";
import MetricCard from "./MetricCard";
import QuickNav from "./QuickNav";
import ActivityFeed from "./ActivityFeed";
import StatusIndicator from "./StatusIndicator";
import dashboardService from "../../../services/dashboardService";

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalAnalyses: 0,
    conversionRate: 0,
    avgScore: 0,
    recentLeads: [],
    recentAnalyses: [],
  });

  const [systemStatus, setSystemStatus] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const dashboardStats = await dashboardService.getDashboardStats();
        const status = await dashboardService.getSystemStatus();

        setStats(dashboardStats);
        setSystemStatus(status);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>

      {/* Quick navigation */}
      <QuickNav />

      {/* Metrics row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricCard
          title="Total Leads"
          value={stats.totalLeads}
          change="+12.5%"
          trend="up"
          color="blue"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          }
        />

        <MetricCard
          title="Total Analyses"
          value={stats.totalAnalyses}
          change="+18.2%"
          trend="up"
          color="green"
          icon={
            <svg
              className="w-6 h-6"
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
          }
        />

        <MetricCard
          title="Conversion Rate"
          value={`${stats.conversionRate}%`}
          change="-2.4%"
          trend="down"
          color="yellow"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          }
        />

        <MetricCard
          title="Avg. Score"
          value={stats.avgScore}
          change="+5.1%"
          trend="up"
          color="purple"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
              />
            </svg>
          }
        />
      </div>

      {/* Activity and status row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityFeed
            activities={[...stats.recentLeads, ...stats.recentAnalyses]}
          />
        </div>
        <div>
          <StatusIndicator systems={systemStatus} />
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
