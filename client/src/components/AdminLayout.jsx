import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './AdminLayout.css';

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2 className="sidebar-title">Admin Panel</h2>
        <nav className="sidebar-nav">
          <NavLink to="/admin/dashboard">Dashboard</NavLink>
          <NavLink to="/admin/analytics">Analytics</NavLink>
          {/* <NavLink to="/admin/staff">Staff</NavLink> */}
        </nav>
      </aside>
      <main className="admin-main-content">
        <Outlet />
      </main>
    </div>
  );
};
export default AdminLayout;