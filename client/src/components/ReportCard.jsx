import React, { useState } from 'react';

const ReportCard = ({ report, user, onUpvote, onOpenComments }) => {
  const [imageError, setImageError] = useState(false);
  const isUpvoted = report.upvotedBy.includes(user?._id);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getCategoryInfo = (category) => {
    const categories = {
      pothole: { icon: '🕳️', label: 'Pothole' },
      streetlight: { icon: '💡', label: 'Streetlight' },
      garbage: { icon: '🗑️', label: 'Garbage' },
      water: { icon: '💧', label: 'Water Leak' },
      tree: { icon: '🌳', label: 'Fallen Tree' },
      other: { icon: '📋', label: 'Other' },
    };
    return categories[category] || categories.other;
  };
  
  const getStatusInfo = (status) => {
    const statuses = {
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      'in-progress': 'bg-sky-100 text-sky-800 border-sky-200',
      resolved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      closed: 'bg-slate-100 text-slate-800 border-slate-200',
    };
    return statuses[status] || statuses.closed;
  };

  const categoryInfo = getCategoryInfo(report.category);

  return (
    <div className="report-card">
      {/* Image Section */}
      <div className="card-image-wrapper">
        {report.mediaUrls && report.mediaUrls.length > 0 && !imageError ? (
          <img
            src={report.mediaUrls[0]}
            alt={report.title}
            className="report-card-image"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="image-placeholder">
            <div className="placeholder-icon">{categoryInfo.icon}</div>
          </div>
        )}
        <span className={`status-badge ${getStatusInfo(report.status)}`}>
          {report.status?.replace('-', ' ')}
        </span>
      </div>

      <div className="card-content">
        {/* Header */}
        <div className="card-header">
          <span className="category-tag">{categoryInfo.label}</span>
          <span className="timestamp">{formatDate(report.createdAt)}</span>
        </div>

        {/* Title and Location */}
        <h3 className="card-title">{report.title}</h3>
        <div className="card-location">
          <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
          <span>{report.location?.address || 'Location not specified'}</span>
        </div>

        {/* Description */}
        {report.description && (
          <p className="card-description">{report.description}</p>
        )}

        {/* Footer Actions */}
        <div className="card-footer">
          <button onClick={() => onUpvote(report._id)} className={`action-btn ${isUpvoted ? 'upvoted' : ''}`}>
            <svg viewBox="0 0 20 20" fill="currentColor"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333V17a1.5 1.5 0 001.5 1.5h8.5a1.5 1.5 0 001.5-1.5v-6.667a1.5 1.5 0 00-.83-1.342l-7.5-3.25a1.5 1.5 0 00-1.34.001l-7.5 3.25A1.5 1.5 0 006 10.333z" /></svg>
            <span>{report.upvoteCount || 0}</span>
          </button>
          <button onClick={() => onOpenComments(report._id)} className="action-btn">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            <span>{report.comments?.length || 0}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;
