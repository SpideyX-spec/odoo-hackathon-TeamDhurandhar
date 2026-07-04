import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Attendance = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!userData || !token) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));

    fetch('/api/attendance/my', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setRecords(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [navigate]);

  if (!user || loading) return <div className="full-screen flex-center">Loading...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#F9FAFB' }}>
      
      {/* Odoo Control Panel */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#111827', fontWeight: 500 }}>Attendance Records</h2>
          <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>View your check-in and check-out logs</div>
        </div>
        <div style={{ position: 'relative', width: '300px' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, padding: '0 8px', backgroundColor: '#F3F4F6', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', borderRight: 'none', borderRadius: '4px 0 0 4px' }}>
             <i className="fa fa-filter" style={{ color: '#875A7B', fontSize: '12px' }}></i> <span style={{ fontSize: '12px', marginLeft: '4px' }}>My Attendance</span>
          </div>
          <input 
            type="text" 
            placeholder="Search..." 
            style={{ width: '100%', padding: '6px 8px 6px 130px', fontSize: '14px', border: '1px solid #E5E7EB', borderRadius: '4px', outline: 'none' }} 
          />
        </div>
      </div>

      <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
        <div className="hrms-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <th style={{ padding: '12px 16px', color: '#374151', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '12px 16px', color: '#374151', fontWeight: 600 }}>Check In</th>
                <th style={{ padding: '12px 16px', color: '#374151', fontWeight: 600 }}>Check Out</th>
                <th style={{ padding: '12px 16px', color: '#374151', fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF' }}>No attendance records found.</td>
                </tr>
              ) : (
                records.map((record, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: '#FFFFFF' }}>
                    <td style={{ padding: '12px 16px', color: '#111827', fontWeight: 500 }}>{record.date}</td>
                    <td style={{ padding: '12px 16px', color: '#4B5563' }}>{record.check_in || '-'}</td>
                    <td style={{ padding: '12px 16px', color: '#4B5563' }}>{record.check_out || '-'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 500,
                        backgroundColor: record.status === 'Present' ? '#E0F2F1' : '#FEF3C7',
                        color: record.status === 'Present' ? '#00A09D' : '#D97706'
                      }}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
