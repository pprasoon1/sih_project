import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../components/Modal'; // 1. Import the new Modal component
import './CitizenDashboard.css';

// (Keep your Icon components here as they were before)
const TitleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const DescIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>;
const CategoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>;
const MediaIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>;

const CitizenDashboard = () => {
  // ... all your existing state and functions (useState, useEffect, handleSubmit, etc.) remain exactly the same ...
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('pothole');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [lng, setLng] = useState(null);
  const [lat, setLat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);


  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLng(pos.coords.longitude);
          setLat(pos.coords.latitude);
        },
        (err) => {
          console.error('⚠️ Location error:', err);
        }
      );
    }
  }, []);

  const handleFileChange = (e) => {
    setMediaFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowConfirmation(false);

    const userToken = localStorage.getItem('token');
    if (!userToken) {
      alert('You are not logged in. Please log in to submit a report.');
      return;
    }

    if (!lng || !lat) {
      alert('Location not available. Please enable location services.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('coordinates', JSON.stringify([lng, lat]));

    mediaFiles.forEach((file) => {
      formData.append('media', file);
    });

    try {
      setLoading(true);
      await axios.post('https://backend-sih-project-l67a.onrender.com/api/reports', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userToken}`,
        },
      });
      alert('Report submitted successfully!');

      setTitle('');
      setDescription('');
      setCategory('pothole');
      setMediaFiles([]);
      setStep(1);
    } catch (err) {
      console.error('❌ Error creating report:', err);
      alert('Error submitting report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="form-step">
            <h3 className="step-title">1. Describe the Issue</h3>
            <div className="input-wrapper">
              <TitleIcon />
              <input type="text" placeholder="Title of the issue" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="input-wrapper">
              <DescIcon />
              <textarea placeholder="Provide a detailed description..." value={description} onChange={(e) => setDescription(e.target.value)} rows="4" />
            </div>
            <button type="button" onClick={nextStep} className="btn btn-primary">Next Step</button>
          </div>
        );
      case 2:
        return (
          <div className="form-step">
            <h3 className="step-title">2. Categorize & Upload</h3>
             <div className="input-wrapper">
                <CategoryIcon />
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="pothole">Pothole</option>
                    <option value="streetlight">Streetlight Outage</option>
                    <option value="garbage">Illegal Dumping</option>
                    <option value="water">Water Leak</option>
                    <option value="tree">Fallen Tree</option>
                    <option value="other">Other</option>
                </select>
             </div>
            <div className="input-wrapper">
                <MediaIcon />
                <input type="file" accept="image/*,video/*" capture="environment" multiple onChange={handleFileChange} />
            </div>
            <div className="buttons-group">
              <button type="button" onClick={prevStep} className="btn-link">Go Back</button>
              <button type="button" onClick={() => setShowConfirmation(true)} className="btn btn-primary">Review & Submit</button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <> {/* Use a Fragment to return multiple top-level elements */}
      <div className="adv-dashboard-container">
        {/* The main dashboard card. No more blurring logic needed here. */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Submit a Civic Report</h2>
            <p>Help improve your community by reporting issues.</p>
          </div>
          <div className="progress-bar">
            <div className={`step ${step >= 1 ? 'active' : ''}`}><div className="dot"></div><span>Details</span></div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}><div className="dot"></div><span>Evidence</span></div>
          </div>
          <form onSubmit={handleSubmit}>
            {renderStep()}
          </form>
        </div>
      </div>

      {/* 2. Use the Modal component for the confirmation dialog */}
      <Modal isOpen={showConfirmation} onClose={() => setShowConfirmation(false)}>
        <div className="confirmation-content">
          <h3>Confirm Your Report</h3>
          <p><strong>Title:</strong> {title}</p>
          <p><strong>Description:</strong> {description}</p>
          <p><strong>Category:</strong> {category}</p>
          <p><strong>Files:</strong> {mediaFiles.length} selected</p>
          <div className="buttons-group">
            <button onClick={() => setShowConfirmation(false)} className="btn-link">Edit</button>
            <button onClick={handleSubmit} disabled={loading} className="btn btn-primary">
              {loading ? 'Submitting...' : 'Confirm & Submit'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CitizenDashboard;