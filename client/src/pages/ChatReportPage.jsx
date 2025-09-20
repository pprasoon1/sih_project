// New Ola-style ChatReportPage with photo-first workflow
import React, { useState, useEffect, useRef } from 'react';
import PhotoUploader from '../components/PhotoUploader';
import VoiceInput from '../components/VoiceInput';
import './ChatReportPage.css';

const ChatReportPage = () => {
    const [currentStep, setCurrentStep] = useState('photo_upload'); // photo_upload, processing, editing, location, submitting, completed
    const [voiceInput, setVoiceInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [sessionId] = useState(() => Date.now().toString() + Math.random().toString(36).substr(2, 9));
    const [reportStatus, setReportStatus] = useState(null);
    const [extractedInfo, setExtractedInfo] = useState(null);
    const [editTimer, setEditTimer] = useState(null);
    const [showEditOptions, setShowEditOptions] = useState(false);
    const [reportData, setReportData] = useState({
        title: '',
        description: '',
        category: '',
        coordinates: null,
        mediaUrl: null
    });
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [currentStep]);

    // Auto-hide edit options after 10 seconds
    useEffect(() => {
        if (showEditOptions && editTimer) {
            console.log('Starting 10-second timer for auto-progression...');
            const timer = setTimeout(() => {
                console.log('Timer expired, proceeding to next step...');
                setShowEditOptions(false);
                proceedToNextStep();
            }, 10000);
            return () => {
                console.log('Clearing timer...');
                clearTimeout(timer);
            };
        }
    }, [showEditOptions, editTimer, currentStep, extractedInfo]);

    const proceedToNextStep = async () => {
        console.log('proceedToNextStep called:', { 
            currentStep, 
            extractedInfo: !!extractedInfo,
            reportData: reportData,
            sessionId: sessionId
        });
        if (currentStep === 'editing' && extractedInfo) {
            console.log('Proceeding from editing to location step...');
            setCurrentStep('location');
            await getLocation();
        } else {
            console.log('Cannot proceed - missing conditions:', { currentStep, hasExtractedInfo: !!extractedInfo });
        }
    };

    const getLocation = async () => {
        try {
            console.log('Getting location...');
            setIsThinking(true);
            
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                });
            });

            const { latitude, longitude } = position.coords;
            console.log('Location obtained:', { latitude, longitude });
            
            setReportData(prev => ({
                ...prev,
                coordinates: [longitude, latitude]
            }));

            console.log('Sending location to server...');
            const response = await fetch('/api/chat/location', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    latitude,
                    longitude,
                    sessionId: sessionId
                }),
            });

            const data = await response.json();
            console.log('Location response:', data);

            if (data.error) {
                throw new Error(data.error);
            }

            // Check if report was submitted directly in location response
            if (data.action === 'report_submitted') {
                console.log('Report submitted successfully via location endpoint!');
                setCurrentStep('completed');
                setReportStatus({
                    success: true,
                    reportId: data.reportId,
                    message: "✅ Report successfully submitted!"
                });
            } else {
                console.log('Moving to submitting step...');
                setCurrentStep('submitting');
                await submitReport();
            }

        } catch (error) {
            console.error("Location error:", error);
            setReportStatus({
                success: false,
                message: "❌ Unable to get your location. Please try again."
            });
            setCurrentStep('editing');
        } finally {
            setIsThinking(false);
        }
    };

    const submitReport = async () => {
        try {
            console.log('Submitting report...');
            const response = await fetch('/api/chat/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ 
                    message: 'Submit the report now',
                    sessionId: sessionId
                }),
            });

            const data = await response.json();
            console.log('Submit report response:', data);

            if (data.error) {
                throw new Error(data.message || 'An error occurred');
            }

            if (data.action === 'report_submitted') {
                console.log('Report submitted successfully!');
                setCurrentStep('completed');
                setReportStatus({
                    success: true,
                    reportId: data.reportId,
                    message: "✅ Report successfully submitted!"
                });
            } else {
                console.log('Unexpected response action:', data.action);
            }

        } catch (error) {
            console.error("Error submitting report:", error);
            setReportStatus({
                success: false,
                message: "❌ Failed to submit report. Please try again."
            });
            setCurrentStep('editing');
        }
    };

    const handleVoiceTranscript = (transcript) => {
        setVoiceInput(transcript);
    };

    const handlePhotoWithDescription = async (photoData, description) => {
        if (!photoData || !photoData.file || !description.trim()) {
            setReportStatus({
                success: false,
                message: "❌ Please upload a photo and provide a voice description."
            });
            return;
        }

        try {
            setIsThinking(true);
            setCurrentStep('processing');

            // Upload photo to Cloudinary first
            const formData = new FormData();
            formData.append('media', photoData.file);

            const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData,
            });

            const uploadData = await uploadResponse.json();

            if (!uploadResponse.ok) {
                throw new Error(uploadData.message || 'Failed to upload photo');
            }

            // Send photo URL and description to AI
            const response = await fetch('/api/chat/photo-description', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    mediaUrl: uploadData.url,
                    description: description,
                    sessionId: sessionId
                }),
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            if (data.action === 'display_extracted_info') {
                setExtractedInfo(data.extractedInfo);
                setReportData(prev => ({
                    ...prev,
                    title: data.extractedInfo.title,
                    category: data.extractedInfo.category,
                    description: data.extractedInfo.description,
                    mediaUrl: uploadData.url
                }));
                setCurrentStep('editing');
                setShowEditOptions(true);
                setEditTimer(Date.now());
            }

        } catch (error) {
            console.error("Error processing photo and description:", error);
            setReportStatus({
                success: false,
                message: "❌ Failed to process your photo and description. Please try again."
            });
            setCurrentStep('photo_upload');
        } finally {
            setIsThinking(false);
        }
    };

    const updateExtractedInfo = (field, value) => {
        console.log('Updating extracted info:', { field, value });
        setExtractedInfo(prev => ({
            ...prev,
            [field]: value
        }));
        setReportData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const startNewReport = () => {
        setCurrentStep('photo_upload');
        setVoiceInput('');
        setExtractedInfo(null);
        setShowEditOptions(false);
        setEditTimer(null);
        setReportStatus(null);
        setReportData({
            title: '',
            description: '',
            category: '',
            coordinates: null,
            mediaUrl: null
        });
    };


    return (
        <div className="chat-container">
            <div className="chat-header">
                <h3>🏛️ CivicBot Assistant</h3>
                {reportStatus && (
                    <div className={`status-banner ${reportStatus.success ? 'success' : 'error'}`}>
                        {reportStatus.success ? '✅' : '❌'} {reportStatus.message}
                        {reportStatus.reportId && (
                            <small> (ID: {reportStatus.reportId})</small>
                        )}
                    </div>
                )}
            </div>

            <div className="chat-content">
                {/* Photo Upload Step */}
                {currentStep === 'photo_upload' && (
                    <div className="step-container">
                        <div className="step-header">
                            <h4>📷 Upload Photo & Describe Issue</h4>
                            <p>Take a photo of the civic issue and describe what you see using your voice</p>
                        </div>
                        <div className="photo-upload-section">
                            <PhotoUploader 
                                onUploadComplete={(photoData) => {
                                    // Store photo data temporarily
                                    setReportData(prev => ({ ...prev, photoData }));
                                }}
                                disabled={isThinking}
                            />
                            <div className="description-input">
                                <VoiceInput
                                    onTranscript={handleVoiceTranscript}
                                    disabled={isThinking}
                                    placeholder="Tap the microphone to describe the civic issue you see in the photo..."
                                />
                                {voiceInput && (
                                    <div className="voice-transcript-display">
                                        <strong>Your description:</strong>
                                        <p>"{voiceInput}"</p>
                                    </div>
                                )}
                                <button 
                                    onClick={() => handlePhotoWithDescription(reportData.photoData, voiceInput)}
                                    disabled={isThinking || !voiceInput.trim() || !reportData.photoData}
                                    className="process-button"
                                >
                                    {isThinking ? '⏳ Processing...' : '🚀 Process Report'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Processing Step */}
                {currentStep === 'processing' && (
                    <div className="step-container">
                        <div className="processing-indicator">
                            <div className="spinner"></div>
                            <h4>🔍 Analyzing your photo and description...</h4>
                            <p>Our AI is extracting details from your submission</p>
                        </div>
                    </div>
                )}

                {/* Editing Step */}
                {currentStep === 'editing' && extractedInfo && (
                    <div className="step-container">
                        <div className="step-header">
                            <h4>📋 Review & Edit Details</h4>
                            <p>Review the extracted information and make changes if needed</p>
                        </div>
                        <div className="extracted-info">
                            <div className="info-item">
                                <label>Title:</label>
                                {showEditOptions ? (
                                    <input
                                        type="text"
                                        value={extractedInfo.title}
                                        onChange={(e) => updateExtractedInfo('title', e.target.value)}
                                        className="edit-input"
                                    />
                                ) : (
                                    <span className="info-value">{extractedInfo.title}</span>
                                )}
                            </div>
                            <div className="info-item">
                                <label>Category:</label>
                                {showEditOptions ? (
                                    <select
                                        value={extractedInfo.category}
                                        onChange={(e) => updateExtractedInfo('category', e.target.value)}
                                        className="edit-select"
                                    >
                                        <option value="pothole">Pothole</option>
                                        <option value="streetlight">Streetlight</option>
                                        <option value="garbage">Garbage</option>
                                        <option value="water">Water Issue</option>
                                        <option value="tree">Tree Issue</option>
                                        <option value="other">Other</option>
                                    </select>
                                ) : (
                                    <span className="info-value">{extractedInfo.category}</span>
                                )}
                            </div>
                            <div className="info-item">
                                <label>Description:</label>
                                {showEditOptions ? (
                                    <textarea
                                        value={extractedInfo.description}
                                        onChange={(e) => updateExtractedInfo('description', e.target.value)}
                                        className="edit-textarea"
                                    />
                                ) : (
                                    <span className="info-value">{extractedInfo.description}</span>
                                )}
                            </div>
                            <div className="confidence-indicator">
                                <span>Confidence: {Math.round(extractedInfo.confidence * 100)}%</span>
                            </div>
                        </div>
                        {showEditOptions && (
                            <div className="edit-timer">
                                <div className="timer-bar">
                                    <div className="timer-progress"></div>
                                </div>
                                <p>⏰ Auto-proceeding in 10 seconds...</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Location Step */}
                {currentStep === 'location' && (
                    <div className="step-container">
                        <div className="step-header">
                            <h4>📍 Getting Your Location</h4>
                            <p>Automatically detecting your current location...</p>
                        </div>
                        <div className="location-indicator">
                            <div className="spinner"></div>
                            <p>Please allow location access when prompted</p>
                        </div>
                    </div>
                )}

                {/* Submitting Step */}
                {currentStep === 'submitting' && (
                    <div className="step-container">
                        <div className="step-header">
                            <h4>📤 Submitting Report</h4>
                            <p>Finalizing your civic issue report...</p>
                        </div>
                        <div className="submitting-indicator">
                            <div className="spinner"></div>
                        </div>
                    </div>
                )}

                {/* Completed Step */}
                {currentStep === 'completed' && (
                    <div className="step-container">
                        <div className="success-section">
                            <div className="success-icon">✅</div>
                            <h4>Report Successfully Submitted!</h4>
                            <p>Thank you for helping improve our community!</p>
                            {reportStatus?.reportId && (
                                <div className="report-id">
                                    Report ID: {reportStatus.reportId}
                                </div>
                            )}
                            <button 
                                onClick={startNewReport}
                                className="new-report-btn"
                            >
                                📝 Report Another Issue
                            </button>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>
        </div>
    );
};

export default ChatReportPage;
