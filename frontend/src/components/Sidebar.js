import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BarChart3, Upload, FileText, Database } from "lucide-react";
import SidebarFilter from "./SidebarFilter";

export function Sidebar() {
  const location = useLocation();
  
  // Navigation items configuration
  const navigation = [
    { name: "Dashboard", href: "/", icon: BarChart3 },
    { name: "Upload Data", href: "/upload", icon: Upload },
    { name: "Complaint List", href: "/complaints", icon: FileText },
    { name: "Auto Classification", href: "/auto-classification", icon: FileText },
  ];

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-1 min-h-0 bg-gray-800">
        {/* Header */}
        <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
          <Database className="h-8 w-8 text-white" />
          <span className="ml-2 text-white text-lg font-medium">CT Complaint Classification System</span>
        </div>
        
        {/* Navigation Menu */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="px-2 py-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  ${
                    location.pathname === item.href
                      ? "bg-gray-900 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }
                  group flex items-center px-2 py-2 text-base font-medium rounded-md
                `}
              >
                <item.icon
                  className={`
                    ${
                      location.pathname === item.href
                        ? "text-white"
                        : "text-gray-400 group-hover:text-gray-300"
                    }
                    mr-3 flex-shrink-0 h-6 w-6
                  `}
                />
                {item.name}
              </Link>
            ))}
          </nav>
          
          {/* Filter Options - Only show on dashboard and complaints pages */}
          {(location.pathname === "/" || location.pathname === "/complaints") && (
            <SidebarFilter />
          )}
        </div>
      </div>
    </div>
  );
}
