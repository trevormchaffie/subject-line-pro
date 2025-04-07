import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const MAX_LABEL_LENGTH = 25;

const TopSubjectsChart = ({
  data,
  title = "Top Performing Subject Lines",
  loading = false,
  error = null,
  onSubjectClick = null,
}) => {
  // Format data for the chart
  const chartData =
    data?.map((item) => ({
      ...item,
      shortSubject:
        item.subjectLine.length > MAX_LABEL_LENGTH
          ? item.subjectLine.substring(0, MAX_LABEL_LENGTH) + "..."
          : item.subjectLine,
    })) || [];

  // Colors based on score
  const getBarColor = (score) => {
    if (score >= 80) return "#38c172"; // good
    if (score >= 60) return "#f6993f"; // medium
    return "#e3342f"; // poor
  };

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
        <>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis
                type="category"
                dataKey="shortSubject"
                width={150}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value, name, props) => [
                  value,
                  name === "overallScore" ? "Score" : name,
                ]}
                labelFormatter={(label) =>
                  "Subject: " +
                  chartData.find((d) => d.shortSubject === label)?.subjectLine
                }
              />
              <Legend />
              <Bar 
                dataKey="overallScore" 
                name="Overall Score"
                onClick={(data) => {
                  if (onSubjectClick) {
                    // Find the full subject data
                    const subjectData = chartData.find(item => 
                      item.shortSubject === data.shortSubject
                    );
                    
                    onSubjectClick({
                      type: 'subjectLine',
                      title: 'Subject Line Analysis',
                      itemData: subjectData,
                      subtitle: subjectData.subjectLine,
                      timestamp: subjectData.created || new Date()
                    });
                  }
                }}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getBarColor(entry.overallScore)}
                    cursor="pointer"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4">
            <h3 className="text-md font-medium mb-2">Top Subjects Details</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject Line
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Spam Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Length
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {chartData.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.subjectLine}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.overallScore >= 80
                              ? "bg-green-100 text-green-800"
                              : item.overallScore >= 60
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.overallScore}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.spamScore}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.length} chars
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : !loading && !error ? (
        <div className="text-gray-500 text-center h-64 flex items-center justify-center">
          <p>No data available</p>
        </div>
      ) : null}
    </div>
  );
};

export default TopSubjectsChart;
