import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { toast } from 'react-hot-toast';
import { FaArrowUp, FaTag, FaUser, FaBuilding, FaClock, FaComment } from 'react-icons/fa';
import { format } from 'date-fns';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './ReportDetailPage.css';

// ... (Leaflet icon fix)

const ReportDetailPage = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [detailsRes, deptsRes] = await Promise.all([
        axios.get(`/api/admin/reports/${reportId}`, { headers }),
        axios.get('/api/admin/departments', { headers })
      ]);
      setReport(detailsRes.data.report);
      setHistory(detailsRes.data.history);
      setDepartments(deptsRes.data);
    } catch (error) {
      toast.error("Failed to fetch details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [reportId]);

  const handleAction = async (actionType, payload) => {
    const token = localStorage.getItem('token');
    const endpointMap = {
      status: `/api/admin/reports/${reportId}/status`,
      assign: `/api/admin/reports/${reportId}/assign`,
      comment: `/api/reports/${reportId}/comments`,
      escalate: `/api/admin/reports/${reportId}/escalate`,
    };
    try {
      await axios.post(endpointMap[actionType], payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`Report ${actionType} updated!`);
      fetchData(); // Refetch all data to get the latest state and history
      if (actionType === 'comment') setNewComment("");
    } catch (error) {
      toast.error(`Failed to perform action: ${actionType}`);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!report) return <div>Report not found.</div>;

  const position = [report.location.coordinates[1], report.location.coordinates[0]];

  return (
    <div className="report-detail-container">
      {/* Header */}
      <div className="report-detail-header">
        <div>
          <button onClick={() => navigate('/admin/dashboard')} className="back-button">← Back</button>
          <h1>{report.title}</h1>
          <span className={`status-tag ${report.status}`}>{report.status.replace('_', ' ')}</span>
        </div>
        <button onClick={() => handleAction('escalate', {})} className="btn-escalate">Escalate to DM</button>
      </div>
      
      {/* Main Grid */}
      <div className="report-detail-grid">
        <div className="detail-main-content">
          <img src={report.mediaUrls[0]} alt={report.title} className="detail-main-image" />
          
          {/* Activity Feed */}
          <div className="activity-feed">
            <h3>Activity Feed</h3>
            {history.map(item => (
              <div key={item._id} className="activity-item">
                <div className="activity-icon"><FaUser /></div>
                <div className="activity-content">
                  <strong>{item.user.name}</strong>
                  {item.changeType === 'status_change' && ` changed status from ${item.fromValue} to ${item.toValue}.`}
                  {item.changeType === 'assigned' && ` assigned this report to ${item.toValue}.`}
                  {item.changeType === 'escalated' && ` escalated this report.`}
                  {item.changeType === 'comment' && ` commented:`}
                  {item.changeType === 'comment' && <p className="activity-comment-text">"{item.comment}"</p>}
                  <span className="activity-time">{format(new Date(item.createdAt), 'MMM d, yyyy h:mm a')}</span>
                </div>
              </div>
            ))}
            <form onSubmit={(e) => { e.preventDefault(); handleAction('comment', { text: newComment }); }}>
              <textarea placeholder="Add an internal note..." value={newComment} onChange={e => setNewComment(e.target.value)} />
              <button type="submit">Post Note</button>
            </form>
          </div>
        </div>
        
        {/* Sidebar */}
        <aside className="detail-sidebar">
          <div className="sidebar-card">
            <h3>Details</h3>
            <ul className="details-list">
              <li><FaArrowUp /><strong>Upvotes:</strong> {report.upvoteCount || 0}</li>
              <li><FaTag /><strong>Category:</strong> {report.category}</li>
              <li><FaUser /><strong>Reporter:</strong> {report.reporterId?.name}</li>
              <li><FaBuilding /><strong>Assigned:</strong> {report.assignedDept?.name || 'N/A'}</li>
              <li><FaClock /><strong>Submitted:</strong> {format(new Date(report.createdAt), 'MMM d, yyyy')}</li>
            </ul>
          </div>
          
          <div className="sidebar-card">
            <h3>Actions</h3>
            <div className="action-item">
              <label>Change Status</label>
              <select value={report.status} onChange={(e) => handleAction('status', { status: e.target.value })}>
                {/* ... options ... */}
              </select>
            </div>
            <div className="action-item">
              <label>Assign Department</label>
              <select value={report.assignedDept?._id || ""} onChange={(e) => handleAction('assign', { departmentId: e.target.value })}>
                {/* ... department options ... */}
              </select>
            </div>
          </div>
          
          <div className="sidebar-card">
            <h3>Location</h3>
            <div className="detail-map">
              <MapContainer center={position} zoom={16} scrollWheelZoom={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={position} />
              </MapContainer>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
export default ReportDetailPage;