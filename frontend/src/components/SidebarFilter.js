import React, { useRef } from "react";
import { Filter, RefreshCw, X, Check, ChevronDown, ChevronUp } from "lucide-react";
import { useFilters } from "../context/FilterContext";

// MultiSelect component for dropdown with multiple selection in sidebar - made more compact
function MultiSelect({ label, options, value = [], onChange, loading, error, displayTransform }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    // Add event listener when dropdown is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Clean up event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  // Transform the display text if a transform function is provided
  const getDisplayText = (option) => {
    if (displayTransform) {
      return displayTransform(option);
    }
    return option;
  };
  
  const toggleOption = (option) => {
    if (value.includes(option)) {
      onChange(value.filter(item => item !== option));
    } else {
      onChange([...value, option]);
    }
  };
  
  const handleSelectAll = () => {
    if (value.length === options.length) {
      onChange([]);
    } else {
      onChange([...options]);
    }
  };
  
  return (
    <div className="relative mb-2" ref={dropdownRef}>
      {/* More compact label */}
      <label className="block text-xs text-gray-300 mb-0.5">{label}</label>
      <div 
        className="w-full py-1 px-2 border border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer bg-gray-700 flex justify-between items-center text-xs"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="truncate text-gray-300">
          {value.length === 0 ? (
            <span className="text-gray-400">Select...</span>
          ) : value.length === 1 ? (
            getDisplayText(value[0])
          ) : (
            `${value.length} selected`
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="h-3 w-3 text-gray-400" />
        ) : (
          <ChevronDown className="h-3 w-3 text-gray-400" />
        )}
      </div>
      
      {/* Selected items badges - more compact */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-0.5">
          {value.map(item => (
            <span 
              key={item} 
              className="bg-blue-800 text-blue-100 text-xs px-1.5 py-0.5 rounded flex items-center"
            >
              {getDisplayText(item).substring(0, 8)}
              {getDisplayText(item).length > 8 && "..."}
              <X 
                className="h-2.5 w-2.5 ml-0.5 cursor-pointer" 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOption(item);
                }}
              />
            </span>
          ))}
        </div>
      )}
      
      {isOpen && (
        <div className="absolute z-10 mt-0.5 w-full bg-gray-700 shadow-lg max-h-40 rounded-md py-1 text-xs overflow-auto focus:outline-none border border-gray-600">
          {loading ? (
            <div className="px-2 py-1 text-gray-300">Loading...</div>
          ) : error ? (
            <div className="px-2 py-1 text-red-400">{error}</div>
          ) : (
            <>
              {/* Select/deselect all option */}
              <div 
                className="px-2 py-1 cursor-pointer hover:bg-gray-600 border-b border-gray-600 flex items-center justify-between"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectAll();
                }}
              >
                <span className="font-medium text-gray-200 text-xs">{value.length === options.length ? 'Deselect All' : 'Select All'}</span>
                {value.length === options.length && (
                  <Check className="h-3 w-3 text-blue-400" />
                )}
              </div>
              
              {/* Options */}
              {options.map(option => (
                <div 
                  key={option} 
                  className="px-2 py-1 cursor-pointer hover:bg-gray-600 flex items-center justify-between"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOption(option);
                  }}
                >
                  <span className="truncate text-gray-300">{getDisplayText(option)}</span>
                  {value.includes(option) && (
                    <Check className="h-3 w-3 text-blue-400" />
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function SidebarFilter() {
  const { 
    filters, 
    filterOptions, 
    loading, 
    error, 
    handleFilterChange, 
    resetFilters,
    applyFilters,
    transformProductDisplay 
  } = useFilters();

  return (
    <div className="h-full px-2 py-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium text-sm text-gray-200 flex items-center">
          <Filter className="h-3.5 w-3.5 mr-1" />
          Filters
        </h3>
      </div>

      <div className="space-y-1">
        {/* Filter components */}
        <MultiSelect
          label="Category L1"
          options={filterOptions.system_components || []}
          value={filters.system_component || []}
          onChange={(value) => handleFilterChange("system_component", value)}
          loading={loading}
          error={error}
        />

        <MultiSelect
          label="Failure Mode"
          options={filterOptions.failure_modes || []}
          value={filters.failure_mode || []}
          onChange={(value) => handleFilterChange("failure_mode", value)}
          loading={loading}
          error={error}
        />

        <MultiSelect
          label="Severity"
          options={filterOptions.severities || []}
          value={filters.severity || []}
          onChange={(value) => handleFilterChange("severity", value)}
          loading={loading}
          error={error}
        />

        <MultiSelect
          label="Status"
          options={filterOptions.is_open || []}
          value={filters.pr_state || []}
          onChange={(value) => handleFilterChange("pr_state", value)}
          loading={loading}
          error={error}
        />

        <MultiSelect
          label="Priority"
          options={filterOptions.priorities || []}
          value={filters.priority || []}
          onChange={(value) => handleFilterChange("priority", value)}
          loading={loading}
          error={error}
        />

        <MultiSelect
          label="Country"
          options={filterOptions.countries || []}
          value={filters.country || []}
          onChange={(value) => handleFilterChange("country", value)}
          loading={loading}
          error={error}
        />

        <MultiSelect
          label="Product ID"
          options={filterOptions.product_identifiers || []}
          value={filters.catalog_item_identifier || []}
          onChange={(value) => handleFilterChange("catalog_item_identifier", value)}
          loading={loading}
          error={error}
          displayTransform={transformProductDisplay}
        />

        <MultiSelect
          label="Category L2"
          options={filterOptions.level2_categories || []}
          value={filters.level2 || []}
          onChange={(value) => handleFilterChange("level2", value)}
          loading={loading}
          error={error}
        />

        <div>
          <label className="block text-xs text-gray-300 mb-0.5">Start Date</label>
          <input
            type="date"
            className="w-full py-0.5 px-2 border border-gray-600 rounded-md bg-gray-700 text-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={filters.start_date || ""}
            onChange={(e) => handleFilterChange("start_date", e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="block text-xs text-gray-300 mb-0.5">End Date</label>
          <input
            type="date"
            className="w-full py-0.5 px-2 border border-gray-600 rounded-md bg-gray-700 text-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={filters.end_date || ""}
            onChange={(e) => handleFilterChange("end_date", e.target.value)}
          />
        </div>

        <div className="flex space-x-1 pt-2 border-t border-gray-700">
          <button
            onClick={resetFilters}
            className="px-2 py-1 border border-gray-600 rounded-md text-xs text-gray-300 hover:bg-gray-700 flex items-center justify-center flex-1"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Reset
          </button>
          <button
            onClick={applyFilters}
            className="px-2 py-1 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700 flex items-center justify-center flex-1"
          >
            <Filter className="h-3 w-3 mr-1" />
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}