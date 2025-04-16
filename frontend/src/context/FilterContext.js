import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchFilterOptions } from '../utils/api';

// Create initial filter state
const initialFilters = {
  system_component: [],
  failure_mode: [],
  severity: [],
  priority: [],
  pr_state: [],
  country: [],
  catalog_item_identifier: [],
  level2: [],
  start_date: "",
  end_date: ""
};

// Create context
const FilterContext = createContext();

// Provider component
export function FilterProvider({ children }) {
  const [filters, setFilters] = useState(initialFilters);
  const [filterOptions, setFilterOptions] = useState({
    system_components: [],
    failure_modes: [],
    severities: [],
    priorities: [],
    is_open: [],
    countries: [],
    product_identifiers: [],
    product_names: [],
    level2_categories: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtersApplied, setFiltersApplied] = useState(false);

  // Load filter options from API
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

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters(initialFilters);
    setFiltersApplied(true); // Trigger data refresh
  };

  // Apply filters
  const applyFilters = () => {
    setFiltersApplied(true);
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
    <FilterContext.Provider value={{
      filters,
      filterOptions,
      loading,
      error,
      filtersApplied,
      setFiltersApplied,
      handleFilterChange,
      resetFilters,
      applyFilters,
      transformProductDisplay
    }}>
      {children}
    </FilterContext.Provider>
  );
}

// Custom hook for using the filter context
export const useFilters = () => useContext(FilterContext);