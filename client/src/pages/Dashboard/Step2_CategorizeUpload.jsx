import React from 'react';

export const Step2_CategorizeUpload = ({ data, categories, mediaPreviews, onDataChange, onFileChange, onFileRemove, onBack, onNext }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-slate-800">2. Add Evidence</h3>
        <p className="text-slate-600 mt-1">Choose a category and upload supporting media.</p>
      </div>
      <div>
        <label className="form-label">Category</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <button key={cat.value} type="button" onClick={() => onDataChange('category', cat.value)} className={`category-btn ${data.category === cat.value ? 'active' : ''}`}>
              <span className="text-2xl">{cat.icon}</span>
              <span className="font-medium text-sm">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="form-label">Photos/Videos (Max 5)</label>
        <div className="space-y-4">
          {mediaPreviews.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {mediaPreviews.map((src, index) => (
                <div key={index} className="relative aspect-square">
                  <img src={src} alt={`Preview ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                  <button onClick={() => onFileRemove(index)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">&times;</button>
                </div>
              ))}
            </div>
          )}
          {data.mediaFiles.length < 5 && (
            <label htmlFor="file-upload" className="file-upload-zone">
              <input id="file-upload" type="file" accept="image/*,video/*" capture="environment" multiple onChange={onFileChange} className="hidden" />
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span className="text-sm font-semibold text-indigo-600">Click to upload</span>
              <span className="text-xs text-slate-500">or take a picture</span>
            </label>
          )}
        </div>
      </div>
      <div className="flex gap-4">
        <button type="button" onClick={onBack} className="flex-1 text-zinc-900">Back</button>
        <button type="button" onClick={onNext} className="btn btn-primary flex-1">Review & Submit</button>
      </div>
    </div>
  );
};