// Updated ChatReportPage.js - Modified handlePhotoUploaded function
import React, { useState, useEffect, useRef } from 'react';
import PhotoUploader from '../components/PhotoUploader';
import './ChatReportPage.css';

const ChatReportPage = () => {
    const [messages, setMessages] = useState([
        { 
            role: 'assistant', 
            content: "👋 Hello! I'm CivicBot, your AI assistant for reporting civic issues. What problem would you like to report today?" 
        }
    ]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [currentAction, setCurrentAction] = useState(null);
    const [sessionId] = useState(() => Date.now().toString() + Math.random().toString(36).substr(2, 9));
    const [reportStatus, setReportStatus] = useState(null);
    const [reportData, setReportData] = useState({
        title: '',
        description: '',
        category: '',
        coordinates: null,
        files: []
    });
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const sendMessage = async (messageContent) => {
        if (!messageContent.trim() || isThinking) return;

        const userMessage = { role: 'user', content: messageContent };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsThinking(true);

        try {
            const response = await fetch('/api/chat/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ 
                    message: messageContent,
                    sessionId: sessionId
                }),
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.message || 'An error occurred');
            }

            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: data.message 
            }]);

            handleAction(data.action, data);

        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: "❌ Sorry, I encountered an error. Please try again." 
            }]);
        } finally {
            setIsThinking(false);
        }
    };

    const handleAction = (action, data) => {
        switch (action) {
            case 'request_location':
                setCurrentAction('location');
                break;
            case 'request_photo':
                setCurrentAction('photo');
                break;
            case 'report_submitted':
                setCurrentAction(null);
                setReportStatus({
                    success: true,
                    reportId: data.reportId,
                    message: "Report successfully submitted!"
                });
                setTimeout(() => setReportStatus(null), 10000);
                break;
            case 'error':
                setCurrentAction(null);
                setReportStatus({
                    success: false,
                    message: "There was an error processing your request."
                });
                setTimeout(() => setReportStatus(null), 5000);
                break;
            default:
                setCurrentAction(null);
        }
    };

    const handleLocationShare = async () => {
        try {
            setIsThinking(true);
            
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                });
            });

            const { latitude, longitude } = position.coords;
            
            // Store coordinates for later use
            setReportData(prev => ({
                ...prev,
                coordinates: [longitude, latitude]
            }));

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

            if (data.error) {
                throw new Error(data.error);
            }

            setMessages(prev => [
                ...prev,
                { role: 'user', content: `📍 Location shared: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}` },
                { role: 'assistant', content: data.message }
            ]);

            setCurrentAction(null);
            
            if (data.action) {
                handleAction(data.action, data);
            }

        } catch (error) {
            console.error("Location error:", error);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: "❌ Unable to get your location. You can type your address instead, or try the location button again." 
            }]);
            setCurrentAction(null);
        } finally {
            setIsThinking(false);
        }
    };

    // Modified function to handle photo data instead of URL
    const handlePhotoUploaded = async (photoData) => {
        if (!photoData || !photoData.file) {
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: "❌ Photo selection failed. Please try again." 
            }]);
            return;
        }

        try {
            setIsThinking(true);

            // Store the photo file for later submission
            setReportData(prev => ({
                ...prev,
                files: [photoData.file]
            }));

            // Instead of sending to a separate photo endpoint, we'll submit the complete report
            // First, let the chat system know we have the photo
            const response = await fetch('/api/chat/photo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    mediaUrl: 'photo_ready', // Just a flag to indicate photo is ready
                    sessionId: sessionId
                }),
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            setMessages(prev => [
                ...prev,
                { role: 'user', content: `📷 Photo selected: ${photoData.name}` },
                { role: 'assistant', content: data.message }
            ]);

            // Now submit the complete report using your existing endpoint
            await submitCompleteReport();

        } catch (error) {
            console.error("Photo processing error:", error);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: "❌ Failed to process photo. Please try uploading again." 
            }]);
        } finally {
            setIsThinking(false);
        }
    };

    const submitCompleteReport = async () => {
        try {
            // Extract report details from the conversation
            // You might want to modify this based on how your AI extracts the data
            const formData = new FormData();
            
            // Add text data (you'll need to extract these from your chat session)
            formData.append('title', reportData.title || 'Civic Issue Report');
            formData.append('description', reportData.description || 'Report submitted via AI Assistant');
            formData.append('category', reportData.category || 'other');
            formData.append('coordinates', JSON.stringify(reportData.coordinates));
            
            // Add the photo file
            if (reportData.files && reportData.files.length > 0) {
                reportData.files.forEach(file => {
                    formData.append('media', file);
                });
            }

            const response = await fetch('/api/reports', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to submit report');
            }

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `✅ **Report Successfully Submitted!**\n\n**Report ID:** ${result._id}\n**Title:** ${result.title}\n**Category:** ${result.category}\n\nThank you for helping improve our community! You've earned 5 points. 🏆\n\nIs there anything else you'd like to report?`
            }]);

            setCurrentAction(null);
            setReportStatus({
                success: true,
                reportId: result._id,
                message: "Report successfully submitted!"
            });

            // Reset report data
            setReportData({
                title: '',
                description: '',
                category: '',
                coordinates: null,
                files: []
            });

        } catch (error) {
            console.error('Error submitting report:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '❌ Sorry, there was an error submitting your report. Please try again.'
            }]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage(input);
    };

    const startNewReport = () => {
        setMessages([
            { 
                role: 'assistant', 
                content: "👋 Ready to help with another report! What civic issue would you like to report?" 
            }
        ]);
        setCurrentAction(null);
        setReportStatus(null);
        setReportData({
            title: '',
            description: '',
            category: '',
            coordinates: null,
            files: []
        });
    };

    // Rest of your component JSX remains the same...
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

            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.role}`}>
                        <div className="message-bubble">
                            {msg.content}
                        </div>
                        {msg.role === 'user' && (
                            <div className="message-time">
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        )}
                    </div>
                ))}
                
                {isThinking && (
                    <div className="message assistant">
                        <div className="message-bubble typing-indicator">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
                {currentAction === 'location' && (
                    <div className="action-panel location-panel">
                        <div className="action-message">
                            📍 Please share your location to help us identify the issue location
                        </div>
                        <button 
                            onClick={handleLocationShare}
                            disabled={isThinking}
                            className="location-button"
                        >
                            {isThinking ? 'Getting Location...' : '📍 Share My Location'}
                        </button>
                        <small className="action-help">
                            Or you can type your address in the message box below
                        </small>
                    </div>
                )}

                {currentAction === 'photo' && (
                    <div className="action-panel photo-panel">
                        <div className="action-message">
                            📷 Please upload a photo of the civic issue
                        </div>
                        <PhotoUploader 
                            onUploadComplete={handlePhotoUploaded}
                            disabled={isThinking}
                        />
                    </div>
                )}

                {reportStatus?.success && (
                    <div className="action-panel success-panel">
                        <button 
                            onClick={startNewReport}
                            className="new-report-btn"
                        >
                            📝 Report Another Issue
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="chat-input-form">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={
                            currentAction === 'location' ? "Or type your address here..." :
                            currentAction === 'photo' ? "Use the camera button above or describe if you can't upload..." :
                            "Describe the civic issue you want to report..."
                        }
                        disabled={isThinking}
                        className="chat-input"
                    />
                    <button 
                        type="submit" 
                        disabled={isThinking || !input.trim()}
                        className="send-button"
                    >
                        {isThinking ? '⏳' : '📤'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatReportPage;
