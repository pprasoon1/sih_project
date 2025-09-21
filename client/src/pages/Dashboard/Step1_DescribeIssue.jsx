import React from 'react';

export const Step1_DescribeIssue = ({ data, onDataChange, onNext }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-slate-800">1. Describe the Issue</h3>
        <p className="text-slate-600 mt-1">Provide a clear title and description.</p>
      </div>
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="form-label">Issue Title</label>
          <input id="title" type="text" placeholder="e.g., Large pothole near Pari Chowk" value={data.title} onChange={(e) => onDataChange('title', e.target.value)} className="form-input" required />
        </div>
        <div>
          <label htmlFor="description" className="form-label">Description</label>
          <textarea id="description" placeholder="Provide details like size, potential danger, and landmarks..." value={data.description} onChange={(e) => onDataChange('description', e.target.value)} className="form-input h-32" />
        </div>
      </div>
      <button type="button" onClick={onNext} className="btn btn-primary w-full" disabled={!data.title}>
        Continue
      </button>
    </div>
  );
};