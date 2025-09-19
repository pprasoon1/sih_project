import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { FaTachometerAlt, FaChartBar, FaUsers } from "react-icons/fa";

const AdminLayout = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">Admin Panel</h2>
        </div>
        <nav className="flex-1 flex flex-col gap-2 p-4">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-md transition ${
                isActive ? "bg-gray-700" : "hover:bg-gray-700"
              }`
            }
          >
            <FaTachometerAlt /> Dashboard
          </NavLink>
          <NavLink
            to="/admin/analytics"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-md transition ${
                isActive ? "bg-gray-700" : "hover:bg-gray-700"
              }`
            }
          >
            <FaChartBar /> Analytics
          </NavLink>
          <NavLink
            to="/admin/staff"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-md transition ${
                isActive ? "bg-gray-700" : "hover:bg-gray-700"
              }`
            }
          >
            <FaUsers /> Staff Management
          </NavLink>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
