import React, { useState } from "react";
import { Upload, FileUp, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { uploadExcelFile } from "../utils/api";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStats, setUploadStats] = useState(null);
  const [error, setError] = useState(null);

  // File selection handler
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
          selectedFile.type === "application/vnd.ms-excel") {
        setFile(selectedFile);
        setError(null);
      } else {
        setFile(null);
        setError("Please select a valid Excel file (.xlsx or .xls)");
      }
    }
  };

  // File upload handler
  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        const newProgress = prev + 5;
        return newProgress > 90 ? 90 : newProgress;
      });
    }, 300);

    try {
      const result = await uploadExcelFile(file);
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStats(result);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Upload Complaint Data</h1>

      <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label
              className={`
                flex flex-col items-center justify-center w-full h-64 
                border-2 border-dashed rounded-lg cursor-pointer 
                ${file ? "border-green-300 bg-green-50" : "border-gray-300 bg-gray-50"} 
                hover:bg-gray-100
              `}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {file ? (
                  <>
                    <CheckCircle className="w-10 h-10 text-green-500 mb-3" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">{file.name}</span>
                    </p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                  </>
                ) : (
                  <>
                    <FileUp className="w-10 h-10 text-gray-400 mb-3" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to select a file</span> or drag and drop here
                    </p>
                    <p className="text-xs text-gray-500">Only Excel files are supported (.xlsx, .xls)</p>
                  </>
                )}
              </div>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {uploading && (
            <div className="mt-2">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Upload Progress</span>
                <span className="text-sm font-medium text-gray-700">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {uploadStats && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                <span>
                  File uploaded successfully! {uploadStats.new_complaints} new complaints added,
                  {uploadStats.existing_complaints} existing complaints.
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-center mt-4">
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className={`
                flex items-center px-4 py-2 rounded-md text-white
                ${
                  !file || uploading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }
              `}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload File
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
