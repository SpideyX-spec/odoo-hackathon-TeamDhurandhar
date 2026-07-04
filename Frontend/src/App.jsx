import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Attendance from './pages/Attendance';
import TimeOff from './pages/TimeOff';
import VerifyEmail from './pages/VerifyEmail';
import AdminWelcome from './pages/AdminWelcome';
import AppShell from './components/AppShell';
import './index.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify/:token" element={<VerifyEmail />} />
        <Route path="/admin/welcome" element={<AdminWelcome />} />

        {/* Authenticated Routes wrapped in AppShell */}
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/employees" element={<AdminDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/timeoff" element={<TimeOff />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
