import React, { useState, useEffect, useCallback } from 'react';
import VoiceRecorder from '../components/VoiceRecorder';
import ImageCapture from '../components/ImageCapture';
import ReportProgress from '../components/ReportProgress';
import EditModal from '../components/EditModal';

const AgenticReportPage = () => {
  const [sessionId, setSessionId] = useState(null);
  const [stage, setStage] = useState('initializing');
  const [reportData, setReportData] = useState(null);
  const [inputs, setInputs] = useState({
    image: null,
    voiceTranscript: null,
    location: null
  });
  const [timeLeft, setTimeLeft] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Initialize session
  useEffect(() => {
    initializeSession();
    getCurrentLocation();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1000;
          if (newTime <= 0) {
            // Auto-submit when timer expires
            if (stage === 'ready_to_submit') {
              handleAutoSubmit();
            }
          }
          return newTime;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, stage]);

  const initializeSession = async () => {
    try {
      const response = await fetch('/api/agentic/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setSessionId(data.sessionId);
        setStage('collecting_inputs');
      } else {
        setError('Failed to initialize session');
      }
    } catch (error) {
      console.error('Error initializing session:', error);
      setError('Failed to initialize session');
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setInputs(prev => ({
            ...prev,
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          }));
        },
        (error) => {
          console.warn('Location access denied:', error);
        }
      );
    }
  };

  const handleImageCapture = (imageFile) => {
    setInputs(prev => ({ ...prev, image: imageFile }));
    checkAndSubmitInputs(imageFile, inputs.voiceTranscript);
  };

  const handleVoiceTranscript = (transcript) => {
    setInputs(prev => ({ ...prev, voiceTranscript: transcript }));
    checkAndSubmitInputs(inputs.image, transcript);
  };

  const checkAndSubmitInputs = useCallback((image, voice) => {
    if ((image || voice) && !isProcessing) {
      // Auto-submit if we have at least one input
      setTimeout(() => {
        submitInputs(image, voice);
      }, 2000); // Give user 2 seconds to provide both inputs if they want
    }
  }, [isProcessing]);

  const submitInputs = async (imageFile = inputs.image, voiceText = inputs.voiceTranscript) => {
    if (!sessionId || isProcessing) return;

    setIsProcessing(true);
    setStage('analyzing');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('sessionId', sessionId);
      
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      if (voiceText) {
        formData.append('voiceTranscript', voiceText);
      }
      
      if (inputs.location) {
        formData.append('latitude', inputs.location.latitude.toString());
        formData.append('longitude', inputs.location.longitude.toString());
      }

      const response = await fetch('/api/agentic/upload-inputs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        setReportData(data.reportData);
        setStage('ready_to_submit');
        setTimeLeft(data.editTimer || 15000);
      } else {
        setError(data.message || 'Failed to analyze inputs');
        setStage('collecting_inputs');
      }

    } catch (error) {
      console.error('Error submitting inputs:', error);
      setError('Failed to process inputs');
      setStage('collecting_inputs');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAutoSubmit = async () => {
    if (!sessionId || !reportData) return;

    try {
      const response = await fetch('/api/agentic/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ sessionId })
      });

      const data = await response.json();
      
      if (data.success) {
        setStage('submitted');
        // Show success message or redirect
        setTimeout(() => {
          alert(`Report submitted successfully! Report ID: ${data.report._id}. You earned ${data.pointsEarned} points!`);
        }, 1000);
      } else {
        setError(data.message || 'Failed to submit report');
      }

    } catch (error) {
      console.error('Error submitting report:', error);
      setError('Failed to submit report');
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleSaveEdit = async (updatedData) => {
    try {
      const response = await fetch('/api/agentic/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          sessionId,
          updates: updatedData
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setReportData(data.reportData);
        setShowEditModal(false);
      } else {
        setError(data.message || 'Failed to update report');
      }

    } catch (error) {
      console.error('Error updating report:', error);
      setError('Failed to update report');
    }
  };

  const resetSession = () => {
    setSessionId(null);
    setStage('initializing');
    setReportData(null);
    setInputs({ image: null, voiceTranscript: null, location: null });
    setTimeLeft(0);
    setError(null);
    initializeSession();
  };

  return (
    <div className="agentic-report-page">
      <div className="header">
        <h1>🤖 AI-Powered Report Submission</h1>
        <p>Provide image and/or voice input - AI will handle the rest!</p>
      </div>

      {error && (
        <div className="error-banner">
          <p>❌ {error}</p>
          <button onClick={resetSession} className="retry-btn">
            🔄 Try Again
          </button>
        </div>
      )}

      <ReportProgress 
        stage={stage}
        reportData={reportData}
        timeLeft={timeLeft}
        onEdit={handleEdit}
      />

      {stage === 'collecting_inputs' && (
        <div className="input-collection">
          <div className="input-section">
            <h3>📸 Capture Issue Image</h3>
            <ImageCapture 
              onImageCapture={handleImageCapture}
              disabled={isProcessing}
            />
          </div>

          <div className="input-section">
            <h3>🎤 Describe the Issue</h3>
            <VoiceRecorder 
              onTranscript={handleVoiceTranscript}
              disabled={isProcessing}
            />
          </div>

          <div className="input-status">
            <div className={`status-item ${inputs.image ? 'completed' : ''}`}>
              {inputs.image ? '✅' : '⏳'} Image: {inputs.image ? 'Captured' : 'Pending'}
            </div>
            <div className={`status-item ${inputs.voiceTranscript ? 'completed' : ''}`}>
              {inputs.voiceTranscript ? '✅' : '⏳'} Voice: {inputs.voiceTranscript ? 'Recorded' : 'Pending'}
            </div>
            <div className={`status-item ${inputs.location ? 'completed' : ''}`}>
              {inputs.location ? '✅' : '⚠️'} Location: {inputs.location ? 'Detected' : 'Not available'}
            </div>
          </div>

          {(inputs.image || inputs.voiceTranscript) && !isProcessing && (
            <div className="manual-submit">
              <button 
                onClick={() => submitInputs()}
                className="submit-inputs-btn"
              >
                🚀 Process Inputs Now
              </button>
            </div>
          )}
        </div>
      )}

      <EditModal
        isOpen={showEditModal}
        reportData={reportData}
        onSave={handleSaveEdit}
        onClose={() => setShowEditModal(false)}
      />

      {stage === 'submitted' && (
        <div className="success-panel">
          <h2>✨ Report Submitted Successfully!</h2>
          <p>Your civic issue has been automatically processed and submitted to the authorities.</p>
          <button onClick={resetSession} className="new-report-btn">
            📝 Submit Another Report
          </button>
        </div>
      )}
    </div>
  );
};

export default AgenticReportPage;
