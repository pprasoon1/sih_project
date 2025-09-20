import React, { useState, useEffect, useRef } from 'react';
import './VoiceInput.css';

const VoiceInput = ({ onTranscript, disabled = false, placeholder = "Tap to speak..." }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSupported, setIsSupported] = useState(false);
    const [error, setError] = useState(null);
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
                setError(`Speech recognition error: ${event.error}`);
                setIsListening(false);
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
            setError('Failed to start speech recognition');
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
                    </div>
                )}
            </div>
            
            <div className="voice-placeholder">
                {placeholder}
            </div>
        </div>
    );
};

export default VoiceInput;
