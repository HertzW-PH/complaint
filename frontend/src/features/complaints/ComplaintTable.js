import React, { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import EditComplaintModal from "./EditComplaintModal";

export default function ComplaintTable({ complaints, onUpdateComplaint }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [editingComplaint, setEditingComplaint] = useState(null);
  const pageSize = 10; // Fixed page size, no longer configurable
  
  // Calculate total pages
  const totalPages = Math.ceil(complaints.length / pageSize);
  
  // Get current page data
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return complaints.slice(startIndex, endIndex);
  };
  
  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Scroll to top of table when changing pages
      const tableTop = document.querySelector('table')?.getBoundingClientRect().top;
      if (tableTop) {
        window.scrollTo({ top: window.scrollY + tableTop - 100, behavior: 'smooth' });
      }
    }
  };
  
  // Jump to specific page
  const handleJumpToPage = (event) => {
    if (event.key === 'Enter') {
      const pageNumber = parseInt(event.target.value);
      if (!isNaN(pageNumber) && pageNumber > 0 && pageNumber <= totalPages) {
        setCurrentPage(pageNumber);
        event.target.value = '';
      }
    }
  };
  
  // Open edit modal
  const handleEdit = (complaint) => {
    setEditingComplaint(complaint);
  };
  
  // Handle complaint update
  const handleComplaintUpdate = (updatedComplaint) => {
    onUpdateComplaint(updatedComplaint);
    setEditingComplaint(null);
  };
  
  // Generate severity badge style
  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case "Safety":
        return "bg-red-100 text-red-800";
      case "High":
        return "bg-orange-100 text-orange-800";
      case "Med":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      case "Enhancement":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  // Generate priority badge style
  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Med":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status badge style
  const getStatusBadgeClass = (status) => {
    if (!status) return "bg-gray-100 text-gray-800";
    
    status = status.toLowerCase();
    if (status.includes("open") || status.includes("active")) {
      return "bg-yellow-100 text-yellow-800";
    } else if (status.includes("closed") || status.includes("resolved") || status.includes("completed")) {
      return "bg-green-100 text-green-800";
    } else {
      return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="overflow-hidden w-full">
      {/* Table container with horizontal scrolling - now uses full available width */}
      <div className="overflow-x-auto shadow rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* Reordered columns with slightly larger font */}
              <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                PR ID
              </th>
              <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Product
              </th>
              <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                L1 Category
              </th>
              <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                L2 Category
              </th>
              <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Short Description
              </th>
              <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Date
              </th>
              <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                S/P
              </th>
              <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {getCurrentPageData().map((complaint) => (
              <tr 
                key={complaint.pr_id} 
                className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                onDoubleClick={() => handleEdit(complaint)}
                title="Double-click to edit this entry"
              >
                {/* PR ID - slightly larger font */}
                <td className="px-2 py-1.5 text-sm font-medium text-gray-900 whitespace-nowrap">
                  <span 
                    className="cursor-pointer text-blue-600 hover:underline" 
                    onClick={() => handleEdit(complaint)}
                  >
                    {complaint.pr_id}
                  </span>
                </td>
                
                {/* Product - slightly larger font */}
                <td className="px-2 py-1.5 text-gray-500">
                  <div className="truncate max-w-[150px] leading-tight text-sm" title={complaint.catalog_item_name || "Not Provided"}>
                    {complaint.catalog_item_name || "Not Provided"}
                  </div>
                  <div className="text-xs text-gray-400 truncate max-w-[150px] leading-tight" title={complaint.catalog_item_identifier || ""}>
                    {complaint.catalog_item_identifier || ""}
                  </div>
                </td>
                
                {/* L1 Category - slightly larger font */}
                <td className="px-2 py-1.5 text-gray-500">
                  <div className="truncate max-w-[120px] leading-tight text-sm" title={complaint.system_component || "Not Categorized"}>
                    {complaint.system_component || "Uncategorized"}
                  </div>
                  <div className="truncate text-xs text-gray-400 max-w-[120px] leading-tight" title={complaint.failure_mode || "Not Categorized"}>
                    {complaint.failure_mode || "Uncategorized"}
                  </div>
                </td>
                
                {/* L2 Category - slightly larger font */}
                <td className="px-2 py-1.5 text-gray-500">
                  <div className="truncate max-w-[120px] leading-tight text-sm" title={complaint.level2 || "Uncategorized"}>
                    {complaint.level2 || "Uncategorized"}
                  </div>
                </td>
                
                {/* Short Description - slightly larger font */}
                <td className="px-2 py-1.5 text-gray-500">
                  <div className="truncate group relative cursor-help max-w-[300px] leading-tight text-sm" title={complaint.short_description || "Description Not Available"}>
                    {complaint.short_description || "No Description"}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute z-10 bg-gray-900 text-white p-2 rounded text-xs max-w-md shadow-lg -top-2 left-0 translate-y-[-100%] pointer-events-none">
                      {complaint.short_description || "No Description"}
                    </div>
                  </div>
                </td>
                
                {/* Date - slightly larger font */}
                <td className="px-2 py-1.5 text-sm text-gray-500 whitespace-nowrap">
                  <div title={complaint.initiate_date || "Not Provided"}>
                    {complaint.initiate_date ? new Date(complaint.initiate_date).toLocaleDateString() : "Not Provided"}
                  </div>
                </td>
                
                {/* S/P (Severity/Priority) */}
                <td className="px-2 py-1.5 whitespace-nowrap">
                  <div className="flex flex-col space-y-0.5">
                    {complaint.severity && (
                      <span className={`px-1.5 inline-flex text-xs leading-4 font-semibold rounded-full ${getSeverityBadgeClass(complaint.severity)}`}>
                        {complaint.severity}
                      </span>
                    )}
                    {complaint.priority && (
                      <span className={`px-1.5 inline-flex text-xs leading-4 font-semibold rounded-full ${getPriorityBadgeClass(complaint.priority)}`}>
                        {complaint.priority}
                      </span>
                    )}
                  </div>
                </td>
                
                {/* Status */}
                <td className="px-2 py-1.5 whitespace-nowrap">
                  <span className={`px-1.5 inline-flex text-xs leading-4 font-semibold rounded-full ${getStatusBadgeClass(complaint.pr_state)}`}>
                    {complaint.pr_state || "Unknown"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tip information */}
      <div className="text-center text-xs text-gray-500 py-1.5 bg-blue-50 my-2 rounded">
        Tip: Double-click any row or click on PR ID to quickly edit the entry
      </div>

      {/* Pagination controls - Simplified without page size dropdown */}
      <div className="border-t border-gray-200 px-4 py-3 flex justify-between items-center">
        {/* Results count */}
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{" "}
          <span className="font-medium">
            {Math.min(currentPage * pageSize, complaints.length)}
          </span>{" "}
          of <span className="font-medium">{complaints.length}</span> results
        </div>

        {/* Page controls */}
        <div className="flex items-center space-x-2">
          {/* Jump to page input (desktop only) */}
          <div className="hidden md:flex items-center">
            <span className="text-sm text-gray-700 mr-2">Go to:</span>
            <input
              type="number"
              min="1"
              max={totalPages}
              className="w-16 rounded-md border border-gray-300 px-2 py-1 text-sm"
              placeholder="Page"
              onKeyDown={handleJumpToPage}
            />
          </div>
          
          {/* Pagination buttons */}
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            {/* First page button */}
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === 1
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
              title="First page"
            >
              <ChevronsLeft className="h-5 w-5" />
            </button>
            
            {/* Previous page button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                currentPage === 1
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
              title="Previous page"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            {/* Page number buttons - adaptive display */}
            <div className="hidden md:flex">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === totalPages || 
                  (page >= currentPage - 1 && page <= currentPage + 1)
                )
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        ...
                      </span>
                    )}
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border ${
                        page === currentPage
                          ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      } text-sm font-medium`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))
              }
            </div>
            
            {/* Current page indicator for mobile */}
            <span className="md:hidden relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-medium text-blue-600">
              {currentPage} of {totalPages}
            </span>
            
            {/* Next page button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                currentPage === totalPages
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
              title="Next page"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            
            {/* Last page button */}
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === totalPages
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
              title="Last page"
            >
              <ChevronsRight className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>

      {/* Edit modal */}
      {editingComplaint && (
        <EditComplaintModal
          complaint={editingComplaint}
          onClose={() => setEditingComplaint(null)}
          onUpdate={handleComplaintUpdate}
        />
      )}
    </div>
  );
}
