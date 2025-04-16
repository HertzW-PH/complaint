import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { fetchComplaintsTrend } from "../../utils/api";

export default function ComplaintsTrendChart() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadTrendData() {
      try {
        const data = await fetchComplaintsTrend();
        const formattedData = {
          labels: data.map((item) => item.date),
          datasets: [
            {
              label: "Complaints Over Time",
              data: data.map((item) => item.count),
              borderColor: "rgba(75, 192, 192, 1)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              fill: true,
            },
          ],
        };
        setChartData(formattedData);
        setLoading(false);
      } catch (err) {
        setError("Failed to load trend data");
        setLoading(false);
      }
    }
    loadTrendData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-medium text-gray-700 mb-3">Complaints Trend</h3>
      <Line data={chartData} />
    </div>
  );
}
