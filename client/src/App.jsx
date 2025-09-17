import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages & Components
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CitizenDashboard from './pages/CitizenDashboard';
import AdminDashboard from './components/AdminDashboard';
import MyReports from './components/MyReports';

// Layout & Protection
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute'; // 1. Import AdminRoute

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          {/* --- Public Routes --- */}
          <Route path='/' element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* --- USER Protected Routes --- */}
          {/* These require a user to be logged in, but can be any role */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<CitizenDashboard />} />
            <Route path='/myreports' element={<MyReports />} />
          </Route>

          {/* --- ADMIN Protected Route --- */}
          {/* This requires the user to specifically be an admin */}
          <Route element={<AdminRoute />}>
            <Route path='/admin' element={<AdminDashboard />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;