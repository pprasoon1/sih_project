import React from 'react';

const ReportProgress = ({ stage, reportData, timeLeft, onEdit }) => {
  const stages = [
    { id: 'collecting_inputs', label: 'Collecting Inputs', icon: '📝' },
    { id: 'analyzing', label: 'Analyzing', icon: '🔍' },
    { id: 'analysis_complete', label: 'Analysis Complete', icon: '✅' },
    { id: 'ready_to_submit', label: 'Ready to Submit', icon: '🚀' },
    { id: 'submitted', label: 'Submitted', icon: '✨' }
  ];

  const currentStageIndex = stages.findIndex(s => s.id === stage);

  return (
    <div className="report-progress">
      <div className="progress-header">
        <h3>Report Processing Status</h3>
      </div>

      <div className="progress-steps">
        {stages.map((step, index) => (
          <div 
            key={step.id} 
            className={`progress-step ${index <= currentStageIndex ? 'completed' : ''} ${index === currentStageIndex ? 'active' : ''}`}
          >
            <div className="step-icon">{step.icon}</div>
            <div className="step-label">{step.label}</div>
          </div>
        ))}
      </div>

      {stage === 'analyzing' && (
        <div className="processing-indicator">
          <div className="spinner"></div>
          <p>AI is analyzing your inputs...</p>
        </div>
      )}

      {stage === 'ready_to_submit' && reportData && (
        <div className="report-preview">
          <h4>Report Preview</h4>
          <div className="report-details">
            <p><strong>Title:</strong> {reportData.title}</p>
            <p><strong>Category:</strong> {reportData.category}</p>
            <p><strong>Urgency:</strong> {reportData.urgency}</p>
            <p><strong>Description:</strong> {reportData.description}</p>
            <p><strong>Confidence:</strong> {Math.round(reportData.confidence * 100)}%</p>
          </div>
          
          {timeLeft > 0 && (
            <div className="edit-timer">
              <p>Time left to edit: <strong>{Math.ceil(timeLeft / 1000)}s</strong></p>
              <button onClick={onEdit} className="edit-btn">
                ✏️ Edit Report
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportProgress;
