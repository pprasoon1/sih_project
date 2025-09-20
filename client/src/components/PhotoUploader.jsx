import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import './PhotoUploader.css'; // Create this CSS file

const PhotoUploader = ({ onUploadComplete }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setIsUploading(true);
        const toastId = toast.loading('Uploading photo...');

        try {
            const formData = new FormData();
            formData.append('media', file);
            // This requires a simple, protected backend endpoint that just uploads a single file
            // and returns the URL, e.g., POST /api/upload
            const res = await axios.post('/api/upload', formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('token')}` 
                },
            });
            toast.success('Upload complete!', { id: toastId });
            onUploadComplete(res.data.url);
        } catch (error) {
            toast.error('Upload failed.', { id: toastId });
        } finally {
            setIsUploading(false);
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
            />
            {preview ? (
                <img src={preview} alt="Preview" className="photo-preview" />
            ) : (
                <label htmlFor="photo-input" className="photo-label">
                    Click to Open Camera or Files
                </label>
            )}
            <button onClick={handleUpload} disabled={!file || isUploading} className="upload-confirm-btn">
                {isUploading ? 'Uploading...' : 'Confirm Photo'}
            </button>
        </div>
    );
};

export default PhotoUploader;