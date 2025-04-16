import React, { useEffect, useState, useRef } from "react";  
import { fetchFilterOptions } from "../../utils/api";  
import { Filter, RefreshCw, X, Check, ChevronDown, ChevronUp } from "lucide-react";  

// MultiSelect component for dropdown with multiple selection
function MultiSelect({ label, options, value = [], onChange, loading, error, displayTransform }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
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
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm text-gray-700 mb-1">{label}</label>
      <div 
        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer bg-white flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="truncate">
          {value.length === 0 ? (
            <span className="text-gray-500">Select options...</span>
          ) : value.length === 1 ? (
            getDisplayText(value[0])
          ) : (
            `${value.length} items selected`
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </div>
      
      {/* Selected items badges */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {value.map(item => (
            <span 
              key={item} 
              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex items-center"
            >
              {getDisplayText(item).substring(0, 15)}
              {getDisplayText(item).length > 15 && "..."}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
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
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm border border-gray-300">
          {loading ? (
            <div className="px-3 py-2 text-gray-500">Loading...</div>
          ) : error ? (
            <div className="px-3 py-2 text-red-500">{error}</div>
          ) : (
            <>
              {/* Select/deselect all option */}
              <div 
                className="px-3 py-2 cursor-pointer hover:bg-gray-100 border-b border-gray-200 flex items-center justify-between"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectAll();
                }}
              >
                <span className="font-medium">{value.length === options.length ? 'Deselect All' : 'Select All'}</span>
                {value.length === options.length && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </div>
              
              {/* Options */}
              {options.map(option => (
                <div 
                  key={option} 
                  className="px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center justify-between"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOption(option);
                  }}
                >
                  <span className="truncate">{getDisplayText(option)}</span>
                  {value.includes(option) && (
                    <Check className="h-4 w-4 text-blue-600" />
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

export default function ComplaintFilter({ filters, setFilters, onApplyFilter, onResetFilter }) {  
  const [filterOptions, setFilterOptions] = useState({  
    system_components: [],  
    failure_modes: [],  
    severities: [],  
    priorities: [],  
    is_open:[],  
    countries: [],  
    product_identifiers: [],  
    product_names: [],  
    level2_categories: [],  
  });  
  const [loading, setLoading] = useState(true);  
  const [error, setError] = useState(null);  

  useEffect(() => {  
    async function loadFilterOptions() {  
      try {  
        const options = await fetchFilterOptions();  
        setFilterOptions(options);  
        setLoading(false);  
      } catch (err) {  
        setError("Unable to load filter options");  
        setLoading(false);  
      }  
    }  
    loadFilterOptions();  
  }, []);  
  
  const handleChange = (field, value) => {  
    setFilters((prev) => ({  
      ...prev,  
      [field]: value,  
    }));  
  };

  // Transform product identifier to display name and ID
  const transformProductDisplay = (option) => {
    const matchingProduct = (filterOptions.product_names || [])
      .find(p => p.identifier === option);
    return matchingProduct ? 
      `${option} - ${matchingProduct.name}` : 
      option;
  };

  return (  
    <div className="bg-white p-4 rounded-lg shadow mb-6">  
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-gray-700 flex items-center">  
          <Filter className="h-4 w-4 mr-2" />  
          Filter Options  
        </h3>
        <div className="flex space-x-2">  
          <button  
            onClick={onResetFilter}  
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 flex items-center"  
          >  
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />  
            Reset  
          </button>  
          <button  
            onClick={onApplyFilter}  
            className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 flex items-center"  
          >  
            <Filter className="h-3.5 w-3.5 mr-1.5" />  
            Apply Filter  
          </button>  
        </div>
      </div>

      {/* First row: System Component, Failure Mode, Severity, Open Status and Priority */}  
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">  
        <MultiSelect
          label="Category L1"
          options={filterOptions.system_components || []}
          value={filters.system_component || []}
          onChange={(value) => handleChange("system_component", value)}
          loading={loading}
          error={error}
        />

        <MultiSelect
          label="Failure Mode"
          options={filterOptions.failure_modes || []}
          value={filters.failure_mode || []}
          onChange={(value) => handleChange("failure_mode", value)}
          loading={loading}
          error={error}
        />

        <MultiSelect
          label="Severity"
          options={filterOptions.severities || []}
          value={filters.severity || []}
          onChange={(value) => handleChange("severity", value)}
          loading={loading}
          error={error}
        />

        <MultiSelect
          label="Status"
          options={filterOptions.is_open || []}
          value={filters.pr_state || []}
          onChange={(value) => handleChange("pr_state", value)}
          loading={loading}
          error={error}
        />

        <MultiSelect
          label="Priority"
          options={filterOptions.priorities || []}
          value={filters.priority || []}
          onChange={(value) => handleChange("priority", value)}
          loading={loading}
          error={error}
        />
      </div>  

      {/* Second row: Country, Product Identifier, Start/End Date */}  
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">  
        <MultiSelect
          label="Country"
          options={filterOptions.countries || []}
          value={filters.country || []}
          onChange={(value) => handleChange("country", value)}
          loading={loading}
          error={error}
        />

        <MultiSelect
          label="Product Identifier"
          options={filterOptions.product_identifiers || []}
          value={filters.catalog_item_identifier || []}
          onChange={(value) => handleChange("catalog_item_identifier", value)}
          loading={loading}
          error={error}
          displayTransform={transformProductDisplay}
        />

        <MultiSelect
          label="Category L2"
          options={filterOptions.level2_categories || []}
          value={filters.level2 || []}
          onChange={(value) => handleChange("level2", value)}
          loading={loading}
          error={error}
        />

        <div>  
          <label className="block text-sm text-gray-700 mb-1">Start Date</label>  
          <input  
            type="date"  
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"  
            value={filters.start_date || ""}  
            onChange={(e) => handleChange("start_date", e.target.value)}  
          />  
        </div>  

        <div>  
          <label className="block text-sm text-gray-700 mb-1">End Date</label>  
          <input  
            type="date"  
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"  
            value={filters.end_date || ""}  
            onChange={(e) => handleChange("end_date", e.target.value)}  
          />  
        </div>  
      </div>  
    </div>  
  );  
}