import React, { useState } from "react";
import { fetchComplaints, fetchStatistics } from "../utils/api";

export default function AutoClassificationPage() {
  const [progress, setProgress] = useState(0);
  const [isClassifying, setIsClassifying] = useState(false);

  const startClassification = async () => {
    setIsClassifying(true);
    setProgress(0);

    try {
      const response = await fetch("/auto-classification/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (response.status === 200) {
        const total = response.data.total;
        let completed = 0;

        // Simulate progress updates
        const interval = setInterval(async () => {
          const progressResponse = await fetch("/auto-classification/progress", {
            method: "GET",
          }).then((res) => res.json());
          completed = progressResponse.data.completed;
          setProgress(Math.round((completed / total) * 100));

          if (completed >= total) {
            clearInterval(interval);
            setIsClassifying(false);
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Error during classification:", error);
      setIsClassifying(false);
    }
  };

  return (
    <div className="p-4">
<h1 className="text-2xl font-bold mb-4">Auto Classification</h1>
      <button
        onClick={startClassification}
        disabled={isClassifying}
        className={`px-4 py-2 text-white rounded ${
          isClassifying ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
{isClassifying ? "Classifying..." : "Start Classification"}
      </button>
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-blue-500 h-4 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
<p className="text-sm mt-2">{progress}% Completed</p>
      </div>
    </div>
  );
}
