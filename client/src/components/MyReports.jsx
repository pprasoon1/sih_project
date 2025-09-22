import React, { useState, useEffect } from "react";
import axios from "axios";
import API from "../api/axios";
import ReportStatusProgress from "./ReportStatusProgress.jsx";

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
        const res = await API.get("/reports/my");
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'acknowledged': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      pothole: '🕳️',
      streetlight: '💡',
      garbage: '🗑️',
      water: '💧',
      tree: '🌳',
      other: '📋'
    };
    return icons[category] || '📋';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Reports</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="btn btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">My Submitted Reports</h2>
        <p className="text-gray-600">Here is a list of all the civic issues you have reported.</p>
      </div>

      {reports.length > 0 ? (
        <div className="grid gap-6">
          {reports.map((report) => (
            <div key={report._id} className="card">
              <div className="card-body">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Image */}
                  <div className="flex-shrink-0">
                    {report.mediaUrls && report.mediaUrls[0] ? (
                      <img 
                        src={report.mediaUrls[0]}
                        alt={report.title} 
                        className="w-full md:w-48 h-32 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full md:w-48 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-3xl mb-2">{getCategoryIcon(report.category)}</div>
                          <p className="text-sm text-gray-500">No Image</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {report.status.replace('_', ' ')}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getCategoryIcon(report.category)} {report.category}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(report.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{report.description}</p>

                    {/* Progress Timeline */}
                    <div className="mt-4">
                      <ReportStatusProgress 
                        status={report.status}
                        createdAt={report.createdAt}
                        resolvedAt={report.resolvedAt}
                      />
                    </div>

                    {/* Stats */}
                    <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                        <span>{report.upvoteCount || 0} upvotes</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>{report.comments?.length || 0} comments</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reports Yet</h3>
          <p className="text-gray-600 mb-4">You haven't submitted any reports yet.</p>
          <p className="text-gray-500 mb-6">Ready to make a difference? Report your first issue today!</p>
          <button 
            onClick={() => window.location.href = '/dashboard'} 
            className="btn btn-primary"
          >
            Report an Issue
          </button>
        </div>
      )}
    </div>
  );
};

export default MyReports;