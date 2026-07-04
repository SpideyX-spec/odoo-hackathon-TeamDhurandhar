import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminWelcome = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'Admin' && parsedUser.role !== 'HR') {
      navigate('/dashboard');
      return;
    }
    setUser(parsedUser);
  }, [navigate]);

  if (!user) return <div className="full-screen flex-center">Loading...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'transparent', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', color: '#111827', margin: '0 0 8px 0', fontWeight: 'bold' }}>Welcome, {user.name}</h1>
        <p style={{ fontSize: '16px', color: '#6B7280', margin: 0 }}>What would you like to do today?</p>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
        
        {/* Create Employee Account Card */}
        <div 
          className="glass-panel"
          style={{ 
            width: '280px', 
            cursor: 'pointer', 
            textAlign: 'center', 
            borderRadius: '8px', 
            padding: '32px 24px',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }} 
          onClick={() => navigate('/admin/dashboard', { state: { openNew: true } })}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
          }} 
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
          }}
        >
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#F3EEF1', color: '#875A7B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 20px' }}>
            <i className="fa fa-user-plus"></i>
          </div>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#111827', fontWeight: 600 }}>Create Employee</h3>
          <p style={{ margin: 0, color: '#6B7280', fontSize: '14px', lineHeight: '1.5' }}>
            Register a new employee into the system and set up their profile.
          </p>
        </div>
        
        {/* Proceed to Dashboard Card */}
        <div 
          style={{ 
            width: '280px', 
            cursor: 'pointer', 
            textAlign: 'center', 
            backgroundColor: '#FFFFFF', 
            border: '1px solid #E5E7EB', 
            borderRadius: '8px', 
            padding: '32px 24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }} 
          onClick={() => navigate('/admin/dashboard')}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
          }} 
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
          }}
        >
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#E0F2F1', color: '#00A09D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 20px' }}>
            <i className="fa fa-th-large"></i>
          </div>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#111827', fontWeight: 600 }}>Go to Dashboard</h3>
          <p style={{ margin: 0, color: '#6B7280', fontSize: '14px', lineHeight: '1.5' }}>
            View the full employee directory, manage attendance, and approve leave requests.
          </p>
        </div>

      </div>
    </div>
  );
};

export default AdminWelcome;
