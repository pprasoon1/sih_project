import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const token = localStorage.getItem('token');

    // If a token exists, the user is authenticated, so we render the requested page.
    // The <Outlet /> component is a placeholder for the actual page component (like Dashboard).
    if (token) {
        return <Outlet />;
    }

    // If no token exists, redirect the user to the /login page.
    // The 'replace' prop ensures the user can't press the "back" button to get to the protected page.
    return <Navigate to="/login" replace />;
};

export default ProtectedRoute;