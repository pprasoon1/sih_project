import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => {
  return (
    <div className="flex flex-col h-screen">
      {/* Navbar stays at top */}
      <Navbar />

      {/* Scrollable main content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
