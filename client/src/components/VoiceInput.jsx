import React, { useState, useEffect, useRef } from 'react';

const VoiceInput = ({ onTranscript, disabled = false, placeholder = "Tap to speak..." }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSupported, setIsSupported] = useState(false);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const [showTextFallback, setShowTextFallback] = useState(false);
    const [textInput, setTextInput] = useState('');
    const recognitionRef = useRef(null);

    useEffect(() => {
        // Check if speech recognition is supported
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            setIsSupported(true);
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            
            // Configure recognition
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            // Handle results
            recognitionRef.current.onresult = (event) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                const currentTranscript = finalTranscript || interimTranscript;
                setTranscript(currentTranscript);
                
                if (finalTranscript && onTranscript) {
                    onTranscript(finalTranscript);
                }
            };

            // Handle errors
            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                
                let errorMessage = '';
                switch (event.error) {
                    case 'network':
                        errorMessage = 'Network error. Please check your internet connection and try again.';
                        break;
                    case 'not-allowed':
                        errorMessage = 'Microphone access denied. Please allow microphone access and try again.';
                        break;
                    case 'no-speech':
                        errorMessage = 'No speech detected. Please try speaking again.';
                        break;
                    case 'audio-capture':
                        errorMessage = 'No microphone found. Please check your microphone and try again.';
                        break;
                    case 'service-not-allowed':
                        errorMessage = 'Speech recognition service not allowed. Please try again.';
                        break;
                    default:
                        errorMessage = `Speech recognition error: ${event.error}. Please try again.`;
                }
                
                setError(errorMessage);
                setIsListening(false);
                
                // For network errors, immediately fall back to text input instead of retrying
                if (event.error === 'network') {
                    setShowTextFallback(true);
                    return;
                }
                
                // Optionally retry once for transient 'no-speech' errors
                if (event.error === 'no-speech' && retryCount < 1) {
                    setTimeout(() => {
                        setRetryCount(prev => prev + 1);
                        setError(null);
                        startListening();
                    }, 1500);
                }
            };

            // Handle end
            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        } else {
            setIsSupported(false);
            setError('Speech recognition is not supported in this browser');
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [onTranscript]);

    const startListening = () => {
        if (!isSupported || disabled) return;
        
        setError(null);
        setTranscript('');
        setIsListening(true);
        
        try {
            recognitionRef.current.start();
        } catch (err) {
            console.error('Error starting speech recognition:', err);
            setError('Failed to start speech recognition. Please try again.');
            setIsListening(false);
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    };

    const clearTranscript = () => {
        setTranscript('');
        setError(null);
    };

    if (!isSupported) {
        return (
            <div className="voice-input-container">
                <div className="voice-input-error">
                    <span>🎤</span>
                    <p>Speech recognition not supported in this browser</p>
                </div>
            </div>
        );
    }

    return (
        <div className="voice-input-container">
            <div className="voice-input-main">
                <button
                    className={`voice-button ${isListening ? 'listening' : ''} ${disabled ? 'disabled' : ''}`}
                    onClick={isListening ? stopListening : startListening}
                    disabled={disabled}
                    type="button"
                >
                    <span className="voice-icon">
                        {isListening ? '⏹️' : '🎤'}
                    </span>
                    <span className="voice-text">
                        {isListening ? 'Listening...' : 'Tap to Speak'}
                    </span>
                </button>
                
                {transcript && (
                    <div className="transcript-container">
                        <div className="transcript-text">
                            {transcript}
                        </div>
                        <button 
                            className="clear-button"
                            onClick={clearTranscript}
                            type="button"
                        >
                            ✕
                        </button>
                    </div>
                )}
                
                {error && (
                    <div className="voice-error">
                        <span>⚠️</span>
                        <p>{error}</p>
                        <div className="error-actions">
                            {error.includes('Network error') && retryCount < 2 && (
                                <button 
                                    className="retry-button"
                                    onClick={() => {
                                        setError(null);
                                        setRetryCount(prev => prev + 1);
                                        startListening();
                                    }}
                                    type="button"
                                >
                                    🔄 Retry
                                </button>
                            )}
                            <button 
                                className="fallback-button"
                                onClick={() => setShowTextFallback(true)}
                                type="button"
                            >
                                ✏️ Type Instead
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="voice-placeholder">
                {placeholder}
            </div>
            
            {/* Text fallback */}
            {showTextFallback && (
                <div className="text-fallback">
                    <textarea
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Type your description here..."
                        className="text-input"
                        rows={3}
                    />
                    <div className="text-fallback-actions">
                        <button 
                            className="submit-text-button"
                            onClick={() => {
                                if (textInput.trim() && onTranscript) {
                                    onTranscript(textInput.trim());
                                }
                            }}
                            disabled={!textInput.trim()}
                            type="button"
                        >
                            ✅ Use This Text
                        </button>
                        <button 
                            className="cancel-text-button"
                            onClick={() => {
                                setShowTextFallback(false);
                                setTextInput('');
                            }}
                            type="button"
                        >
                            ❌ Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoiceInput;
