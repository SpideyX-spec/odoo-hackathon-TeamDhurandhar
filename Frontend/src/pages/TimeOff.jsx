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

  const fetchLeaves = (token) => {
    fetch('/api/leave', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { setLeaves(data); setLoading(false); })
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
        setSubmitStatus('Success!');
        setShowForm(false);
        fetchLeaves(localStorage.getItem('token'));
      } else {
        setSubmitStatus(`Error: ${data.error}`);
      }
    } catch (err) {
      setSubmitStatus(`Error: ${err.message}`);
    }
  };

  if (!user || loading) return <div className="full-screen flex-center">Loading...</div>;

  // Render Calendar Month
  const renderMonth = (monthName, startIndex, daysInMonth, highlights) => {
    const days = [];
    for (let i = 0; i < startIndex; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    
    return (
      <div key={monthName} style={{ flex: '1 1 200px', minWidth: '200px' }}>
        <h4 style={{ textAlign: 'center', margin: '0 0 12px 0', fontSize: '14px', color: '#374151', fontWeight: 500 }}>{monthName} 2026</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '4px', textAlign: 'center', fontSize: '12px' }}>
          <div style={{ color: '#9CA3AF', fontSize: '10px' }}>Week</div>
          <div style={{ color: '#6B7280' }}>S</div><div style={{ color: '#6B7280' }}>M</div><div style={{ color: '#6B7280' }}>T</div>
          <div style={{ color: '#6B7280' }}>W</div><div style={{ color: '#6B7280' }}>T</div><div style={{ color: '#6B7280' }}>F</div><div style={{ color: '#6B7280' }}>S</div>
          
          {/* Calendar grid rendering */}
          {Array.from({ length: Math.ceil(days.length / 7) }).map((_, weekIndex) => (
            <React.Fragment key={weekIndex}>
              <div style={{ color: '#9CA3AF', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {weekIndex + 1}
              </div>
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                const day = days[weekIndex * 7 + dayIndex];
                let bg = 'transparent';
                let color = '#374151';
                let borderRadius = '0';
                let border = 'none';
                
                // Demo Highlights logic
                if (dayIndex === 0 || dayIndex === 6) bg = '#F3F4F6'; // weekend
                if (monthName === 'Jan' && day === 23) { bg = '#F3EEF1'; borderRadius = '50%'; border = '1px solid #875A7B'; }
                if (monthName === 'Jul' && day === 4) { bg = '#FCA5A5'; color = '#fff'; borderRadius = '50%'; }
                if (monthName === 'Jul' && day >= 6 && day <= 9) { bg = '#DBEAFE'; }
                if (monthName === 'Jul' && day >= 20 && day <= 23) { bg = '#FEF08A'; }
                
                return (
                  <div key={dayIndex} style={{ 
                    height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    backgroundColor: bg, color: color, borderRadius: borderRadius, border: border 
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#FFFFFF' }}>
      
      {/* Top Title Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #E5E7EB' }}>
        <h2 style={{ margin: 0, fontSize: '18px', color: '#111827', fontWeight: 500 }}>Dashboard (2026)</h2>
        <div style={{ position: 'relative', width: '300px' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, padding: '0 8px', backgroundColor: '#F3F4F6', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', borderRight: 'none', borderRadius: '4px 0 0 4px' }}>
             <i className="fa fa-filter" style={{ color: '#875A7B', fontSize: '12px' }}></i> <span style={{ fontSize: '12px', marginLeft: '4px' }}>Active Time Off ×</span>
          </div>
          <input type="text" placeholder="Search..." style={{ width: '100%', padding: '6px 8px 6px 140px', fontSize: '14px', border: '1px solid #E5E7EB', borderRadius: '4px', outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', gap: '16px', color: '#6B7280' }}>
           <i className="fa fa-calendar" style={{ cursor: 'pointer' }}></i>
           <i className="fa fa-list" style={{ cursor: 'pointer' }}></i>
           <i className="fa fa-clock-o" style={{ cursor: 'pointer' }}></i>
        </div>
      </div>

      {/* Action Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 24px', borderBottom: '1px solid #E5E7EB', gap: '16px' }}>
        <div style={{ display: 'flex' }}>
          <button style={{ padding: '6px 12px', backgroundColor: '#875A7B', color: 'white', border: 'none', borderRadius: '4px 0 0 4px', cursor: 'pointer' }}><i className="fa fa-arrow-left"></i></button>
          <button style={{ padding: '6px 12px', backgroundColor: '#875A7B', color: 'white', border: 'none', borderLeft: '1px solid #9D7590', borderRight: '1px solid #9D7590', cursor: 'pointer' }}>TODAY</button>
          <button style={{ padding: '6px 12px', backgroundColor: '#875A7B', color: 'white', border: 'none', borderRadius: '0 4px 4px 0', cursor: 'pointer' }}><i className="fa fa-arrow-right"></i></button>
        </div>
        
        <button style={{ padding: '6px 12px', backgroundColor: 'transparent', color: '#374151', border: '1px solid transparent', cursor: 'pointer', fontWeight: 500 }}>YEAR <i className="fa fa-caret-down"></i></button>
        
        <button style={{ padding: '6px 16px', backgroundColor: '#875A7B', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500, fontSize: '13px' }} onClick={() => setShowForm(true)}>NEW TIME OFF</button>
        <button style={{ padding: '6px 16px', backgroundColor: 'transparent', color: '#374151', border: '1px solid transparent', cursor: 'pointer', fontWeight: 500, fontSize: '13px' }}>ALLOCATION REQUEST</button>
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* Left Side (Metrics & Calendars) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          
          {/* Metrics Row */}
          <div style={{ display: 'flex', border: '1px solid #E5E7EB', borderRadius: '8px', marginBottom: '32px' }}>
            <div style={{ flex: 1, padding: '24px', textAlign: 'center', borderRight: '1px solid #E5E7EB' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#111827' }}>Paid Time Off</h3>
              <div style={{ fontSize: '32px', fontWeight: 600, color: '#875A7B', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <i className="fa fa-umbrella" style={{ fontSize: '24px', color: '#9CA3AF' }}></i> 20
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6B7280', textTransform: 'uppercase' }}>Days Available <i className="fa fa-question-circle"></i></p>
              <p style={{ margin: 0, fontSize: '10px', color: '#9CA3AF' }}>(VALID UNTIL 12/31/2026)</p>
            </div>
            
            <div style={{ flex: 1, padding: '24px', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#111827' }}>Compensatory Days</h3>
              <div style={{ fontSize: '32px', fontWeight: 600, color: '#875A7B', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <i className="fa fa-balance-scale" style={{ fontSize: '24px', color: '#9CA3AF' }}></i> 129.5
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6B7280', textTransform: 'uppercase' }}>Hours Available <i className="fa fa-question-circle"></i></p>
              <p style={{ margin: 0, fontSize: '10px', color: '#9CA3AF' }}>(VALID UNTIL 12/31/2026)</p>
            </div>
          </div>

          {/* Calendar Grid (Hardcoded 8 months to match visual density, normally dynamic) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '32px' }}>
            {renderMonth('Jan', 4, 31)}
            {renderMonth('Feb', 0, 28)}
            {renderMonth('Mar', 0, 31)}
            {renderMonth('Apr', 3, 30)}
            {renderMonth('May', 5, 31)}
            {renderMonth('Jun', 1, 30)}
            {renderMonth('Jul', 3, 31)}
            {renderMonth('Aug', 6, 31)}
          </div>
          
        </div>

        {/* Right Sidebar (Legends) */}
        <div style={{ width: '250px', borderLeft: '1px solid #E5E7EB', backgroundColor: '#FFFFFF', padding: '24px', overflowY: 'auto' }}>
          
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#374151' }}><i className="fa fa-check-square-o"></i> Time Off Type</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '13px', color: '#4B5563' }}>
              <input type="checkbox" checked readOnly style={{ accentColor: '#F59E0B' }} /> Sick Time Off
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#4B5563' }}>
              <input type="checkbox" checked readOnly style={{ accentColor: '#3B82F6' }} /> Compensatory Days
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#374151' }}>Legend</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '13px', color: '#4B5563' }}>
              <div style={{ width: '16px', height: '16px', backgroundColor: '#875A7B', borderRadius: '2px' }}></div> Validated
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '13px', color: '#4B5563' }}>
              <div style={{ width: '16px', height: '16px', backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, #E5E7EB 2px, #E5E7EB 4px)', borderRadius: '2px', border: '1px solid #D1D5DB' }}></div> To Approve
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '13px', color: '#4B5563' }}>
              <div style={{ width: '16px', height: '2px', backgroundColor: '#9CA3AF' }}></div> Refused
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '13px', color: '#4B5563' }}>
              <div style={{ width: '20px', textAlign: 'center', backgroundColor: '#F3F4F6', color: '#9CA3AF', fontSize: '10px', padding: '2px 0', borderRadius: '2px' }}>13</div> Public Holiday
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#4B5563' }}>
              <div style={{ width: '20px', textAlign: 'center', backgroundColor: '#F3F4F6', color: '#9CA3AF', fontSize: '10px', padding: '2px 0', borderRadius: '2px' }}>13</div> Stress Day
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#374151' }}>Stress Days</h4>
            <div style={{ fontSize: '13px', color: '#DC2626', fontWeight: 500 }}>July 11, 2026 <span style={{ color: '#4B5563', fontWeight: 'normal' }}>: Company Celebration</span></div>
          </div>

          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#374151' }}>Public Holidays</h4>
            <div style={{ fontSize: '13px', color: '#111827', fontWeight: 500 }}>July 12, 2026 <span style={{ color: '#4B5563', fontWeight: 'normal' }}>: Public Time Off</span></div>
          </div>

        </div>
      </div>

      {/* Apply Leave Modal */}
      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '400px', backgroundColor: '#fff', border: 'none', color: '#111827' }}>
            <h3 style={{ margin: '0 0 16px 0', borderBottom: '1px solid #E5E7EB', paddingBottom: '12px' }}>Apply for Leave</h3>
            {submitStatus && <div style={{ marginBottom: '16px', color: '#D97706', fontSize: '14px' }}>{submitStatus}</div>}
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} required style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #D1D5DB', backgroundColor: '#fff', color: '#111827' }}>
                <option value="Sick Time Off">Sick Time Off</option>
                <option value="Compensatory Days">Compensatory Days</option>
                <option value="Paid Time Off">Paid Time Off</option>
              </select>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>Start Date</label>
                  <input type="date" required value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #D1D5DB', marginTop: '4px', backgroundColor: '#fff', color: '#111827' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>End Date</label>
                  <input type="date" required value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #D1D5DB', marginTop: '4px', backgroundColor: '#fff', color: '#111827' }} />
                </div>
              </div>

              <textarea placeholder="Remarks / Reason" value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} rows="3" style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #D1D5DB', backgroundColor: '#fff', color: '#111827' }}></textarea>

              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#875A7B', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}>Submit</button>
                <button type="button" style={{ padding: '8px 16px', backgroundColor: '#FFFFFF', color: '#374151', border: '1px solid #D1D5DB', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }} onClick={() => { setShowForm(false); setSubmitStatus(''); }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeOff;
