import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import logoImg from '../../assets/logo.png';
import { usePWAInstall } from '../../hooks/usePWAInstall';

const RiderLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { isInstallable, triggerInstall } = usePWAInstall();

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (localStorage.getItem('rider_token')) {
      navigate('/rider/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await API.post('/rider/auth/login', { username, password });
      if (res.data.success) {
        localStorage.setItem('rider_token', res.data.token);
        localStorage.setItem('rider_info', JSON.stringify(res.data.rider));
        navigate('/rider/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
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
      padding: '1.5rem',
      fontFamily: 'var(--font, sans-serif)',
      color: '#1f2937'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '24px',
        padding: '2.5rem 2rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        zIndex: 1,
        textAlign: 'center'
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '2rem' }}>
          <img src={logoImg} alt="Solvix Go Logo" style={{ height: '50px', objectFit: 'contain', marginBottom: '0.5rem' }} />
          <h2 style={{ color: '#1f2937', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Rider Portal</h2>
          <p style={{ color: '#4b5563', fontSize: '0.85rem', marginTop: '0.25rem' }}>Log in to view and update your orders</p>
        </div>

        {isInstallable && (
          <div style={{ marginBottom: '1.5rem' }}>
            <button
              onClick={triggerInstall}
              type="button"
              style={{
                width: '100%',
                background: 'rgba(244, 123, 0, 0.1)',
                border: '1.5px solid var(--orange, #f47b00)',
                borderRadius: '12px',
                padding: '0.9rem 1rem',
                color: '#f47b00',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Install Rider App on Device
            </button>
          </div>
        )}

        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '12px',
            color: '#b91c1c',
            padding: '0.8rem 1rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1.5rem',
            textAlign: 'left'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', color: '#374151', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. rider_code_aa"
              style={{
                width: '100%',
                background: '#f9fafb',
                border: '1.5px solid #d1d5db',
                borderRadius: '12px',
                padding: '0.8rem 1rem',
                color: '#1f2937',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#f47b00'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', color: '#374151', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                background: '#f9fafb',
                border: '1.5px solid #d1d5db',
                borderRadius: '12px',
                padding: '0.8rem 1rem',
                color: '#1f2937',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#f47b00'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: '#f47b00',
              border: 'none',
              borderRadius: '12px',
              padding: '0.9rem 1rem',
              color: '#fff',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'transform 0.15s, opacity 0.2s',
              opacity: loading ? 0.8 : 1
            }}
          >
            {loading ? 'Logging in...' : 'Access Portal'}
          </button>
        </form>
      </div>

      <div style={{ marginTop: '1.5rem', color: '#4b5563', fontSize: '0.75rem', zIndex: 1 }}>
        Solvix Go Dispatch Operations Management v2.0
      </div>
    </div>
  );
};

export default RiderLogin;
