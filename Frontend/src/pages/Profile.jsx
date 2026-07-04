import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // If id is present, admin is viewing an employee
  
  const [currentUser, setCurrentUser] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [activeTab, setActiveTab] = useState('Resume');
  const [loading, setLoading] = useState(true);

  // Form states
  const [privateInfo, setPrivateInfo] = useState({});
  const [salaryConfig, setSalaryConfig] = useState({});
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  
  const [payslip, setPayslip] = useState(null);
  const [generatingPayslip, setGeneratingPayslip] = useState(false);

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) return alert('Password must be at least 6 characters');
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${profileUser.id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ newPassword })
      });
      if(res.ok) {
        alert('Password changed successfully');
        setNewPassword('');
      } else {
        alert('Failed to change password');
      }
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

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
        
        return fetch(`/api/salary/${targetId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      })
      .then(res => res ? res.json() : null)
      .then(salary => {
        if (salary && !salary.error) {
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

  if (loading) return <div className="full-screen flex-center" style={{color: '#111827'}}>Loading...</div>;
  if (!profileUser) return <div className="full-screen flex-center" style={{color: '#111827'}}>User not found or access denied.</div>;

  const isAdmin = currentUser.role === 'Admin' || currentUser.role === 'HR';

  // Calculate salary components based on config
  const wage = salaryConfig.wage || 0;
  const basic = (wage * (salaryConfig.basic_percent || 0)) / 100;
  const hra = (basic * (salaryConfig.hra_percent || 0)) / 100;
  const standard = (wage * (salaryConfig.standard_percent || 0)) / 100;
  const perf = (wage * (salaryConfig.performance_percent || 0)) / 100;
  const lta = (basic * (salaryConfig.lta_percent || 0)) / 100;
  const pf = (basic * (salaryConfig.pf_percent || 0)) / 100;
  const fixed = wage - (basic + hra + standard + perf + lta);
  const profTax = salaryConfig.professional_tax || 0;

  const generatePayslip = async () => {
    setGeneratingPayslip(true);
    try {
      const res = await fetch(`/api/salary/${profileUser.id}/payslip`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if(res.ok) {
        setPayslip(data);
      } else {
        alert(data.error);
      }
    } catch(e) {
      console.error(e);
    }
    setGeneratingPayslip(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#F9F9F9', color: '#111827', overflowY: 'auto' }}>
      
      {/* Top Save Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', backgroundColor: '#F3F4F6', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{ padding: '6px 16px', backgroundColor: '#875A7B', color: '#FFFFFF', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500, fontSize: '13px' }} onClick={activeTab === 'Salary Info' ? saveSalaryInfo : savePrivateInfo} disabled={saving}>
            {saving ? 'SAVING...' : 'SAVE'}
          </button>
          <button style={{ padding: '6px 16px', backgroundColor: 'transparent', color: '#a0a0a0', border: '1px solid #E5E7EB', borderRadius: '4px', cursor: 'pointer', fontWeight: 500, fontSize: '13px' }} onClick={() => navigate(-1)}>
            DISCARD
          </button>
        </div>
      </div>

      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        
        {/* Main Profile Container */}
        <div style={{ border: '1px solid #E5E7EB', borderRadius: '4px', backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
          
          {/* Hero Header */}
          <div style={{ borderBottom: '1px solid #E5E7EB' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #E5E7EB', fontSize: '18px', fontWeight: 500 }}>
              My Profile
            </div>
            
            <div style={{ display: 'flex', padding: '32px', gap: '48px', flexWrap: 'wrap' }}>
              {/* Avatar Column */}
              <div style={{ position: 'relative' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111827', fontSize: '48px', border: '2px solid #875A7B' }}>
                  {profileUser.name.charAt(0)}
                </div>
                <div style={{ position: 'absolute', bottom: '0', right: '0', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid #E5E7EB' }}>
                  <i className="fa fa-pencil" style={{ fontSize: '14px', color: '#6B7280' }}></i>
                </div>
              </div>

              {/* Personal Details Column */}
              <div style={{ flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', borderBottom: '1px solid #E5E7EB', paddingBottom: '8px' }}>
                    {profileUser.name}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ width: '100px', color: '#6B7280', fontSize: '14px' }}>Job Position</span>
                    <input type="text" name="job_position" value={privateInfo.job_position || ''} onChange={handlePrivateInfoChange} style={{ flex: 1, backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #E5E7EB', color: '#111827', padding: '4px', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ width: '100px', color: '#6B7280', fontSize: '14px' }}>Email</span>
                    <input type="text" name="email" value={privateInfo.email || ''} onChange={handlePrivateInfoChange} style={{ flex: 1, backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #E5E7EB', color: '#111827', padding: '4px', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ width: '100px', color: '#6B7280', fontSize: '14px' }}>Mobile</span>
                    <input type="text" name="phone" value={privateInfo.phone || ''} onChange={handlePrivateInfoChange} style={{ flex: 1, backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #E5E7EB', color: '#111827', padding: '4px', outline: 'none' }} />
                  </div>
                </div>
              </div>

              {/* Company Details Column */}
              <div style={{ flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: '100px', color: '#6B7280', fontSize: '14px' }}>Company</span>
                  <input type="text" disabled value="HRMS Odoo.x" style={{ flex: 1, backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #E5E7EB', color: '#6B7280', padding: '4px', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: '100px', color: '#6B7280', fontSize: '14px' }}>Department</span>
                  <input type="text" name="department" value={privateInfo.department || ''} onChange={handlePrivateInfoChange} style={{ flex: 1, backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #E5E7EB', color: '#111827', padding: '4px', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: '100px', color: '#6B7280', fontSize: '14px' }}>Manager</span>
                  <input type="text" name="manager" value={privateInfo.manager || ''} onChange={handlePrivateInfoChange} style={{ flex: 1, backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #E5E7EB', color: '#111827', padding: '4px', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: '100px', color: '#6B7280', fontSize: '14px' }}>Location</span>
                  <input type="text" name="location" value={privateInfo.location || ''} onChange={handlePrivateInfoChange} style={{ flex: 1, backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #E5E7EB', color: '#111827', padding: '4px', outline: 'none' }} />
                </div>
              </div>
            </div>
            
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', padding: '0 24px' }}>
              {['Resume', 'Private Info', 'Salary Info', 'Security'].map(tab => {
                if (tab === 'Salary Info' && !isAdmin) return null; // Hide salary tab if not admin
                if (tab === 'Security' && currentUser.id !== profileUser.id) return null; // Hide security if not own profile
                return (
                  <div 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: '12px 24px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: activeTab === tab ? '#111827' : '#6B7280',
                      border: activeTab === tab ? '1px solid #fff' : '1px solid transparent',
                      borderBottom: 'none',
                      backgroundColor: activeTab === tab ? '#F3F4F6' : 'transparent',
                      marginBottom: '-1px',
                      borderTopLeftRadius: '4px',
                      borderTopRightRadius: '4px'
                    }}
                  >
                    {tab}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div style={{ padding: '32px' }}>
            
            {/* RESUME TAB */}
            {activeTab === 'Resume' && (
              <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                {/* Left Column */}
                <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ border: '1px solid #E5E7EB', padding: '16px', borderRadius: '4px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>About <i className="fa fa-pencil" style={{fontSize: '12px', color: '#666', marginLeft: '8px', cursor: 'pointer'}}></i></div>
                    <p style={{ color: '#6B7280', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
                      Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
                    </p>
                  </div>
                  <div style={{ border: '1px solid #E5E7EB', padding: '16px', borderRadius: '4px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>What I love about my job <i className="fa fa-pencil" style={{fontSize: '12px', color: '#666', marginLeft: '8px', cursor: 'pointer'}}></i></div>
                    <p style={{ color: '#6B7280', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
                      Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
                    </p>
                  </div>
                  <div style={{ border: '1px solid #E5E7EB', padding: '16px', borderRadius: '4px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>My interests and hobbies <i className="fa fa-pencil" style={{fontSize: '12px', color: '#666', marginLeft: '8px', cursor: 'pointer'}}></i></div>
                    <p style={{ color: '#6B7280', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
                      Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
                    </p>
                  </div>
                </div>

                {/* Right Column */}
                <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ border: '1px solid #E5E7EB', borderRadius: '4px', minHeight: '200px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #E5E7EB', fontSize: '15px', fontWeight: 500 }}>Skills</div>
                    <div style={{ padding: '16px', flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                      <span style={{ color: '#875A7B', fontSize: '13px', cursor: 'pointer' }}>+ Add Skills</span>
                    </div>
                  </div>
                  <div style={{ border: '1px solid #E5E7EB', borderRadius: '4px', minHeight: '200px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #E5E7EB', fontSize: '15px', fontWeight: 500 }}>Certification</div>
                    <div style={{ padding: '16px', flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                      <span style={{ color: '#875A7B', fontSize: '13px', cursor: 'pointer' }}>+ Add Skills</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PRIVATE INFO TAB */}
            {activeTab === 'Private Info' && (
              <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '150px', fontSize: '13px', color: '#6B7280' }}>Date of Birth</label>
                    <input type="date" name="date_of_birth" value={privateInfo.date_of_birth || ''} onChange={handlePrivateInfoChange} style={{ flex: 1, backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #E5E7EB', color: '#111827', padding: '4px', outline: 'none', colorScheme: 'dark' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '150px', fontSize: '13px', color: '#6B7280' }}>Residing Address</label>
                    <input type="text" name="address" value={privateInfo.address || ''} onChange={handlePrivateInfoChange} style={{ flex: 1, backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #E5E7EB', color: '#111827', padding: '4px', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '150px', fontSize: '13px', color: '#6B7280' }}>Nationality</label>
                    <input type="text" name="nationality" value={privateInfo.nationality || ''} onChange={handlePrivateInfoChange} style={{ flex: 1, backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #E5E7EB', color: '#111827', padding: '4px', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '150px', fontSize: '13px', color: '#6B7280' }}>Personal Email</label>
                    <input type="email" name="email" value={privateInfo.email || ''} onChange={handlePrivateInfoChange} style={{ flex: 1, backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #E5E7EB', color: '#111827', padding: '4px', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '150px', fontSize: '13px', color: '#6B7280' }}>Gender</label>
                    <input type="text" name="gender" value={privateInfo.gender || ''} onChange={handlePrivateInfoChange} style={{ flex: 1, backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #E5E7EB', color: '#111827', padding: '4px', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '150px', fontSize: '13px', color: '#6B7280' }}>Marital Status</label>
                    <input type="text" name="marital_status" value={privateInfo.marital_status || ''} onChange={handlePrivateInfoChange} style={{ flex: 1, backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #E5E7EB', color: '#111827', padding: '4px', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '150px', fontSize: '13px', color: '#6B7280' }}>Date of Joining</label>
                    <input type="date" name="date_of_joining" value={privateInfo.date_of_joining || ''} onChange={handlePrivateInfoChange} style={{ flex: 1, backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #E5E7EB', color: '#111827', padding: '4px', outline: 'none', colorScheme: 'dark' }} />
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ fontSize: '15px', fontWeight: 500, color: '#111827', borderBottom: '1px solid #E5E7EB', paddingBottom: '8px', marginBottom: '8px' }}>Bank Details</div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '150px', fontSize: '13px', color: '#6B7280' }}>Account Number</label>
                    <input type="text" name="account_number" value={privateInfo.account_number || ''} onChange={handlePrivateInfoChange} style={{ flex: 1, backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #E5E7EB', color: '#111827', padding: '4px', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '150px', fontSize: '13px', color: '#6B7280' }}>Bank Name</label>
                    <input type="text" name="bank_name" value={privateInfo.bank_name || ''} onChange={handlePrivateInfoChange} style={{ flex: 1, backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #E5E7EB', color: '#111827', padding: '4px', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '150px', fontSize: '13px', color: '#6B7280' }}>IFSC Code</label>
                    <input type="text" name="ifsc_code" value={privateInfo.ifsc_code || ''} onChange={handlePrivateInfoChange} style={{ flex: 1, backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #E5E7EB', color: '#111827', padding: '4px', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '150px', fontSize: '13px', color: '#6B7280' }}>PAN No</label>
                    <input type="text" name="pan_no" value={privateInfo.pan_no || ''} onChange={handlePrivateInfoChange} style={{ flex: 1, backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #E5E7EB', color: '#111827', padding: '4px', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '150px', fontSize: '13px', color: '#6B7280' }}>UAN NO</label>
                    <input type="text" name="uan_no" value={privateInfo.uan_no || ''} onChange={handlePrivateInfoChange} style={{ flex: 1, backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #E5E7EB', color: '#111827', padding: '4px', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '150px', fontSize: '13px', color: '#6B7280' }}>Emp Code</label>
                    <input type="text" name="emp_code" value={privateInfo.emp_code || ''} onChange={handlePrivateInfoChange} style={{ flex: 1, backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #E5E7EB', color: '#111827', padding: '4px', outline: 'none' }} />
                  </div>
                </div>
              </div>
            )}

            {/* SALARY INFO TAB (Admin Only) */}
            {activeTab === 'Salary Info' && isAdmin && (
              <div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827', borderBottom: '1px solid #E5E7EB', paddingBottom: '8px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Salary Info</span>
                  <button onClick={generatePayslip} disabled={generatingPayslip} style={{ padding: '6px 16px', backgroundColor: '#00A09D', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
                    {generatingPayslip ? 'Generating...' : 'Generate Payslip'}
                  </button>
                </div>
                
                {/* Top Section */}
                <div style={{ display: 'flex', gap: '48px', marginBottom: '48px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <label style={{ width: '120px', fontSize: '14px', color: '#6B7280' }}>Month Wage</label>
                      <input type="number" name="wage" value={salaryConfig.wage || 0} onChange={handleSalaryConfigChange} style={{ flex: 1, backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #E5E7EB', color: '#111827', padding: '4px', outline: 'none', fontSize: '16px' }} />
                      <span style={{ marginLeft: '12px', color: '#6B7280', fontSize: '14px' }}>/ Month</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <label style={{ width: '120px', fontSize: '14px', color: '#6B7280' }}>Yearly wage</label>
                      <input type="number" readOnly value={(salaryConfig.wage || 0) * 12} style={{ flex: 1, backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #E5E7EB', color: '#111827', padding: '4px', outline: 'none', fontSize: '16px' }} />
                      <span style={{ marginLeft: '12px', color: '#6B7280', fontSize: '14px' }}>/ Yearly</span>
                    </div>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <label style={{ width: '180px', fontSize: '14px', color: '#6B7280' }}>No of working days in a week:</label>
                      <input type="number" name="working_days" value={salaryConfig.working_days || ''} onChange={handleSalaryConfigChange} style={{ flex: 1, backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #E5E7EB', color: '#111827', padding: '4px', outline: 'none', fontSize: '14px' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <label style={{ width: '180px', fontSize: '14px', color: '#6B7280' }}>Break Time:</label>
                      <input type="text" placeholder="" style={{ flex: 1, backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #E5E7EB', color: '#111827', padding: '4px', outline: 'none', fontSize: '14px' }} />
                      <span style={{ marginLeft: '12px', color: '#6B7280', fontSize: '14px' }}>/hrs</span>
                    </div>
                  </div>
                </div>

                {/* Columns */}
                <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
                  
                  {/* Salary Components */}
                  <div style={{ flex: 1, minWidth: '350px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 500, color: '#111827', borderBottom: '1px solid #E5E7EB', paddingBottom: '8px', marginBottom: '24px' }}>Salary Components</div>
                    
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <label style={{ fontSize: '14px', color: '#6B7280' }}>Basic Salary</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ fontSize: '14px', color: '#111827' }}>{basic.toFixed(2)} ₹ / month</span>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <input type="number" name="basic_percent" value={salaryConfig.basic_percent || 0} onChange={handleSalaryConfigChange} style={{ width: '60px', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #E5E7EB', color: '#111827', padding: '2px', outline: 'none', textAlign: 'right' }} />
                            <span style={{ marginLeft: '4px', color: '#6B7280', fontSize: '13px' }}>%</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: '11px', color: '#777', marginTop: '4px' }}>Define Basic salary from company cost compute it based on monthly Wages</div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <label style={{ fontSize: '14px', color: '#6B7280' }}>House Rent Allowance</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ fontSize: '14px', color: '#111827' }}>{hra.toFixed(2)} ₹ / month</span>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <input type="number" name="hra_percent" value={salaryConfig.hra_percent || 0} onChange={handleSalaryConfigChange} style={{ width: '60px', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #E5E7EB', color: '#111827', padding: '2px', outline: 'none', textAlign: 'right' }} />
                            <span style={{ marginLeft: '4px', color: '#6B7280', fontSize: '13px' }}>%</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: '11px', color: '#777', marginTop: '4px' }}>HRA provided to employees 50% of the basic salary</div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <label style={{ fontSize: '14px', color: '#6B7280' }}>Standard Allowance</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ fontSize: '14px', color: '#111827' }}>{standard.toFixed(2)} ₹ / month</span>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <input type="number" name="standard_percent" value={salaryConfig.standard_percent || 0} onChange={handleSalaryConfigChange} style={{ width: '60px', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #E5E7EB', color: '#111827', padding: '2px', outline: 'none', textAlign: 'right' }} />
                            <span style={{ marginLeft: '4px', color: '#6B7280', fontSize: '13px' }}>%</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: '11px', color: '#777', marginTop: '4px', maxWidth: '80%' }}>A standard allowance is a predetermined, fixed amount provided to employee as part of their salary</div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <label style={{ fontSize: '14px', color: '#6B7280' }}>Performance Bonus</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ fontSize: '14px', color: '#111827' }}>{perf.toFixed(2)} ₹ / month</span>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <input type="number" name="performance_percent" value={salaryConfig.performance_percent || 0} onChange={handleSalaryConfigChange} style={{ width: '60px', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #E5E7EB', color: '#111827', padding: '2px', outline: 'none', textAlign: 'right' }} />
                            <span style={{ marginLeft: '4px', color: '#6B7280', fontSize: '13px' }}>%</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: '11px', color: '#777', marginTop: '4px', maxWidth: '80%' }}>Variable amount paid during payroll. The value defined by the company and calculated as a % of the basic salary</div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <label style={{ fontSize: '14px', color: '#6B7280' }}>Leave Travel Allowance</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ fontSize: '14px', color: '#111827' }}>{lta.toFixed(2)} ₹ / month</span>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <input type="number" name="lta_percent" value={salaryConfig.lta_percent || 0} onChange={handleSalaryConfigChange} style={{ width: '60px', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #E5E7EB', color: '#111827', padding: '2px', outline: 'none', textAlign: 'right' }} />
                            <span style={{ marginLeft: '4px', color: '#6B7280', fontSize: '13px' }}>%</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: '11px', color: '#777', marginTop: '4px', maxWidth: '80%' }}>LTA is paid by the company to employees to cover their travel expenses. and calculated as a % of the basic salary</div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <label style={{ fontSize: '14px', color: '#6B7280' }}>Fixed Allowance</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ fontSize: '14px', color: '#111827' }}>{fixed.toFixed(2)} ₹ / month</span>
                          <div style={{ display: 'flex', alignItems: 'center', width: '70px' }}>
                            <span style={{ color: '#777', fontSize: '13px' }}>Auto</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: '11px', color: '#777', marginTop: '4px', maxWidth: '80%' }}>fixed allowance portion of wages is determined after calculating all salary components</div>
                    </div>

                  </div>

                  {/* Provident Fund and Tax */}
                  <div style={{ flex: 1, minWidth: '350px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 500, color: '#111827', borderBottom: '1px solid #E5E7EB', paddingBottom: '8px', marginBottom: '24px' }}>Provident Fund (PF) Contribution</div>
                    
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <label style={{ fontSize: '14px', color: '#6B7280' }}>Employee</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ fontSize: '14px', color: '#111827' }}>{pf.toFixed(2)} ₹ / month</span>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <input type="number" name="pf_percent" value={salaryConfig.pf_percent || 0} onChange={handleSalaryConfigChange} style={{ width: '60px', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #E5E7EB', color: '#111827', padding: '2px', outline: 'none', textAlign: 'right' }} />
                            <span style={{ marginLeft: '4px', color: '#6B7280', fontSize: '13px' }}>%</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: '11px', color: '#777', marginTop: '4px' }}>PF is calculated based on the basic salary</div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <label style={{ fontSize: '14px', color: '#6B7280' }}>Employe'r</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ fontSize: '14px', color: '#111827' }}>{pf.toFixed(2)} ₹ / month</span>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <input type="number" disabled value={salaryConfig.pf_percent || 0} style={{ width: '60px', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #E5E7EB', color: '#777', padding: '2px', outline: 'none', textAlign: 'right' }} />
                            <span style={{ marginLeft: '4px', color: '#6B7280', fontSize: '13px' }}>%</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: '11px', color: '#777', marginTop: '4px' }}>PF is calculated based on the basic salary</div>
                    </div>

                    <div style={{ fontSize: '15px', fontWeight: 500, color: '#111827', borderBottom: '1px solid #E5E7EB', paddingBottom: '8px', marginBottom: '24px', marginTop: '48px' }}>Tax Deductions</div>

                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <label style={{ fontSize: '14px', color: '#6B7280' }}>Professional Tax</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <input type="number" name="professional_tax" value={salaryConfig.professional_tax || 0} onChange={handleSalaryConfigChange} style={{ width: '100px', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #E5E7EB', color: '#111827', padding: '2px', outline: 'none', textAlign: 'right' }} />
                            <span style={{ marginLeft: '8px', color: '#111827', fontSize: '14px' }}>₹ / month</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: '11px', color: '#777', marginTop: '4px' }}>Professional Tax deducted from the Gross salary</div>
                    </div>
                  </div>

                </div>
              </div>
            )}
            
            {/* SECURITY TAB */}
            {activeTab === 'Security' && currentUser.id === profileUser.id && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '400px' }}>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827', borderBottom: '1px solid #E5E7EB', paddingBottom: '8px' }}>Security Settings</div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: '#6B7280' }}>Existing Password</label>
                  <input type="password" value="********" disabled style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid #E5E7EB', color: '#777', padding: '8px 12px', borderRadius: '4px', outline: 'none' }} />
                  <span style={{ fontSize: '11px', color: '#777' }}>Your password is securely hashed.</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: '#6B7280' }}>New Password</label>
                  <input type="password" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ backgroundColor: 'transparent', border: '1px solid #E5E7EB', color: '#111827', padding: '8px 12px', borderRadius: '4px', outline: 'none' }} />
                </div>
                
                <button onClick={handleChangePassword} disabled={saving} style={{ padding: '8px 16px', backgroundColor: '#875A7B', color: '#FFFFFF', border: 'none', borderRadius: '4px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 500, alignSelf: 'flex-start' }}>
                  {saving ? 'UPDATING...' : 'UPDATE PASSWORD'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Payslip Modal */}
      {payslip && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #E5E7EB', paddingBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', color: '#875A7B' }}>Payslip - {payslip.month}</h2>
              <button onClick={() => setPayslip(null)} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6B7280' }}>&times;</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
              <div>
                <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#6B7280' }}>Employee Name: <strong style={{ color: '#111827' }}>{profileUser.name}</strong></p>
                <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#6B7280' }}>Job Position: <strong style={{ color: '#111827' }}>{privateInfo.job_position || '-'}</strong></p>
              </div>
              <div>
                <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#6B7280' }}>Working Days: <strong style={{ color: '#111827' }}>{payslip.workingDays}</strong></p>
                <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#6B7280' }}>Days Present: <strong style={{ color: '#111827' }}>{payslip.daysPresent}</strong></p>
              </div>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#374151' }}>Earnings</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: '#374151' }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '12px', borderBottom: '1px solid #E5E7EB' }}>Basic Salary</td>
                  <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #E5E7EB' }}>{payslip.breakdown.basic.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px', borderBottom: '1px solid #E5E7EB' }}>HRA</td>
                  <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #E5E7EB' }}>{payslip.breakdown.hra.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px', borderBottom: '1px solid #E5E7EB' }}>Standard Allowance</td>
                  <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #E5E7EB' }}>{payslip.breakdown.standard.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px', borderBottom: '1px solid #E5E7EB' }}>Performance Bonus</td>
                  <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #E5E7EB' }}>{payslip.breakdown.performance.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px', borderBottom: '1px solid #E5E7EB' }}>LTA</td>
                  <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #E5E7EB' }}>{payslip.breakdown.lta.toFixed(2)}</td>
                </tr>
                <tr style={{ backgroundColor: '#F9FAFB', fontWeight: 600 }}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #E5E7EB' }}>Gross Earnings</td>
                  <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #E5E7EB' }}>{payslip.actualEarnings.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#374151' }}>Deductions</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: '#374151' }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '12px', borderBottom: '1px solid #E5E7EB' }}>PF (Employee Contribution)</td>
                  <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #E5E7EB' }}>{payslip.deductions.pf.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px', borderBottom: '1px solid #E5E7EB' }}>Professional Tax</td>
                  <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #E5E7EB' }}>{payslip.deductions.profTax.toFixed(2)}</td>
                </tr>
                <tr style={{ backgroundColor: '#F9FAFB', fontWeight: 600 }}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #E5E7EB' }}>Total Deductions</td>
                  <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #E5E7EB' }}>{(payslip.deductions.pf + payslip.deductions.profTax).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F3F4F6', padding: '16px', borderRadius: '4px' }}>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>Net Payable</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#00A09D' }}>
                ₹ {(payslip.actualEarnings - (payslip.deductions.pf + payslip.deductions.profTax)).toFixed(2)}
              </div>
            </div>
            
            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <button style={{ padding: '8px 24px', backgroundColor: '#875A7B', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }} onClick={() => window.print()}>Print Payslip</button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default Profile;
