import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TimeOff = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    type: 'Sick Time Off',
    remarks: ''
  });
  const [submitStatus, setSubmitStatus] = useState('');

  const [activeTypes, setActiveTypes] = useState({
    'Sick Time Off': true,
    'Compensatory Days': true,
    'Paid Time Off': true
  });

  const fetchLeaves = (token) => {
    fetch('/api/leave', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { setLeaves(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!userData || !token) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchLeaves(token);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus('Submitting...');
    try {
      const res = await fetch('/api/leave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitStatus('Success! Leave is pending approval.');
        setTimeout(() => {
          setShowForm(false);
          setSubmitStatus('');
        }, 2000);
        fetchLeaves(localStorage.getItem('token'));
      } else {
        setSubmitStatus(`Error: ${data.error}`);
      }
    } catch (err) {
      setSubmitStatus(`Error: ${err.message}`);
    }
  };

  if (!user || loading) return <div className="full-screen flex-center">Loading...</div>;

  // Calculate Leave Balance
  const usedDays = leaves
    .filter(l => l.status === 'Approved' && l.type === 'Paid Time Off')
    .reduce((acc, curr) => {
        const start = new Date(curr.start_date);
        const end = new Date(curr.end_date);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return acc + diffDays;
    }, 0);

  // Dynamic Paid Time Off Allocation (combined no of weekdays in current month)
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  let defaultPTO = 0;
  for (let i = 1; i <= totalDaysInMonth; i++) {
    const d = new Date(currentYear, currentMonth, i).getDay();
    if (d !== 0 && d !== 6) defaultPTO++;
  }

  const remainingDays = defaultPTO - usedDays;

  // Helpers for Calendar
  const getLeaveForDay = (year, month, day) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return leaves.find(l => {
      // Only show if Approved (and type is active in checkboxes)
      if (l.status !== 'Approved') return false;
      if (!activeTypes[l.type]) return false;
      return dateStr >= l.start_date && dateStr <= l.end_date;
    });
  };

  const getLeaveColor = (type) => {
    if (type === 'Sick Time Off') return '#F59E0B'; // Amber
    if (type === 'Compensatory Days') return '#3B82F6'; // Blue
    if (type === 'Paid Time Off') return '#875A7B'; // Odoo Purple
    return '#111827';
  };

  const renderMonth = (year, monthIndex) => {
    const date = new Date(year, monthIndex, 1);
    const monthName = date.toLocaleString('default', { month: 'short' });
    const startIndex = date.getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < startIndex; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    
    return (
      <div key={`${year}-${monthIndex}`} style={{ flex: '1 1 250px', minWidth: '200px' }}>
        <h4 style={{ textAlign: 'center', margin: '0 0 12px 0', fontSize: '14px', color: '#374151', fontWeight: 500 }}>{monthName} {year}</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '4px', textAlign: 'center', fontSize: '12px' }}>
          <div style={{ color: '#9CA3AF', fontSize: '10px' }}>Week</div>
          <div style={{ color: '#6B7280' }}>S</div><div style={{ color: '#6B7280' }}>M</div><div style={{ color: '#6B7280' }}>T</div>
          <div style={{ color: '#6B7280' }}>W</div><div style={{ color: '#6B7280' }}>T</div><div style={{ color: '#6B7280' }}>F</div><div style={{ color: '#6B7280' }}>S</div>
          
          {Array.from({ length: Math.ceil(days.length / 7) }).map((_, weekIndex) => (
            <React.Fragment key={weekIndex}>
              <div style={{ color: '#9CA3AF', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {weekIndex + 1}
              </div>
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                const day = days[weekIndex * 7 + dayIndex];
                let bg = 'transparent';
                let color = '#374151';
                
                if (day) {
                  if (dayIndex === 0 || dayIndex === 6) bg = '#F3F4F6'; // weekend
                  
                  const activeLeave = getLeaveForDay(year, monthIndex + 1, day);
                  if (activeLeave) {
                    bg = getLeaveColor(activeLeave.type);
                    color = '#fff';
                  }
                }
                
                return (
                  <div key={dayIndex} style={{ 
                    height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    backgroundColor: bg, color: color, borderRadius: '2px'
                  }}>
                    {day || ''}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const handleTypeToggle = (type) => {
    setActiveTypes(prev => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'transparent' }}>
      
      {/* Top Title Bar */}
      <div className="glass-panel" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.4)', borderRadius: '0', gap: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '18px', color: '#111827', fontWeight: 500 }}>Dashboard ({currentYear})</h2>
        <div style={{ display: 'flex', gap: '16px', color: '#6B7280' }}>
           <i className="fa fa-calendar" style={{ cursor: 'pointer' }}></i>
           <i className="fa fa-list" style={{ cursor: 'pointer' }}></i>
           <i className="fa fa-clock-o" style={{ cursor: 'pointer' }}></i>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="glass-panel" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.4)', borderRadius: '0', gap: '16px' }}>
        <button style={{ padding: '6px 16px', backgroundColor: '#875A7B', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500, fontSize: '13px' }} onClick={() => setShowForm(true)}>NEW TIME OFF</button>
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'flex', flexWrap: 'wrap', flex: 1, overflow: 'auto' }}>
        
        {/* Left Side (Metrics & Calendars) */}
        <div style={{ flex: '1 1 60%', minWidth: '300px', padding: '24px' }}>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginBottom: '32px' }}>
            <div style={{ flex: '1 1 200px', padding: '24px', textAlign: 'center', border: '1px solid #E5E7EB', borderRadius: '8px', backgroundColor: '#fff' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#111827' }}>Paid Time Off</h3>
              <div style={{ fontSize: '32px', fontWeight: 600, color: '#875A7B', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <i className="fa fa-umbrella" style={{ fontSize: '24px', color: '#9CA3AF' }}></i> {remainingDays}
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6B7280', textTransform: 'uppercase' }}>Days Available <i className="fa fa-question-circle"></i></p>
            </div>
            
            <div style={{ flex: '1 1 200px', padding: '24px', textAlign: 'center', border: '1px solid #E5E7EB', borderRadius: '8px', backgroundColor: '#fff' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#111827' }}>Compensatory Days</h3>
              <div style={{ fontSize: '32px', fontWeight: 600, color: '#875A7B', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <i className="fa fa-balance-scale" style={{ fontSize: '24px', color: '#9CA3AF' }}></i> 0
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6B7280', textTransform: 'uppercase' }}>Hours Available <i className="fa fa-question-circle"></i></p>
            </div>
          </div>

          {leaves.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '32px' }}>
              {Array.from({ length: 12 }).map((_, i) => renderMonth(currentYear, i))}
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280', border: '1px dashed #D1D5DB', borderRadius: '8px' }}>
              <i className="fa fa-calendar-times-o" style={{ fontSize: '48px', marginBottom: '16px', color: '#D1D5DB' }}></i>
              <p>No past or active leave records found.</p>
              <p style={{ fontSize: '12px' }}>Apply for a new Time Off to see the calendar.</p>
            </div>
          )}
          
        </div>

        {/* Right Sidebar (Legends) */}
        <div style={{ flex: '1 1 300px', maxWidth: '400px', borderLeft: '1px solid #E5E7EB', backgroundColor: '#FFFFFF', padding: '24px' }}>
          
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#374151' }}><i className="fa fa-check-square-o"></i> Time Off Type</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '13px', color: '#4B5563', cursor: 'pointer' }} onClick={() => handleTypeToggle('Sick Time Off')}>
              <input type="checkbox" checked={activeTypes['Sick Time Off']} readOnly style={{ accentColor: '#F59E0B' }} /> Sick Time Off
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '13px', color: '#4B5563', cursor: 'pointer' }} onClick={() => handleTypeToggle('Compensatory Days')}>
              <input type="checkbox" checked={activeTypes['Compensatory Days']} readOnly style={{ accentColor: '#3B82F6' }} /> Compensatory Days
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#4B5563', cursor: 'pointer' }} onClick={() => handleTypeToggle('Paid Time Off')}>
              <input type="checkbox" checked={activeTypes['Paid Time Off']} readOnly style={{ accentColor: '#875A7B' }} /> Paid Time Off
            </div>
          </div>
          
          {leaves.filter(l => l.status === 'Pending').length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#374151' }}>My Pending Requests</h4>
              {leaves.filter(l => l.status === 'Pending').map(l => (
                <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', border: '1px solid #FCD34D', backgroundColor: '#FEF3C7', borderRadius: '4px', marginBottom: '8px', fontSize: '12px' }}>
                  <div>
                    <strong>{l.type}</strong><br/>
                    {l.start_date} to {l.end_date}
                  </div>
                  <div style={{ color: '#D97706', fontWeight: 500 }}>Pending</div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Apply Leave Modal */}
      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', backgroundColor: '#fff', border: 'none', color: '#111827' }}>
            <h3 style={{ margin: '0 0 16px 0', borderBottom: '1px solid #E5E7EB', paddingBottom: '12px' }}>Apply for Leave</h3>
            {submitStatus && <div style={{ marginBottom: '16px', color: submitStatus.includes('Error') ? '#DC2626' : '#059669', fontSize: '14px' }}>{submitStatus}</div>}
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} required style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #D1D5DB', backgroundColor: '#fff', color: '#111827' }}>
                <option value="Sick Time Off">Sick Time Off</option>
                <option value="Compensatory Days">Compensatory Days</option>
                <option value="Paid Time Off">Paid Time Off</option>
              </select>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ flex: '1 1 140px' }}>
                  <label style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>Start Date</label>
                  <input type="date" required value={formData.start_date} min={new Date().toISOString().split('T')[0]} onChange={e => setFormData({...formData, start_date: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #D1D5DB', marginTop: '4px', backgroundColor: '#fff', color: '#111827' }} />
                </div>
                <div style={{ flex: '1 1 140px' }}>
                  <label style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>End Date</label>
                  <input type="date" required value={formData.end_date} min={formData.start_date || new Date().toISOString().split('T')[0]} onChange={e => setFormData({...formData, end_date: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #D1D5DB', marginTop: '4px', backgroundColor: '#fff', color: '#111827' }} />
                </div>
              </div>

              <textarea placeholder="Remarks / Reason" value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} rows="3" style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #D1D5DB', backgroundColor: '#fff', color: '#111827' }}></textarea>

              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button type="submit" style={{ flex: 1, padding: '8px 16px', backgroundColor: '#875A7B', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}>Submit</button>
                <button type="button" style={{ flex: 1, padding: '8px 16px', backgroundColor: '#FFFFFF', color: '#374151', border: '1px solid #D1D5DB', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }} onClick={() => { setShowForm(false); setSubmitStatus(''); }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeOff;
