import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { toast } from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './ReportDetailPage.css'; // We'll create this for styling

// --- (Leaflet icon fix from before) ---
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetinaUrl,
    iconUrl: iconUrl,
    shadowUrl: shadowUrl,
});
// ---

const ReportDetailPage = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [departments, setDepartments] = useState([]); // 👈 Add state for departments
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const fetchDetails = async () => {
      try {
        // Fetch both the report and the list of departments at the same time
        const [reportRes, deptsRes] = await Promise.all([
          axios.get(`/api/admin/reports/${reportId}`, { headers }),
          axios.get('/api/admin/departments', { headers })
        ]);
        setReport(reportRes.data);
        setDepartments(deptsRes.data);
      } catch (error) {
        toast.error("Failed to fetch details.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [reportId]);

  // --- Start: Action Handlers ---
  const handleStatusChange = async (newStatus) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.put(`/api/admin/reports/${reportId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReport(res.data); // Update the page with the latest report data
      toast.success("Status updated!");
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  const handleAssignDept = async (departmentId) => {
    if (!departmentId) return;
    const token = localStorage.getItem("token");
    try {
      const res = await axios.put(`/api/admin/reports/${reportId}/assign`,
        { departmentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReport(res.data); // Update the page with the latest report data
      toast.success("Department assigned!");
    } catch (err) {
      toast.error("Failed to assign department.");
    }
  };

  const handleEscalate = async () => {
    // ... (escalate function remains the same)
  };
  // --- End: Action Handlers ---

  if (loading) return <div>Loading report details...</div>;
  if (!report) return <div>Report not found. <Link to="/admin/dashboard">Go back</Link></div>;
  
  const position = [report.location.coordinates[1], report.location.coordinates[0]];

  return (
    <div className="report-detail-container">
      <div className="report-detail-header">
        <button onClick={() => navigate('/admin/dashboard')} className="back-button">← Back to Dashboard</button>
        <h1>{report.title}</h1>
        <button onClick={handleEscalate} className="btn-escalate">Escalate to DM</button>
      </div>
      <div className="report-detail-grid">
        <div className="detail-main-content">
          <img src={report.mediaUrls[0]} alt={report.title} className="detail-main-image" />
          <h3>Description</h3>
          <p>{report.description}</p>
        </div>
        <aside className="detail-sidebar">
          <div className="detail-map">
            <MapContainer center={position} zoom={16} style={{ height: '250px', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={position}><Popup>{report.title}</Popup></Marker>
            </MapContainer>
          </div>
          <h3>Details</h3>
          <ul className="details-list">
             {/* ... list items for status, category, etc. ... */}
          </ul>
          
          {/* 👇 Add the Actions section here */}
          <div className="detail-actions">
            <h3>Actions</h3>
            <div className="action-item">
              <label>Change Status</label>
              <select value={report.status} onChange={(e) => handleStatusChange(e.target.value)} className="action-select">
                  <option value="new">New</option>
                  <option value="acknowledged">Acknowledge</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
              </select>
            </div>
            <div className="action-item">
              <label>Assign Department</label>
              <select value={report.assignedDept?._id || ""} onChange={(e) => handleAssignDept(e.target.value)} className="action-select">
                  <option value="">Choose Department...</option>
                  {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                          {dept.name}
                      </option>
                  ))}
              </select>
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
};
export default ReportDetailPage;