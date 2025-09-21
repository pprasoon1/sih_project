import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import NotificationIcon from './NotificationIcon';

const Navbar = () => {
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

    const navLinkClasses = ({ isActive }) => 
        `text-sm font-medium transition-colors ${
            isActive 
                ? 'text-indigo-600' 
                : 'text-slate-600 hover:text-slate-900'
        }`;

    return (
        // FIXED: Increased z-index to be higher than the map's info card
        <header className="sticky top-0 z-[1100] border-b border-slate-200 bg-white/80 backdrop-blur-lg">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex flex-shrink-0 items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-blue-500">
                            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-slate-900">CivicVoice</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden items-center space-x-8 md:flex">
                        <NavLink to="/feed" className={navLinkClasses}>Community Feed</NavLink>
                        <NavLink to="/leaderboard" className={navLinkClasses}>Leaderboard</NavLink>
                        <NavLink to="/health-map" className={navLinkClasses}>Health Map</NavLink>
                        
                        {token && (
                            <>
                                <NavLink to="/dashboard" className={navLinkClasses}>Report Issue</NavLink>
                                <NavLink to="/agent" className={navLinkClasses}>🤖 AI Assistant</NavLink>
                                <NavLink to="/myreports" className={navLinkClasses}>My Reports</NavLink>
                                <NavLink to="/profile" className={navLinkClasses}>Profile</NavLink>
                            </>
                        )}
                        
                        {token && role === 'admin' && (
                            <NavLink to="/admin/dashboard" className={navLinkClasses}>Admin</NavLink>
                        )}
                    </nav>

                    {/* Desktop Actions */}
                    <div className="hidden items-center space-x-4 md:flex">
                        {token ? (
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2 rounded-full bg-indigo-50 px-3 py-1">
                                    {/* Star Icon */}
                                    <span className="text-sm font-medium text-indigo-600">
                                        {user?.points || 0}
                                    </span>
                                </div>
                                <NotificationIcon />
                                <button onClick={handleLogout} className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100">
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link to="/login" className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100">
                                    Login
                                </Link>
                                <Link to="/signup" className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button onClick={toggleMobileMenu} className="p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 md:hidden">
                        {/* Hamburger/Close Icon */}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div className="border-t border-slate-200 py-4 md:hidden">
                        {/* Your mobile nav links */}
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;