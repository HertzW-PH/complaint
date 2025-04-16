import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { fetchMonthlyTrend } from "../../utils/api";
import { Loader2 } from "lucide-react";
import { useFilters } from "../../context/FilterContext";

export default function MonthlyTrendChart() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { filters, filtersApplied, setFiltersApplied } = useFilters();

  const loadMonthlyTrend = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchMonthlyTrend(filters);
      // Format data for the chart
      setChartData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initial load
  useEffect(() => {
    loadMonthlyTrend();
  }, [loadMonthlyTrend]);

  // When filters are applied, reload data
  useEffect(() => {
    if (filtersApplied) {
      loadMonthlyTrend();
    }
  }, [filtersApplied, loadMonthlyTrend]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600 mb-2" />
        <span>Loading trend data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center h-64">
        <div className="text-red-500 mb-2">Error loading data</div>
        <div className="text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-medium mb-4">Monthly Complaint Trends</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              name="Month"
            />
            <YAxis />
            <Tooltip 
              formatter={(value) => [`${value} complaints`, "Count"]}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              name="Complaints"
              stroke="#8884d8"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}