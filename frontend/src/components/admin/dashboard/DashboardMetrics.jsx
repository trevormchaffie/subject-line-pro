import React, { useState, useEffect } from "react";
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
import MetricCard from "./MetricCard";
import apiService from "../../services/apiService";

const DashboardMetrics = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await apiService.getDashboardMetrics(period);
        setMetrics(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard metrics:", err);
        setError("Failed to load dashboard metrics. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [period]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-danger/10 border-l-4 border-danger p-4 rounded">
        <p className="text-danger">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-primary text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  // Format chart data
  const chartData = metrics.timeSeriesData.labels.map((label, index) => {
    return {
      date: label,
      subjects: metrics.timeSeriesData.datasets.subjects[index] || 0,
      leads: metrics.timeSeriesData.datasets.leads[index] || 0,
      conversionRate:
        metrics.timeSeriesData.datasets.conversionRates[index] || 0,
      effectivenessScore:
        metrics.timeSeriesData.datasets.effectivenessScores[index] || 0,
      spamScore: metrics.timeSeriesData.datasets.spamScores[index] || 0,
    };
  });

  return (
    <div className="space-y-8">
      {/* Period selector */}
      <div className="flex justify-end mb-6">
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

      {/* Metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Subject Lines Analyzed"
          value={metrics.totalSubjectsAnalyzed}
          trend={metrics.trends.subjectsAnalyzedTrend}
        />
        <MetricCard
          title="Leads Captured"
          value={metrics.totalLeads}
          trend={metrics.trends.leadsTrend}
        />
        <MetricCard
          title="Conversion Rate"
          value={metrics.conversionRate}
          suffix="%"
          trend={metrics.trends.conversionRateTrend}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <MetricCard
          title="Avg. Effectiveness Score"
          value={metrics.avgEffectivenessScore}
          suffix="/100"
          trend={metrics.trends.effectivenessScoreTrend}
        />
        <MetricCard
          title="Avg. Spam Score"
          value={metrics.avgSpamScore}
          suffix="%"
          trend={metrics.trends.spamScoreTrend}
          isInverted={true}
        />
      </div>

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
    </div>
  );
};

export default DashboardMetrics;
