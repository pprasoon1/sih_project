import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    // Check for both a token and the 'admin' role
    const isAdmin = token && role === 'admin';

    // If the user is an admin, show the admin page.
    // Otherwise, redirect them to the citizen dashboard.
    return isAdmin ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

export default AdminRoute;