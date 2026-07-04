import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const AppShell = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
    } else {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

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
      {/* Sidebar */}
      <aside className="hrms-sidebar">
        <div className="hrms-brand" onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/dashboard')} style={{cursor: 'pointer'}}>
          HRMS Odoo.x
        </div>
        
        <ul className="hrms-nav-list">
          <li className="hrms-nav-item">
            <a className={`hrms-nav-link ${isActive('/dashboard') && !isAdmin ? 'active' : ''}`} onClick={() => navigate('/dashboard')}>
              <i className="fa fa-home" style={{marginRight: '8px'}}></i> Dashboard
            </a>
          </li>
          <li className="hrms-nav-item">
            <a className={`hrms-nav-link ${isActive('/profile') ? 'active' : ''}`} onClick={() => navigate('/profile')}>
              <i className="fa fa-user" style={{marginRight: '8px'}}></i> My Profile
            </a>
          </li>
          <li className="hrms-nav-item">
            <a className={`hrms-nav-link ${isActive('/attendance') ? 'active' : ''}`} onClick={() => navigate('/attendance')}>
              <i className="fa fa-clock-o" style={{marginRight: '8px'}}></i> Attendance
            </a>
          </li>
          <li className="hrms-nav-item">
            <a className={`hrms-nav-link ${isActive('/timeoff') ? 'active' : ''}`} onClick={() => navigate('/timeoff')}>
              <i className="fa fa-calendar" style={{marginRight: '8px'}}></i> Time Off
            </a>
          </li>

          {isAdmin && (
            <>
              <div className="hrms-nav-section" style={{marginTop: '16px'}}>Admin</div>
              <li className="hrms-nav-item">
                <a className={`hrms-nav-link ${isActive('/admin/dashboard') ? 'active' : ''}`} onClick={() => navigate('/admin/dashboard')}>
                  <i className="fa fa-users" style={{marginRight: '8px'}}></i> Employee Directory
                </a>
              </li>
            </>
          )}
        </ul>
      </aside>

      {/* Main area */}
      <main className="hrms-main">
        {/* Topbar */}
        <header className="hrms-topbar">
          <div className="hrms-search-box">
            <i className="fa fa-search hrms-search-icon"></i>
            <input type="text" className="hrms-search-input" placeholder="Search everywhere..." />
          </div>
          
          <div className="hrms-user-actions">
            <button className="hrms-icon-btn">
              <i className="fa fa-bell"></i>
            </button>
            <div className="hrms-user-menu" onClick={() => setShowDropdown(!showDropdown)} style={{position: 'relative'}}>
              <div className="hrms-avatar">{user.name.charAt(0).toUpperCase()}</div>
              <span className="hrms-user-name">{user.name}</span>
              <i className="fa fa-chevron-down" style={{fontSize: '10px', color: '#6B7280'}}></i>
              
              {showDropdown && (
                <div style={{
                  position: 'absolute', 
                  top: '100%', 
                  right: '0', 
                  backgroundColor: '#fff', 
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
                  borderRadius: '8px', 
                  padding: '16px', 
                  minWidth: '200px', 
                  zIndex: 50,
                  marginTop: '8px'
                }}>
                  <div style={{marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #E5E7EB'}}>
                    <strong>{user.name}</strong><br/>
                    <span style={{fontSize: '12px', color: '#6B7280'}}>{user.role}</span>
                  </div>
                  <div style={{ marginBottom: '12px', cursor: 'pointer', color: '#111827' }} onClick={() => navigate('/profile')}>
                    <i className="fa fa-user" style={{marginRight: '8px'}}></i> My Profile
                  </div>
                  <div style={{ cursor: 'pointer', color: '#DC2626' }} onClick={handleLogout}>
                    <i className="fa fa-sign-out" style={{marginRight: '8px'}}></i> Log Out
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="hrms-page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppShell;
