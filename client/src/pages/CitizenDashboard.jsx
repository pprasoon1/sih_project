import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../components/Modal'; // Assuming you have a Modal component
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-hot-toast';
import './CitizenDashboard.css'; // For custom styles like the spinner

// --- Main Component ---
const CitizenDashboard = () => {
  // --- State Management ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('pothole');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [lng, setLng] = useState(null);
  const [lat, setLat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const socket = useSocket(); // Get socket instance from context

  // --- Effects ---

  // Listen for real-time report status updates via sockets
  useEffect(() => {
    if (!socket) return;

    const handleStatusUpdate = ({ reportId, status }) => {
      // You can enhance this by matching the reportId to a list of user's reports
      toast.success(`A report has been updated to: ${status.replace("_", " ")}`);
    };

    socket.on("reportStatusUpdated", handleStatusUpdate);

    // Cleanup listener on component unmount
    return () => {
      socket.off("reportStatusUpdated", handleStatusUpdate);
    };
  }, [socket]);

  // Get user's current location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLng(pos.coords.longitude);
          setLat(pos.coords.latitude);
        },
        (err) => {
          console.error('⚠️ Location error:', err);
          toast.error('Could not get location. Please enable location services.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser.');
    }
  }, []);

  // --- Event Handlers ---

  const handleFileChange = (e) => {
    if (e.target.files.length > 5) {
      toast.error("You can upload a maximum of 5 files.");
      return;
    }
    setMediaFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const userToken = localStorage.getItem('token');
    if (!userToken) {
      return toast.error('You must be logged in to submit a report.');
    }
    if (!lng || !lat) {
      return toast.error('Location not available. Please try again.');
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('coordinates', JSON.stringify([lng, lat]));
    mediaFiles.forEach((file) => formData.append('media', file));

    setLoading(true);
    try {
      // Replace with your actual API endpoint
      await axios.post('https://backend-sih-project-l67a.onrender.com/api/reports', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userToken}`,
        },
      });

      toast.success('Report submitted successfully! 🎉');
      // Reset form
      setTitle('');
      setDescription('');
      setCategory('pothole');
      setMediaFiles([]);
      setStep(1);
      setShowConfirmation(false);
    } catch (err) {
      console.error('❌ Error creating report:', err);
      const errorMessage = err.response?.data?.message || 'Error submitting report. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // --- Navigation ---
  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  // --- Data & Configuration ---
  const categories = [
    { value: 'pothole', label: 'Pothole', icon: '🕳️' },
    { value: 'streetlight', label: 'Streetlight Outage', icon: '💡' },
    { value: 'garbage', label: 'Garbage', icon: '🗑️' },
    { value: 'water', label: 'Water Leak', icon: '💧' },
    { value: 'tree', label: 'Fallen Tree', icon: '🌳' },
    { value: 'other', label: 'Other', icon: '📋' }
  ];

  // --- Step Renderer ---
  const renderStep = () => {
    switch (step) {
      case 1: // Describe the Issue
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Describe the Issue</h3>
              <p className="text-gray-600">Provide details about the problem you've encountered.</p>
            </div>
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Issue Title</label>
                <input type="text" placeholder="e.g., Large pothole on Main Street" value={title} onChange={(e) => setTitle(e.target.value)} className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea placeholder="Provide details like size, depth, and potential danger..." value={description} onChange={(e) => setDescription(e.target.value)} className="form-input form-textarea" rows="4" />
              </div>
            </div>
            <button type="button" onClick={nextStep} className="btn btn-primary btn-full" disabled={!title}>
              Continue
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        );

      case 2: // Categorize & Upload
        return (
          <div className="space-y-6 animate-fade-in">
             <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                   <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" /></svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Categorize & Upload</h3>
                <p className="text-gray-600">Select the category and add supporting evidence.</p>
             </div>
             <div className="space-y-4">
                <div className="form-group">
                   <label className="form-label">Category</label>
                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {categories.map((cat) => (
                         <button key={cat.value} type="button" onClick={() => setCategory(cat.value)} className={`p-4 rounded-lg border-2 transition-all text-center ${ category === cat.value ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}>
                            <div className="text-2xl mb-2">{cat.icon}</div>
                            <div className="text-sm font-medium">{cat.label}</div>
                         </button>
                      ))}
                   </div>
                </div>
                <div className="form-group">
                   <label className="form-label">Photos/Videos (Optional)</label>
                   <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <input id="file-upload" type="file" accept="image/*,video/*" capture="environment" multiple onChange={handleFileChange} className="hidden" />
                      <label htmlFor="file-upload" className="cursor-pointer">
                         <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                         <p className="text-sm text-blue-600 font-semibold mb-2">
                           {mediaFiles.length > 0 ? `${mediaFiles.length} file(s) selected` : 'Click to upload or take a picture'}
                         </p>
                         <p className="text-xs text-gray-500">Supports JPG, PNG, MP4 (Max 5 files)</p>
                      </label>
                   </div>
                </div>
             </div>
             <div className="flex space-x-4">
                <button type="button" onClick={prevStep} className="btn btn-secondary flex-1">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                   Back
                </button>
                <button type="button" onClick={() => setShowConfirmation(true)} className="btn btn-primary flex-1">
                   Review & Submit
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </button>
             </div>
          </div>
        );

      default:
        return null;
    }
  };

  // --- JSX Render ---
  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="container mx-auto">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Report a Civic Issue</h1>
              <p className="text-gray-600">Help improve your community by reporting problems.</p>
            </div>

            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-center">
                  <div className={`flex items-center transition-colors duration-300 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 ${ step >= 1 ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-200 text-gray-500 border-gray-200'}`}>1</div>
                      <span className="ml-2 font-medium">Details</span>
                  </div>
                  <div className={`flex-auto border-t-2 transition-colors duration-300 mx-4 ${step >= 2 ? 'border-blue-600' : 'border-gray-200'}`}></div>
                  <div className={`flex items-center transition-colors duration-300 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 ${ step >= 2 ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-200 text-gray-500 border-gray-200'}`}>2</div>
                      <span className="ml-2 font-medium">Evidence</span>
                  </div>
              </div>
            </div>

            {/* Form Card */}
            <div className="card">
              <div className="card-body">
                  {renderStep()}
              </div>
            </div>

            {/* Location Status */}
            <div className="mt-6 text-center">
              <div className="inline-flex items-center space-x-2 text-sm text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span>
                  {lng && lat ? `Location detected: ${lat.toFixed(4)}, ${lng.toFixed(4)} ✓` : 'Detecting location...'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal isOpen={showConfirmation} onClose={() => setShowConfirmation(false)}>
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Confirm Your Report</h3>
            <p className="text-gray-600">Please review the details before submitting.</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-2">Issue Details</h4>
              <p className="text-sm text-gray-700"><strong>Title:</strong> {title}</p>
              <p className="text-sm text-gray-700"><strong>Description:</strong> {description || <span className="text-gray-500">No description provided</span>}</p>
              <p className="text-sm text-gray-700"><strong>Category:</strong> {categories.find(c => c.value === category)?.label}</p>
              <p className="text-sm text-gray-700"><strong>Media:</strong> {mediaFiles.length} file(s) attached</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <button type="button" onClick={() => setShowConfirmation(false)} className="btn btn-secondary flex-1">
              Edit Report
            </button>
            <button type="button" onClick={handleSubmit} disabled={loading} className="btn btn-primary flex-1">
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  Confirm & Submit
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CitizenDashboard;