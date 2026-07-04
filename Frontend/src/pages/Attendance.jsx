import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Attendance = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Stats
  const [daysPresent, setDaysPresent] = useState(0);
  const [totalWorkingDays] = useState(22); // Fixed for demo

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!userData || !token) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    const isAdmin = parsedUser.role === 'Admin' || parsedUser.role === 'HR';
    const endpoint = isAdmin ? '/api/attendance/today' : '/api/attendance/my';

    fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setRecords(data);
        if (!isAdmin) {
          setDaysPresent(data.length);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [navigate]);

  const calculateHours = (checkInStr, checkOutStr) => {
    if (!checkInStr || !checkOutStr) return { workHours: '-', extraHours: '-' };
    
    const parseTime = (timeStr) => {
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes, seconds] = time.split(':').map(Number);
      
      // If there is no modifier, assume 24h format
      if (!modifier) {
        return hours + ((minutes || 0) / 60) + ((seconds || 0) / 3600);
      }

      if (hours === 12) {
        hours = modifier === 'AM' ? 0 : 12;
      } else if (modifier === 'PM') {
        hours = hours + 12;
      }
      return hours + (minutes / 60) + (seconds / 3600);
    };

    try {
      const inTime = parseTime(checkInStr);
      const outTime = parseTime(checkOutStr);
      
      let diff = outTime - inTime;
      if (diff < 0) diff += 24; 
      
      const formatHrs = (h) => {
        const hh = Math.floor(h);
        const mm = Math.round((h - hh) * 60);
        return `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`;
      };

      const workHrsDec = diff;
      const extraHrsDec = Math.max(0, diff - 9);

      return {
        workHours: formatHrs(workHrsDec),
        extraHours: formatHrs(extraHrsDec)
      };
    } catch(e) {
       return { workHours: '-', extraHours: '-' };
    }
  };

  if (!user || loading) return <div className="full-screen flex-center">Loading...</div>;

  const isAdmin = user.role === 'Admin' || user.role === 'HR';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'transparent' }}>
      
      {/* Odoo Control Panel */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#111827', fontWeight: 500 }}>{isAdmin ? 'Attendances List view' : 'Attendance'}</h2>
          <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>{isAdmin ? 'For Admin/HR Officer' : 'For Employees'}</div>
        </div>
        
        {isAdmin && (
          <div style={{ position: 'relative', width: '300px' }}>
            <input 
              type="text" 
              placeholder="Searchbar..." 
              style={{ width: '100%', padding: '6px 8px 6px 12px', fontSize: '14px', border: '1px solid #E5E7EB', borderRadius: '4px', outline: 'none', backgroundColor: '#FFFFFF' }} 
            />
          </div>
        )}
      </div>

      <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
        
        {/* Navigation / Filters Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <button style={{ padding: '4px 12px', border: '1px solid rgba(0,0,0,0.2)', background: 'transparent', borderRadius: '4px', cursor: 'pointer', color: '#374151' }}>{'<-'}</button>
          <button style={{ padding: '4px 12px', border: '1px solid rgba(0,0,0,0.2)', background: 'transparent', borderRadius: '4px', cursor: 'pointer', color: '#374151' }}>{'->'}</button>
          
          {isAdmin ? (
            <>
              <button style={{ padding: '4px 12px', border: '1px solid rgba(0,0,0,0.2)', background: 'transparent', borderRadius: '4px', cursor: 'pointer', color: '#374151' }}>Date v</button>
              <button style={{ padding: '4px 12px', border: '1px solid rgba(0,0,0,0.2)', background: 'transparent', borderRadius: '4px', cursor: 'pointer', color: '#374151' }}>Day</button>
            </>
          ) : (
            <>
              <button style={{ padding: '4px 12px', border: '1px solid rgba(0,0,0,0.2)', background: 'transparent', borderRadius: '4px', cursor: 'pointer', color: '#374151' }}>Oct v</button>
              <div style={{ display: 'flex', gap: '16px', marginLeft: '16px' }}>
                <div style={{ border: '1px solid rgba(0,0,0,0.2)', padding: '4px 12px', borderRadius: '4px', fontSize: '13px', color: '#374151' }}>Count of days present: <strong>{daysPresent}</strong></div>
                <div style={{ border: '1px solid rgba(0,0,0,0.2)', padding: '4px 12px', borderRadius: '4px', fontSize: '13px', color: '#374151' }}>Leaves count: <strong>0</strong></div>
                <div style={{ border: '1px solid rgba(0,0,0,0.2)', padding: '4px 12px', borderRadius: '4px', fontSize: '13px', color: '#374151' }}>Total working days: <strong>{totalWorkingDays}</strong></div>
              </div>
            </>
          )}
        </div>

        <div className="hrms-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF' }}>
          <div style={{ padding: '12px 16px', backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', fontWeight: 600, color: '#374151' }}>
             22, October 2025
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <th style={{ padding: '12px 16px', color: '#374151', fontWeight: 600, borderRight: '1px solid rgba(0,0,0,0.1)' }}>{isAdmin ? 'Emp' : 'Date'}</th>
                <th style={{ padding: '12px 16px', color: '#374151', fontWeight: 600, borderRight: '1px solid rgba(0,0,0,0.1)' }}>Check In</th>
                <th style={{ padding: '12px 16px', color: '#374151', fontWeight: 600, borderRight: '1px solid rgba(0,0,0,0.1)' }}>Check Out</th>
                <th style={{ padding: '12px 16px', color: '#374151', fontWeight: 600, borderRight: '1px solid rgba(0,0,0,0.1)' }}>Work Hours</th>
                <th style={{ padding: '12px 16px', color: '#374151', fontWeight: 600 }}>Extra hours</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF' }}>No attendance records found.</td>
                </tr>
              ) : (
                records.map((record, index) => {
                  const { workHours, extraHours } = calculateHours(record.check_in, record.check_out);
                  
                  return (
                    <tr key={index} style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', backgroundColor: 'transparent' }}>
                      <td style={{ padding: '12px 16px', color: '#111827', fontWeight: 500, borderRight: '1px solid rgba(0,0,0,0.1)' }}>{isAdmin ? record.name : record.date}</td>
                      <td style={{ padding: '12px 16px', color: '#4B5563', borderRight: '1px solid rgba(0,0,0,0.1)' }}>{record.check_in || '-'}</td>
                      <td style={{ padding: '12px 16px', color: '#4B5563', borderRight: '1px solid rgba(0,0,0,0.1)' }}>{record.check_out || '-'}</td>
                      <td style={{ padding: '12px 16px', color: '#4B5563', borderRight: '1px solid rgba(0,0,0,0.1)' }}>{workHours}</td>
                      <td style={{ padding: '12px 16px', color: '#4B5563' }}>{extraHours}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
