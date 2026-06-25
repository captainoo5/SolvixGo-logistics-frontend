import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import logoImg from '../../assets/logo.png';

const RiderStatus = () => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await API.get(`/rider/auth/status?phone=${encodeURIComponent(phone)}`);
      if (res.data.success) {
        setResult(res.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Application not found for this phone number.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabelAndColor = (status) => {
    switch (status) {
      case 'pending_review':
        return { label: 'Pending Review', color: '#f59e0b', desc: 'Your application has been received and is waiting for office verification.' };
      case 'documents_verified':
        return { label: 'Documents Verified', color: '#3b82f6', desc: 'Your documents have been verified. Final approval by the Superadmin is pending.' };
      case 'approved':
        return { label: 'Approved', color: '#10b981', desc: 'Congratulations! Your application has been approved. You can now log in to the Rider Portal.' };
      case 'rejected':
        return { label: 'Rejected', color: '#ef4444', desc: 'Your application was declined.' };
      case 'suspended':
        return { label: 'Suspended', color: '#ef4444', desc: 'Your rider account is currently suspended.' };
      default:
        return { label: status, color: '#6b7280', desc: '' };
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#f3f4f6',
      padding: '1.5rem 1rem',
      fontFamily: 'sans-serif',
      color: '#1f2937'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: '#ffffff',
        borderRadius: '16px',
        padding: '2rem 1.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        boxSizing: 'border-box'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src={logoImg} alt="Solvix Go Logo" style={{ height: '40px', marginBottom: '0.5rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Rider Application Status</h2>
          <p style={{ color: '#4b5563', fontSize: '0.875rem', marginTop: '0.25rem' }}>Enter your phone number to check your status</p>
        </div>

        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            color: '#b91c1c',
            padding: '0.8rem',
            fontSize: '0.875rem',
            marginBottom: '1.5rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Phone Number</label>
            <input
              type="tel"
              required
              placeholder="e.g. 08012345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                width: '100%',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                padding: '0.75rem',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box',
                background: '#f9fafb'
              }}
            />
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%',
            background: '#f47b00',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.9rem',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            opacity: loading ? 0.8 : 1
          }}>
            {loading ? 'Searching...' : 'Check Status'}
          </button>
        </form>

        {result && (() => {
          const statusInfo = getStatusLabelAndColor(result.verificationStatus);
          return (
            <div style={{
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '1.5rem 1rem',
              textAlign: 'center',
              marginBottom: '1.5rem'
            }}>
              <span style={{ fontSize: '0.875rem', color: '#4b5563', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Current Status</span>
              <div style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: statusInfo.color,
                marginTop: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                {statusInfo.label}
              </div>
              <p style={{ fontSize: '0.875rem', color: '#4b5563', margin: '0 0 1rem 0', lineHeight: 1.5 }}>
                {statusInfo.desc}
              </p>

              {result.verificationStatus === 'rejected' && result.rejectionReason && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fee2e2',
                  borderRadius: '8px',
                  color: '#b91c1c',
                  padding: '0.8rem',
                  fontSize: '0.875rem',
                  textAlign: 'left'
                }}>
                  <strong>Reason:</strong> {result.rejectionReason}
                </div>
              )}

              {result.verificationStatus === 'approved' && (
                <Link to="/login" style={{
                  display: 'inline-block',
                  background: '#10b981',
                  color: '#ffffff',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  marginTop: '0.5rem'
                }}>
                  Login to Rider Portal
                </Link>
              )}
            </div>
          );
        })()}

        <div style={{ textAlign: 'center', fontSize: '0.875rem', borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
          Need to register? <Link to="/rider/register" style={{ color: '#f47b00', textDecoration: 'none', fontWeight: 600 }}>Register here</Link>
          <br />
          <Link to="/" style={{ display: 'inline-block', marginTop: '1rem', color: '#4b5563', textDecoration: 'none' }}>Back to Home Page</Link>
        </div>
      </div>
    </div>
  );
};

export default RiderStatus;
