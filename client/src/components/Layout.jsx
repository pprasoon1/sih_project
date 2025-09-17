import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import './Layout.css'; // Import the new CSS file

const Layout = () => {
    return (
        <>
            <div className="animated-background"></div>
            <Navbar />
            {/* We've added a class and removed the inline style */}
            <main className="main-content">
                <Outlet />
            </main>
        </>
    );
};

export default Layout;