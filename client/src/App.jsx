import { useState } from 'react'
import './App.css'
import Login from './pages/Login'
import Signup from './pages/Signup'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './pages/Home'
import CitizenDashboard from './pages/CitizenDashboard';
import AdminDashboard from './components/AdminDashboard';
import MyReports from './components/MyReports';

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<CitizenDashboard />} />
        <Route path='/admin' element={<AdminDashboard />} />
        <Route path='/myreports' element={<MyReports />} />
        {/* Citizen dashboard, admin dashboard, public issues will be added later */}
      </Routes>
    </Router>
  )
}

export default App
