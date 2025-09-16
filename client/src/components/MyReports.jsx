// src/components/MyReports.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";

const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyReports = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to view your reports.");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get("http://localhost:5001/api/reports/my", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setReports(res.data);
      } catch (err) {
        console.error("❌ Error fetching reports:", err);
        setError("Failed to fetch reports. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyReports();
  }, []);

  if (loading) return <p>Loading your reports...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">My Submitted Reports</h2>
      <div className="space-y-4">
        {reports.length > 0 ? (
          reports.map((report) => (
            <div key={report._id} className="bg-white p-4 rounded-lg shadow-md flex items-start space-x-4">
              <img src={`http://localhost:5001${report.mediaUrls[0]}`} alt={report.title} className="w-24 h-24 object-cover rounded-md" />
              <div className="flex-grow">
                <h3 className="text-xl font-semibold">{report.title}</h3>
                <p className="text-gray-600">{report.description}</p>
                <p className="text-sm text-gray-500">Category: <span className="font-medium">{report.category}</span></p>
              </div>
              <div className="text-right">
                 <span className={`px-3 py-1 text-sm rounded-full ${
                     {
                         new: 'bg-blue-200 text-blue-800',
                         acknowledged: 'bg-yellow-200 text-yellow-800',
                         in_progress: 'bg-purple-200 text-purple-800',
                         resolved: 'bg-green-200 text-green-800',
                     }[report.status] || 'bg-gray-200 text-gray-800'
                 }`}>
                     {report.status}
                 </span>
                 <p className="text-xs text-gray-400 mt-2">
                    {new Date(report.createdAt).toLocaleDateString()}
                 </p>
              </div>
            </div>
          ))
        ) : (
          <p>You have not submitted any reports yet.</p>
        )}
      </div>
    </div>
  );
};

export default MyReports;