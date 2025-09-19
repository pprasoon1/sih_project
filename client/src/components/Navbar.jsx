import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import NotificationIcon from './NotificationIcon'; // 👈 1. Import the component
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        // A full page reload can help clear out any lingering state
        window.location.href = '/login'; 
    };

    return (
        <header className="main-header">
            <div className="container">
                <Link to="/" className="navbar-brand">
                    CivicVoice
                </Link>
                <nav className="navbar-links">
                    <NavLink to="/feed">Community Feed</NavLink>
                    {token && <NavLink to="/dashboard">Report an Issue</NavLink>}
                    {token && <NavLink to="/myreports">My Reports</NavLink>}
                    {token && role === 'admin' && <NavLink to="/admin/dashboard">Admin Dashboard</NavLink>}
                </nav>
                <div className="navbar-actions">
                    {token ? (
                        <>
                            {/* 👇 2. Add the icon here for logged-in users */}
                            <NotificationIcon /> 
                            <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn-link">Login</Link>
                            <Link to="/signup" className="btn btn-primary">Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;