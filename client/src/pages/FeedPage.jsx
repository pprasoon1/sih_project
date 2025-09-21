import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CommentModal from '../components/CommentModal';

const ReportCard = ({ report, user, onUpvote, onOpenComments }) => {
  const isUpvoted = report.upvotedBy.includes(user?._id);
  const [imageError, setImageError] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
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

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="card hover:shadow-lg transition-all duration-300">
      {/* Image Section */}
      {report.mediaUrls && report.mediaUrls.length > 0 && !imageError ? (
        <div className="relative">
          <img 
            src={report.mediaUrls[0]} 
            alt={report.title} 
            className="w-full h-48 object-cover"
            onError={() => setImageError(true)}
          />
          <div className="absolute top-4 left-4">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
              {report.status?.replace('-', ' ')}
            </span>
          </div>
        </div>
      ) : (
        <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">{getCategoryIcon(report.category)}</div>
            <p className="text-gray-500 text-sm">No image available</p>
          </div>
        </div>
      )}

      <div className="card-body">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
              {report.title}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {report.location?.address || 'Location not specified'}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {report.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {report.description}
          </p>
        )}

        {/* Category and Meta */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {getCategoryIcon(report.category)} {report.category}
            </span>
            <span className="text-xs text-gray-500">
              {formatDate(report.createdAt)}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            by {report.reportedBy?.name || 'Anonymous'}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => onUpvote(report._id)} 
              className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                isUpvoted 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <svg className={`w-4 h-4 ${isUpvoted ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <span>{report.upvoteCount || 0}</span>
            </button>
            
            <button 
              onClick={() => onOpenComments(report._id)} 
              className="flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{report.comments?.length || 0}</span>
            </button>
          </div>

          {/* Progress Indicator */}
          {report.status === 'in-progress' && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-blue-600 font-medium">In Progress</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FeedPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalReportId, setModalReportId] = useState(null);
  const [filter, setFilter] = useState('all');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view the community feed');
          return;
        }

        // Try to get location first
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { longitude, latitude } = position.coords;
            try {
              const res = await axios.get(
                `https://backend-sih-project-l67a.onrender.com/api/reports/feed?lng=${longitude}&lat=${latitude}`, 
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              setReports(res.data);
            } catch (error) {
              console.error("Failed to fetch feed with location", error);
              // Fallback to general feed without location
              const res = await axios.get(
                'https://backend-sih-project-l67a.onrender.com/api/reports/feed',
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              setReports(res.data);
            }
          },
          async (error) => {
            console.error("Geolocation error", error);
            // Fallback to general feed without location
            try {
              const res = await axios.get(
                'https://backend-sih-project-l67a.onrender.com/api/reports/feed',
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              setReports(res.data);
            } catch (error) {
              setError('Failed to load community feed');
            }
          }
        );
      } catch (error) {
        console.error("Failed to fetch feed", error);
        setError('Failed to load community feed');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleUpvote = async (reportId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(
        `https://backend-sih-project-l67a.onrender.com/api/reports/${reportId}/upvote`, 
        {}, 
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setReports(prevReports => 
        prevReports.map(report => report._id === reportId ? res.data : report)
      );
    } catch (error) {
      console.error("Upvote failed", error);
    }
  };

  const handleCommentAdded = (reportId) => {
    setReports(prevReports =>
      prevReports.map(report => {
        if (report._id === reportId) {
          const newComments = [...(report.comments || []), {}];
          return { ...report, comments: newComments };
        }
        return report;
      })
    );
  };

  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true;
    return report.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-gray-600">Loading community feed...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Feed</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="btn btn-primary"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Feed</h1>
          <p className="text-gray-600">Stay updated with issues and progress in your community</p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Reports' },
              { key: 'pending', label: 'Pending' },
              { key: 'in-progress', label: 'In Progress' },
              { key: 'resolved', label: 'Resolved' }
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === filterOption.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reports Grid */}
        {filteredReports.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reports Found</h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all' 
                ? 'No reports have been submitted yet. Be the first to report an issue!'
                : `No reports with status "${filter}" found.`
              }
            </p>
            {filter === 'all' && (
              <button 
                onClick={() => window.location.href = '/dashboard'} 
                className="btn btn-primary"
              >
                Report an Issue
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map(report => (
              <ReportCard 
                key={report._id} 
                report={report} 
                user={user}
                onUpvote={handleUpvote} 
                onOpenComments={setModalReportId}
              />
            ))}
          </div>
        )}

        {/* Comment Modal */}
        {modalReportId && (
          <CommentModal 
            reportId={modalReportId} 
            onClose={() => setModalReportId(null)}
            onCommentAdded={() => handleCommentAdded(modalReportId)}
          />
        )}
      </div>
    </div>
  );
};

export default FeedPage;