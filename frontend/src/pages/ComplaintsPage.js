import React, { useState, useEffect } from "react";
import { fetchComplaints } from "../utils/api";
import ComplaintTable from "../features/complaints/ComplaintTable";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { useFilters } from "../context/FilterContext";

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { filters, filtersApplied, setFiltersApplied } = useFilters();

  // Load complaints data
  const loadComplaints = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchComplaints(filters);
      setComplaints(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initial load
  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  // When filters are applied, reload data
  useEffect(() => {
    if (filtersApplied) {
      loadComplaints();
      setFiltersApplied(false);
    }
  }, [filtersApplied, setFiltersApplied, loadComplaints]);

  // Refresh data
  const handleRefresh = () => {
    loadComplaints();
  };

  // Update complaint
  const handleUpdateComplaint = (updatedComplaint) => {
    setComplaints((prevComplaints) =>
      prevComplaints.map((complaint) =>
        complaint.pr_id === updatedComplaint.pr_id ? updatedComplaint : complaint
      )
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Complaint Records</h1>
        <button
          onClick={handleRefresh}
          className="flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4 mr-1.5" />
          刷新数据
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <span>Failed to load data: {error}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-lg text-gray-700">Loading complaint data...</span>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {complaints.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No complaints match the criteria</p>
            </div>
          ) : (
            <ComplaintTable
              complaints={complaints}
              onUpdateComplaint={handleUpdateComplaint}
            />
          )}
        </div>
      )}
    </div>
  );
}
