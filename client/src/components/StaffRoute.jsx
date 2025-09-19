import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const StaffRoute = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    // If the user has a token and their role is 'staff' or 'admin', allow access.
    // Admins should typically be able to access staff pages.
    const isAuthorized = token && (role === 'staff' || role === 'admin');

    return isAuthorized ? <Outlet /> : <Navigate to="/login" replace />;
};

export default StaffRoute;