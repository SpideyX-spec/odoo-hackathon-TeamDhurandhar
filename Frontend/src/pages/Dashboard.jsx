import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  // Dashboard State
  const [leaveBalance, setLeaveBalance] = useState(12);
  const [pendingLeavesCount, setPendingLeavesCount] = useState(1);
  const [calendarDays, setCalendarDays] = useState([]);
  
  const [workHoursStr, setWorkHoursStr] = useState('0h 0m / 8h');
  const [workProgress, setWorkProgress] = useState(0);

  // Onboarding & Reminders
  const [onboardingTasks, setOnboardingTasks] = useState([
    { id: 1, text: 'Setup Email Signature', completed: true },
    { id: 2, text: 'Submit PAN Card', completed: false },
    { id: 3, text: 'Complete Safety Training', completed: false }
  ]);
  const onboardingProgress = Math.round((onboardingTasks.filter(t => t.completed).length / onboardingTasks.length) * 100);

  const reminders = [
    { id: 1, title: 'Annual Appraisal Due', type: 'Urgent', color: '#DC2626' },
    { id: 2, title: 'Submit Tax Declaration', type: 'High', color: '#D97706' },
    { id: 3, title: 'Update Emergency Contact', type: 'Normal', color: '#3B82F6' }
  ];
  
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

    const parseTime = (timeStr) => {
      if (!timeStr) return 0;
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes, seconds] = time.split(':').map(Number);
      if (!modifier) {
        return hours + ((minutes || 0) / 60) + ((seconds || 0) / 3600);
      }
      if (hours === 12) {
        hours = modifier === 'AM' ? 0 : 12;
      } else if (modifier === 'PM') {
        hours = hours + 12;
      }
      return hours + ((minutes || 0) / 60) + ((seconds || 0) / 3600);
    };

    const token = JSON.parse(userData).token || localStorage.getItem('token');

    // Fetch initial attendance status
    fetch('/api/attendance/my', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (!data || !Array.isArray(data)) return;
        
        const todayDate = new Date().toLocaleDateString('en-CA'); // 'YYYY-MM-DD' in local time
        
        // --- Calculate Work Hours Today ---
        const todayRecord = data.find(d => d.date === todayDate);
        if (todayRecord && todayRecord.check_in) {
          const inTime = parseTime(todayRecord.check_in);
          let outTime = 0;
          if (todayRecord.check_out) {
            outTime = parseTime(todayRecord.check_out);
          } else {
            outTime = parseTime(new Date().toLocaleTimeString('en-US')); // Current time
          }
          let diff = outTime - inTime;
          if (diff < 0) diff += 24;
          
          const hh = Math.floor(diff);
          const mm = Math.round((diff - hh) * 60);
          setWorkHoursStr(`${hh}h ${mm}m / 8h`);
          setWorkProgress(Math.min(100, (diff / 8) * 100));
        }

        // --- Calculate Weekly Calendar Dots ---
        const curr = new Date();
        const firstDayOfWeek = curr.getDate() - curr.getDay(); // Sunday is 0
        const days = [];
        for (let i = 0; i < 7; i++) {
          const d = new Date(curr.getFullYear(), curr.getMonth(), firstDayOfWeek + i);
          // Get local date string 'YYYY-MM-DD'
          const dStr = d.toLocaleDateString('en-CA');
          
          const isToday = dStr === todayDate;
          const isWeekend = d.getDay() === 0 || d.getDay() === 6;
          
          const record = data.find(rec => rec.date === dStr);
          let status = isWeekend ? 'weekend' : '';
          if (record && record.check_in) {
            status = 'present';
          }

          days.push({
            date: d.getDate(),
            status: status,
            isToday: isToday
          });
        }
        setCalendarDays(days);
      })
      .catch(console.error);
  }, [navigate]);

  if (!user) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'transparent' }}>
      
      {/* Top Title Bar (Odoo Control Panel) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#111827', fontWeight: 500 }}>Dashboard</h2>
          <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>Welcome back, {user.name} &bull; {currentDateFormatted}</div>
        </div>
        <div style={{ position: 'relative', width: '300px' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, padding: '0 8px', backgroundColor: '#F3F4F6', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', borderRight: 'none', borderRadius: '4px 0 0 4px' }}>
             <i className="fa fa-filter" style={{ color: '#875A7B', fontSize: '12px' }}></i> <span style={{ fontSize: '12px', marginLeft: '4px' }}>My Dashboard</span>
          </div>
          <input type="text" placeholder="Search..." style={{ width: '100%', padding: '6px 8px 6px 115px', fontSize: '14px', border: '1px solid #E5E7EB', borderRadius: '4px', outline: 'none', backgroundColor: '#FFFFFF' }} />
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '24px', overflowY: 'auto', flex: 1, background: 'transparent' }}>
        
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

          <div className="hrms-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500, textTransform: 'uppercase' }}>Work Hours Today</span>
              <span style={{ fontSize: '14px', color: '#111827', fontWeight: 'bold' }}>{workHoursStr}</span>
            </div>
            <div style={{ height: '8px', backgroundColor: '#F3F4F6', borderRadius: '4px', width: '100%', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${workProgress}%`, backgroundColor: '#00A09D' }}></div>
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
                      border: day.isToday ? '1px solid rgba(0, 160, 157, 0.5)' : '1px solid rgba(255,255,255,0.3)',
                      backgroundColor: day.isToday ? 'rgba(224, 242, 241, 0.6)' : 'rgba(255, 255, 255, 0.4)',
                      backdropFilter: 'blur(4px)',
                      opacity: day.status === 'weekend' ? 0.6 : 1
                    }}
                    onClick={() => navigate('/attendance')}
                  >
                    <span style={{ fontSize: '16px', color: '#111827', fontWeight: day.isToday ? 600 : 400 }}>{day.date}</span>
                    {day.status === 'present' && <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00A09D' }}></span>}
                    {day.status === 'weekend' && <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#D1D5DB' }}></span>}
                    {!['present', 'weekend'].includes(day.status) && <span style={{ width: '8px', height: '8px' }}></span>}
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
                <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: '6px', cursor: 'pointer', color: '#374151', fontSize: '14px', fontWeight: 500, textAlign: 'left', transition: 'background-color 0.2s', backdropFilter: 'blur(4px)' }} onClick={() => navigate('/timeoff')} onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.8)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.5)'}>
                  <i className="fa fa-calendar-plus-o" style={{ width: '20px', color: '#875A7B', fontSize: '16px', textAlign: 'center' }}></i> Apply Leave
                </button>
                <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: '6px', cursor: 'pointer', color: '#374151', fontSize: '14px', fontWeight: 500, textAlign: 'left', transition: 'background-color 0.2s', backdropFilter: 'blur(4px)' }} onClick={() => navigate('/profile')} onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.8)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.5)'}>
                  <i className="fa fa-user-circle-o" style={{ width: '20px', color: '#875A7B', fontSize: '16px', textAlign: 'center' }}></i> My Profile
                </button>
                <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: '6px', cursor: 'pointer', color: '#374151', fontSize: '14px', fontWeight: 500, textAlign: 'left', transition: 'background-color 0.2s', backdropFilter: 'blur(4px)' }} onClick={() => navigate('/attendance')} onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.8)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.5)'}>
                  <i className="fa fa-bar-chart" style={{ width: '20px', color: '#875A7B', fontSize: '16px', textAlign: 'center' }}></i> Attendance Report
                </button>
              </div>
            </div>

            {/* Smart Reminders Widget */}
            <div className="hrms-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #E5E7EB', paddingBottom: '12px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#111827' }}><i className="fa fa-bell-o" style={{ color: '#875A7B' }}></i> AI Smart Reminders</h3>
                <span style={{ fontSize: '12px', color: '#6B7280', backgroundColor: '#F3F4F6', padding: '2px 8px', borderRadius: '12px' }}>Prioritized</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {reminders.map(rem => (
                  <div key={rem.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px', backgroundColor: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: '6px', backdropFilter: 'blur(4px)' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: rem.color, marginTop: '6px' }}></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', color: '#111827', fontWeight: 500 }}>{rem.title}</div>
                      <div style={{ fontSize: '11px', color: rem.color, fontWeight: 600, marginTop: '2px' }}>{rem.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Onboarding Checklist */}
            <div className="hrms-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #E5E7EB', paddingBottom: '12px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#111827' }}><i className="fa fa-list-ul" style={{ color: '#875A7B' }}></i> Onboarding</h3>
                <span style={{ fontSize: '12px', color: '#00A09D', fontWeight: 600 }}>{onboardingProgress}%</span>
              </div>
              
              <div style={{ height: '6px', backgroundColor: '#F3F4F6', borderRadius: '3px', width: '100%', overflow: 'hidden', marginBottom: '16px' }}>
                <div style={{ height: '100%', width: `${onboardingProgress}%`, backgroundColor: '#00A09D', transition: 'width 0.3s' }}></div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {onboardingTasks.map(task => (
                  <label key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: task.completed ? '#9CA3AF' : '#374151', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={task.completed} 
                      onChange={() => {
                        const newTasks = onboardingTasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t);
                        setOnboardingTasks(newTasks);
                      }}
                      style={{ accentColor: '#00A09D' }} 
                    />
                    <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>{task.text}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
