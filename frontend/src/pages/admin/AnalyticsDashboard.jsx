import { useState, useEffect } from "react";
import apiService from "../../services/apiService";
import TimeSeriesChart from "../../components/charts/TimeSeriesChart";
import DistributionChart from "../../components/charts/DistributionChart";
import TopSubjectsChart from "../../components/charts/TopSubjectsChart";
import ConversionMetrics from "../../components/charts/ConversionMetrics";
import DetailedAnalysisView from "../../components/analysis/DetailedAnalysisView";

const AnalyticsDashboard = () => {
  // States for different data sets
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [timeframe, setTimeframe] = useState("daily");
  const [timeSeriesLoading, setTimeSeriesLoading] = useState(false);
  const [timeSeriesError, setTimeSeriesError] = useState(null);

  const [distributionData, setDistributionData] = useState(null);
  const [distributionLoading, setDistributionLoading] = useState(false);
  const [distributionError, setDistributionError] = useState(null);

  const [topSubjectsData, setTopSubjectsData] = useState([]);
  const [topSubjectsLoading, setTopSubjectsLoading] = useState(false);
  const [topSubjectsError, setTopSubjectsError] = useState(null);

  const [conversionData, setConversionData] = useState(null);
  const [conversionLoading, setConversionLoading] = useState(false);
  const [conversionError, setConversionError] = useState(null);
  
  // State for detailed view
  const [detailedViewData, setDetailedViewData] = useState(null);

  // Fetch time series data
  useEffect(() => {
    const fetchTimeSeriesData = async () => {
      setTimeSeriesLoading(true);
      setTimeSeriesError(null);

      try {
        const response = await apiService.getAnalyticsTimeSeries(timeframe, 30);
        setTimeSeriesData(response.data);
      } catch (error) {
        console.error("Error fetching time series data:", error);
        setTimeSeriesError(
          "Failed to load time series data. Please try again."
        );
      } finally {
        setTimeSeriesLoading(false);
      }
    };

    fetchTimeSeriesData();
  }, [timeframe]);

  // Fetch distribution data
  useEffect(() => {
    const fetchDistributionData = async () => {
      setDistributionLoading(true);
      setDistributionError(null);

      try {
        const response = await apiService.getScoreDistribution();
        console.log("Score distribution response:", response);
        if (response && response.success && response.data) {
          setDistributionData(response.data);
        } else {
          console.error("Invalid score distribution format:", response);
          setDistributionError(
            "Failed to load score distribution data. Invalid data format."
          );
        }
      } catch (error) {
        console.error("Error fetching distribution data:", error);
        setDistributionError(
          "Failed to load score distribution data. Please try again."
        );
      } finally {
        setDistributionLoading(false);
      }
    };

    fetchDistributionData();
  }, []);

  // Fetch top subjects data
  useEffect(() => {
    const fetchTopSubjectsData = async () => {
      setTopSubjectsLoading(true);
      setTopSubjectsError(null);

      try {
        const response = await apiService.getTopSubjectLines(10);
        console.log("Top subjects response:", response);
        if (response && response.success && response.data) {
          setTopSubjectsData(response.data);
        } else {
          console.error("Invalid top subjects format:", response);
          setTopSubjectsError(
            "Failed to load top subject lines. Invalid data format."
          );
        }
      } catch (error) {
        console.error("Error fetching top subjects data:", error);
        setTopSubjectsError(
          "Failed to load top subject lines. Please try again."
        );
      } finally {
        setTopSubjectsLoading(false);
      }
    };

    fetchTopSubjectsData();
  }, []);

  // Fetch conversion metrics
  useEffect(() => {
    const fetchConversionData = async () => {
      setConversionLoading(true);
      setConversionError(null);

      try {
        const response = await apiService.getConversionMetrics();
        console.log("Conversion metrics response:", response);
        // Make sure we're setting the data property specifically
        if (response && response.success && response.data) {
          setConversionData(response.data);
        } else {
          console.error("Invalid conversion metrics response format:", response);
          setConversionError(
            "Failed to load conversion metrics. Invalid data format."
          );
        }
      } catch (error) {
        console.error("Error fetching conversion data:", error);
        setConversionError(
          "Failed to load conversion metrics. Please try again."
        );
      } finally {
        setConversionLoading(false);
      }
    };

    fetchConversionData();
  }, []);

  // Handler for timeframe change
  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
  };
  
  // Handlers for drill-down clicks
  const handleDetailedView = (data) => {
    setDetailedViewData(data);
  };
  
  const handleCloseDetailedView = () => {
    setDetailedViewData(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Analytics Dashboard
        </h1>

        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 rounded ${
              timeframe === "daily"
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
            onClick={() => handleTimeframeChange("daily")}
          >
            Daily
          </button>
          <button
            className={`px-4 py-2 rounded ${
              timeframe === "weekly"
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
            onClick={() => handleTimeframeChange("weekly")}
          >
            Weekly
          </button>
          <button
            className={`px-4 py-2 rounded ${
              timeframe === "monthly"
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
            onClick={() => handleTimeframeChange("monthly")}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Conversion Metrics */}
      <div className="mb-8">
        <ConversionMetrics
          data={conversionData}
          loading={conversionLoading}
          error={conversionError}
          title="Lead Conversion Metrics"
        />
      </div>

      {/* Time Series Chart */}
      <div className="mb-8">
        <TimeSeriesChart
          data={timeSeriesData}
          loading={timeSeriesLoading}
          error={timeSeriesError}
          title={`Subject Line Analysis Trends (${
            timeframe.charAt(0).toUpperCase() + timeframe.slice(1)
          })`}
          dataKey="count"
          onPointClick={handleDetailedView}
        />
      </div>

      {/* Score Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {distributionData && (
          <>
            <DistributionChart
              data={distributionData.overallScore}
              loading={distributionLoading}
              error={distributionError}
              title="Overall Score Distribution"
              color="#3490dc"
              onBarClick={handleDetailedView}
            />

            <DistributionChart
              data={distributionData.spamScore}
              loading={distributionLoading}
              error={distributionError}
              title="Spam Score Distribution"
              color="#e3342f"
              onBarClick={handleDetailedView}
            />
          </>
        )}
      </div>

      {/* Top Subject Lines */}
      <div className="mb-8">
        <TopSubjectsChart
          data={topSubjectsData}
          loading={topSubjectsLoading}
          error={topSubjectsError}
          onSubjectClick={handleDetailedView}
        />
      </div>
      
      {/* Detailed Analysis View */}
      {detailedViewData && (
        <DetailedAnalysisView 
          data={detailedViewData} 
          onClose={handleCloseDetailedView}
        />
      )}
    </div>
  );
};

export default AnalyticsDashboard;
