import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const DistributionChart = ({
  data,
  title,
  dataKey = "count",
  xAxisKey = "range",
  color = "#3490dc",
  loading = false,
  error = null,
  onBarClick = null,
}) => {
  // Transform data format if needed
  const chartData = Array.isArray(data)
    ? data
    : data?.ranges.map((range, index) => ({
        range,
        count: data.counts[index],
      }));

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {error && (
        <div className="text-danger text-center h-64 flex items-center justify-center">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && chartData && chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar 
              dataKey={dataKey} 
              fill={color} 
              name="Count" 
              onClick={(data) => {
                if (onBarClick) {
                  onBarClick({
                    type: 'distributionBar',
                    title: `${title} Details`,
                    itemData: {
                      range: data[xAxisKey],
                      count: data[dataKey],
                      percentage: Math.round((data[dataKey] / chartData.reduce((sum, item) => sum + item[dataKey], 0)) * 100)
                    },
                    subtitle: `Details for range ${data[xAxisKey]}`
                  });
                }
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : !loading && !error ? (
        <div className="text-gray-500 text-center h-64 flex items-center justify-center">
          <p>No data available</p>
        </div>
      ) : null}
    </div>
  );
};

export default DistributionChart;
