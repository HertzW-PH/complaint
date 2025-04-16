import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import UploadPage from "./pages/UploadPage";
import ComplaintsPage from "./pages/ComplaintsPage";
import AutoClassificationPage from "./pages/AutoClassificationPage";
import { FilterProvider } from "./context/FilterContext";

// Import Tailwind CSS
import "tailwindcss/tailwind.css";

export default function App() {
  return (
    <BrowserRouter>
      <FilterProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/complaints" element={<ComplaintsPage />} />
            <Route path="/auto-classification" element={<AutoClassificationPage />} />
          </Routes>
        </Layout>
      </FilterProvider>
    </BrowserRouter>
  );
}
