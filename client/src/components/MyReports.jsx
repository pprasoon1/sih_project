// src/components/MyReports.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import './MyReports.css'; // We will create this next

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
        const res = await axios.get("https://backend-sih-project-l67a.onrender.com/api/reports/my", {
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
      <div className="reports-container">
        <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Loading your reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
      return (
        <div className="reports-container">
            <div className="error-message-full-page">{error}</div>
        </div>
      )
  }

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>My Submitted Reports</h1>
        <p>Here is a list of all the civic issues you have reported.</p>
      </div>

      <div className="reports-list">
        {reports.length > 0 ? (
          reports.map((report) => (
            <div key={report._id} className="report-card">
              <div className="report-image-container">
                 {/* Display image if available, otherwise a placeholder */}
                 {report.mediaUrls && report.mediaUrls[0] ? (
                    <img 
                        src={report.mediaUrls[0]}
                        alt={report.title} 
                        className="report-image" 
                    />
                 ) : (
                    <div className="report-image-placeholder">No Image</div>
                 )}
              </div>
              <div className="report-details">
                <div className="report-info">
                    <span className={`status-badge ${getStatusClass(report.status)}`}>
                        {report.status.replace('_', ' ')}
                    </span>
                    <h3 className="report-title">{report.title}</h3>
                    <p className="report-description">{report.description}</p>
                </div>
                <div className="report-footer">
                    <span className="report-category">{report.category}</span>
                    <span className="report-date">
                        {new Date(report.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-reports-message">
            <h3>You haven't submitted any reports yet.</h3>
            <p>Ready to make a difference? Report your first issue today!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReports;