import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // If id is present, admin is viewing an employee
  
  const [currentUser, setCurrentUser] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [salaryData, setSalaryData] = useState(null);
  const [activeTab, setActiveTab] = useState('Private Info');
  const [loading, setLoading] = useState(true);

  // Form states
  const [privateInfo, setPrivateInfo] = useState({});
  const [salaryConfig, setSalaryConfig] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setCurrentUser(parsedUser);

    const targetId = id || parsedUser.id;
    const token = localStorage.getItem('token');

    // Fetch user info
    fetch(`/api/users/${targetId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setProfileUser(data);
        setPrivateInfo(data);
        
        // If admin/hr, fetch salary info
        if (parsedUser.role === 'Admin' || parsedUser.role === 'HR') {
          return fetch(`/api/salary/${targetId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }
        return null;
      })
      .then(res => res ? res.json() : null)
      .then(salary => {
        if (salary && !salary.error) {
          setSalaryData(salary);
          setSalaryConfig(salary);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

  }, [navigate, id]);

  const handlePrivateInfoChange = (e) => {
    setPrivateInfo({ ...privateInfo, [e.target.name]: e.target.value });
  };

  const handleSalaryConfigChange = (e) => {
    setSalaryConfig({ ...salaryConfig, [e.target.name]: parseFloat(e.target.value) || 0 });
  };

  const savePrivateInfo = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${profileUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(privateInfo)
      });
      if(res.ok) alert('Saved successfully');
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const saveSalaryInfo = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/salary/${profileUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(salaryConfig)
      });
      if(res.ok) alert('Salary structure saved successfully');
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  if (loading) return <div className="full-screen flex-center">Loading...</div>;
  if (!profileUser) return <div className="full-screen flex-center">User not found or access denied.</div>;

  const isAdmin = currentUser.role === 'Admin' || currentUser.role === 'HR';

  // Calculate salary components based on config
  const wage = salaryConfig.wage || 0;
  const basic = (wage * (salaryConfig.basic_percent || 0)) / 100;
  const hra = (basic * (salaryConfig.hra_percent || 0)) / 100;
  const standard = (wage * (salaryConfig.standard_percent || 0)) / 100;
  const perf = (wage * (salaryConfig.performance_percent || 0)) / 100;
  const lta = (basic * (salaryConfig.lta_percent || 0)) / 100;
  const fixed = wage - (basic + hra + standard + perf + lta);
  const pf = (basic * (salaryConfig.pf_percent || 0)) / 100;
  const profTax = salaryConfig.professional_tax || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#F9FAFB' }}>
      
      {/* Top Action Bar (Control Panel) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{ padding: '6px 16px', backgroundColor: '#875A7B', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500, fontSize: '13px' }} onClick={activeTab === 'Salary Info' ? saveSalaryInfo : savePrivateInfo} disabled={saving}>
            {saving ? 'SAVING...' : 'SAVE'}
          </button>
          <button style={{ padding: '6px 16px', backgroundColor: '#FFFFFF', color: '#374151', border: '1px solid #D1D5DB', borderRadius: '4px', cursor: 'pointer', fontWeight: 500, fontSize: '13px' }}>
            DISCARD
          </button>
        </div>
        <div style={{ fontSize: '14px', color: '#6B7280' }}>
          Profile / <span style={{ fontWeight: 500, color: '#111827' }}>{profileUser.name}</span>
        </div>
      </div>

      <main style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
        {/* Odoo Form Sheet Layout */}
        <div className="hrms-card" style={{ maxWidth: '1000px', margin: '0 auto', padding: 0, overflow: 'hidden' }}>
          
          {/* Form Header */}
          <div style={{ padding: '32px', display: 'flex', gap: '32px' }}>
            <div style={{ width: '96px', height: '96px', borderRadius: '4px', backgroundColor: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: '#6B7280', border: '1px solid #D1D5DB' }}>
              <i className="fa fa-camera" style={{ fontSize: '24px', opacity: 0.5 }}></i>
            </div>
            
            <div style={{ flex: 1 }}>
              <input type="text" value={profileUser.name} readOnly style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', border: 'none', backgroundColor: 'transparent', outline: 'none', width: '100%', marginBottom: '16px' }} />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'x 32px' }}>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
                  <label style={{ width: '120px', fontWeight: 500, color: '#4B5563', fontSize: '13px', borderBottom: '1px solid #F3F4F6' }}>Job Position</label>
                  <span style={{ fontSize: '13px', color: '#111827', borderBottom: '1px solid #F3F4F6', flex: 1 }}>{profileUser.job_position || '-'}</span>
                </div>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
                  <label style={{ width: '120px', fontWeight: 500, color: '#4B5563', fontSize: '13px', borderBottom: '1px solid #F3F4F6' }}>Department</label>
                  <span style={{ fontSize: '13px', color: '#111827', borderBottom: '1px solid #F3F4F6', flex: 1 }}>{profileUser.department || '-'}</span>
                </div>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
                  <label style={{ width: '120px', fontWeight: 500, color: '#4B5563', fontSize: '13px', borderBottom: '1px solid #F3F4F6' }}>Email</label>
                  <span style={{ fontSize: '13px', color: '#00A09D', borderBottom: '1px solid #F3F4F6', flex: 1 }}>{profileUser.email}</span>
                </div>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
                  <label style={{ width: '120px', fontWeight: 500, color: '#4B5563', fontSize: '13px', borderBottom: '1px solid #F3F4F6' }}>Manager</label>
                  <span style={{ fontSize: '13px', color: '#00A09D', borderBottom: '1px solid #F3F4F6', flex: 1 }}>{profileUser.manager || '-'}</span>
                </div>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
                  <label style={{ width: '120px', fontWeight: 500, color: '#4B5563', fontSize: '13px', borderBottom: '1px solid #F3F4F6' }}>Mobile</label>
                  <span style={{ fontSize: '13px', color: '#111827', borderBottom: '1px solid #F3F4F6', flex: 1 }}>{profileUser.phone || '-'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notebook Tabs */}
          <div style={{ display: 'flex', backgroundColor: '#F9FAFB', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB', padding: '0 24px' }}>
            {['Resume', 'Private Info', 'Salary Info', 'Security'].map(tab => {
              if (tab === 'Salary Info' && !isAdmin) return null; // Only admin sees salary info
              return (
                <div 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  style={{ 
                    padding: '12px 16px', 
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: activeTab === tab ? 600 : 400,
                    color: activeTab === tab ? '#111827' : '#6B7280',
                    borderTop: activeTab === tab ? '2px solid #875A7B' : '2px solid transparent',
                    backgroundColor: activeTab === tab ? '#FFFFFF' : 'transparent',
                    marginTop: '-1px'
                  }}
                >
                  {tab}
                </div>
              );
            })}
          </div>

          {/* Form Content */}
          <div style={{ padding: '32px' }}>
            {activeTab === 'Resume' && (
              <div>
                <p style={{ color: '#6B7280', fontSize: '13px', fontStyle: 'italic' }}>No resume information provided yet.</p>
              </div>
            )}

            {activeTab === 'Private Info' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px' }}>
                
                {/* Personal Details */}
                <div>
                  <h4 style={{ color: '#875A7B', fontSize: '14px', borderBottom: '1px solid #E5E7EB', paddingBottom: '8px', marginBottom: '16px' }}>Personal Details</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <label style={{ width: '120px', fontWeight: 500, color: '#4B5563', fontSize: '13px', paddingTop: '4px' }}>Date of Birth</label>
                      <input type="text" name="date_of_birth" value={privateInfo.date_of_birth || ''} onChange={handlePrivateInfoChange} style={{ flex: 1, padding: '4px 0', border: 'none', borderBottom: '1px solid #D1D5DB', outline: 'none', fontSize: '13px', color: '#111827' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <label style={{ width: '120px', fontWeight: 500, color: '#4B5563', fontSize: '13px', paddingTop: '4px' }}>Nationality</label>
                      <input type="text" name="nationality" value={privateInfo.nationality || ''} onChange={handlePrivateInfoChange} style={{ flex: 1, padding: '4px 0', border: 'none', borderBottom: '1px solid #D1D5DB', outline: 'none', fontSize: '13px', color: '#111827' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <label style={{ width: '120px', fontWeight: 500, color: '#4B5563', fontSize: '13px', paddingTop: '4px' }}>Gender</label>
                      <input type="text" name="gender" value={privateInfo.gender || ''} onChange={handlePrivateInfoChange} style={{ flex: 1, padding: '4px 0', border: 'none', borderBottom: '1px solid #D1D5DB', outline: 'none', fontSize: '13px', color: '#111827' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <label style={{ width: '120px', fontWeight: 500, color: '#4B5563', fontSize: '13px', paddingTop: '4px' }}>Marital Status</label>
                      <input type="text" name="marital_status" value={privateInfo.marital_status || ''} onChange={handlePrivateInfoChange} style={{ flex: 1, padding: '4px 0', border: 'none', borderBottom: '1px solid #D1D5DB', outline: 'none', fontSize: '13px', color: '#111827' }} />
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div>
                  <h4 style={{ color: '#875A7B', fontSize: '14px', borderBottom: '1px solid #E5E7EB', paddingBottom: '8px', marginBottom: '16px' }}>Bank Details</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <label style={{ width: '120px', fontWeight: 500, color: '#4B5563', fontSize: '13px', paddingTop: '4px' }}>Account Number</label>
                      <input type="text" name="account_number" value={privateInfo.account_number || ''} onChange={handlePrivateInfoChange} style={{ flex: 1, padding: '4px 0', border: 'none', borderBottom: '1px solid #D1D5DB', outline: 'none', fontSize: '13px', color: '#111827' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <label style={{ width: '120px', fontWeight: 500, color: '#4B5563', fontSize: '13px', paddingTop: '4px' }}>Bank Name</label>
                      <input type="text" name="bank_name" value={privateInfo.bank_name || ''} onChange={handlePrivateInfoChange} style={{ flex: 1, padding: '4px 0', border: 'none', borderBottom: '1px solid #D1D5DB', outline: 'none', fontSize: '13px', color: '#111827' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <label style={{ width: '120px', fontWeight: 500, color: '#4B5563', fontSize: '13px', paddingTop: '4px' }}>IFSC Code</label>
                      <input type="text" name="ifsc_code" value={privateInfo.ifsc_code || ''} onChange={handlePrivateInfoChange} style={{ flex: 1, padding: '4px 0', border: 'none', borderBottom: '1px solid #D1D5DB', outline: 'none', fontSize: '13px', color: '#111827' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <label style={{ width: '120px', fontWeight: 500, color: '#4B5563', fontSize: '13px', paddingTop: '4px' }}>PAN No</label>
                      <input type="text" name="pan_no" value={privateInfo.pan_no || ''} onChange={handlePrivateInfoChange} style={{ flex: 1, padding: '4px 0', border: 'none', borderBottom: '1px solid #D1D5DB', outline: 'none', fontSize: '13px', color: '#111827' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <label style={{ width: '120px', fontWeight: 500, color: '#4B5563', fontSize: '13px', paddingTop: '4px' }}>UAN No</label>
                      <input type="text" name="uan_no" value={privateInfo.uan_no || ''} onChange={handlePrivateInfoChange} style={{ flex: 1, padding: '4px 0', border: 'none', borderBottom: '1px solid #D1D5DB', outline: 'none', fontSize: '13px', color: '#111827' }} />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {activeTab === 'Salary Info' && isAdmin && salaryData && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB', padding: '16px', borderRadius: '4px', border: '1px solid #E5E7EB', marginBottom: '32px' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>Month Wage</span>
                    <input type="number" name="wage" value={salaryConfig.wage} onChange={handleSalaryConfigChange} style={{ width: '150px', fontSize: '16px', padding: '6px 12px', border: '1px solid #D1D5DB', borderRadius: '4px' }} />
                    <span style={{ fontSize: '13px', color: '#6B7280' }}>/ Month</span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#6B7280' }}>Working days in a week</span>
                    <input type="number" name="working_days" value={salaryConfig.working_days} onChange={handleSalaryConfigChange} style={{ width: '80px', padding: '6px', border: '1px solid #D1D5DB', borderRadius: '4px' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px' }}>
                  
                  {/* Earnings */}
                  <div>
                    <h4 style={{ color: '#00A09D', fontSize: '14px', borderBottom: '1px solid #E5E7EB', paddingBottom: '8px', marginBottom: '16px' }}>Salary Components</h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#4B5563' }}>Basic Salary</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>₹ {basic.toFixed(2)}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><input type="number" name="basic_percent" value={salaryConfig.basic_percent} onChange={handleSalaryConfigChange} style={{ width: '50px', padding: '2px 4px', border: '1px solid #D1D5DB', borderRadius: '2px', fontSize: '12px' }} /> %</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#4B5563' }}>House Rent Allowance</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>₹ {hra.toFixed(2)}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><input type="number" name="hra_percent" value={salaryConfig.hra_percent} onChange={handleSalaryConfigChange} style={{ width: '50px', padding: '2px 4px', border: '1px solid #D1D5DB', borderRadius: '2px', fontSize: '12px' }} /> %</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#4B5563' }}>Standard Allowance</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>₹ {standard.toFixed(2)}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><input type="number" name="standard_percent" value={salaryConfig.standard_percent} onChange={handleSalaryConfigChange} style={{ width: '50px', padding: '2px 4px', border: '1px solid #D1D5DB', borderRadius: '2px', fontSize: '12px' }} /> %</span>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#4B5563' }}>Performance Bonus</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>₹ {perf.toFixed(2)}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><input type="number" name="performance_percent" value={salaryConfig.performance_percent} onChange={handleSalaryConfigChange} style={{ width: '50px', padding: '2px 4px', border: '1px solid #D1D5DB', borderRadius: '2px', fontSize: '12px' }} /> %</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#4B5563' }}>Leave Travel Allowance</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>₹ {lta.toFixed(2)}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><input type="number" name="lta_percent" value={salaryConfig.lta_percent} onChange={handleSalaryConfigChange} style={{ width: '50px', padding: '2px 4px', border: '1px solid #D1D5DB', borderRadius: '2px', fontSize: '12px' }} /> %</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB', padding: '8px', borderRadius: '4px' }}>
                        <span style={{ fontSize: '13px', color: '#4B5563' }}>Fixed Allowance (Auto)</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>₹ {fixed.toFixed(2)}</span>
                          <span style={{ width: '50px', textAlign: 'center', fontSize: '11px', color: '#9CA3AF' }}>Rem</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div>
                    <h4 style={{ color: '#DC2626', fontSize: '14px', borderBottom: '1px solid #E5E7EB', paddingBottom: '8px', marginBottom: '16px' }}>Deductions & Contributions</h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#4B5563' }}>Provident Fund (Employee)</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>₹ {pf.toFixed(2)}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><input type="number" name="pf_percent" value={salaryConfig.pf_percent} onChange={handleSalaryConfigChange} style={{ width: '50px', padding: '2px 4px', border: '1px solid #D1D5DB', borderRadius: '2px', fontSize: '12px' }} /> %</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#4B5563' }}>Professional Tax</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <input type="number" name="professional_tax" value={salaryConfig.professional_tax} onChange={handleSalaryConfigChange} style={{ width: '80px', padding: '4px 8px', border: '1px solid #D1D5DB', borderRadius: '2px', fontSize: '13px' }} />
                          <span style={{ width: '50px', textAlign: 'center', fontSize: '11px', color: '#9CA3AF' }}>Fixed ₹</span>
                        </div>
                      </div>

                      <div style={{ marginTop: '32px', padding: '24px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#4B5563' }}>
                          <span>Gross Salary</span>
                          <span style={{ fontWeight: 600, color: '#111827' }}>₹ {wage.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '14px', color: '#DC2626' }}>
                          <span>Total Deductions</span>
                          <span style={{ fontWeight: 600 }}>- ₹ {(pf + profTax).toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #E5E7EB', paddingTop: '16px', fontSize: '18px', color: '#00A09D' }}>
                          <span style={{ fontWeight: 500 }}>Net Salary</span>
                          <span style={{ fontWeight: 'bold' }}>₹ {(wage - pf - profTax).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {activeTab === 'Security' && (
              <div>
                <p style={{ color: '#6B7280', fontSize: '13px', fontStyle: 'italic' }}>Update your password here (Coming soon).</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
