import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import './StaffDashboard.css';

const StaffDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchTasks = async () => {
            const token = localStorage.getItem('token');
            try {
                // This endpoint needs to be created on your backend
                const res = await axios.get('/api/staff/mytasks', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTasks(res.data);
            } catch (error) {
                console.error("Failed to fetch tasks", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    if (loading) return <div className="staff-container"><h2>Loading assigned tasks...</h2></div>;

    return (
        <div className="staff-container">
            <div className="staff-header">
                <h1>Welcome, {user.name}</h1>
                <p>Here are your assigned tasks. Let's get to work!</p>
            </div>
            <div className="task-list">
                {tasks.length > 0 ? tasks.map(task => (
                    <Link to={`/staff/task/${task._id}`} key={task._id} className="task-card-link">
                        <div className="task-card">
                            <div className="task-card-header">
                                <span className="task-category">{task.category}</span>
                                <span className="task-date">{format(new Date(task.createdAt), 'MMM d, yyyy')}</span>
                            </div>
                            <h3 className="task-title">{task.title}</h3>
                            <p className="task-upvotes">{task.upvoteCount || 0} upvotes</p>
                        </div>
                    </Link>
                )) : (
                    <p>No tasks assigned to you at the moment. Great job!</p>
                )}
            </div>
        </div>
    );
};

export default StaffDashboard;