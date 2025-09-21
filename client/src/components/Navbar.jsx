import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import NotificationIcon from './NotificationIcon';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        window.location.href = '/login'; 
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };
    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="container">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-gray-900">CivicVoice</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <NavLink 
                            to="/feed" 
                            className={({ isActive }) => 
                                `text-sm font-medium transition-colors ${
                                    isActive 
                                        ? 'text-blue-600' 
                                        : 'text-gray-600 hover:text-gray-900'
                                }`
                            }
                        >
                            Community Feed
                        </NavLink>
                        <NavLink 
                            to="/leaderboard" 
                            className={({ isActive }) => 
                                `text-sm font-medium transition-colors ${
                                    isActive 
                                        ? 'text-blue-600' 
                                        : 'text-gray-600 hover:text-gray-900'
                                }`
                            }
                        >
                            Leaderboard
                        </NavLink>
                        <NavLink 
                            to="/health-map" 
                            className={({ isActive }) => 
                                `text-sm font-medium transition-colors ${
                                    isActive 
                                        ? 'text-blue-600' 
                                        : 'text-gray-600 hover:text-gray-900'
                                }`
                            }
                        >
                            Health Map
                        </NavLink>
                        
                        {token && (
                            <>
                                <NavLink 
                                    to="/dashboard" 
                                    className={({ isActive }) => 
                                        `text-sm font-medium transition-colors ${
                                            isActive 
                                                ? 'text-blue-600' 
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`
                                    }
                                >
                                    Report Issue
                                </NavLink>
                                <NavLink 
                                    to="/agent" 
                                    className={({ isActive }) => 
                                        `text-sm font-medium transition-colors ${
                                            isActive 
                                                ? 'text-blue-600' 
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`
                                    }
                                >
                                    🤖 AI Assistant
                                </NavLink>
                                <NavLink 
                                    to="/myreports" 
                                    className={({ isActive }) => 
                                        `text-sm font-medium transition-colors ${
                                            isActive 
                                                ? 'text-blue-600' 
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`
                                    }
                                >
                                    My Reports
                                </NavLink>
                                <NavLink 
                                    to="/profile" 
                                    className={({ isActive }) => 
                                        `text-sm font-medium transition-colors ${
                                            isActive 
                                                ? 'text-blue-600' 
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`
                                    }
                                >
                                    Profile
                                </NavLink>
                            </>
                        )}
                        
                        {token && role === 'admin' && (
                            <NavLink 
                                to="/admin/dashboard" 
                                className={({ isActive }) => 
                                    `text-sm font-medium transition-colors ${
                                        isActive 
                                            ? 'text-blue-600' 
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`
                                }
                            >
                                Admin
                            </NavLink>
                        )}
                    </nav>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center space-x-4">
                        {token ? (
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 rounded-full">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                    <span className="text-sm font-medium text-blue-600">
                                        {user?.points || 0}
                                    </span>
                                </div>
                                <NotificationIcon />
                                <button 
                                    onClick={handleLogout} 
                                    className="btn btn-ghost btn-sm"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link to="/login" className="btn btn-ghost btn-sm">
                                    Login
                                </Link>
                                <Link to="/signup" className="btn btn-primary btn-sm">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={toggleMobileMenu}
                        className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 py-4">
                        <nav className="flex flex-col space-y-4">
                            <NavLink 
                                to="/feed" 
                                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Community Feed
                            </NavLink>
                            <NavLink 
                                to="/leaderboard" 
                                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Leaderboard
                            </NavLink>
                            <NavLink 
                                to="/health-map" 
                                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Health Map
                            </NavLink>
                            
                            {token && (
                                <>
                                    <NavLink 
                                        to="/dashboard" 
                                        className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Report Issue
                                    </NavLink>
                                    <NavLink 
                                        to="/agent" 
                                        className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        🤖 AI Assistant
                                    </NavLink>
                                    <NavLink 
                                        to="/myreports" 
                                        className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        My Reports
                                    </NavLink>
                                    <NavLink 
                                        to="/profile" 
                                        className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Profile
                                    </NavLink>
                                </>
                            )}
                            
                            {token && role === 'admin' && (
                                <NavLink 
                                    to="/admin/dashboard" 
                                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Admin
                                </NavLink>
                            )}

                            <div className="pt-4 border-t border-gray-200">
                                {token ? (
                                    <div className="flex flex-col space-y-3">
                                        <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg">
                                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                            </svg>
                                            <span className="text-sm font-medium text-blue-600">
                                                {user?.points || 0} Points
                                            </span>
                                        </div>
                                        <NotificationIcon />
                                        <button 
                                            onClick={handleLogout} 
                                            className="btn btn-ghost btn-sm w-full justify-start"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col space-y-3">
                                        <Link 
                                            to="/login" 
                                            className="btn btn-ghost btn-sm w-full justify-start"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            Login
                                        </Link>
                                        <Link 
                                            to="/signup" 
                                            className="btn btn-primary btn-sm w-full justify-start"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            Sign Up
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;