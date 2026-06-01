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
      background: 'radial-gradient(circle at top, #0f1c4a 0%, #080f2d 100%)',
      padding: '1.5rem',
      fontFamily: 'var(--font, sans-serif)'
    }}>
      {/* Glow Effect */}
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        background: 'rgba(244, 123, 0, 0.15)',
        filter: 'blur(100px)',
        borderRadius: '50%',
        zIndex: 0
      }} />

      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '2.5rem 2rem',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        zIndex: 1,
        textAlign: 'center'
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '2rem' }}>
          <img src={logoImg} alt="Solvix Go Logo" style={{ height: '50px', objectFit: 'contain', marginBottom: '0.5rem' }} />
          <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Rider Portal</h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Log in to view and update your orders</p>
        </div>

        {isInstallable && (
          <div style={{ marginBottom: '1.5rem' }}>
            <button
              onClick={triggerInstall}
              type="button"
              style={{
                width: '100%',
                background: 'rgba(244, 123, 0, 0.1)',
                border: '1.5px solid var(--orange)',
                borderRadius: '12px',
                padding: '0.9rem 1rem',
                color: 'var(--orange-light)',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              📱 Install Rider App on Device
            </button>
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            color: '#f87171',
            padding: '0.8rem 1rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1.5rem',
            textAlign: 'left'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. rider_code_aa"
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1.5px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '0.8rem 1rem',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--orange)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1.5px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '0.8rem 1rem',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--orange)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #f47b00 0%, #d95d00 100%)',
              border: 'none',
              borderRadius: '12px',
              padding: '0.9rem 1rem',
              color: '#fff',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 8px 16px rgba(244, 123, 0, 0.25)',
              transition: 'transform 0.15s, opacity 0.2s',
              opacity: loading ? 0.8 : 1
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {loading ? '⏳ Logging in...' : '🚪 Access Portal'}
          </button>
        </form>
      </div>

      <div style={{ marginTop: '1.5rem', color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.75rem', zIndex: 1 }}>
        Solvix Go Dispatch Operations Management v2.0
      </div>
    </div>
  );
};

export default RiderLogin;
