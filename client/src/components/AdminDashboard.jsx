import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-hot-toast'; // Import toast for pop-ups
import { useSocket } from '../context/SocketContext'; // Import our custom hook
import AdminMap from "./AdminMap";
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [reports, setReports] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socket = useSocket(); // Use the single, global socket connection

  // Effect for fetching initial data
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in as an admin.");
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
        setError("Could not load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Effect for handling WebSocket events
  useEffect(() => {
    if (!socket) return; // Don't set up listeners until the socket is ready

    const handleNewReport = (newReport) => {
      console.log("Received new report via socket:", newReport);
      setReports((prevReports) => [newReport, ...prevReports]);
      // Show a pop-up notification to the admin
      toast.success(`New report submitted: "${newReport.title}"`);
    };

    socket.on('newReport', handleNewReport);

    return () => {
      socket.off('newReport', handleNewReport);
    };
  }, [socket]); // This effect re-runs if the socket connection changes

  // ... (handleStatusChange and handleAssignDept functions remain the same)
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
      toast.error("Failed to update status.");
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
      toast.success("Department assigned!");
    } catch (err) {
      console.error("❌ Error assigning department:", err);
      toast.error("Failed to assign department.");
    }
  };

  // ... (JSX and other logic remains the same)
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
                              <img src={`${report.mediaUrls[0]}`} alt={report.title} />
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