import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const ResolveTaskPage = () => {
    const { reportId } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // Fetch report details to show the "before" picture
        const fetchReport = async () => {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/admin/reports/${reportId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReport(res.data.report);
        };
        fetchReport();
    }, [reportId]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmitResolution = async (e) => {
        e.preventDefault();
        if (!imageFile) {
            toast.error('Please upload a resolution photo.');
            return;
        }
        setSubmitting(true);
        const token = localStorage.getItem('token');
        const toastId = toast.loading('Uploading photo...');

        try {
            // Step 1: Upload "after" photo to Cloudinary
            const formData = new FormData();
            formData.append('media', imageFile);
            // This needs a new, simple upload endpoint
            const uploadRes = await axios.post('/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
            });
            const resolvedMediaUrl = uploadRes.data.url;
            toast.loading('Submitting resolution...', { id: toastId });

            // Step 2: Call the resolve endpoint with the new image URL
            await axios.put(`/api/staff/reports/${reportId}/resolve`,
                { resolvedMediaUrls: [resolvedMediaUrl] },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success('Task marked as resolved!', { id: toastId });
            navigate('/staff/dashboard');
        } catch (error) {
            toast.error('Failed to resolve task.', { id: toastId });
        } finally {
            setSubmitting(false);
        }
    };

    if (!report) return <div>Loading task...</div>;

    return (
        <div className="resolve-task-container">
            <h1>Resolve Task: {report.title}</h1>
            <div className="before-after-gallery">
                <div>
                    <h3>Before</h3>
                    <img src={report.mediaUrls[0]} alt="Before" />
                </div>
                <div>
                    <h3>After</h3>
                    {preview ? <img src={preview} alt="Preview" /> : <div className="image-placeholder">Upload a photo</div>}
                </div>
            </div>
            <form onSubmit={handleSubmitResolution}>
                <label htmlFor="resolution-photo">Upload Resolution Photo</label>
                <input type="file" id="resolution-photo" accept="image/*" onChange={handleFileChange} required />
                <button type="submit" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Mark as Resolved'}
                </button>
            </form>
        </div>
    );
};
export default ResolveTaskPage;