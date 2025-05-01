import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const ConversionMetrics = ({
  data,
  title = "Lead Conversion Metrics",
  loading = false,
  error = null,
}) => {
  // Check if data has all required properties
  const isValidData = data && 
    typeof data.analyzed === 'number' && 
    typeof data.leads === 'number' && 
    typeof data.conversionRate === 'number';
  
  // Format data for pie chart with safety checks
  const pieData = isValidData
    ? [
        { name: "Converted", value: data.leads },
        { name: "Not Converted", value: data.analyzed - data.leads },
      ]
    : [];

  // Colors for the pie chart
  const COLORS = ["#38c172", "#e2e8f0"];

  // Formatted metrics with safety checks
  const metrics = isValidData
    ? {
        analyzed: data.analyzed.toLocaleString(),
        leads: data.leads.toLocaleString(),
        rate: data.conversionRate.toFixed(1) + "%",
      }
    : { analyzed: "0", leads: "0", rate: "0%" };

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

      {!loading && !error && isValidData ? (
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/2">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, "Count"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <div className="stats flex flex-col space-y-4">
              <div className="stat p-3 bg-gray-50 rounded-lg">
                <h3 className="text-md font-medium text-gray-500">
                  Subject Lines Analyzed
                </h3>
                <p className="text-2xl font-bold text-primary">
                  {metrics.analyzed}
                </p>
              </div>

              <div className="stat p-3 bg-gray-50 rounded-lg">
                <h3 className="text-md font-medium text-gray-500">
                  Leads Captured
                </h3>
                <p className="text-2xl font-bold text-success">
                  {metrics.leads}
                </p>
              </div>

              <div className="stat p-3 bg-gray-50 rounded-lg">
                <h3 className="text-md font-medium text-gray-500">
                  Conversion Rate
                </h3>
                <p className="text-2xl font-bold text-primary">
                  {metrics.rate}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : !loading && !error ? (
        <div className="text-gray-500 text-center h-64 flex items-center justify-center">
          <p>No data available</p>
        </div>
      ) : null}
    </div>
  );
};

export default ConversionMetrics;
