// src/components/AdminDashboard.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchAllReports = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("http://localhost:5001/api/admin/reports", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReports(res.data);
      } catch (err) {
        console.error("❌ Error fetching reports for admin:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllReports();
  }, []);

  // 👇 New handler function
  const handleStatusChange = async (reportId, newStatus) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.put(
        `http://localhost:5001/api/admin/reports/${reportId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update the status in the local state to reflect the change immediately
      setReports(
        reports.map((r) => (r._id === reportId ? res.data : r))
      );
    } catch (err) {
      console.error("❌ Error updating status:", err);
      alert("Failed to update status.");
    }
  };

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Report Title
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Category
              </th>
               <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Reporter
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Date
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Actions
          </th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report._id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{report.title}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{report.category}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{report.reporterId?.name || "N/A"}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                   <p className="text-gray-900 whitespace-no-wrap">{new Date(report.createdAt).toLocaleDateString()}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                   <span className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
                        <span aria-hidden className={`absolute inset-0 ${
                            {
                                new: 'bg-blue-200',
                                acknowledged: 'bg-yellow-200',
                                in_progress: 'bg-purple-200',
                                resolved: 'bg-green-200',
                            }[report.status] || 'bg-gray-200'
                        } opacity-50 rounded-full`}></span>
                        <span className="relative">{report.status}</span>
                    </span>
                </td>
                 {/* 👇 Add new cell for the status update dropdown */}
              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                <select
                  value={report.status}
                  onChange={(e) => handleStatusChange(report._id, e.target.value)}
                  className="border rounded-lg px-2 py-1"
                >
                  <option value="new">New</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;