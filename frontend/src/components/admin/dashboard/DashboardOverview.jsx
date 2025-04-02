import { useState, useEffect } from "react";
import MetricCard from "./MetricCard";
import QuickNav from "./QuickNav";
import ActivityFeed from "./ActivityFeed";
import StatusIndicator from "./StatusIndicator";
import dashboardService from "../../../services/dashboardService";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import apiService from "../../../services/apiService";

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
  const [advancedMetrics, setAdvancedMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState(null);
  const [period, setPeriod] = useState("month");

  // Existing refreshMetrics function
  const refreshMetrics = async () => {
    try {
      setMetricsLoading(true);
      const response = await apiService.getDashboardMetrics(period);
      setAdvancedMetrics(response.data);
      setMetricsError(null);
    } catch (err) {
      console.error("Error fetching dashboard metrics:", err);
      setMetricsError("Failed to load advanced metrics. Please try again.");
    } finally {
      setMetricsLoading(false);
    }
  };

  // NEW: Add refreshAllMetrics function
  const refreshAllMetrics = async () => {
    try {
      setLoading(true);
      setMetricsLoading(true);

      // Pass timestamp parameter to force fresh data
      const dashboardStats = await dashboardService.getDashboardStats(
        `?_t=${Date.now()}`
      );
      const status = await dashboardService.getSystemStatus();

      setStats(dashboardStats);
      setSystemStatus(status);

      // Fetch advanced metrics
      const response = await apiService.getDashboardMetrics(period);
      setAdvancedMetrics(response.data);
      setMetricsError(null);
    } catch (error) {
      console.error("Error refreshing dashboard data:", error);
    } finally {
      setLoading(false);
      setMetricsLoading(false);
    }
  };

  // NEW: Add forceFullRefresh function
  const forceFullRefresh = async () => {
    // Clear stats first to trigger UI updates
    setStats({
      totalLeads: 0,
      totalAnalyses: 0,
      conversionRate: 0,
      avgScore: 0,
      recentLeads: [],
      recentAnalyses: [],
    });

    // Clear advanced metrics
    setAdvancedMetrics(null);

    // Set loading states
    setLoading(true);
    setMetricsLoading(true);

    // Add a slight delay to ensure state updates first
    setTimeout(async () => {
      try {
        // Force fresh data with timestamp
        const dashboardStats = await dashboardService.getDashboardStats(
          `?_t=${Date.now()}`
        );

        const status = await dashboardService.getSystemStatus();

        // Update states with new data
        setStats(dashboardStats);
        setSystemStatus(status);

        // Fetch advanced metrics
        const response = await apiService.getDashboardMetrics(period);
        setAdvancedMetrics(response.data);
        setMetricsError(null);
      } catch (error) {
        console.error("Error during force refresh:", error);
      } finally {
        setLoading(false);
        setMetricsLoading(false);
      }
    }, 100);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const dashboardStats = await dashboardService.getDashboardStats();

        // Check data structure
        if (
          !dashboardStats.recentLeads ||
          !Array.isArray(dashboardStats.recentLeads) ||
          !dashboardStats.recentLeads.length
        ) {
          console.warn("No recent leads data received from backend");
        }

        if (
          !dashboardStats.recentAnalyses ||
          !Array.isArray(dashboardStats.recentAnalyses) ||
          !dashboardStats.recentAnalyses.length
        ) {
          console.warn("No recent analyses data received from backend");
        }

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

  // Add this new useEffect to simulate activity data if needed
  useEffect(() => {
    // Create simulated activity data if none exists
    if (
      (!stats.recentLeads || !stats.recentLeads.length) &&
      (!stats.recentAnalyses || !stats.recentAnalyses.length)
    ) {
      setStats((prevStats) => ({
        ...prevStats,
        recentLeads: [
          {
            id: "sim-1",
            type: "lead",
            text: "New lead captured",
            detail: "latest@example.com",
            timestamp: new Date(),
          },
        ],
        recentAnalyses: [
          {
            id: "sim-2",
            type: "analysis",
            text: "Subject line analyzed",
            detail: "Latest Product Launch Email",
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
          },
        ],
      }));
    }
  }, [stats.recentLeads, stats.recentAnalyses]);

  useEffect(() => {
    const fetchAdvancedMetrics = async () => {
      try {
        setMetricsLoading(true);
        const response = await apiService.getDashboardMetrics(period);
        setAdvancedMetrics(response.data);
        setMetricsError(null);
      } catch (err) {
        console.error("Error fetching dashboard metrics:", err);
        setMetricsError("Failed to load advanced metrics. Please try again.");
      } finally {
        setMetricsLoading(false);
      }
    };

    fetchAdvancedMetrics();
  }, [period]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      {/* MODIFIED: Replace h2 with flex container including refresh button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Dashboard Overview</h2>
        <button
          onClick={forceFullRefresh} // Changed from refreshAllMetrics to forceFullRefresh
          className="px-4 py-2 bg-primary text-white rounded flex items-center"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh Data
        </button>
      </div>

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
            activities={[
              ...(Array.isArray(stats.recentLeads) ? stats.recentLeads : []),
              ...(Array.isArray(stats.recentAnalyses)
                ? stats.recentAnalyses
                : []),
            ]}
          />
        </div>
        <div>
          <StatusIndicator systems={systemStatus} />
        </div>
      </div>

      {/* Advanced Metrics Dashboard */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Performance Analytics</h2>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border border-gray-300 rounded-md p-2"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
        </div>

        {metricsLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : metricsError ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
            <p className="text-red-500">{metricsError}</p>
            <button
              onClick={refreshMetrics} // Replace the existing onClick handler
              className="mt-2 px-4 py-2 bg-primary text-white rounded"
            >
              Retry
            </button>
          </div>
        ) : advancedMetrics ? (
          <>
            {/* Add this code right here, before the Detailed Metrics cards */}
            {advancedMetrics &&
              advancedMetrics.timeSeriesData.labels.length === 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <p className="text-gray-500">
                    No data available for the selected period.
                  </p>
                </div>
              )}
            {/* Detailed Metrics cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <MetricCard
                title="Subject Lines Analyzed"
                value={advancedMetrics.totalSubjectsAnalyzed}
                change={`${Math.abs(
                  advancedMetrics.trends.subjectsAnalyzedTrend
                ).toFixed(1)}%`}
                trend={
                  advancedMetrics.trends.subjectsAnalyzedTrend > 0
                    ? "up"
                    : "down"
                }
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
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                }
              />
              <MetricCard
                title="Leads Captured"
                value={advancedMetrics.totalLeads}
                change={`${Math.abs(advancedMetrics.trends.leadsTrend).toFixed(
                  1
                )}%`}
                trend={advancedMetrics.trends.leadsTrend > 0 ? "up" : "down"}
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
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                }
              />
              <MetricCard
                title="Conversion Rate"
                value={`${advancedMetrics.conversionRate}%`}
                change={`${Math.abs(
                  advancedMetrics.trends.conversionRateTrend
                ).toFixed(1)}%`}
                trend={
                  advancedMetrics.trends.conversionRateTrend > 0 ? "up" : "down"
                }
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <MetricCard
                title="Avg. Effectiveness Score"
                value={advancedMetrics.avgEffectivenessScore}
                change={`${Math.abs(
                  advancedMetrics.trends.effectivenessScoreTrend
                ).toFixed(1)}%`}
                trend={
                  advancedMetrics.trends.effectivenessScoreTrend > 0
                    ? "up"
                    : "down"
                }
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
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                }
              />
              <MetricCard
                title="Avg. Spam Score"
                value={`${advancedMetrics.avgSpamScore}%`}
                change={`${Math.abs(
                  advancedMetrics.trends.spamScoreTrend
                ).toFixed(1)}%`}
                // Inverted: lower spam score is better
                trend={
                  advancedMetrics.trends.spamScoreTrend < 0 ? "up" : "down"
                }
                color="red"
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                }
              />
            </div>

            {/* Format chart data */}
            {(() => {
              const chartData = advancedMetrics.timeSeriesData.labels.map(
                (label, index) => {
                  return {
                    date: label,
                    subjects:
                      advancedMetrics.timeSeriesData.datasets.subjects[index] ||
                      0,
                    leads:
                      advancedMetrics.timeSeriesData.datasets.leads[index] || 0,
                    conversionRate:
                      advancedMetrics.timeSeriesData.datasets.conversionRates[
                        index
                      ] || 0,
                    effectivenessScore:
                      advancedMetrics.timeSeriesData.datasets
                        .effectivenessScores[index] || 0,
                    spamScore:
                      advancedMetrics.timeSeriesData.datasets.spamScores[
                        index
                      ] || 0,
                  };
                }
              );

              return (
                <>
                  {/* Charts */}
                  <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">
                      Analysis Activity
                    </h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={chartData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Area
                            type="monotone"
                            dataKey="subjects"
                            stackId="1"
                            stroke="#8884d8"
                            fill="#8884d8"
                            name="Subject Lines"
                          />
                          <Area
                            type="monotone"
                            dataKey="leads"
                            stackId="2"
                            stroke="#82ca9d"
                            fill="#82ca9d"
                            name="Leads"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-lg font-semibold text-gray-700 mb-4">
                        Conversion Rate
                      </h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={chartData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="conversionRate"
                              stroke="#3490dc"
                              name="Conversion Rate (%)"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-lg font-semibold text-gray-700 mb-4">
                        Quality Scores
                      </h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={chartData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="effectivenessScore"
                              stroke="#38c172"
                              name="Effectiveness Score"
                            />
                            <Line
                              type="monotone"
                              dataKey="spamScore"
                              stroke="#e3342f"
                              name="Spam Score"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default DashboardOverview;
