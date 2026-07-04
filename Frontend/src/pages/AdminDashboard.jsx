import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddModal, setShowAddModal] = useState(location.state?.openNew || false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', job_position: '' });
  const [addStatus, setAddStatus] = useState('');

  const [leaves, setLeaves] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [activeTab, setActiveTab] = useState('employees'); // 'employees', 'attendance', 'leaves'

  const fetchEmployees = (token) => {
    fetch('/api/users', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { setEmployees(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  const fetchLeaves = (token) => {
    fetch('/api/leave', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setLeaves(data))
      .catch(err => console.error(err));
  };

  const fetchAttendances = (token) => {
    fetch('/api/attendance/today', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setAttendances(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      navigate('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'Admin' && parsedUser.role !== 'HR') {
      navigate('/dashboard'); // Redirect non-admins
      return;
    }
    setUser(parsedUser);
    fetchEmployees(token);
    fetchLeaves(token);
    fetchAttendances(token);
  }, [navigate]);

  const handleUpdateLeave = async (id, status) => {
    try {
      const res = await fetch(`/api/leave/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status, admin_comments: 'Updated by Admin' })
      });
      if (res.ok) {
        fetchLeaves(localStorage.getItem('token'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setAddStatus('Creating...');
    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if(res.ok) {
        setAddStatus(`Success! ID: ${data.userId} | Password: ${data.autoPassword}`);
        fetchEmployees(localStorage.getItem('token'));
      } else {
        setAddStatus(`Error: ${data.error}`);
      }
    } catch (err) {
      setAddStatus(`Error: ${err.message}`);
    }
  };

  if (!user || loading) return <div className="full-screen flex-center">Loading...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#F9FAFB' }}>
      
      {/* Odoo Control Panel */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#111827', fontWeight: 500 }}>Employees</h2>
          <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>Manage directory, attendance, and leaves</div>
        </div>
        <div style={{ position: 'relative', width: '350px' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, padding: '0 8px', backgroundColor: '#F3F4F6', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', borderRight: 'none', borderRadius: '4px 0 0 4px' }}>
             <i className="fa fa-filter" style={{ color: '#875A7B', fontSize: '12px' }}></i> <span style={{ fontSize: '12px', marginLeft: '4px' }}>Active Employees</span>
          </div>
          <input 
            type="text" 
            placeholder="Search..." 
            style={{ width: '100%', padding: '6px 8px 6px 145px', fontSize: '14px', border: '1px solid #E5E7EB', borderRadius: '4px', outline: 'none' }} 
          />
        </div>
      </div>

      {/* Secondary Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            style={{ padding: '6px 16px', backgroundColor: '#875A7B', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500, fontSize: '13px' }} 
            onClick={() => setShowAddModal(true)}
          >
            CREATE
          </button>
          <button style={{ padding: '6px 16px', backgroundColor: 'transparent', color: '#374151', border: '1px solid transparent', cursor: 'pointer', fontWeight: 500, fontSize: '13px' }}>
            IMPORT
          </button>
        </div>
        <div style={{ display: 'flex', gap: '16px', color: '#6B7280' }}>
           <i className={`fa fa-th-large ${activeTab === 'employees' ? 'hrms-text' : ''}`} style={{ cursor: 'pointer', color: activeTab === 'employees' ? '#875A7B' : '#9CA3AF' }} onClick={() => setActiveTab('employees')}></i>
           <i className={`fa fa-list ${activeTab === 'attendance' ? 'hrms-text' : ''}`} style={{ cursor: 'pointer', color: activeTab === 'attendance' ? '#875A7B' : '#9CA3AF' }} onClick={() => setActiveTab('attendance')}></i>
           <i className={`fa fa-calendar ${activeTab === 'leaves' ? 'hrms-text' : ''}`} style={{ cursor: 'pointer', color: activeTab === 'leaves' ? '#875A7B' : '#9CA3AF' }} onClick={() => setActiveTab('leaves')}></i>
        </div>
      </div>

      {/* Custom Tabs Navigation (Inside main content) */}
      <div style={{ padding: '0 24px', borderBottom: '1px solid #E5E7EB', backgroundColor: '#FFFFFF', display: 'flex', gap: '24px' }}>
        <div 
          onClick={() => setActiveTab('employees')} 
          style={{ padding: '16px 0', fontSize: '14px', fontWeight: 500, cursor: 'pointer', color: activeTab === 'employees' ? '#875A7B' : '#6B7280', borderBottom: activeTab === 'employees' ? '2px solid #875A7B' : '2px solid transparent' }}
        >
          Employees
        </div>
        <div 
          onClick={() => setActiveTab('attendance')} 
          style={{ padding: '16px 0', fontSize: '14px', fontWeight: 500, cursor: 'pointer', color: activeTab === 'attendance' ? '#875A7B' : '#6B7280', borderBottom: activeTab === 'attendance' ? '2px solid #875A7B' : '2px solid transparent' }}
        >
          Today's Attendance
        </div>
        <div 
          onClick={() => setActiveTab('leaves')} 
          style={{ padding: '16px 0', fontSize: '14px', fontWeight: 500, cursor: 'pointer', color: activeTab === 'leaves' ? '#875A7B' : '#6B7280', borderBottom: activeTab === 'leaves' ? '2px solid #875A7B' : '2px solid transparent' }}
        >
          Leave Requests
        </div>
      </div>

      <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
        
        {/* EMPLOYEES KANBAN */}
        {activeTab === 'employees' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {employees.map(emp => {
              const empAttendance = attendances.find(a => a.user_id === emp.id);
              const isPresent = empAttendance && empAttendance.status === 'Present';
              
              return (
                <div 
                  key={emp.id} 
                  className="hrms-card" 
                  style={{ display: 'flex', gap: '16px', alignItems: 'center', cursor: 'pointer', padding: '16px', position: 'relative' }} 
                  onClick={() => navigate(`/profile/${emp.id}`)}
                >
                  <div style={{ position: 'absolute', top: '12px', right: '12px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: isPresent ? '#00A09D' : '#DC2626' }} title={isPresent ? "Present" : "Absent"}></div>
                  
                  <div style={{ width: '64px', height: '64px', borderRadius: '4px', backgroundColor: '#F3EEF1', color: '#875A7B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 600 }}>
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#111827', fontWeight: 600 }}>{emp.name}</h3>
                    <p style={{ margin: 0, color: '#6B7280', fontSize: '13px' }}>{emp.job_position || 'Employee'}</p>
                    <p style={{ margin: '4px 0 0 0', color: '#9CA3AF', fontSize: '11px' }}><i className="fa fa-envelope-o"></i> {emp.email}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ATTENDANCE LIST VIEW */}
        {activeTab === 'attendance' && (
          <div className="hrms-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  <th style={{ padding: '12px 16px', color: '#374151', fontWeight: 600 }}>Employee</th>
                  <th style={{ padding: '12px 16px', color: '#374151', fontWeight: 600 }}>Check In</th>
                  <th style={{ padding: '12px 16px', color: '#374151', fontWeight: 600 }}>Check Out</th>
                  <th style={{ padding: '12px 16px', color: '#374151', fontWeight: 600 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendances.length === 0 ? (
                  <tr><td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF' }}>No attendance records for today.</td></tr>
                ) : (
                  attendances.map(record => (
                    <tr key={record.id} style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: '#FFFFFF' }}>
                      <td style={{ padding: '12px 16px', color: '#111827', fontWeight: 500 }}>{record.name}</td>
                      <td style={{ padding: '12px 16px', color: '#4B5563' }}>{record.check_in || '-'}</td>
                      <td style={{ padding: '12px 16px', color: '#4B5563' }}>{record.check_out || '-'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 500,
                          backgroundColor: record.status === 'Present' ? '#E0F2F1' : '#F3F4F6',
                          color: record.status === 'Present' ? '#00A09D' : '#6B7280'
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
        )}

        {/* LEAVES LIST VIEW */}
        {activeTab === 'leaves' && (
          <div className="hrms-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  <th style={{ padding: '12px 16px', color: '#374151', fontWeight: 600 }}>Employee</th>
                  <th style={{ padding: '12px 16px', color: '#374151', fontWeight: 600 }}>Type</th>
                  <th style={{ padding: '12px 16px', color: '#374151', fontWeight: 600 }}>Start Date</th>
                  <th style={{ padding: '12px 16px', color: '#374151', fontWeight: 600 }}>End Date</th>
                  <th style={{ padding: '12px 16px', color: '#374151', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '12px 16px', color: '#374151', fontWeight: 600 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {leaves.length === 0 ? (
                  <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF' }}>No leave requests found.</td></tr>
                ) : (
                  leaves.map(leave => (
                    <tr key={leave.id} style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: '#FFFFFF' }}>
                      <td style={{ padding: '12px 16px', color: '#111827', fontWeight: 500 }}>{leave.name}</td>
                      <td style={{ padding: '12px 16px', color: '#4B5563' }}>{leave.type}</td>
                      <td style={{ padding: '12px 16px', color: '#4B5563' }}>{leave.start_date}</td>
                      <td style={{ padding: '12px 16px', color: '#4B5563' }}>{leave.end_date}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 500,
                          backgroundColor: leave.status === 'Approved' ? '#E0F2F1' : leave.status === 'Rejected' ? '#FEF2F2' : '#FEF3C7',
                          color: leave.status === 'Approved' ? '#00A09D' : leave.status === 'Rejected' ? '#DC2626' : '#D97706'
                        }}>
                          {leave.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {leave.status === 'Pending' && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button style={{ backgroundColor: '#00A09D', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }} onClick={() => handleUpdateLeave(leave.id, 'Approved')}>Approve</button>
                            <button style={{ backgroundColor: '#FFFFFF', color: '#DC2626', border: '1px solid #DC2626', padding: '3px 11px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }} onClick={() => handleUpdateLeave(leave.id, 'Rejected')}>Reject</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Add Employee Modal (Odoo Dialog Style) */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="hrms-card" style={{ width: '450px', padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#111827' }}>Create Employee</h3>
              <i className="fa fa-times" style={{ color: '#9CA3AF', cursor: 'pointer' }} onClick={() => { setShowAddModal(false); setAddStatus(''); }}></i>
            </div>
            
            <div style={{ padding: '24px' }}>
              {addStatus && <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#F3F4F6', color: '#374151', fontSize: '13px', borderRadius: '4px', borderLeft: '4px solid #875A7B' }}>{addStatus}</div>}
              <form onSubmit={handleAddEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#374151', marginBottom: '6px', fontWeight: 500 }}>Full Name</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '4px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#374151', marginBottom: '6px', fontWeight: 500 }}>Email Address</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '4px' }} />
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '13px', color: '#374151', marginBottom: '6px', fontWeight: 500 }}>Phone</label>
                    <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '4px' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '13px', color: '#374151', marginBottom: '6px', fontWeight: 500 }}>Job Position</label>
                    <input type="text" value={formData.job_position} onChange={e => setFormData({...formData, job_position: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '4px' }} />
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#875A7B', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}>Create</button>
                  <button type="button" style={{ padding: '8px 16px', backgroundColor: '#FFFFFF', color: '#374151', border: '1px solid #D1D5DB', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }} onClick={() => { setShowAddModal(false); setAddStatus(''); }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
