import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { agentAPI } from '../api/axios';
import VoiceInput from './VoiceInput';
import ImageCapture from './ImageCapture';
import './AgentReportFlow.css';

const AgentReportFlow = ({ onComplete, onCancel }) => {
  console.log('AgentReportFlow component rendered');
  
  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [inputType, setInputType] = useState(null); // 'image', 'voice', 'text'
  const [countdown, setCountdown] = useState(5);
  const [isPaused, setIsPaused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Report data
  const [reportData, setReportData] = useState({
    title: '',
    description: '',
    category: 'pothole',
    mediaFiles: [],
    coordinates: null
  });
  
  // Location data
  const [location, setLocation] = useState({
    lat: null,
    lng: null,
    address: null
  });
  
  // Refs
  const countdownRef = useRef(null);
  const fileInputRef = useRef(null);

  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0 && !isPaused && currentStep < 6) {
      countdownRef.current = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0 && !isPaused) {
      handleAutoAdvance();
    }
    
    return () => {
      if (countdownRef.current) {
        clearTimeout(countdownRef.current);
      }
    };
  }, [countdown, isPaused, currentStep]);

  // Get user location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: null // We'll get this from reverse geocoding if needed
          });
          setReportData(prev => ({
            ...prev,
            coordinates: [position.coords.longitude, position.coords.latitude]
          }));
        },
        (error) => {
          console.error('Location error:', error);
          toast.error('Location access denied. Please enable location services.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser.');
    }
  };

  const handleAutoAdvance = () => {
    if (currentStep < 6) {
      setCurrentStep(prev => prev + 1);
      setCountdown(5);
    }
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleRetry = () => {
    setCurrentStep(1);
    setInputType(null);
    setCountdown(5);
    setIsPaused(false);
    setReportData({
      title: '',
      description: '',
      category: 'pothole',
      mediaFiles: [],
      coordinates: null
    });
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
  };

  // Step 1: Input modality selection
  const handleInputTypeSelect = (type) => {
    setInputType(type);
    setCurrentStep(2);
    setCountdown(5);
  };

  // Step 2: Process input based on type
  const handleImageCapture = async (file) => {
    setIsProcessing(true);
    setReportData(prev => ({
      ...prev,
      mediaFiles: [file]
    }));
    
    try {
      // AI-powered image analysis
      const analysis = await analyzeImage(file);
      setReportData(prev => ({
        ...prev,
        title: analysis.title || 'Issue detected in image',
        description: analysis.description || 'Issue identified through image analysis',
        category: analysis.category || 'other'
      }));
      
      toast.success('Image analyzed successfully!');
      setCurrentStep(3);
      setCountdown(5);
    } catch (error) {
      console.error('Image analysis error:', error);
      toast.error('Failed to analyze image. Please try again.');
      setCurrentStep(3); // Still proceed to next step
      setCountdown(5);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceTranscript = async (transcript) => {
    try {
      // Analyze the transcript using AI
      const analysis = await agentAPI.analyzeText(transcript);
      setReportData(prev => ({
        ...prev,
        title: analysis.title,
        description: analysis.description,
        category: analysis.category,
        confidence: analysis.confidence,
        severity: analysis.severity,
        suggestedPriority: analysis.suggestedPriority
      }));
    } catch (error) {
      console.error('Voice analysis error:', error);
      // Fallback to simple processing
      setReportData(prev => ({
        ...prev,
        title: extractTitleFromTranscript(transcript),
        description: transcript
      }));
    }
    setCurrentStep(3);
    setCountdown(5);
  };

  const handleTextInput = async (text) => {
    try {
      // Analyze the text using AI
      const analysis = await agentAPI.analyzeText(text);
      setReportData(prev => ({
        ...prev,
        title: analysis.title,
        description: analysis.description,
        category: analysis.category,
        confidence: analysis.confidence,
        severity: analysis.severity,
        suggestedPriority: analysis.suggestedPriority
      }));
    } catch (error) {
      console.error('Text analysis error:', error);
      // Fallback to simple processing
      setReportData(prev => ({
        ...prev,
        title: extractTitleFromTranscript(text),
        description: text
      }));
    }
    setCurrentStep(3);
    setCountdown(5);
  };

  // AI Image Analysis using backend API
  const analyzeImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await agentAPI.analyzeImage(formData);
      return response.data.data;
    } catch (error) {
      console.error('Image analysis error:', error);
      // Return fallback analysis
      return {
        title: 'Infrastructure Issue Detected',
        description: 'Visual analysis suggests a potential infrastructure problem that requires attention.',
        category: 'other',
        confidence: 0.3,
        severity: 'medium',
        suggestedPriority: 'medium',
        error: 'AI analysis failed, using fallback'
      };
    }
  };

  const extractTitleFromTranscript = (text) => {
    // Simple title extraction - take first 50 characters
    return text.length > 50 ? text.substring(0, 50) + '...' : text;
  };

  // Step 3: Category selection
  const handleCategorySelect = (category) => {
    setReportData(prev => ({
      ...prev,
      category
    }));
    setCurrentStep(4);
    setCountdown(5);
  };

  // Step 4: Location confirmation
  const handleLocationConfirm = () => {
    setCurrentStep(5);
    setCountdown(5);
  };

  // Step 5: Confirmation screen
  const handleEditField = (field, value) => {
    setReportData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddMedia = (files) => {
    setReportData(prev => ({
      ...prev,
      mediaFiles: [...prev.mediaFiles, ...files]
    }));
  };

  // Step 6: Submit report
  const handleSubmitReport = async () => {
    if (!reportData.title || !reportData.coordinates) {
      toast.error('Missing required information');
      return;
    }

    setIsProcessing(true);
    const userToken = localStorage.getItem('token');
    
    if (!userToken) {
      toast.error('You must be logged in to submit a report.');
      setIsProcessing(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', reportData.title);
      formData.append('description', reportData.description);
      formData.append('category', reportData.category);
      formData.append('coordinates', JSON.stringify(reportData.coordinates));
      formData.append('processingMethod', 'agentic');
      
      // Add AI analysis metadata
      if (reportData.confidence) {
        formData.append('confidence', reportData.confidence);
      }
      if (reportData.severity) {
        formData.append('severity', reportData.severity);
      }
      if (reportData.suggestedPriority) {
        formData.append('suggestedPriority', reportData.suggestedPriority);
      }
      
      // Add media files
      reportData.mediaFiles.forEach((file) => formData.append('media', file));

      let response;
      try {
        response = await agentAPI.createReport(formData);
      } catch (agentError) {
        // Fallback to regular reports API if agent API is not available
        if (agentError.response?.status === 404) {
          console.log('Agent API not available, falling back to regular reports API');
          const regularAPI = axios.create({
            baseURL: "https://backend-sih-project-l67a.onrender.com/api",
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${userToken}`,
            }
          });
          response = await regularAPI.post('/reports', formData);
        } else {
          throw agentError;
        }
      }

      toast.success('AI-assisted report submitted successfully!');
      setCurrentStep(7); // Success screen
      setCountdown(0);
      
      if (onComplete) {
        setTimeout(() => onComplete(response.data.data), 2000);
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="agent-step">
            <h2>🤖 Agent Report Assistant</h2>
            <p>Choose how you'd like to report the issue:</p>
            <div className="input-options">
              <button 
                className="input-option" 
                onClick={() => handleInputTypeSelect('image')}
              >
                📸 Take Photo
              </button>
              <button 
                className="input-option" 
                onClick={() => handleInputTypeSelect('voice')}
              >
                🎤 Voice Description
              </button>
              <button 
                className="input-option" 
                onClick={() => handleInputTypeSelect('text')}
              >
                ✏️ Type Description
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="agent-step">
            <h2>📝 Provide Details</h2>
            {inputType === 'image' && (
              <div>
                <p>Take a photo or upload an image of the issue:</p>
                <ImageCapture 
                  onImageCapture={handleImageCapture}
                  disabled={isProcessing}
                />
                {isProcessing && <p>🔍 Analyzing image...</p>}
              </div>
            )}
            {inputType === 'voice' && (
              <div>
                <p>Describe the issue using your voice:</p>
                <VoiceInput 
                  onTranscript={handleVoiceTranscript}
                  disabled={isProcessing}
                />
              </div>
            )}
            {inputType === 'text' && (
              <div>
                <p>Describe the issue in your own words:</p>
                <textarea
                  className="text-input"
                  placeholder="Describe the issue you've encountered..."
                  onChange={(e) => handleTextInput(e.target.value)}
                  rows="4"
                />
                <button 
                  className="btn-primary"
                  onClick={() => handleTextInput(document.querySelector('.text-input').value)}
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="agent-step">
            <h2>🏷️ Categorize Issue</h2>
            <p>What type of issue is this?</p>
            <div className="category-options">
              {['pothole', 'streetlight', 'garbage', 'water', 'tree', 'other'].map(cat => (
                <button
                  key={cat}
                  className={`category-option ${reportData.category === cat ? 'selected' : ''}`}
                  onClick={() => handleCategorySelect(cat)}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
            <div className="preview-data">
              <h4>Preview:</h4>
              <p><strong>Title:</strong> {reportData.title}</p>
              <p><strong>Description:</strong> {reportData.description}</p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="agent-step">
            <h2>📍 Location Confirmation</h2>
            <p>Your location has been automatically detected:</p>
            <div className="location-info">
              <p><strong>Coordinates:</strong> {location.lat?.toFixed(6)}, {location.lng?.toFixed(6)}</p>
              {location.address && <p><strong>Address:</strong> {location.address}</p>}
            </div>
            <button className="btn-primary" onClick={handleLocationConfirm}>
              Confirm Location
            </button>
          </div>
        );

      case 5:
        return (
          <div className="agent-step">
            <h2>✅ Review & Confirm</h2>
            <p>Please review your report before submission:</p>
            <div className="confirmation-form">
              <div className="form-group">
                <label>Title:</label>
                <input
                  type="text"
                  value={reportData.title}
                  onChange={(e) => handleEditField('title', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  value={reportData.description}
                  onChange={(e) => handleEditField('description', e.target.value)}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Category:</label>
                <select
                  value={reportData.category}
                  onChange={(e) => handleEditField('category', e.target.value)}
                >
                  {['pothole', 'streetlight', 'garbage', 'water', 'tree', 'other'].map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Media Files:</label>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) => handleAddMedia(Array.from(e.target.files))}
                />
                <p>{reportData.mediaFiles.length} file(s) selected</p>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="agent-step">
            <h2>🚀 Submitting Report</h2>
            <p>Your report is being submitted...</p>
            {isProcessing && <div className="loading-spinner">⏳</div>}
          </div>
        );

      case 7:
        return (
          <div className="agent-step success">
            <h2>✅ Report Submitted Successfully!</h2>
            <p>Your civic issue report has been submitted and will be reviewed by the appropriate department.</p>
            <div className="success-actions">
              <button className="btn-primary" onClick={handleRetry}>
                Submit Another Report
              </button>
              <button className="btn-secondary" onClick={handleCancel}>
                Close
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="agent-report-flow">
      <div className="agent-header">
        <div className="step-indicator">
          {[1, 2, 3, 4, 5, 6].map(step => (
            <div 
              key={step} 
              className={`step-dot ${currentStep >= step ? 'active' : ''} ${currentStep === step ? 'current' : ''}`}
            />
          ))}
        </div>
        <div className="step-controls">
          {currentStep < 7 && (
            <>
              <button 
                className="control-btn pause"
                onClick={handlePause}
              >
                {isPaused ? '▶️ Resume' : '⏸️ Pause'}
              </button>
              <button 
                className="control-btn retry"
                onClick={handleRetry}
              >
                🔄 Retry
              </button>
              <button 
                className="control-btn cancel"
                onClick={handleCancel}
              >
                ❌ Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div className="agent-content">
        {renderStep()}
      </div>

      {currentStep < 6 && countdown > 0 && !isPaused && (
        <div className="countdown-timer">
          <span>Auto-advancing in {countdown}s</span>
        </div>
      )}

      {currentStep === 5 && !isProcessing && (
        <div className="submit-section">
          <button 
            className="btn-primary submit-btn"
            onClick={handleSubmitReport}
            disabled={!reportData.title || !reportData.coordinates}
          >
            Submit Report
          </button>
        </div>
      )}
    </div>
  );
};

export default AgentReportFlow;
