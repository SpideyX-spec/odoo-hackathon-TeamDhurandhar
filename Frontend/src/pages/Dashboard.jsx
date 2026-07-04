import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  // Dashboard State
  const [leaveBalance, setLeaveBalance] = useState(12);
  const [pendingLeavesCount, setPendingLeavesCount] = useState(1);
  const [calendarDays, setCalendarDays] = useState([]);
  
  // Format Date
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const currentDateFormatted = new Date().toLocaleDateString('en-US', options);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));

    // Generate mock calendar days for current week/month
    const days = [];
    const today = new Date().getDate();
    for (let i = 1; i <= 7; i++) {
      let status = 'present';
      if (i === 6 || i === 7) status = 'weekend';
      else if (i === today) status = 'present';
      else if (i > today) status = '';
      
      days.push({
        date: i,
        status: status,
        isToday: i === today
      });
    }
    setCalendarDays(days);
  }, [navigate]);

  if (!user) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#FFFFFF' }}>
      
      {/* Top Title Bar (Odoo Control Panel) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #E5E7EB' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#111827', fontWeight: 500 }}>Dashboard</h2>
          <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>Welcome back, {user.name} &bull; {currentDateFormatted}</div>
        </div>
        <div style={{ position: 'relative', width: '300px' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, padding: '0 8px', backgroundColor: '#F3F4F6', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', borderRight: 'none', borderRadius: '4px 0 0 4px' }}>
             <i className="fa fa-filter" style={{ color: '#875A7B', fontSize: '12px' }}></i> <span style={{ fontSize: '12px', marginLeft: '4px' }}>My Dashboard</span>
          </div>
          <input type="text" placeholder="Search..." style={{ width: '100%', padding: '6px 8px 6px 115px', fontSize: '14px', border: '1px solid #E5E7EB', borderRadius: '4px', outline: 'none' }} />
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '24px', overflowY: 'auto', flex: 1, backgroundColor: '#F9FAFB' }}>
        
        {/* Stat Tiles Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '24px' }}>
          
          <div className="hrms-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', padding: '20px' }} onClick={() => navigate('/timeoff')}>
            <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: '#F3EEF1', color: '#875A7B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
              <i className="fa fa-plane"></i>
            </div>
            <div>
              <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500, textTransform: 'uppercase' }}>Leave Balance</div>
              <div style={{ fontSize: '24px', color: '#111827', fontWeight: 'bold' }}>{leaveBalance} <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#6B7280', textTransform: 'none' }}>Days</span></div>
            </div>
          </div>
          
          <div className="hrms-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: '#E0F2F1', color: '#00A09D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
              <i className="fa fa-briefcase"></i>
            </div>
            <div>
              <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500, textTransform: 'uppercase' }}>Today's Status</div>
              <div style={{ fontSize: '24px', color: '#111827', fontWeight: 'bold' }}>Working</div>
            </div>
          </div>

          <div className="hrms-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500, textTransform: 'uppercase' }}>Work Hours Today</span>
              <span style={{ fontSize: '14px', color: '#111827', fontWeight: 'bold' }}>5h / 8h</span>
            </div>
            <div style={{ height: '8px', backgroundColor: '#F3F4F6', borderRadius: '4px', width: '100%', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '62.5%', backgroundColor: '#00A09D' }}></div>
            </div>
          </div>

          <div className="hrms-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', padding: '20px' }} onClick={() => navigate('/timeoff')}>
            <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
              <i className="fa fa-hourglass-half"></i>
            </div>
            <div>
              <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500, textTransform: 'uppercase' }}>Pending Approvals</div>
              <div style={{ fontSize: '24px', color: '#111827', fontWeight: 'bold' }}>{pendingLeavesCount}</div>
            </div>
          </div>

        </div>

        {/* Content Layout */}
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          
          {/* Main Area */}
          <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '24px', minWidth: '400px' }}>
            
            {/* Quick Check-In Widget */}
            <div className="hrms-card" style={{ textAlign: 'center', backgroundColor: '#F3EEF1', border: '1px dashed #875A7B', cursor: 'pointer', padding: '32px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#875A7B', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 16px' }}>
                <i className="fa fa-sign-in"></i>
              </div>
              <h3 style={{ color: '#875A7B', margin: '0 0 8px 0' }}>Check In</h3>
              <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>Click here to record your attendance for the day</p>
            </div>

            {/* Attendance Calendar */}
            <div className="hrms-card">
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#111827', borderBottom: '1px solid #E5E7EB', paddingBottom: '12px' }}>This Week's Attendance</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px', textAlign: 'center' }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dow => (
                  <div key={dow} style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280', marginBottom: '8px' }}>{dow}</div>
                ))}
                
                {calendarDays.map((day, idx) => (
                  <div 
                    key={idx} 
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', 
                      padding: '12px 8px', borderRadius: '8px', cursor: 'pointer', 
                      border: day.isToday ? '1px solid #00A09D' : '1px solid transparent',
                      backgroundColor: day.isToday ? '#E0F2F1' : '#F9FAFB',
                      opacity: day.status === 'weekend' ? 0.6 : 1
                    }}
                    onClick={() => navigate('/attendance')}
                  >
                    <span style={{ fontSize: '16px', color: '#111827', fontWeight: day.isToday ? 600 : 400 }}>{day.date}</span>
                    {day.status === 'present' && <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00A09D' }}></span>}
                    {day.status === 'absent' && <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#DC2626' }}></span>}
                    {day.status === 'weekend' && <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#D1D5DB' }}></span>}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', minWidth: '300px' }}>
            
            {/* Quick Actions List */}
            <div className="hrms-card">
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#111827', borderBottom: '1px solid #E5E7EB', paddingBottom: '12px' }}>Quick Shortcuts</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '6px', cursor: 'pointer', color: '#374151', fontSize: '14px', fontWeight: 500, textAlign: 'left', transition: 'background-color 0.2s' }} onClick={() => navigate('/timeoff')} onMouseOver={e => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseOut={e => e.currentTarget.style.backgroundColor = '#FFFFFF'}>
                  <i className="fa fa-calendar-plus-o" style={{ width: '20px', color: '#875A7B', fontSize: '16px', textAlign: 'center' }}></i> Apply Leave
                </button>
                <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '6px', cursor: 'pointer', color: '#374151', fontSize: '14px', fontWeight: 500, textAlign: 'left', transition: 'background-color 0.2s' }} onClick={() => navigate('/profile')} onMouseOver={e => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseOut={e => e.currentTarget.style.backgroundColor = '#FFFFFF'}>
                  <i className="fa fa-user-circle-o" style={{ width: '20px', color: '#875A7B', fontSize: '16px', textAlign: 'center' }}></i> My Profile
                </button>
                <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '6px', cursor: 'pointer', color: '#374151', fontSize: '14px', fontWeight: 500, textAlign: 'left', transition: 'background-color 0.2s' }} onClick={() => navigate('/attendance')} onMouseOver={e => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseOut={e => e.currentTarget.style.backgroundColor = '#FFFFFF'}>
                  <i className="fa fa-bar-chart" style={{ width: '20px', color: '#875A7B', fontSize: '16px', textAlign: 'center' }}></i> Attendance Report
                </button>
              </div>
            </div>

            {/* Announcements */}
            <div className="hrms-card" style={{ flexGrow: 1 }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#111827', borderBottom: '1px solid #E5E7EB', paddingBottom: '12px' }}>Company Announcements</h3>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 0', color: '#9CA3AF' }}>
                <i className="fa fa-bullhorn" style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.5 }}></i>
                <div style={{ fontSize: '14px' }}>No recent announcements.</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
