import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // Import Toaster for pop-ups
import { SocketProvider, useSocket } from './context/SocketContext';

// Import your pages and components
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CitizenDashboard from './pages/CitizenDashboard';
import AdminDashboard from './components/AdminDashboard';
import MyReports from './components/MyReports';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import NotificationHandler from './components/NotificationHandler'; // Import the handler

// A helper component to access context hooks after the provider is set up
const AppContent = () => {
  const socket = useSocket();
  // NOTE: Assuming you have an auth context or similar to get the user
  // This is a placeholder for your actual authentication logic.
  const user = JSON.parse(localStorage.getItem('user')); 

  useEffect(() => {
    // If the socket is connected and a user is logged in, join their private room
    if (socket && user && user._id) {
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
          <Route path='/' element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<CitizenDashboard />} />
            <Route path='/myreports' element={<MyReports />} />
          </Route>
          <Route element={<AdminRoute />}>
            <Route path='/admin' element={<AdminDashboard />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
};

// The main App component now sets up the providers
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