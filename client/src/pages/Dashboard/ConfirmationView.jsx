import React from 'react';

export const ConfirmationView = ({ data, categories, mediaPreviews, onClose, onSubmit, loading }) => {
  return (
    <div className="p-2">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-slate-900">Confirm Your Report</h3>
        <p className="text-slate-600 mt-1">Please review the details before submitting.</p>
      </div>
      <div className="space-y-3 text-sm border-y border-slate-200 py-4 mb-6">
        <p><strong>Title:</strong> {data.title}</p>
        <p><strong>Description:</strong> {data.description || <span className="text-slate-500">N/A</span>}</p>
        <p><strong>Category:</strong> {categories.find(c => c.value === data.category)?.label}</p>
        <div>
          <strong>Media ({mediaPreviews.length}):</strong>
          {mediaPreviews.length > 0 ? (
            <div className="mt-2 grid grid-cols-3 sm:grid-cols-5 gap-2">
              {mediaPreviews.map((src, index) => (
                <img key={index} src={src} alt={`Preview ${index + 1}`} className="w-full aspect-square object-cover rounded-md" />
              ))}
            </div>
          ) : <span className="text-slate-500 ml-1">None</span>}
        </div>
      </div>
      <div className="flex flex-col-reverse sm:flex-row gap-3">
        <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
          Back to Edit
        </button>
        <button type="button" onClick={onSubmit} disabled={loading} className="btn btn-primary flex-1">
          {loading ? <><div className="spinner"></div> Submitting...</> : 'Confirm & Submit'}
        </button>
      </div>
    </div>
  );
};