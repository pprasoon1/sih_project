import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import './StaffManagementPage.css';

const StaffManagementPage = () => {
    const [staffList, setStaffList] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', department: '' });
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        try {
            const [staffRes, deptsRes] = await Promise.all([
                axios.get('/api/admin/staff', { headers }),
                axios.get('/api/admin/departments', { headers })
            ]);
            setStaffList(staffRes.data);
            setDepartments(deptsRes.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
            toast.error("Could not load data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const toastId = toast.loading('Creating staff account...');
        try {
            await axios.post('/api/admin/staff', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Staff member created successfully!', { id: toastId });
            setFormData({ name: '', email: '', password: '', department: '' }); // Reset form
            fetchData(); // Refresh the list
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create staff.', { id: toastId });
        }
    };

    if (loading) return <div>Loading staff data...</div>;

    return (
        <div className="staff-management-container">
            <h1>Staff Management</h1>
            <div className="staff-grid">
                <div className="staff-form-card">
                    <h2>Add New Staff Member</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input type="password" id="password" name="password" value={formData.password} onChange={handleInputChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="department">Department</label>
                            <select id="department" name="department" value={formData.department} onChange={handleInputChange} required>
                                <option value="">Select a department...</option>
                                {departments.map(dept => (
                                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="btn-submit">Create Staff Account</button>
                    </form>
                </div>
                <div className="staff-list-card">
                    <h2>Current Staff</h2>
                    <table className="staff-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Department</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staffList.map(staff => (
                                <tr key={staff._id}>
                                    <td>{staff.name}</td>
                                    <td>{staff.email}</td>
                                    <td>{staff.department?.name || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StaffManagementPage;