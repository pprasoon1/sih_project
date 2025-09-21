import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useSocket } from '../context/SocketContext';
import AdminMap from "./AdminMap";
import { FaPhone, FaCommentDots, FaArrowRight, FaMapMarkerAlt } from "react-icons/fa";

const ReportInfoCard = ({ report }) => {
  if (!report) return null;

  return (
    <div className="absolute bottom-12 left-8 z-[1000] w-11/12 max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl animate-fade-in-up">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <span className="text-sm font-semibold text-slate-500">
            Report ID #{(report._id || 'N/A').substring(0, 8)}...
          </span>
          <h3 className="mt-1 text-2xl font-bold text-slate-900">{report.title || 'Untitled Report'}</h3>
          <div className="mt-2 flex items-center gap-2 text-slate-600">
            <FaMapMarkerAlt />
            <span className="font-medium">{report.category || 'No Category'}</span>
          </div>
        </div>
        <div className="w-full md:w-auto">
          <Link
            to={`/admin/report/${report._id}`}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-700"
          >
            View Details <FaArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [activeFilter, setActiveFilter] = useState('in_progress');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socket = useSocket();

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        setError("You must be logged in as an admin.");
        setLoading(false);
        return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const reportsRes = await axios.get(`https://backend-sih-project-l67a.onrender.com/api/admin/reports`, { headers });
      const validReports = Array.isArray(reportsRes.data) ? reportsRes.data : [];
      setReports(validReports);
      
      if (validReports.length > 0) {
        setSelectedReport(validReports[0]);
      }
      setError(null);
    } catch (err) {
      console.error("❌ Error fetching initial data:", err);
      setError("Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!socket) return;
    const handleNewReport = () => {
      toast.success(`New report submitted!`);
      fetchData();
    };
    socket.on('newReport', handleNewReport);
    return () => socket.off('newReport', handleNewReport);
  }, [socket, fetchData]);

  const getStatusStyles = (status) => {
    const baseStyles = "inline-block flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold";
    switch (status) {
      case 'in_progress': return `${baseStyles} bg-emerald-500 text-white`;
      case 'new': return `${baseStyles} bg-sky-500 text-white`;
      case 'acknowledged': return `${baseStyles} bg-amber-500 text-white`;
      case 'resolved': return `${baseStyles} bg-slate-200 text-slate-700`;
      default: return `${baseStyles} bg-slate-200 text-slate-700`;
    }
  };

  const filteredReports = reports.filter(report => {
    if (!report || !report.status) return false;
    if (activeFilter === 'in_progress') {
      return ['new', 'acknowledged', 'in_progress'].includes(report.status);
    }
    if (activeFilter === 'resolved') {
      return report.status === 'resolved';
    }
    return false;
  });

  if (loading) { return <div>Loading...</div> }
  if (error) { return <div>Error: {error}</div> }

  return (
    <div className="relative flex h-screen w-full bg-white font-sans text-slate-800">
      {/* Left Panel */}
      <div className="z-10 flex w-full max-w-md flex-shrink-0 flex-col border-r border-slate-200 bg-white md:max-w-lg">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setActiveFilter('in_progress')}
              className={`rounded-full px-5 py-2 font-semibold transition ${
                activeFilter === 'in_progress' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setActiveFilter('resolved')}
              className={`rounded-full px-5 py-2 font-semibold transition ${
                activeFilter === 'resolved' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Resolved
            </button>
          </div>
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto px-6 pb-6">
          {filteredReports.map((report) => (
            <button
              key={report._id}
              onClick={() => setSelectedReport(report)}
              className={`w-full rounded-2xl border-2 p-4 text-left transition ${
                selectedReport?._id === report._id ? 'border-slate-900 bg-slate-50' : 'border-transparent hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{report.title || 'Untitled Report'}</h3>
                  <p className="text-sm text-slate-500">ID: {(report._id || 'N/A').substring(0, 12)}...</p>
                </div>
                <span className={getStatusStyles(report.status)}>
                  {report.status.replace('_', ' ')}
                </span>
              </div>
              {selectedReport?._id === report._id && (
                <div className="mt-4 border-t border-slate-200 pt-4">
                  <div className="text-sm">
                    <p><span className="font-semibold">Category:</span> {report.category || 'N/A'}</p>
                    <p><span className="font-semibold">Assigned:</span> {report.assignedDept?.name || 'Unassigned'}</p>
                    <p><span className="font-semibold">Date:</span> {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <button className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 transition hover:bg-slate-300"><FaPhone /></button>
                    <button className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 transition hover:bg-slate-300"><FaCommentDots /></button>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="relative flex-1">
        <AdminMap reports={reports} selectedReport={selectedReport} />
        <ReportInfoCard report={selectedReport} />
      </div>
    </div>
  );
};

export default AdminDashboard;