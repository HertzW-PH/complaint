import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BarChart3, Upload, FileText, Database, Settings } from "lucide-react";

export function TopNavbar() {
  const location = useLocation();
  
  // Navigation items configuration
  const navigation = [
    { name: "Dashboard", href: "/", icon: BarChart3 },
    { name: "Complaint List", href: "/complaints", icon: FileText },
    { name: "Upload Data", href: "/upload", icon: Upload },
    { name: "Auto Analysis", href: "/auto-classification", icon: Settings },
  ];

  return (
    <div className="bg-gray-800 shadow-md fixed top-0 left-0 right-0 z-20">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and system name */}
          <div className="flex items-center">
            <Database className="h-8 w-8 text-white" />
            <span className="ml-2 text-white text-lg font-medium">CT Complaint Classification System</span>
          </div>
          
          {/* Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
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
                    flex items-center px-3 py-2 rounded-md text-sm font-medium
                  `}
                >
                  <item.icon
                    className={`
                      ${
                        location.pathname === item.href
                          ? "text-white"
                          : "text-gray-400 group-hover:text-gray-300"
                      }
                      mr-2 flex-shrink-0 h-5 w-5
                    `}
                  />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state - simplified for now */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
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
                block px-3 py-2 rounded-md text-base font-medium flex items-center
              `}
            >
              <item.icon
                className={`
                  ${
                    location.pathname === item.href
                      ? "text-white"
                      : "text-gray-400 group-hover:text-gray-300"
                  }
                  mr-3 flex-shrink-0 h-5 w-5
                `}
              />
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}