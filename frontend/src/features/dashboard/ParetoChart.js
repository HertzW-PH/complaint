import React from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

// Pareto chart component for displaying data with cumulative percentage line
export default function ParetoChart({ title, data }) {
  // Convert object to array and sort by value in descending order
  const sortedData = Object.entries(data || {})
    .map(([name, value]) => ({
      name,
      value: typeof value === "number" ? value : Number(value) || 0,
    }))
    .sort((a, b) => b.value - a.value);

  // Calculate total and cumulative percentages
  const total = sortedData.reduce((sum, item) => sum + item.value, 0);
  
  let cumulative = 0;
  const chartData = sortedData.map(item => {
    cumulative += item.value;
    return {
      ...item,
      percentage: (item.value / total) * 100,
      cumulativePercentage: (cumulative / total) * 100,
    };
  });

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end"
              height={70}
              interval={0}
              tick={{fontSize: 11}}
            />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              stroke="#82ca9d" 
              domain={[0, 100]} 
              unit="%" 
            />
            <Tooltip formatter={(value, name) => {
              if (name === "Count") return [value, "Count"];
              if (name === "Cumulative %") return [`${value.toFixed(1)}%`, name];
              return [value, name];
            }} />
            <Legend />
            <Bar 
              yAxisId="left" 
              dataKey="value" 
              name="Count" 
              fill="#8884d8" 
              barSize={30} 
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="cumulativePercentage" 
              name="Cumulative %" 
              stroke="#82ca9d" 
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}