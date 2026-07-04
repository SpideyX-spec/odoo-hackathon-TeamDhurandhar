import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('Verifying...');

  useEffect(() => {
    fetch(`/api/auth/verify/${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setStatus(data.error);
        } else {
          setStatus(data.message);
        }
      })
      .catch(err => {
        setStatus('Verification failed. Please try again.');
      });
  }, [token]);

  return (
    <div className="full-screen flex-center" style={{ backgroundColor: '#181818', color: '#fff' }}>
      <div className="card" style={{ width: '400px', padding: '40px', border: '1px solid #333', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '24px' }}>Email Verification</h2>
        <p style={{ marginBottom: '24px', color: status.includes('successfully') ? '#4caf50' : '#ff9800' }}>
          {status}
        </p>
        <Link to="/login" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', backgroundColor: '#9c27b0' }}>
          Go to Login
        </Link>
      </div>
    </div>
  );
};

export default VerifyEmail;
