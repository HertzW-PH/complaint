import React, { useState, useEffect } from "react";
import ChartCard from "../features/dashboard/ChartCard";
import ParetoChart from "../features/dashboard/ParetoChart";
import MonthlyTrendChart from "../features/dashboard/MonthlyTrendChart";
import CountryStatisticsChart from "../features/dashboard/CountryStatisticsChart";
import ProductStatisticsChart from "../features/dashboard/ProductStatisticsChart";
import { fetchStatistics } from "../utils/api";
import { Loader2, RefreshCw } from "lucide-react";
import { useFilters } from "../context/FilterContext";

export default function Dashboard() {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { filters, filtersApplied, setFiltersApplied } = useFilters();

  const loadStatistics = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Pass the filters to the statistics API
      const data = await fetchStatistics(filters);
      setStatistics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initial load
  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  // When filters are applied, reload data
  useEffect(() => {
    if (filtersApplied) {
      loadStatistics();
      setFiltersApplied(false); // Reset the filtersApplied flag after loading
    }
  }, [filtersApplied, setFiltersApplied, loadStatistics]);

  // Refresh data
  const handleRefresh = () => {
    loadStatistics();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 mt-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Failed to load</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 md:py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Complaint Dashboard</h1>
        <button
          onClick={handleRefresh}
          className="flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4 mr-1.5" />
          刷新数据
        </button>
      </div>
      
      {/* Overview and Category L1 charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium">Overview</h3>
          <div className="mt-2">
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600">Total number</p>
                <p className="text-2xl font-bold text-blue-800">
                  {Object.values(statistics?.system_component || {}).reduce((a, b) => a + Number(b), 0)}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-600">Critical</p>
                <p className="text-2xl font-bold text-red-800">
                  {statistics?.severity?.Safety || 0}
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-600">High Priority</p>
                <p className="text-2xl font-bold text-yellow-800">
                  {statistics?.priority?.High || 0}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600">Low</p>
                <p className="text-2xl font-bold text-green-800">
                  {statistics?.priority?.Low || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <ChartCard 
          title="Category L1" 
          data={statistics?.system_component} 
          type="pie" 
        />
      </div>
      
      {/* Monthly trend chart */}
      <div className="mb-6">
        <MonthlyTrendChart />
      </div>
      
      {/* Pareto charts for L1 and L2 categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <ParetoChart 
          title="Category L1 Pareto Analysis" 
          data={statistics?.system_component}
        />
        
        <ParetoChart 
          title="Category L2 Pareto Analysis" 
          data={statistics?.level2}
        />
      </div>
      
      {/* Country and Product statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <CountryStatisticsChart />
        <ProductStatisticsChart />
      </div>
      
      {/* Failure Mode, Severity and Priority charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard 
          title="Failure Mode" 
          data={statistics?.failure_mode} 
          type="pie" 
        />
        
        <ChartCard 
          title="Severity" 
          data={statistics?.severity} 
          type="pie" 
        />
        
        <ChartCard 
          title="Priority" 
          data={statistics?.priority} 
          type="bar" 
        />
      </div>
    </div>
  );
}
