import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useSocket } from '../context/SocketContext';
import AdminMap from "./AdminMap";
import StatCards from './StatCards';
import { FaArrowUp } from "react-icons/fa";

const AdminDashboard = () => {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const socket = useSocket();

  // We use useCallback to create a stable fetch function that can be used in useEffect
  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        setError("You must be logged in as an admin.");
        setLoading(false);
        return;
    }
    const headers = { Authorization: `Bearer ${token}` };

    setLoading(true);
    try {
      const [reportsRes, statsRes] = await Promise.all([
        axios.get(`https://backend-sih-project-l67a.onrender.com/api/admin/reports?sortBy=${sortBy}`, { headers }),
        axios.get("https://backend-sih-project-l67a.onrender.com/api/analytics/stats", { headers }),
      ]);
      setReports(reportsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error("❌ Error fetching initial data:", err);
      setError("Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [sortBy]); // This dependency ensures the fetch function is recreated if sortBy changes

  // Effect for initial data fetch and re-fetching when the sort option changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Effect for handling WebSocket events
  useEffect(() => {
    if (!socket) return;

    const handleNewReport = (newReport) => {
      toast.success(`New report submitted: "${newReport.title}"`);
      // Refetch all data to ensure the dashboard is perfectly in sync with the database
      fetchData(); 
    };

    socket.on('newReport', handleNewReport);

    // Clean up the listener when the component unmounts or dependencies change
    return () => {
      socket.off('newReport', handleNewReport);
    };
  }, [socket, fetchData]);

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
            <h1>Reports Dashboard</h1>
            <div className="sort-controls">
              <label htmlFor="sort-select">Sort By:</label>
              <select id="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="createdAt">Newest</option>
                <option value="upvoteCount">Most Upvoted</option>
              </select>
            </div>
        </div>
        
        <StatCards stats={stats} />

        <div className="admin-map-container">
            <AdminMap reports={reports} />
        </div>

        <div className="admin-reports-grid">
            {reports.map((report) => (
                <Link to={`/admin/report/${report._id}`} key={report._id} className="admin-report-card-link">
                    <div className="admin-report-card">
                      <div className="upvote-display">
                        <FaArrowUp /> {report.upvoteCount || 0}
                      </div>
                      <div className="card-main-info">
                          <div className="card-image-container">
                               {report.mediaUrls && report.mediaUrls[0] ? (
                                  <img src={report.mediaUrls[0]} alt={report.title} />
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
                          </div>
                      </div>
                      <div className="card-meta-info">
                          <div className="meta-item">
                              <strong>Date:</strong> {new Date(report.createdAt).toLocaleDateString()}
                          </div>
                          <div className="meta-item">
                              <strong>Assigned To:</strong> {report.assignedDept?.name || 'Unassigned'}
                          </div>
                      </div>
                    </div>
                </Link>
            ))}
        </div>
    </div>
  );
};

export default AdminDashboard;