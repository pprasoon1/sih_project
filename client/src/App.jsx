import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SocketProvider, useSocket } from './context/SocketContext';

// Import Pages & Components
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CitizenDashboard from './pages/CitizenDashboard';
import AdminDashboard from './components/AdminDashboard';
import MyReports from './components/MyReports';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import NotificationHandler from './components/NotificationHandler';
import AdminLayout from './components/AdminLayout';
import AnalyticsPage from './pages/AnalyticsPage';
import ReportDetailPage from './pages/ReportDetailPage';
import FeedPage from './pages/FeedPage';

// A helper component to access context hooks after the provider is set up
const AppContent = () => {
  const socket = useSocket();
  // Manage user state properly instead of reading from localStorage on every render
  const [user, setUser] = useState(null);

  // Effect to load user from localStorage once when the app starts
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Effect to join the socket room when the user or socket connection is established
  useEffect(() => {
    if (socket && user?._id) {
      socket.emit('joinRoom', user._id);
      console.log(`User ${user.name} joining room ${user._id}`);
    }
  }, [socket, user]);

  return (
    <>
      {/* The NotificationHandler will only activate if a user is logged in */}
      {user && <NotificationHandler />}
      <Routes>
        <Route element={<Layout />}>
          {/* Public Routes */}
          <Route path='/' element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Citizen Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<CitizenDashboard />} />
            <Route path='/myreports' element={<MyReports />} />
            <Route path='/feed' element={<FeedPage />} />
          </Route>

          {/* Admin Protected Routes with Nested Layout */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="analytics" element={<AnalyticsPage />} /> 
            <Route path="report/:reportId" element={<ReportDetailPage />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
};

// The main App component sets up all the global providers
function App() {
  return (
    <SocketProvider>
      <Router>
        {/* This component is responsible for rendering the pop-up notifications */}
        <Toaster position="top-right" reverseOrder={false} />
        <AppContent />
      </Router>
    </SocketProvider>
  );
}

export default App;