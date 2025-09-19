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
import LeaderboardPage from './pages/LeaderBoardPage'; // Corrected filename suggestion
import ProfilePage from './pages/ProfilePage';
import StaffDashboard from './pages/StaffDashboard';
import ResolveTaskPage from './pages/ResolveTaskPage';
// Assume you create a StaffRoute component
import StaffRoute from './components/StaffRoute';

// A helper component to access context hooks after the provider is set up
const AppContent = () => {
  const socket = useSocket();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (socket && user?._id) {
      socket.emit('joinRoom', user._id);
      console.log(`User ${user.name} joining room ${user._id}`);
    }
  }, [socket, user]);

  return (
    <>
      {user && <NotificationHandler />}
      <Routes>
        <Route element={<Layout />}>
          {/* --- Public Routes --- */}
          <Route path='/' element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} /> {/* 👈 MOVED HERE */}

          {/* --- Citizen Protected Routes --- */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<CitizenDashboard />} />
            <Route path='/myreports' element={<MyReports />} />
            <Route path='/feed' element={<FeedPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* --- Admin Protected Routes with Nested Layout --- */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="report/:reportId" element={<ReportDetailPage />} />
          </Route>

          {/* --- STAFF Protected Routes --- */}
          <Route element={<StaffRoute />}>
            <Route path="/staff/dashboard" element={<StaffDashboard />} />
            <Route path="/staff/task/:reportId" element={<ResolveTaskPage />} />
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
        <Toaster position="top-right" reverseOrder={false} />
        <AppContent />
      </Router>
    </SocketProvider>
  );
}

export default App;