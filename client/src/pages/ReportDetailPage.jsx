import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { toast } from 'react-hot-toast';
import { FaArrowUp, FaTag, FaUser, FaBuilding, FaClock } from 'react-icons/fa';
import { format } from 'date-fns';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './ReportDetailPage.css';

// --- (Leaflet icon fix) ---
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });
// ---

// 👇 1. Helper component to fix map rendering bug
const MapResizeComponent = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);
  return null;
};


const ReportDetailPage = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  // We use useCallback to create a stable function for refetching
  const fetchData = React.useCallback(async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [detailsRes, deptsRes] = await Promise.all([
        axios.get(`https://backend-sih-project-l67a.onrender.com/api/admin/reports/${reportId}`, { headers }),
        axios.get('https://backend-sih-project-l67a.onrender.com/api/admin/departments', { headers })
      ]);
      setReport(detailsRes.data.report);
      setHistory(detailsRes.data.history);
      setDepartments(deptsRes.data);
    } catch (error) {
      toast.error("Failed to fetch details.");
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 👇 2. Reverted to separate, clear handler functions
  const handleStatusChange = async (newStatus) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`https://backend-sih-project-l67a.onrender.com/api/admin/reports/${reportId}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Status updated!");
      fetchData(); // Refetch to get latest history
    } catch (err) { toast.error("Failed to update status."); }
  };

  const handleAssignDept = async (departmentId) => {
    if (!departmentId) return;
    const token = localStorage.getItem('token');
    try {
      await axios.put(`https://backend-sih-project-l67a.onrender.com/api/admin/reports/${reportId}/assign`, { departmentId }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Department assigned!");
      fetchData();
    } catch (err) { toast.error("Failed to assign department."); }
  };
  
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const token = localStorage.getItem('token');
    try {
      await axios.post(`https://backend-sih-project-l67a.onrender.com/api/reports/${reportId}/comments`, { text: newComment }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Comment posted!");
      setNewComment("");
      fetchData();
    } catch (error) { toast.error("Failed to post comment."); }
  };

  const handleEscalate = async () => {
    const token = localStorage.getItem('token');
    const toastId = toast.loading('Escalating report...');
    try {
      await axios.post(`https://backend-sih-project-l67a.onrender.com/api/admin/reports/${reportId}/escalate`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Report successfully escalated.', { id: toastId });
      fetchData();
    } catch (error) { toast.error('Failed to escalate report.', { id: toastId }); }
  };

  if (loading) return <div>Loading...</div>;
  if (!report) return <div>Report not found.</div>;

  const position = [report.location.coordinates[1], report.location.coordinates[0]];

  return (
    <div className="report-detail-container">
      <div className="report-detail-header">
        <div>
          <button onClick={() => navigate('/admin/dashboard')} className="back-button">← Back</button>
          <h1>{report.title}</h1>
          <span className={`status-tag ${report.status}`}>{report.status.replace('_', ' ')}</span>
        </div>
        <button onClick={handleEscalate} className="btn-escalate">Escalate to DM</button>
      </div>
      
      <div className="report-detail-grid">
        <div className="detail-main-content">
          <img src={report.mediaUrls[0]} alt={report.title} className="detail-main-image" />
          <div className="activity-feed">
            <h3>Activity Feed</h3>
            <div className="comments-list">
              {history.map(item => (
                <div key={item._id || item.id} className="comment-item">
                  <div className="comment-header">
                    <FaUser className="comment-user-icon" />
                    <span className="comment-user">{item.user?.name || item.userName || "System"}</span>
                    <FaClock className="comment-time-icon" />
                    <span className="comment-time">{item.createdAt ? format(new Date(item.createdAt), 'PPpp') : ""}</span>
                  </div>
                  <div className="comment-body">
                    {item.text || item.action || ""}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleAddComment}>
              <textarea placeholder="Add an internal note..." value={newComment} onChange={e => setNewComment(e.target.value)} />
              <button type="submit">Post Note</button>
            </form>
          </div>
        </div>
        
        <aside className="detail-sidebar">
          <div className="sidebar-card">
            <h3>Details</h3>
            <ul className="details-list">
              <li><FaArrowUp /><strong>Upvotes:</strong> {report.upvoteCount || 0}</li>
              {/* ... other details ... */}
            </ul>
          </div>
          
          <div className="sidebar-card">
            <h3>Actions</h3>
            <div className="action-item">
              <label>Change Status</label>
              {/* 👇 3. Correctly wire the onChange handler and add options */}
              <select value={report.status} onChange={(e) => handleStatusChange(e.target.value)}>
                  <option value="new">New</option>
                  <option value="acknowledged">Acknowledge</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
              </select>
            </div>
            <div className="action-item">
              <label>Assign Department</label>
              {/* 👇 3. Correctly wire the onChange handler and add options */}
              <select value={report.assignedDept?._id || ""} onChange={(e) => handleAssignDept(e.target.value)}>
                  <option value="">Choose Department...</option>
                  {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                          {dept.name}
                      </option>
                  ))}
              </select>
            </div>
          </div>
          
          <div className="sidebar-card">
            <h3>Location</h3>
            <div className="detail-map">
              <MapContainer center={position} zoom={16} scrollWheelZoom={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={position} />
                <MapResizeComponent /> {/* 👈 Add the resize helper here */}
              </MapContainer>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
export default ReportDetailPage;