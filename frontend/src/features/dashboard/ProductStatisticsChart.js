import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { fetchProductStatistics } from "../../utils/api";
import { Loader2 } from "lucide-react";
import { useFilters } from "../../context/FilterContext";

export default function ProductStatisticsChart() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { filters, filtersApplied, setFiltersApplied } = useFilters();

  const loadProductStats = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchProductStatistics(filters);
      
      // Convert object to array for charting
      const formattedData = Object.entries(data || {})
        .map(([name, value]) => ({
          name,
          value: typeof value === "number" ? value : Number(value) || 0,
        }))
        .sort((a, b) => b.value - a.value)
        // Limit to top 15 products to avoid overcrowding
        .slice(0, 15);
        
      setChartData(formattedData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initial load
  useEffect(() => {
    loadProductStats();
  }, [loadProductStats]);

  // When filters are applied, reload data
  useEffect(() => {
    if (filtersApplied) {
      loadProductStats();
    }
  }, [filtersApplied, loadProductStats]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600 mb-2" />
        <span>Loading product data...</span>
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
      <h3 className="text-lg font-medium mb-4">Top Products by Complaints</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={150}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                return value.length > 20 ? `${value.substring(0, 17)}...` : value;
              }}
            />
            <Tooltip 
              formatter={(value) => [`${value} complaints`, "Count"]}
              labelFormatter={(label) => label}
            />
            <Legend />
            <Bar 
              dataKey="value" 
              name="Complaints" 
              fill="#82ca9d" 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}