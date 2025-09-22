import React, { useState, useEffect } from 'react';
import API from '../api/axios.jsx';
import CommentModal from '../components/CommentModal';
import ReportCard from '../components/ReportCard'; // Import the refactored card
import './FeedPage.css'; // Import the new CSS

const FeedPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalReportId, setModalReportId] = useState(null);
  const [filter, setFilter] = useState('all');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
<<<<<<< HEAD
    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view the community feed.');
        setLoading(false);
        return;
      }

      let url = 'https://backend-sih-project-l67a.onrender.com/api/reports/feed';

      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        const { longitude, latitude } = position.coords;
        url += `?lng=${longitude}&lat=${latitude}`;
      } catch (geoError) {
        console.warn("Could not get location, fetching general feed.", geoError.message);
      }

      try {
        const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
        setReports(res.data);
      } catch (apiError) {
        console.error("Failed to fetch feed", apiError);
        setError('Failed to load the community feed. Please try again later.');
=======
    const getPosition = (opts = {}) => new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error('Geolocation unsupported'));
      let timeoutId;
      const success = (pos) => { clearTimeout(timeoutId); resolve(pos); };
      const failure = (err) => { clearTimeout(timeoutId); reject(err); };
      timeoutId = setTimeout(() => failure(new Error('Geolocation timeout')), 6000);
      navigator.geolocation.getCurrentPosition(success, failure, { timeout: 5000, ...opts });
    });

    const fetchReports = async () => {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view the community feed');
        setLoading(false);
        return;
      }

      let coords = null;
      try {
        const position = await getPosition();
        coords = { lng: position.coords.longitude, lat: position.coords.latitude };
      } catch (geoErr) {
        // Proceed without coords
      }

      try {
        if (coords) {
          const res = await API.get(`/reports/feed?lng=${coords.lng}&lat=${coords.lat}`);
          setReports(res.data);
        } else {
          const res = await API.get('/reports/feed');
          setReports(res.data);
        }
      } catch (e1) {
        try {
          if (coords) {
            const res2 = await API.get(`/reports/nearby?lng=${coords.lng}&lat=${coords.lat}`);
            setReports(res2.data);
          } else {
            const res2 = await API.get('/reports/trending');
            setReports(res2.data);
          }
        } catch (e2) {
          try {
            const res3 = await API.get('/reports/trending');
            setReports(Array.isArray(res3.data) ? res3.data : []);
          } catch (e3) {
            console.error('All feed attempts failed', e3);
            setError('Failed to load the community feed. Please try again later.');
          }
        }
>>>>>>> fd85d62 (yyy)
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleUpvote = async (reportId) => {
    try {
<<<<<<< HEAD
      const res = await axios.post(
        `https://backend-sih-project-l67a.onrender.com/api/reports/${reportId}/upvote`, {}, { headers: { Authorization: `Bearer ${token}` } }
=======
      const res = await API.post(`/reports/${reportId}/upvote`);
      setReports(prevReports => 
        prevReports.map(report => report._id === reportId ? res.data : report)
>>>>>>> fd85d62 (yyy)
      );
      setReports(prev => prev.map(r => r._id === reportId ? res.data : r));
    } catch (error) {
      console.error('Upvote failed', error);
    }
  };

  const handleCommentAdded = (reportId) => {
    setReports(prev =>
      prev.map(report =>
        report._id === reportId
          ? { ...report, comments: [...(report.comments || []), {}] }
          : report
      )
    );
  };

  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true;
    if (filter === 'pending') {
      return ['new', 'acknowledged'].includes(report.status);
    }
    if (filter === 'in-progress') {
      return report.status === 'in_progress';
    }
    if (filter === 'resolved') {
      return report.status === 'resolved';
    }
    return true;
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
        <p>Stay updated with issues and progress in your area.</p>
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
      
      {renderContent()}

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
