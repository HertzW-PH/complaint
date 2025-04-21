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
import { fetchCountryStatistics } from "../../utils/api";
import { Loader2 } from "lucide-react";
import { useFilters } from "../../context/FilterContext";

export default function CountryStatisticsChart() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { filters, filtersApplied } = useFilters();

  const loadCountryStats = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchCountryStatistics(filters);
      
      // Convert object to array for charting
      const formattedData = Object.entries(data || {})
        .map(([name, value]) => ({
          name,
          value: typeof value === "number" ? value : Number(value) || 0,
        }))
        .sort((a, b) => b.value - a.value);
        
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
    loadCountryStats();
  }, [loadCountryStats]);

  // When filters are applied, reload data
  useEffect(() => {
    if (filtersApplied) {
      loadCountryStats();
    }
  }, [filtersApplied, loadCountryStats]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600 mb-2" />
        <span>Loading country data...</span>
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
      <h3 className="text-lg font-medium mb-4">Complaints by Country</h3>
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
              width={100}
              tick={{ fontSize: 12 }}
            />
            <Tooltip formatter={(value) => [`${value} complaints`, "Count"]} />
            <Legend />
            <Bar 
              dataKey="value" 
              name="Complaints" 
              fill="#8884d8" 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}