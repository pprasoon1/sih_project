// src/components/AdminDashboard.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminMap from "./AdminMap";
import io from "socket.io-client";

const AdminDashboard = () => {
  const [reports, setReports] = useState([]);
  const [departments, setDepartments] = useState([]); // New state for departments
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const fetchInitialData = async () => {
      try {
        // Fetch both reports and departments in parallel for efficiency
        const [reportsRes, deptsRes] = await Promise.all([
          axios.get("http://localhost:5001/api/admin/reports", { headers }),
          axios.get("http://localhost:5001/api/admin/departments", { headers }),
        ]);
        setReports(reportsRes.data);
        setDepartments(deptsRes.data);
      } catch (err) {
        console.error("❌ Error fetching initial data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    // --- Socket.IO Setup ---
    const socket = io("http://localhost:5001");

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("newReport", (newReport) => {
      console.log("Received new report:", newReport);
      setReports((prevReports) => [newReport, ...prevReports]);
    });

    // Cleanup on component unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  const handleStatusChange = async (reportId, newStatus) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.put(
        `http://localhost:5001/api/admin/reports/${reportId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReports(reports.map((r) => (r._id === reportId ? res.data : r)));
    } catch (err) {
      console.error("❌ Error updating status:", err);
      alert("Failed to update status.");
    }
  };

  // --- New handler for assigning a report to a department ---
  const handleAssignDept = async (reportId, departmentId) => {
    if (!departmentId) return; // Ignore if the default "Assign..." option is selected

    const token = localStorage.getItem("token");
    try {
      const res = await axios.put(
        `http://localhost:5001/api/admin/reports/${reportId}/assign`,
        { departmentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update the report in the local state to reflect the assignment
      setReports(reports.map((r) => (r._id === reportId ? res.data : r)));
    } catch (err) {
      console.error("❌ Error assigning department:", err);
      alert("Failed to assign department.");
    }
  };


  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <AdminMap reports={reports} />
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          {/* Table Head */}
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Report Details</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reporter</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned Department</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          {/* Table Body */}
          <tbody>
            {reports.map((report) => (
              <tr key={report._id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap font-bold">{report.title}</p>
                    <p className="text-gray-600 whitespace-no-wrap">{report.category}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{report.reporterId?.name || "N/A"}</p>
                    <p className="text-gray-600 whitespace-no-wrap">{new Date(report.createdAt).toLocaleDateString()}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <span className={`relative inline-block px-3 py-1 font-semibold leading-tight rounded-full ${
                      { new: 'bg-blue-200 text-blue-900', acknowledged: 'bg-yellow-200 text-yellow-900', in_progress: 'bg-purple-200 text-purple-900', resolved: 'bg-green-200 text-green-900' }[report.status] || 'bg-gray-200 text-gray-900'
                    }`}>
                    <span className="relative">{report.status}</span>
                  </span>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {/* Display the assigned department's name */}
                    <p className="text-gray-900 whitespace-no-wrap">{report.assignedDept?.name || 'Unassigned'}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm space-y-2">
                  {/* Action 1: Change Status */}
                  <select value={report.status} onChange={(e) => handleStatusChange(report._id, e.target.value)} className="w-full border rounded-lg px-2 py-1">
                    <option value="new">New</option>
                    <option value="acknowledged">Acknowledged</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                   {/* Action 2: Assign Department */}
                   <select value={report.assignedDept?._id || ""} onChange={(e) => handleAssignDept(report._id, e.target.value)} className="w-full border rounded-lg px-2 py-1">
                        <option value="">Assign Dept...</option>
                        {departments.map((dept) => (
                            <option key={dept._id} value={dept._id}>
                                {dept.name}
                            </option>
                        ))}
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