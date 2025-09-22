import React, { useState, useEffect } from 'react';
import API from '../api/axios.jsx'; // Use the configured axios instance
import CommentModal from '../components/CommentModal';
import ReportCard from '../components/ReportCard';
import './FeedPage.css';

const FeedPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalReportId, setModalReportId] = useState(null);
  const [filter, setFilter] = useState('all');
  
  // Memoize user object to prevent re-parsing on every render
  const user = React.useMemo(() => JSON.parse(localStorage.getItem('user')), []);

  useEffect(() => {
    // A robust function to get geolocation with a timeout
    const getPosition = (opts = {}) => new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject(new Error('Geolocation is not supported by your browser.'));
      }
      
      const timeoutId = setTimeout(() => reject(new Error('Geolocation request timed out.')), 6000);
      
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(timeoutId);
          resolve(pos);
        },
        (err) => {
          clearTimeout(timeoutId);
          reject(err);
        },
        { timeout: 5000, ...opts }
      );
    });

    const fetchReports = async () => {
      setLoading(true);
      setError(null);

      if (!localStorage.getItem('token')) {
        setError('Please log in to view the community feed.');
        setLoading(false);
        return;
      }

      // 1. Attempt to get user's location
      let coords = null;
      try {
        const position = await getPosition();
        coords = { 
          lng: position.coords.longitude, 
          lat: position.coords.latitude 
        };
      } catch (geoErr) {
        console.warn("Could not get location, will fetch a general feed.", geoErr.message);
      }

      // 2. Fetch reports (with or without location)
      try {
        const url = coords ? `/reports/feed?lng=${coords.lng}&lat=${coords.lat}` : '/reports/feed';
        const res = await API.get(url);
        setReports(res.data);
      } catch (apiError) {
        console.error("Primary feed fetch failed, attempting fallback.", apiError);
        // Fallback sequence: nearby (with coords) -> general feed
        try {
          if (coords) {
            const res2 = await API.get(`/reports/nearby?lng=${coords.lng}&lat=${coords.lat}`);
            setReports(res2.data);
          } else {
            const res2 = await API.get('/reports/feed');
            setReports(res2.data);
          }
        } catch (fallbackError1) {
          console.warn('Secondary feed fetch failed, attempting general feed.', fallbackError1);
          try {
            const res3 = await API.get('/reports/feed');
            setReports(Array.isArray(res3.data) ? res3.data : []);
          } catch (fallbackError2) {
            console.error('All feed fetch attempts failed.', fallbackError2);
            setError('Failed to load the community feed. Please try again later.');
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []); // Empty dependency array ensures this runs once on mount

  const handleUpvote = async (reportId) => {
    try {
      // API instance handles authorization headers automatically
      const res = await API.post(`/reports/${reportId}/upvote`);
      // Update the specific report in the state with the fresh data from the API
      setReports(prevReports => 
        prevReports.map(report => (report._id === reportId ? res.data : report))
      );
    } catch (err) {
      console.error('Upvote failed', err);
      // Optionally, show a toast notification for the failed upvote
    }
  };
  
  const handleCommentAdded = (reportId) => {
    // This function updates the comment count on the frontend for immediate feedback,
    // avoiding a full re-fetch of the report.
    setReports(prevReports =>
      prevReports.map(report => {
        if (report._id === reportId) {
          // Safely increment comment count
          const currentCommentCount = report.commentCount ?? (report.comments?.length || 0);
          return { ...report, commentCount: currentCommentCount + 1 };
        }
        return report;
      })
    );
  };

  // Filter reports based on the active tab
  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true;
    if (filter === 'pending') return ['new', 'acknowledged'].includes(report.status);
    if (filter === 'in-progress') return report.status === 'in_progress';
    if (filter === 'resolved') return report.status === 'resolved';
    return true; // Default fallback
  });

  const renderContent = () => {
    if (loading) {
      return (
        <div className="state-container">
          <div className="spinner"></div>
          <p>Loading community feed...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="state-container error-state">
           <div className="icon-wrapper error">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h3>Unable to Load Feed</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Try Again
          </button>
        </div>
      );
    }

    if (filteredReports.length === 0) {
      return (
        <div className="state-container">
          <div className="icon-wrapper">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <h3>No Reports Found</h3>
          <p>
            {filter === 'all'
              ? 'Be the first to report an issue in your community!'
              : `There are no reports with the status "${filter}".`}
          </p>
          {filter === 'all' && (
            <button onClick={() => window.location.href = '/dashboard'} className="btn-primary">
              Report an Issue
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="feed-grid">
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
    );
  };
  
  return (
    <div className="feed-container">
      <header className="feed-header">
        <h1>Community Feed</h1>
        <p>Stay updated with issues and progress in Greater Noida.</p>
      </header>

      <div className="filter-tabs">
        {[
          { key: 'all', label: 'All Reports' },
          { key: 'pending', label: 'Pending' },
          { key: 'in-progress', label: 'In Progress' },
          { key: 'resolved', label: 'Resolved' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`filter-btn ${filter === key ? 'active' : ''}`}
          >
            {label}
          </button>
        ))}
      </div>
      
      <main>
        {renderContent()}
      </main>

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