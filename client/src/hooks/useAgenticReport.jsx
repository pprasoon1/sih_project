import { useState, useCallback } from 'react';

export const useAgenticReport = () => {
    const [sessionId, setSessionId] = useState(null);
    const [stage, setStage] = useState('initializing');
    const [reportData, setReportData] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

    const initializeSession = useCallback(async () => {
        try {
            setIsProcessing(true);
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
                setError(null);
            } else {
                setError('Failed to initialize session');
            }
        } catch (error) {
            console.error('Error initializing session:', error);
            setError('Failed to initialize session');
        } finally {
            setIsProcessing(false);
        }
    }, []);

    const submitInputs = useCallback(async (imageFile, voiceTranscript, location) => {
        if (!sessionId) return;

        try {
            setIsProcessing(true);
            setStage('analyzing');
            setError(null);

            const formData = new FormData();
            formData.append('sessionId', sessionId);
            
            if (imageFile) {
                formData.append('image', imageFile);
            }
            
            if (voiceTranscript) {
                formData.append('voiceTranscript', voiceTranscript);
            }
            
            if (location) {
                formData.append('latitude', location.latitude.toString());
                formData.append('longitude', location.longitude.toString());
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
                return { success: true, editTimer: data.editTimer };
            } else {
                setError(data.message || 'Failed to analyze inputs');
                setStage('collecting_inputs');
                return { success: false, error: data.message };
            }

        } catch (error) {
            console.error('Error submitting inputs:', error);
            setError('Failed to process inputs');
            setStage('collecting_inputs');
            return { success: false, error: error.message };
        } finally {
            setIsProcessing(false);
        }
    }, [sessionId]);

    const editReport = useCallback(async (updates) => {
        if (!sessionId) return;

        try {
            const response = await fetch('/api/agentic/edit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    sessionId,
                    updates
                })
            });

            const data = await response.json();
            
            if (data.success) {
                setReportData(data.reportData);
                return { success: true };
            } else {
                setError(data.message || 'Failed to update report');
                return { success: false, error: data.message };
            }

        } catch (error) {
            console.error('Error updating report:', error);
            setError('Failed to update report');
            return { success: false, error: error.message };
        }
    }, [sessionId]);

    const submitReport = useCallback(async () => {
        if (!sessionId) return;

        try {
            setIsProcessing(true);
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
                return { 
                    success: true, 
                    report: data.report, 
                    pointsEarned: data.pointsEarned 
                };
            } else {
                setError(data.message || 'Failed to submit report');
                return { success: false, error: data.message };
            }

        } catch (error) {
            console.error('Error submitting report:', error);
            setError('Failed to submit report');
            return { success: false, error: error.message };
        } finally {
            setIsProcessing(false);
        }
    }, [sessionId]);

    const reset = useCallback(() => {
        setSessionId(null);
        setStage('initializing');
        setReportData(null);
        setIsProcessing(false);
        setError(null);
    }, []);

    return {
        sessionId,
        stage,
        reportData,
        isProcessing,
        error,
        initializeSession,
        submitInputs,
        editReport,
        submitReport,
        reset
    };
};
