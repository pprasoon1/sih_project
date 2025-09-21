// components/PhotoUploader.jsx
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const PhotoUploader = ({ onUploadComplete, disabled }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Validate file
            if (!selectedFile.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }
            
            if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
                toast.error('File size too large. Please select an image under 10MB');
                return;
            }

            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleConfirm = async () => {
        if (!file) {
            toast.error('Please select a photo first');
            return;
        }
        
        setIsProcessing(true);
        const toastId = toast.loading('Processing photo...');

        try {
            // Create a temporary FormData to simulate the file upload
            // We'll pass the file directly to the parent component
            // The parent will handle the actual upload via the existing createReport endpoint
            
            // Convert file to base64 for preview or pass the file object directly
            const reader = new FileReader();
            reader.onloadend = () => {
                // Pass the file object and preview URL to parent
                onUploadComplete({
                    file: file,
                    preview: preview,
                    name: file.name,
                    size: file.size,
                    type: file.type
                });
                
                toast.success('Photo ready for upload!', { id: toastId });
                
                // Clear the preview after a short delay
                setTimeout(() => {
                    setPreview('');
                    setFile(null);
                    // Clean up the preview URL to prevent memory leaks
                    if (preview) {
                        URL.revokeObjectURL(preview);
                    }
                }, 1000);
            };
            reader.readAsDataURL(file);
            
        } catch (error) {
            console.error('Processing error:', error);
            toast.error('Failed to process photo. Please try again.', { id: toastId });
            onUploadComplete(null);
        } finally {
            setIsProcessing(false);
        }
    };

    const clearPhoto = () => {
        setFile(null);
        if (preview) {
            URL.revokeObjectURL(preview);
            setPreview('');
        }
    };

    return (
        <div className="photo-uploader">
            <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                id="photo-input"
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
                disabled={disabled || isProcessing}
            />
            
            {preview ? (
                <div className="photo-preview-container">
                    <img src={preview} alt="Preview" className="photo-preview" />
                    <button 
                        onClick={clearPhoto} 
                        className="clear-photo-btn"
                        type="button"
                        disabled={isProcessing}
                    >
                        ✕
                    </button>
                </div>
            ) : (
                <label htmlFor="photo-input" className="photo-label">
                    <div className="photo-icon">📷</div>
                    <span>Click to Open Camera or Files</span>
                </label>
            )}
            
            <button 
                onClick={handleConfirm} 
                disabled={!file || isProcessing || disabled} 
                className="upload-confirm-btn"
            >
                {isProcessing ? (
                    <>
                        <span className="upload-spinner"></span>
                        Processing...
                    </>
                ) : (
                    '✓ Confirm Photo'
                )}
            </button>
        </div>
    );
};

export default PhotoUploader;