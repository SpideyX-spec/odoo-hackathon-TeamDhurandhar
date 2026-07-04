import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const AppShell = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showAttendanceDropdown, setShowAttendanceDropdown] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState('Not Checked In');
  const [checkInTime, setCheckInTime] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
    } else {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchAttendanceStatus(parsedUser);
    }
  }, [navigate]);

  const fetchAttendanceStatus = (currentUser) => {
    fetch('/api/attendance/my', { headers: { 'Authorization': `Bearer ${currentUser.token || localStorage.getItem('token')}` } })
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const todayDate = new Date().toISOString().split('T')[0];
          const todayRecord = data.find(d => d.date === todayDate);
          if (todayRecord) {
            if (todayRecord.check_out) {
              setAttendanceStatus('Checked Out');
            } else {
              setAttendanceStatus('Checked In');
              setCheckInTime(todayRecord.check_in);
            }
          }
        }
      })
      .catch(console.error);
  };

  const handleCheckInOut = async (e) => {
    e.stopPropagation();
    setLoadingAction(true);
    const endpoint = attendanceStatus === 'Checked In' ? '/api/attendance/check-out' : '/api/attendance/check-in';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (res.ok) {
        if (attendanceStatus === 'Checked In') {
          setAttendanceStatus('Checked Out');
        } else {
          setAttendanceStatus('Checked In');
          setCheckInTime(data.time);
        }
        setShowAttendanceDropdown(false);
      }
    } catch (err) {
      console.error(err);
    }
    setLoadingAction(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  const isAdmin = user.role === 'Admin' || user.role === 'HR';
  const isActive = (path) => location.pathname.includes(path);

  return (
    <div className="hrms-app-shell">
      {/* Top Navbar */}
      <nav className="hrms-navbar">
        <div className="hrms-navbar-left">
          <img src="/odoo_logo.png" alt="Company Logo" className="hrms-logo" style={{ cursor: 'pointer' }} onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/dashboard')} />
          <ul className="hrms-nav-list">
            <li className="hrms-nav-item">
              <a className={`hrms-nav-link ${isActive('/employees') || (isActive('/admin/dashboard') && isAdmin) || (isActive('/dashboard') && !isAdmin) ? 'active' : ''}`} onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/dashboard')}>
                Employees
              </a>
            </li>
            <li className="hrms-nav-item">
              <a className={`hrms-nav-link ${isActive('/attendance') ? 'active' : ''}`} onClick={() => navigate('/attendance')}>
                Attendance
              </a>
            </li>
            <li className="hrms-nav-item">
              <a className={`hrms-nav-link ${isActive('/timeoff') ? 'active' : ''}`} onClick={() => navigate('/timeoff')}>
                Time Off
              </a>
            </li>
          </ul>
        </div>
        
        <div className="hrms-navbar-right">
          {/* Attendance Status Dot */}
          <div className="hrms-systray-item" onClick={() => { setShowAttendanceDropdown(!showAttendanceDropdown); setShowProfileDropdown(false); }}>
            <div className={`status-dot ${attendanceStatus === 'Checked In' ? 'green' : 'red'}`} title={attendanceStatus}></div>
            {showAttendanceDropdown && (
              <div style={{ position: 'absolute', top: '140%', right: '0', backgroundColor: '#fff', color: '#111827', borderRadius: '8px', padding: '16px', minWidth: '200px', zIndex: 100, border: '1px solid #E5E7EB', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} onClick={e => e.stopPropagation()}>
                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '12px', fontWeight: 500 }}>
                  {attendanceStatus === 'Checked In' ? `Since ${checkInTime || '09:00AM'}` : (attendanceStatus === 'Checked Out' ? 'Checked Out' : 'Not Checked In')}
                </div>
                <button 
                  onClick={handleCheckInOut} 
                  disabled={loadingAction || attendanceStatus === 'Checked Out'}
                  style={{ width: '100%', padding: '10px 12px', backgroundColor: attendanceStatus === 'Checked Out' ? '#F3F4F6' : (attendanceStatus === 'Checked In' ? '#FEE2E2' : '#E0F2F1'), color: attendanceStatus === 'Checked Out' ? '#9CA3AF' : (attendanceStatus === 'Checked In' ? '#DC2626' : '#00A09D'), border: 'none', borderRadius: '6px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, cursor: (loadingAction || attendanceStatus === 'Checked Out') ? 'not-allowed' : 'pointer' }}
                >
                  {attendanceStatus === 'Checked Out' ? 'Done for Today' : (attendanceStatus === 'Checked In' ? 'Check Out' : 'Check In')} <span>&rarr;</span>
                </button>
              </div>
            )}
          </div>

          {/* User Avatar */}
          <div className="hrms-systray-item" onClick={() => { setShowProfileDropdown(!showProfileDropdown); setShowAttendanceDropdown(false); }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#00A09D', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            {showProfileDropdown && (
              <div style={{ position: 'absolute', top: '140%', right: '0', backgroundColor: '#fff', color: '#111827', border: '1px solid #E5E7EB', borderRadius: '8px', minWidth: '160px', zIndex: 100, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', cursor: 'pointer', fontSize: '14px', transition: 'background-color 0.2s' }} onClick={() => navigate('/profile')} onMouseOver={e => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseOut={e => e.currentTarget.style.backgroundColor = '#fff'}>
                  My Profile
                </div>
                <div style={{ padding: '12px 16px', cursor: 'pointer', fontSize: '14px', transition: 'background-color 0.2s', color: '#DC2626' }} onClick={handleLogout} onMouseOver={e => e.currentTarget.style.backgroundColor = '#FEF2F2'} onMouseOut={e => e.currentTarget.style.backgroundColor = '#fff'}>
                  Log Out
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main area */}
      <main className="hrms-main">
        {/* Dynamic Page Content */}
        <div className="hrms-page-content" style={{ height: '100%', overflowY: 'auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppShell;
