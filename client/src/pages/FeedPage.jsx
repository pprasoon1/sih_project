import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaArrowUp, FaComment } from 'react-icons/fa';

const ReportCard = ({ report, user }) => {
  const [upvoteCount, setUpvoteCount] = useState(report.upvoteCount);
  // Check if the current user has upvoted this report
  const [isUpvoted, setIsUpvoted] = useState(report.upvotedBy.includes(user?._id));

  const handleUpvote = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(`/api/reports/${report._id}/upvote`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Update state based on the server's response
      setUpvoteCount(res.data.upvoteCount);
      setIsUpvoted(res.data.upvotedBy.includes(user?._id));
    } catch (error) {
      console.error("Upvote failed", error);
    }
  };

  return (
    <div className="report-card">
      <img src={report.mediaUrls[0]} alt={report.title} className="report-card-image" />
      <div className="report-card-content">
        <h3>{report.title}</h3>
        <p>Category: {report.category}</p>
        <div className="report-card-actions">
          <button onClick={handleUpvote} className={`upvote-btn ${isUpvoted ? 'upvoted' : ''}`}>
            <FaArrowUp /> {upvoteCount}
          </button>
          <button className="comment-btn"><FaComment /> Comments</button>
        </div>
      </div>
    </div>
  );
};

const FeedPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    // Get user's location and fetch feed
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { longitude, latitude } = position.coords;
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`/api/reports/feed?lng=${longitude}&lat=${latitude}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReports(res.data);
      } catch (error) {
        console.error("Failed to fetch feed", error);
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error("Geolocation error", error);
      setLoading(false);
      // TODO: Handle case where user denies location access
    });
  }, []);

  if (loading) return <div>Loading community feed...</div>;

  return (
    <div className="feed-container">
      <h1>Community Feed</h1>
      <div className="feed-grid">
        {reports.map(report => (
          <ReportCard key={report._id} report={report} user={user} />
        ))}
      </div>
    </div>
  );
};
export default FeedPage;