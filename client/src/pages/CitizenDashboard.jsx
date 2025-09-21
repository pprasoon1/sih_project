import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../components/Modal';
<<<<<<< HEAD
=======
import { useSocket } from '../context/SocketContext'; // 👈 use socket
import { toast } from 'react-hot-toast'; // 👈 toast notifications
import './CitizenDashboard.css';

// --- SVG Icon Components ---
const TitleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
    viewBox="0 0 24 24" fill="none" stroke="currentColor" 
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);
const DescIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
    viewBox="0 0 24 24" fill="none" stroke="currentColor" 
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);
const CategoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
    viewBox="0 0 24 24" fill="none" stroke="currentColor" 
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>
);
const MediaIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
    viewBox="0 0 24 24" fill="none" stroke="currentColor" 
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
    <circle cx="12" cy="13" r="4"></circle>
  </svg>
);
>>>>>>> 083cac110d260cf8a7699e1fb50e093ce38ca7f7

const CitizenDashboard = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('pothole');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [lng, setLng] = useState(null);
  const [lat, setLat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const socket = useSocket(); // 👈 get socket instance

  // ✅ Listen for report status updates
  useEffect(() => {
    if (!socket) return;

    socket.on("reportStatusUpdated", ({ reportId, status }) => {
      toast.success(`Your report has been updated to: ${status.replace("_", " ")}`);
    });

    return () => {
      socket.off("reportStatusUpdated");
    };
  }, [socket]);

  // Get user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLng(pos.coords.longitude);
        setLat(pos.coords.latitude);
      },
      (err) => console.error('⚠️ Location error:', err)
    );
  }, []);

  const handleFileChange = (e) => {
    setMediaFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const userToken = localStorage.getItem('token');
    if (!userToken) return toast.error('You must be logged in to submit a report.');
    if (!lng || !lat) return toast.error('Location not available. Please enable location services.');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('coordinates', JSON.stringify([lng, lat]));
    mediaFiles.forEach((file) => formData.append('media', file));

    setLoading(true);
    try {
      await axios.post('https://backend-sih-project-l67a.onrender.com/api/reports', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userToken}`,
        },
      });
      toast.success('Report submitted successfully!');
      setTitle('');
      setDescription('');
      setCategory('pothole');
      setMediaFiles([]);
      setStep(1);
      setShowConfirmation(false);
    } catch (err) {
      console.error('❌ Error creating report:', err);
      toast.error('Error submitting report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const categories = [
    { value: 'pothole', label: 'Pothole', icon: '🕳️' },
    { value: 'streetlight', label: 'Streetlight Outage', icon: '💡' },
    { value: 'garbage', label: 'Garbage', icon: '🗑️' },
    { value: 'water', label: 'Water Leak', icon: '💧' },
    { value: 'tree', label: 'Fallen Tree', icon: '🌳' },
    { value: 'other', label: 'Other', icon: '📋' }
  ];

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
<<<<<<< HEAD
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Describe the Issue</h3>
              <p className="text-gray-600">Provide details about the problem you've encountered</p>
            </div>

            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Issue Title</label>
                <input
                  type="text"
                  placeholder="e.g., Large pothole on Main Street"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  placeholder="Provide details like size, depth, and potential danger..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-input form-textarea"
                  rows="4"
                />
              </div>
            </div>

            <button 
              type="button" 
              onClick={nextStep} 
              className="btn btn-primary btn-full"
              disabled={!title}
            >
              Continue
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
=======
          <div className="form-step active">
            <h3 className="step-title">1. Describe the Issue</h3>
            <div className="input-wrapper">
              <TitleIcon />
              <input 
                type="text" 
                placeholder="e.g., Large pothole on Main Street" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
              />
            </div>
            <div className="input-wrapper">
              <DescIcon />
              <textarea 
                placeholder="Provide details like size, depth, and potential danger..." 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                rows="4" 
              />
            </div>
            <button 
              type="button" 
              onClick={nextStep} 
              className="btn btn-primary" 
              disabled={!title}
            >
              Next Step
>>>>>>> 083cac110d260cf8a7699e1fb50e093ce38ca7f7
            </button>
          </div>
        );

      case 2:
        return (
<<<<<<< HEAD
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Categorize & Upload</h3>
              <p className="text-gray-600">Select the category and add supporting evidence</p>
            </div>

            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Category</label>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        category === cat.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="text-2xl mb-2">{cat.icon}</div>
                      <div className="text-sm font-medium">{cat.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Photos/Videos (Optional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*,video/*"
                    capture="environment"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-600 mb-2">
                      {mediaFiles.length > 0 
                        ? `${mediaFiles.length} file(s) selected` 
                        : 'Click to upload photos or videos'
                      }
                    </p>
                    <p className="text-xs text-gray-500">Supports JPG, PNG, MP4 formats</p>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button 
                type="button" 
                onClick={prevStep} 
                className="btn btn-secondary flex-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <button 
                type="button" 
                onClick={() => setShowConfirmation(true)} 
                className="btn btn-primary flex-1"
              >
                Review & Submit
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
=======
          <div className="form-step active">
            <h3 className="step-title">2. Categorize & Upload</h3>
            <div className="input-wrapper">
              <CategoryIcon />
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="pothole">Pothole</option>
                <option value="streetlight">Streetlight Outage</option>
                <option value="garbage">Garbage</option>
                <option value="water">Water Leak</option>
                <option value="tree">Fallen Tree</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="input-wrapper file-input">
              <MediaIcon />
              <label htmlFor="file-upload">
                {mediaFiles.length > 0 
                  ? `${mediaFiles.length} file(s) selected` 
                  : 'Upload Photo/Video'}
              </label>
              <input 
                id="file-upload" 
                type="file" 
                accept="image/*,video/*" 
                capture="environment" 
                multiple 
                onChange={handleFileChange} 
              />
            </div>
            <div className="buttons-group">
              <button type="button" onClick={prevStep} className="btn-link">Go Back</button>
              <button type="button" onClick={() => setShowConfirmation(true)} className="btn btn-primary">
                Review & Submit
>>>>>>> 083cac110d260cf8a7699e1fb50e093ce38ca7f7
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Report an Issue</h1>
              <p className="text-gray-600">Help improve your community by reporting problems</p>
            </div>

            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-4">
                <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    1
                  </div>
                  <span className="ml-2 text-sm font-medium">Details</span>
                </div>
                <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    2
                  </div>
                  <span className="ml-2 text-sm font-medium">Evidence</span>
                </div>
              </div>
            </div>

            {/* Form Card */}
            <div className="card">
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  {renderStep()}
                </form>
              </div>
            </div>

            {/* Location Status */}
            <div className="mt-6 text-center">
              <div className="inline-flex items-center space-x-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>
                  {lng && lat ? 'Location detected ✓' : 'Detecting location...'}
                </span>
              </div>
            </div>
          </div>
<<<<<<< HEAD
=======
          <div className="progress-bar">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>
              <div className="dot"></div><span>Details</span>
            </div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <div className="dot"></div><span>Evidence</span>
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            {renderStep()}
          </form>
>>>>>>> 083cac110d260cf8a7699e1fb50e093ce38ca7f7
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal isOpen={showConfirmation} onClose={() => setShowConfirmation(false)}>
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Confirm Your Report</h3>
            <p className="text-gray-600">Please review your report before submitting</p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Issue Details</h4>
              <p className="text-sm text-gray-700"><strong>Title:</strong> {title}</p>
              <p className="text-sm text-gray-700"><strong>Description:</strong> {description || 'No description provided'}</p>
              <p className="text-sm text-gray-700"><strong>Category:</strong> {categories.find(c => c.value === category)?.label}</p>
              <p className="text-sm text-gray-700"><strong>Media:</strong> {mediaFiles.length} file(s) attached</p>
            </div>
          </div>

          <div className="flex space-x-4">
            <button 
              type="button" 
              onClick={() => setShowConfirmation(false)} 
              className="btn btn-secondary flex-1"
            >
              Edit Report
            </button>
            <button 
              type="button" 
              onClick={handleSubmit} 
              disabled={loading} 
              className="btn btn-primary flex-1"
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Submit Report
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
