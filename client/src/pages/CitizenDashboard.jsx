import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-hot-toast';

// --- Components (could be in separate files) ---
import Modal from '../components/Modal';
import { Step1_DescribeIssue } from './Dashboard/Step1_DescribeIssue';
import { Step2_CategorizeUpload } from './Dashboard/Step2_CategorizeUpload';
import { ConfirmationView } from './Dashboard/ConfirmationView';

import './CitizenDashboard.css'; // For custom styles

// --- Constants ---
const CATEGORIES = [
  { value: 'pothole', label: 'Pothole', icon: '🕳️' },
  { value: 'streetlight', label: 'Streetlight', icon: '💡' },
  { value: 'garbage', label: 'Garbage', icon: '🗑️' },
  { value: 'water', label: 'Water Leak', icon: '💧' },
  { value: 'tree', label: 'Fallen Tree', icon: '🌳' },
  { value: 'other', label: 'Other', icon: '📋' }
];

// --- Main Component ---
const CitizenDashboard = () => {
  // --- State Management ---
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'pothole',
    mediaFiles: [],
  });
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const socket = useSocket();

  // --- Effects ---

  // Location detection
  useEffect(() => {
    if (!navigator.geolocation) {
      return toast.error('Geolocation is not supported by your browser.');
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        console.error('⚠️ Location error:', err);
        toast.error('Could not get location. Please enable it in your browser settings.');
      }
    );
  }, []);

  // Socket listener for real-time updates
  useEffect(() => {
    if (!socket) return;
    const handleStatusUpdate = ({ reportId, status }) => {
      toast.success(`Report status updated: ${status.replace("_", " ")}`, { icon: '🔔' });
    };
    socket.on("reportStatusUpdated", handleStatusUpdate);
    return () => socket.off("reportStatusUpdated", handleStatusUpdate);
  }, [socket]);

  // Cleanup for media preview URLs to prevent memory leaks
  useEffect(() => {
    return () => mediaPreviews.forEach(url => URL.revokeObjectURL(url));
  }, [mediaPreviews]);


  // --- Event Handlers ---

  const handleDataChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.mediaFiles.length > 5) {
      return toast.error("You can upload a maximum of 5 files.");
    }
    setFormData(prev => ({ ...prev, mediaFiles: [...prev.mediaFiles, ...files] }));
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setMediaPreviews(prev => [...prev, ...newPreviews]);
  };

  const handleRemoveFile = (indexToRemove) => {
    // Revoke the specific URL to free memory
    URL.revokeObjectURL(mediaPreviews[indexToRemove]);

    setFormData(prev => ({
      ...prev,
      mediaFiles: prev.mediaFiles.filter((_, index) => index !== indexToRemove)
    }));
    setMediaPreviews(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async () => {
    if (loading) return;

    const userToken = localStorage.getItem('token');
    if (!userToken) return toast.error('Please log in to submit a report.');
    if (!location.lat || !location.lng) return toast.error('Location not available. Cannot submit report.');

    const apiFormData = new FormData();
    apiFormData.append('title', formData.title);
    apiFormData.append('description', formData.description);
    apiFormData.append('category', formData.category);
    apiFormData.append('coordinates', JSON.stringify([location.lng, location.lat]));
    formData.mediaFiles.forEach((file) => apiFormData.append('media', file));

    setLoading(true);
    try {
      await axios.post('https://backend-sih-project-l67a.onrender.com/api/reports', apiFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userToken}`,
        },
      });

      toast.success('Report submitted successfully! 🎉');
      resetForm();
    } catch (err) {
      console.error('❌ Error creating report:', err);
      toast.error(err.response?.data?.message || 'Error submitting report.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', category: 'pothole', mediaFiles: [] });
    setMediaPreviews([]);
    setShowConfirmation(false);
    setStep(1);
  };
  
  // --- Navigation ---
  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  // --- Step Renderer ---
  const renderStepContent = () => {
    const animationKey = `step-${step}`; // Ensures animation triggers on step change
    switch (step) {
      case 1:
        return (
          <div key={animationKey} className="animate-slide-in">
            <Step1_DescribeIssue
              data={formData}
              onDataChange={handleDataChange}
              onNext={nextStep}
            />
          </div>
        );
      case 2:
        return (
          <div key={animationKey} className="animate-slide-in">
            <Step2_CategorizeUpload
              data={formData}
              categories={CATEGORIES}
              mediaPreviews={mediaPreviews}
              onDataChange={handleDataChange}
              onFileChange={handleFileChange}
              onFileRemove={handleRemoveFile}
              onBack={prevStep}
              onNext={() => setShowConfirmation(true)}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 tracking-tight">Report a Civic Issue</h1>
            <p className="mt-3 text-lg text-slate-600">Help improve your community by reporting issues that need attention.</p>
            {/* AI Assistant Button - Restored vibrant style */}
            <Link to="/agent" className="mt-6 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg transform hover:scale-105">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Try AI Assistant Chat
            </Link>
          </header>

          <div className="mb-8">
            <div className="flex items-center">
              {[ "Details", "Evidence" ].map((label, index) => (
                <React.Fragment key={label}>
                  <div className={`flex items-center transition-colors duration-300 ${step >= (index + 1) ? 'text-indigo-600' : 'text-slate-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${ step > (index + 1) ? 'bg-indigo-600 border-indigo-600 text-white' : step === (index + 1) ? 'border-indigo-600 bg-white' : 'border-slate-300 bg-slate-50' }`}>
                      {step > (index + 1) ? '✓' : index + 1}
                    </div>
                    <span className="ml-3 font-medium hidden sm:block">{label}</span>
                  </div>
                  {index < 1 && (
                    <div className={`flex-auto border-t-2 transition-colors duration-500 mx-4 ${step > (index + 1) ? 'border-indigo-600' : 'border-slate-300'}`}></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50">
            <fieldset disabled={loading} className="p-6 sm:p-8">
              {renderStepContent()}
            </fieldset>
          </div>

          <div className="mt-6 text-center text-sm text-slate-500">
            {location.lat ? (
              <span className="inline-flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                Location acquired
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <div className="spinner-tiny"></div>
                Acquiring location...
              </span>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={showConfirmation} onClose={() => setShowConfirmation(false)}>
        <ConfirmationView
          data={formData}
          categories={CATEGORIES}
          mediaPreviews={mediaPreviews}
          onClose={() => setShowConfirmation(false)}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </Modal>
    </>
  );
};

export default CitizenDashboard;