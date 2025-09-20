import React, { useState, useRef } from 'react';

const ImageCapture = ({ onImageCapture, disabled }) => {
  const [preview, setPreview] = useState(null);
  const [capturedFile, setCapturedFile] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size too large. Please select an image under 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      setCapturedFile(file);
      onImageCapture(file);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setPreview(null);
    setCapturedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const openCamera = () => {
    cameraInputRef.current?.click();
  };

  const openFiles = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="image-capture">
      {preview ? (
        <div className="preview-container">
          <img src={preview} alt="Captured" className="image-preview" />
          <button onClick={clearImage} className="clear-image-btn">
            ✕ Remove
          </button>
        </div>
      ) : (
        <div className="capture-options">
          <button 
            onClick={openCamera} 
            disabled={disabled}
            className="capture-btn camera"
          >
            📸 Take Photo
          </button>
          <button 
            onClick={openFiles} 
            disabled={disabled}
            className="capture-btn file"
          >
            📁 Choose File
          </button>
        </div>
      )}

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default ImageCapture;