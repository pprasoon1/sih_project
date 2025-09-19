import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaArrowUp, FaComment } from 'react-icons/fa';
import CommentModal from '../components/CommentModal';
import './FeedPage.css';

// A simpler "dumb" component that just displays data
const ReportCard = ({ report, user, onUpvote, onOpenComments }) => {
  const isUpvoted = report.upvotedBy.includes(user?._id);

  return (
    <div className="report-card">
      <img src={report.mediaUrls[0]} alt={report.title} className="report-card-image" />
      <div className="report-card-content">
        <h3>{report.title}</h3>
        <p>Category: {report.category}</p>
        <div className="report-card-actions">
          <button onClick={() => onUpvote(report._id)} className={`upvote-btn ${isUpvoted ? 'upvoted' : ''}`}>
            <FaArrowUp /> {report.upvoteCount}
          </button>
          <button onClick={() => onOpenComments(report._id)} className="comment-btn">
            {/* The comment count is now directly from the report prop */}
            <FaComment /> {report.comments?.length || 0} Comments
          </button>
        </div>
      </div>
    </div>
  );
};

// The main "smart" component that manages state and logic
const FeedPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalReportId, setModalReportId] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { longitude, latitude } = position.coords;
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`https://backend-sih-project-l67a.onrender.com/api/reports/feed?lng=${longitude}&lat=${latitude}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log();
        
        
        
        setReports(res.data);
      } catch (error) {
        console.error("Failed to fetch feed", error);
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error("Geolocation error", error);
      setLoading(false);
    });
  }, []);

  const handleUpvote = async (reportId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(`https://backend-sih-project-l67a.onrender.com/api/reports/${reportId}/upvote`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Find the report in the state and replace it with the updated one from the server
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
          // Create a new comments array and add a placeholder to increment the length.
          // This ensures the count updates visually.
          const newComments = [...(report.comments || []), {}];
          return { ...report, comments: newComments };
        }
        return report;
      })
    );
  };

  if (loading) return <div>Loading community feed...</div>;

  return (
    <div className="feed-container">
      <h1>Community Feed</h1>
      <div className="feed-grid">
        {reports.map(report => (
          <ReportCard 
            key={report._id} 
            report={report} 
            user={user}
            onUpvote={handleUpvote} 
            onOpenComments={setModalReportId}
          />
        ))}
      </div>

      {modalReportId && (
        <CommentModal 
          reportId={modalReportId} 
          onClose={() => setModalReportId(null)}
          onCommentAdded={() => handleCommentAdded(modalReportId)}
        />
      )}
    </div>
  );
};

export default FeedPage;