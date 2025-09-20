import React, { useState, useRef, useEffect } from 'react';

const VoiceRecorder = ({ onTranscript, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart;
          } else {
            interimTranscript += transcriptPart;
          }
        }

        setTranscript(finalTranscript + interimTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    setIsRecording(true);
    setTranscript('');
    
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      
      if (transcript.trim()) {
        onTranscript(transcript.trim());
      }
    }
  };

  const clearTranscript = () => {
    setTranscript('');
  };

  return (
    <div className="voice-recorder">
      <div className="recording-controls">
        {!isRecording ? (
          <button 
            onClick={startRecording} 
            disabled={disabled || isProcessing}
            className="record-btn start"
          >
            🎤 Start Recording
          </button>
        ) : (
          <button 
            onClick={stopRecording} 
            className="record-btn stop"
          >
            ⏹️ Stop Recording
          </button>
        )}
      </div>

      {transcript && (
        <div className="transcript-display">
          <h4>Voice Input:</h4>
          <p>{transcript}</p>
          <button onClick={clearTranscript} className="clear-btn">
            Clear
          </button>
        </div>
      )}

      {isRecording && (
        <div className="recording-indicator">
          <span className="pulse-dot"></span>
          Recording...
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;