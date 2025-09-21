import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { toast } from 'react-hot-toast';
import { FaArrowUp, FaTag, FaUser, FaBuilding, FaClock, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';
import { format, formatDistanceToNow } from 'date-fns';

const MapResizeComponent = () => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

const getStatusStyles = (status) => {
    const baseStyles = "inline-block flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize";
    switch (status) {
      case 'in_progress': return `${baseStyles} bg-emerald-100 text-emerald-800`;
      case 'new': return `${baseStyles} bg-sky-100 text-sky-800`;
      case 'acknowledged': return `${baseStyles} bg-amber-100 text-amber-800`;
      case 'resolved': return `${baseStyles} bg-slate-100 text-slate-700`;
      default: return `${baseStyles} bg-slate-100 text-slate-700`;
    }
};

const ReportDetailPage = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
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
    } catch {
      toast.error("Failed to fetch details.");
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusChange = async (newStatus) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`https://backend-sih-project-l67a.onrender.com/api/admin/reports/${reportId}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Status updated!");
      fetchData();
    } catch { toast.error("Failed to update status."); }
  };

  const handleAssignDept = async (departmentId) => {
    if (!departmentId) return;
    const token = localStorage.getItem('token');
    try {
      await axios.put(`https://backend-sih-project-l67a.onrender.com/api/admin/reports/${reportId}/assign`, { departmentId }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Department assigned!");
      fetchData();
    } catch { toast.error("Failed to assign department."); }
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
    } catch { toast.error("Failed to post comment."); }
  };

  const handleEscalate = async () => {
    const token = localStorage.getItem('token');
    const toastId = toast.loading('Escalating report...');
    try {
      await axios.post(`https://backend-sih-project-l67a.onrender.com/api/admin/reports/${reportId}/escalate`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Report successfully escalated.', { id: toastId });
      fetchData();
    } catch { toast.error('Failed to escalate report.', { id: toastId }); }
  };

  if (loading) return <div className="flex h-screen items-center justify-center font-semibold">Loading report details...</div>;
  if (!report) return <div className="flex h-screen items-center justify-center font-semibold">Report not found.</div>;

  const position = [report.location.coordinates[1], report.location.coordinates[0]];

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* ## Header ## */}
        <header className="mb-8">
          <button onClick={() => navigate('/admin/dashboard')} className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900">
            <FaArrowLeft />
            Back to Dashboard
          </button>
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-slate-900">{report.title}</h1>
              <span className={getStatusStyles(report.status)}>{report.status.replace('_', ' ')}</span>
            </div>
            <button onClick={handleEscalate} className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700">
              <FaExclamationTriangle />
              Escalate to DM
            </button>
          </div>
        </header>

        {/* ## Main Content Grid ## */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* ## Main Content (Left) ## */}
          <main className="lg:col-span-2 space-y-8">
            
            {/* ## Visual Evidence & Location - Horizontal Grid ## */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              
              {/* Visual Evidence */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-6 text-xl font-bold text-slate-900">Visual Evidence</h3>
                
                {/* Before Photo */}
                <div className="mb-6">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-700">Submitted Issue</h4>
                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">Before</span>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <img 
                      src={report.mediaUrls[0]} 
                      alt="Issue submission" 
                      className="aspect-[4/3] w-full object-cover" 
                    />
                  </div>
                </div>

                {/* After Photo */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-700">Resolution Status</h4>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                      report.resolvedMediaUrls?.length > 0 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {report.resolvedMediaUrls?.length > 0 ? 'After' : 'Pending'}
                    </span>
                  </div>
                  
                  {report.resolvedMediaUrls?.length > 0 ? (
                    <div className="overflow-hidden rounded-xl border border-slate-200">
                      <img 
                        src={report.resolvedMediaUrls[0]} 
                        alt="Issue resolved" 
                        className="aspect-[4/3] w-full object-cover" 
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-[4/3] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50">
                      <div className="text-center">
                        <div className="mx-auto h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center mb-3">
                          <FaClock className="text-slate-500" />
                        </div>
                        <p className="text-sm font-medium text-slate-600">Awaiting Resolution</p>
                        <p className="text-xs text-slate-500 mt-1">Photo will appear once issue is resolved</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Location Map */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-6 text-xl font-bold text-slate-900">Location Details</h3>
                
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <MapContainer 
                      center={position} 
                      zoom={16} 
                      scrollWheelZoom={false} 
                      style={{ height: "300px", width: "100%" }}
                    >
                      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                      <Marker position={position} />
                      <MapResizeComponent />
                    </MapContainer>
                  </div>
                  
                  <div className="rounded-lg bg-slate-50 p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-slate-600">Latitude:</span>
                        <p className="text-slate-800 font-mono">{position[0].toFixed(6)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">Longitude:</span>
                        <p className="text-slate-800 font-mono">{position[1].toFixed(6)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ## Activity Feed ## */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-6 text-xl font-bold text-slate-900">Activity Timeline</h3>
              
              <div className="space-y-6">
                {history.map((item, index) => (
                  <div key={item._id || item.id} className="flex gap-4">
                    <div className="relative flex flex-col items-center">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 border-2 border-white shadow-sm">
                        <FaUser className="text-slate-500 text-sm" />
                      </div>
                      {index < history.length - 1 && (
                        <div className="mt-2 h-full w-0.5 bg-slate-200"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 pb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-slate-800">
                            {item.user?.name || "System"}
                          </span>
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                            {item.action ? 'Action' : 'Comment'}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">
                          {item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true }) : ''}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                        {item.text || item.action}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="mt-8 border-t border-slate-200 pt-6">
                <div className="space-y-4">
                  <textarea
                    placeholder="Add an internal note or update about this report..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    className="w-full rounded-xl border-slate-300 p-4 text-sm shadow-sm transition focus:border-indigo-500 focus:ring-indigo-500 resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <button 
                      type="submit" 
                      className="rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
                      disabled={!newComment.trim()}
                    >
                      Post Update
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </main>

          {/* ## Enhanced Sidebar ## */}
          <aside className="lg:col-span-1 space-y-6">
            
            {/* Report Details */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-xl font-bold text-slate-900">Report Information</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-3">
                    <FaArrowUp className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">Community Support</span>
                  </div>
                  <span className="font-bold text-slate-900">{report.upvoteCount || 0}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-3">
                    <FaTag className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">Category</span>
                  </div>
                  <span className="font-medium text-slate-900 capitalize">{report.category}</span>
                </div>

                {report.user?.name && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-3">
                      <FaUser className="text-slate-400" />
                      <span className="text-sm font-medium text-slate-700">Reporter</span>
                    </div>
                    <span className="font-medium text-slate-900">{report.user.name}</span>
                  </div>
                )}

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-3">
                    <FaBuilding className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">Department</span>
                  </div>
                  <span className="font-medium text-slate-900">
                    {report.assignedDept?.name || 'Unassigned'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-3">
                    <FaClock className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">Submitted</span>
                  </div>
                  <span className="font-medium text-slate-900">
                    {report.createdAt ? format(new Date(report.createdAt), 'MMM d, yyyy') : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-xl font-bold text-slate-900">Quick Actions</h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Update Status</label>
                  <select 
                    value={report.status} 
                    onChange={(e) => handleStatusChange(e.target.value)} 
                    className="w-full rounded-xl border-slate-300 text-sm shadow-sm transition focus:border-indigo-500 focus:ring-indigo-500 p-3"
                  >
                    <option value="new">🆕 New</option>
                    <option value="acknowledged">👀 Acknowledged</option>
                    <option value="in_progress">⚡ In Progress</option>
                    <option value="resolved">✅ Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Assign Department</label>
                  <select 
                    value={report.assignedDept?._id || ""} 
                    onChange={(e) => handleAssignDept(e.target.value)} 
                    className="w-full rounded-xl border-slate-300 text-sm shadow-sm transition focus:border-indigo-500 focus:ring-indigo-500 p-3"
                  >
                    <option value="">🏛️ Select Department...</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Priority Indicator */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <FaExclamationTriangle className="text-amber-600" />
                <h3 className="text-lg font-bold text-amber-800">Priority Level</h3>
              </div>
              <p className="text-sm text-amber-700 mb-4">
                Based on community engagement and urgency indicators.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-amber-700">Current Priority:</span>
                <span className="rounded-full bg-amber-200 px-3 py-1 text-sm font-bold text-amber-800">
                  {report.upvoteCount > 10 ? 'High' : report.upvoteCount > 5 ? 'Medium' : 'Low'}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailPage;