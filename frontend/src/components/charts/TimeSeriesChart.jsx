import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const TimeSeriesChart = ({
  data,
  title,
  dataKey = "count",
  xAxisKey = "date",
  color = "#3490dc",
  loading = false,
  error = null,
}) => {
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

      {!loading && !error && data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={xAxisKey}
              tickFormatter={(value) => {
                // Shorten date labels for better display
                if (value.includes("-")) {
                  const parts = value.split("-");
                  if (parts.length === 3) {
                    // Full date: YYYY-MM-DD
                    return `${parts[1]}/${parts[2]}`;
                  }
                  if (parts.length === 2) {
                    // Month: YYYY-MM
                    return `${parts[1]}/${parts[0].slice(2)}`;
                  }
                }
                return value;
              }}
            />
            <YAxis />
            <Tooltip
              formatter={(value) => [value, dataKey]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              activeDot={{ r: 8 }}
              name={dataKey.charAt(0).toUpperCase() + dataKey.slice(1)}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : !loading && !error ? (
        <div className="text-gray-500 text-center h-64 flex items-center justify-center">
          <p>No data available</p>
        </div>
      ) : null}
    </div>
  );
};

export default TimeSeriesChart;
