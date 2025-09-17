import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CitizenDashboard.css';

const CitizenDashboard = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('pothole');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [lng, setLng] = useState(null);
  const [lat, setLat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Auto detect location
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

  // File input change
  const handleFileChange = (e) => {
    setMediaFiles(Array.from(e.target.files));
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

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
      const res = await axios.post('http://localhost:5001/api/reports', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userToken}`,
        },
      });
      console.log('✅ Report created:', res.data);
      alert('Report submitted successfully!');

      // reset form
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

  return (
    <div className="dashboard-container">
      <div className="dashboard-form">
        <h2 className="dashboard-title">Report a Civic Issue</h2>
        <p className="dashboard-subtitle">Let's make our community better, one report at a time.</p>
        
        <div className="progress-bar">
            <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1</div>
            <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2</div>
            <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>3</div>
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="form-step">
              <label>What's the issue?</label>
              <input
                type="text"
                placeholder="e.g., Large pothole on Main Street"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <label>Describe the issue in more detail</label>
              <textarea
                placeholder="Provide details like the size of the pothole, potential hazards, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
              />
              <button type="button" onClick={nextStep} className="next-button">Next</button>
            </div>
          )}

          {step === 2 && (
            <div className="form-step">
              <label>Select a category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="pothole">Pothole</option>
                <option value="streetlight">Streetlight Outage</option>
                <option value="garbage">Illegal Dumping</option>
                <option value="water">Water Leak</option>
                <option value="tree">Fallen Tree</option>
                <option value="other">Other</option>
              </select>
              <div className="buttons-group">
                <button type="button" onClick={prevStep} className="prev-button">Back</button>
                <button type="button" onClick={nextStep} className="next-button">Next</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-step">
              <label>Upload Photos or Videos</label>
              <input
                type="file"
                accept="image/*,video/*"
                capture="environment"
                multiple
                onChange={handleFileChange}
              />
               <div className="buttons-group">
                <button type="button" onClick={prevStep} className="prev-button">Back</button>
                <button type="submit" disabled={loading} className="submit-report-button">
                    {loading ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CitizenDashboard;