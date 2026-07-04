import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    loginId: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect based on role or to common dashboard
      if (data.user.role === 'Admin' || data.user.role === 'HR') {
        navigate('/admin/welcome');
      } else {
        navigate('/dashboard');
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '24px' }}>

        <div style={{ backgroundColor: '#FFFFFF', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', width: '100%', maxWidth: '400px', border: '1px solid #E5E7EB' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ margin: 0, fontSize: '28px', color: '#875A7B', fontWeight: 'bold' }}>Odoo X</h1>
            <p style={{ color: '#6B7280', margin: '8px 0 0 0', fontSize: '14px' }}>Sign in to your account</p>
          </div>

          {error && <div style={{ backgroundColor: '#FEF2F2', borderLeft: '4px solid #DC2626', color: '#B91C1C', padding: '12px', marginBottom: '16px', fontSize: '14px', borderRadius: '4px' }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '13px', color: '#374151', display: 'block', marginBottom: '6px', fontWeight: 500 }}>Login ID/Email Address</label>
              <input
                type="text"
                name="loginId"
                value={formData.loginId}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #D1D5DB', backgroundColor: '#FFFFFF', color: '#111827', outline: 'none', transition: 'border-color 0.2s' }}
                onFocus={(e) => e.target.style.borderColor = '#875A7B'}
                onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
              />
            </div>
            <div>
              <label style={{ fontSize: '13px', color: '#374151', display: 'block', marginBottom: '6px', fontWeight: 500 }}>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #D1D5DB', backgroundColor: '#FFFFFF', color: '#111827', outline: 'none', transition: 'border-color 0.2s' }}
                onFocus={(e) => e.target.style.borderColor = '#875A7B'}
                onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
              />
            </div>

            <button type="submit" disabled={loading} style={{
              marginTop: '8px',
              backgroundColor: '#875A7B',
              color: '#FFFFFF',
              padding: '12px',
              borderRadius: '4px',
              border: 'none',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'background-color 0.2s'
            }}>
              {loading ? 'Signing In...' : 'Log in'}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: '#6B7280' }}>
            <a href="#" style={{ color: '#875A7B', textDecoration: 'none' }}>Reset Password</a>
          </div>
        </div>

        <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '12px', color: '#9CA3AF' }}>
          Powered by Odoo X
        </div>
      </div>
    </div>
  );
};

export default Login;
