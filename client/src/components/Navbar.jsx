import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import NotificationIcon from './NotificationIcon';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user'); // Also remove user object
        localStorage.removeItem('role');
        window.location.href = '/login'; 
    };

    return (
        <header className="main-header">
            <div className="container">
                <Link to="/" className="navbar-brand">
                    CivicVoice
                </Link>
                <nav className="navbar-links">
                    {/* Links visible to everyone */}
                    <NavLink to="/feed">Community Feed</NavLink>
                    <NavLink to="/leaderboard">Leaderboard</NavLink>

                    {/* Links visible only when logged in */}
                    {token && <NavLink to="/dashboard">Report an Issue</NavLink>}
                    {token && <NavLink to="/myreports">My Reports</NavLink>}
                    {token && <NavLink to="/profile">My Profile</NavLink>}
                    
                    {/* Link visible only to admins */}
                    {token && role === 'admin' && <NavLink to="/admin/dashboard">Admin</NavLink>}
                </nav>
                <div className="navbar-actions">
                    {token ? (
                        <div className="user-nav-items">
                            <div className="user-points">
                                {user?.points || 0} Points
                            </div>
                            <NotificationIcon /> 
                            <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
                        </div>
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