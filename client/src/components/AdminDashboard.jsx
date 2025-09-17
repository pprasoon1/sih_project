// src/components/AdminDashboard.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminMap from "./AdminMap"; // Assuming AdminMap component exists
import io from "socket.io-client";
import './AdminDashboard.css'; // We will create this next

const AdminDashboard = () => {
  const [reports, setReports] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
        setError("You must be logged in as an admin to view this page.");
        setLoading(false);
        return;
    }
    const headers = { Authorization: `Bearer ${token}` };

    const fetchInitialData = async () => {
      try {
        const [reportsRes, deptsRes] = await Promise.all([
          axios.get("http://localhost:5001/api/admin/reports", { headers }),
          axios.get("http://localhost:5001/api/admin/departments", { headers }),
        ]);
        setReports(reportsRes.data);
        setDepartments(deptsRes.data);
      } catch (err) {
        console.error("❌ Error fetching initial data:", err);
        setError("Could not load dashboard data. You may not have admin privileges.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    const socket = io("http://localhost:5001");
    socket.on("connect", () => console.log("✅ Socket connected:", socket.id));
    socket.on("newReport", (newReport) => {
      console.log("Received new report via socket:", newReport);
      setReports((prevReports) => [newReport, ...prevReports]);
    });

    return () => socket.disconnect();
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

  const handleAssignDept = async (reportId, departmentId) => {
    if (!departmentId) return;
    const token = localStorage.getItem("token");
    try {
      const res = await axios.put(
        `http://localhost:5001/api/admin/reports/${reportId}/assign`,
        { departmentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReports(reports.map((r) => (r._id === reportId ? res.data : r)));
    } catch (err) {
      console.error("❌ Error assigning department:", err);
      alert("Failed to assign department.");
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'new': return 'status-new';
      case 'acknowledged': return 'status-acknowledged';
      case 'in_progress': return 'status-in-progress';
      case 'resolved': return 'status-resolved';
      default: return 'status-default';
    }
  };
  
  if (loading) {
    return (
        <div className="admin-container">
            <div className="loading-indicator">
                <div className="spinner"></div>
                <p>Loading Dashboard Data...</p>
            </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="admin-container">
            <div className="error-message-full-page">{error}</div>
        </div>
    );
  }

  return (
    <div className="admin-container">
        <div className="admin-header">
            <h1>Admin Dashboard</h1>
            <p>.</p>
        </div>
        
        <div className="admin-map-container">
            <AdminMap reports={reports} />
        </div>

        <div className="admin-reports-grid">
            {reports.map((report) => (
                <div key={report._id} className="admin-report-card">
                    <div className="card-main-info">
                        <div className="card-image-container">
                           {report.mediaUrls && report.mediaUrls[0] ? (
                              <img src={`http://localhost:5001${report.mediaUrls[0]}`} alt={report.title} />
                           ) : (
                              <div className="image-placeholder">No Image</div>
                           )}
                        </div>
                        <div className="card-details">
                            <span className={`status-badge ${getStatusClass(report.status)}`}>
                                {report.status.replace('_', ' ')}
                            </span>
                            <h3 className="card-title">{report.title}</h3>
                            <p className="card-category">{report.category}</p>
                            <p className="card-description">{report.description}</p>
                        </div>
                    </div>
                    <div className="card-meta-info">
                        <div className="meta-item">
                            <strong>Reporter:</strong> {report.reporterId?.name || "N/A"}
                        </div>
                        <div className="meta-item">
                            <strong>Date:</strong> {new Date(report.createdAt).toLocaleDateString()}
                        </div>
                        <div className="meta-item">
                            <strong>Assigned To:</strong> {report.assignedDept?.name || 'Unassigned'}
                        </div>
                    </div>
                    <div className="card-actions">
                         <select value={report.status} onChange={(e) => handleStatusChange(report._id, e.target.value)} className="action-select">
                            <option value="new">New</option>
                            <option value="acknowledged">Acknowledge</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                        </select>
                        <select value={report.assignedDept?._id || ""} onChange={(e) => handleAssignDept(report._id, e.target.value)} className="action-select">
                            <option value="">Assign Department...</option>
                            {departments.map((dept) => (
                                <option key={dept._id} value={dept._id}>
                                    {dept.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default AdminDashboard;