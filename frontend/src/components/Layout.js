import React from "react";
import { useLocation } from "react-router-dom";
import { TopNavbar } from "./TopNavbar";
import SidebarFilter from "./SidebarFilter";

export function Layout({ children }) {
  const location = useLocation();
  // Only show filters on dashboard and complaints pages
  const showFilters = location.pathname === "/" || location.pathname === "/complaints";

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Top Navigation Bar - Fixed at the top */}
      <TopNavbar />
      
      {/* Main content area with padding-top to account for fixed navbar */}
      <div className="flex flex-1 pt-16"> {/* Added pt-16 for navbar height */}
        {/* Filters Sidebar - fixed on the left side */}
        <div className={`hidden md:block w-64 bg-gray-800 overflow-y-auto fixed left-0 bottom-0 top-16 transition-all duration-300 z-10 ${!showFilters ? '-ml-64' : ''}`}>
          <SidebarFilter />
        </div>
        
        {/* Page content - adjusted margin based on sidebar visibility */}
        <div className={`flex-1 p-4 md:p-6 transition-all duration-300 ${showFilters ? 'md:ml-64' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
