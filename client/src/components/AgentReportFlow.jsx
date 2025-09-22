import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { agentAPI } from '../api/axios';
import VoiceInput from './VoiceInput';
import ImageCapture from './ImageCapture';
import './AgentReportFlow.css'; // The new stylesheet will go here

// --- Minimalist SVG Icons ---
const IconArrowRight = () => <svg xmlns="http://www.w.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>;
const IconCheckCircle = () => <svg xmlns="http://www.w.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="success-icon"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const IconLoader = () => <svg xmlns="http://www.w.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="processing-icon"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>;


const AgentReportFlow = ({ onComplete, onCancel }) => {
  // State management (same as before)
  const [flowState, setFlowState] = useState('input'); // 'input', 'analyzing', 'review', 'submitting', 'success'
  const [isProcessing, setIsProcessing] = useState(false);
  const [reportData, setReportData] = useState({ title: '', description: '', category: 'pothole', mediaFiles: [], coordinates: null });
  const [imageFile, setImageFile] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [location, setLocation] = useState({ lat: null, lng: null });

  // Auto-proceed timers to minimise user intervention
  useEffect(() => {
    if (flowState !== 'input') return;
    if (!imageFile) return;
    const hasText = Boolean((textInput || '').trim() || (voiceTranscript || '').trim());
    if (!hasText) return;
    if (isProcessing) return;

    const t = setTimeout(() => {
      // Safety re-checks before firing
      if (flowState === 'input' && imageFile && ((textInput || '').trim() || (voiceTranscript || '').trim())) {
        handleAnalyzeInputs();
      }
    }, 1200);
    return () => clearTimeout(t);
  }, [flowState, imageFile, textInput, voiceTranscript, isProcessing]);

  useEffect(() => {
    if (flowState !== 'review') return;
    if (isProcessing) return;
    if (!reportData.title || !reportData.description) return;
    // give user a moment to intervene
    const t = setTimeout(() => {
      if (flowState === 'review' && reportData.title && reportData.description) {
        handleSubmitReport();
      }
    }, 2000);
    return () => clearTimeout(t);
  }, [flowState, reportData.title, reportData.description, isProcessing]);

  // --- All your existing logic (useEffect, handleReset, handleAnalyzeInputs, handleSubmitReport, etc.) remains exactly the same. ---
  // --- No changes are needed for the component's internal logic. ---
  useEffect(() => { if (navigator.geolocation) { navigator.geolocation.getCurrentPosition( (position) => { setLocation({ lat: position.coords.latitude, lng: position.coords.longitude }); setReportData(prev => ({ ...prev, coordinates: [position.coords.longitude, position.coords.latitude] })); }, (error) => { console.error('Location error:', error); toast.error('Could not get location.'); } ); } }, []);
  const handleReset = () => { setFlowState('input'); setIsProcessing(false); setReportData({ title: '', description: '', category: 'pothole', mediaFiles: [], coordinates: location.lng ? [location.lng, location.lat] : null, }); setImageFile(null); setTextInput(''); setVoiceTranscript(''); };
  const handleImageCapture = (file) => { setImageFile(file); setReportData(prev => ({ ...prev, mediaFiles: [file] })); };
  const handleAnalyzeInputs = async () => { if (!imageFile || !(textInput.trim() || voiceTranscript.trim())) { toast.error('Please provide a photo and a description.'); return; } setFlowState('analyzing'); setIsProcessing(true); const combinedText = textInput.trim() || voiceTranscript.trim(); try { const [imageAnalysis, textAnalysisResp] = await Promise.all([ analyzeImage(imageFile), agentAPI.analyzeText(combinedText).then(r => r?.data?.data || {}).catch(() => ({})) ]); const merged = mergeAnalyses(imageAnalysis, textAnalysisResp, combinedText); setReportData(prev => ({ ...prev, ...merged })); toast.success('AI analysis complete. Please review.'); setFlowState('review'); } catch (err) { toast.error('AI analysis failed. Please fill details manually.'); setReportData(prev => ({ ...prev, title: extractTitleFromTranscript(combinedText), description: combinedText || prev.description, })); setFlowState('review'); } finally { setIsProcessing(false); } };
  const handleSubmitReport = async () => { if (!reportData.title || !reportData.description) { toast.error('Title and description are required.'); return; } setFlowState('submitting'); setIsProcessing(true); const userToken = localStorage.getItem('token'); if (!userToken) { toast.error('You must be logged in.'); setIsProcessing(false); setFlowState('review'); return; } try { const formData = new FormData(); formData.append('title', reportData.title); formData.append('description', reportData.description); formData.append('category', reportData.category); formData.append('coordinates', JSON.stringify(reportData.coordinates)); formData.append('processingMethod', 'agentic'); if (reportData.confidence) formData.append('confidence', reportData.confidence); if (reportData.severity) formData.append('severity', reportData.severity); if (reportData.suggestedPriority) formData.append('suggestedPriority', reportData.suggestedPriority); reportData.mediaFiles.forEach((file) => formData.append('media', file)); let response; try { response = await agentAPI.createReport(formData); } catch (agentError) { if (agentError.response?.status === 404) { const regularAPI = axios.create({ baseURL: "https://backend-sih-project-l67a.onrender.com/api", headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${userToken}` } }); response = await regularAPI.post('/reports', formData); } else { throw agentError; } } toast.success('Report submitted successfully!'); setFlowState('success'); if (onComplete) { const payload = response?.data?.data || response?.data; setTimeout(() => onComplete(payload), 3000); } } catch (error) { toast.error('Failed to submit report.'); setFlowState('review'); } finally { setIsProcessing(false); } };
  const analyzeImage = async (file) => { const formData = new FormData(); formData.append('image', file); const response = await agentAPI.analyzeImage(formData); return response.data.data; };
  const mergeAnalyses = (img, txt, fallbackText) => { const severityRank = { low: 1, medium: 2, high: 3, critical: 4 }; const pick = (a, b) => (a !== undefined && a !== null ? a : b); const title = pick(txt?.title, pick(img?.title, extractTitleFromTranscript(fallbackText || 'Issue Report'))); const description = pick(txt?.description, pick(fallbackText, img?.description)); const imgConf = typeof img?.confidence === 'number' ? img.confidence : 0; const txtConf = typeof txt?.confidence === 'number' ? txt.confidence : 0; let category = img?.category || txt?.category || 'other'; if (txt?.category && img?.category && txt?.category !== img?.category) { category = txtConf >= imgConf ? txt.category : img.category; } else if (txt?.category) { category = txt.category; } const confidence = Math.max(imgConf, txtConf || 0); const imgSev = img?.severity || 'medium'; const txtSev = txt?.severity || imgSev; const severity = severityRank[txtSev] >= severityRank[imgSev] ? txtSev : imgSev; const priorityOrder = { low: 1, medium: 2, high: 3 }; const imgPr = img?.suggestedPriority || 'medium'; const txtPr = txt?.suggestedPriority || imgPr; const suggestedPriority = (priorityOrder[txtPr] >= priorityOrder[imgPr]) ? txtPr : imgPr; return { title, description, category, confidence, severity, suggestedPriority }; };
  const extractTitleFromTranscript = (text) => text ? (text.length > 50 ? text.substring(0, 50) + '...' : text) : 'Issue Report';
  const handleEditField = (field, value) => setReportData(prev => ({ ...prev, [field]: value }));
  const handleAddMedia = (files) => setReportData(prev => ({ ...prev, mediaFiles: [...prev.mediaFiles, ...Array.from(files)] }));
  
  // The main change is in the JSX structure and class names below
  return (
    <div className="agent-flow-container">
      <div className={`agent-flow-view ${flowState === 'input' ? 'is-active' : ''}`}>
        <div className="view-header">
          <h1>New Report</h1>
          <p className="subtitle">Submit an issue using AI assistance.</p>
        </div>
        <div className="view-content">
          <div className="form-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <label>Provide a photo</label>
              <ImageCapture onImageCapture={handleImageCapture} />
            </div>
          </div>
          <div className="form-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <label>Describe the issue</label>
              <textarea
                placeholder="What's the problem?"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows="3"
              />
              <VoiceInput onTranscript={setVoiceTranscript} />
            </div>
          </div>
        </div>
        <div className="view-footer">
          <button
            className="btn btn-primary"
            onClick={handleAnalyzeInputs}
            disabled={!imageFile || !(textInput.trim() || voiceTranscript.trim())}
          >
            <span>Analyze & Continue</span>
            <IconArrowRight />
          </button>
        </div>
      </div>

      <div className={`agent-flow-view ${flowState === 'review' ? 'is-active' : ''}`}>
        <div className="view-header">
          <h1>Review Details</h1>
          <p className="subtitle">Confirm the AI-generated information.</p>
        </div>
        <div className="view-content">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input type="text" id="title" value={reportData.title} onChange={(e) => handleEditField('title', e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea id="description" value={reportData.description} onChange={(e) => handleEditField('description', e.target.value)} rows="4" />
          </div>
          <div className="form-group">
            <label>Category</label>
            <div className="chip-group">
              {['pothole', 'streetlight', 'garbage', 'water', 'tree', 'other'].map(cat => (
                <button key={cat} className={`chip ${reportData.category === cat ? 'selected' : ''}`} onClick={() => handleEditField('category', cat)} >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="view-footer space-between">
          <button className="btn btn-secondary" onClick={handleReset}>Back</button>
          <button className="btn btn-primary" onClick={handleSubmitReport}>Submit Report</button>
        </div>
      </div>
      
      {['analyzing', 'submitting', 'success'].includes(flowState) && (
        <div className="agent-flow-overlay is-active">
          <div className="overlay-content">
            {flowState === 'success' ? (
              <>
                <IconCheckCircle />
                <h2>Success!</h2>
                <p>Your report has been submitted.</p>
                <button className="btn btn-primary" onClick={onCancel}>Done</button>
              </>
            ) : (
              <>
                <IconLoader />
                <h2>{flowState === 'analyzing' ? 'Analyzing...' : 'Submitting...'}</h2>
                <p>This shouldn't take long.</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentReportFlow;