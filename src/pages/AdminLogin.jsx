import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { usePWAInstall } from '../hooks/usePWAInstall';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { isInstallable, triggerInstall } = usePWAInstall();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const response = await API.post('/auth/login', { email, password });
      
      if (response.data.success) {
        localStorage.setItem('solvix_token', response.data.token);
        localStorage.setItem('solvix_admin', response.data.admin.name);
        localStorage.setItem('solvix_admin_role', response.data.admin.role);
        
        // Success redirect
        navigate('/admin');
      } else {
        setErrorMsg(response.data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login request failed', err);
      setErrorMsg(err.response?.data?.message || 'Server connection failed. Is the API backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-dark) 100%)',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Visual background glows */}
      <div style={{
        position: 'absolute',
        top: '-150px',
        right: '-150px',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(244,123,0,0.15) 0%, transparent 75%)',
        zIndex: 0
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '-150px',
        left: '-150px',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(13,27,77,0.4) 0%, transparent 75%)',
        zIndex: 0
      }}></div>

      <div style={{
        background: '#fff',
        width: '100%',
        maxWidth: '440px',
        borderRadius: '24px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        padding: '3rem 2.5rem',
        position: 'relative',
        zIndex: 1,
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        
        {/* Brand Logo Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: 'var(--navy)',
            letterSpacing: '-0.5px',
            margin: 0
          }}>
            Solvix<span style={{ color: 'var(--orange)' }}>Go</span>
          </h2>
          <p style={{ color: 'var(--gray-text)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Administrator Access Panel
          </p>
        </div>

        {isInstallable && (
          <div style={{ marginBottom: '1.5rem' }}>
            <button
              onClick={triggerInstall}
              type="button"
              style={{
                width: '100%',
                padding: '0.8rem',
                borderRadius: '12px',
                border: '1px solid var(--orange)',
                background: 'rgba(244,123,0,0.1)',
                color: 'var(--orange)',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'var(--transition)'
              }}
            >
              Install Admin App on Device
            </button>
          </div>
        )}

        {/* Form Error Message */}
        {errorMsg && (
          <div style={{
            background: '#FFF5F5',
            borderLeft: '4px solid #E53E3E',
            color: '#C53030',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 500,
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {errorMsg}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleLoginSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--navy)',
              marginBottom: '0.5rem'
            }}>
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="admin@solvixgo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '0.8rem 1.25rem',
                borderRadius: '12px',
                border: '1.5px solid #E2E8F0',
                fontFamily: 'var(--font)',
                fontSize: '0.9rem',
                outline: 'none',
                color: 'var(--navy)',
                transition: 'border-color 0.2s ease'
              }}
              className="login-input"
            />
          </div>

          <div style={{ marginBottom: '2rem', position: 'relative' }}>
            <label style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--navy)',
              marginBottom: '0.5rem'
            }}>
              Secure Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.8rem 3.5rem 0.8rem 1.25rem',
                  borderRadius: '12px',
                  border: '1.5px solid #E2E8F0',
                  fontFamily: 'var(--font)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  color: 'var(--navy)',
                  transition: 'border-color 0.2s ease'
                }}
                className="login-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--gray-text)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: '12px',
              border: 'none',
              background: 'var(--orange)',
              color: '#fff',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(244,123,0,0.3)',
              transition: 'var(--transition)'
            }}
            className="btn-login-submit"
          >
            {loading ? (
              <>
                <div style={{
                  width: '18px',
                  height: '18px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite'
                }}></div>
                Verifying Credentials...
              </>
            ) : 'Sign In To Dashboard'}
          </button>
        </form>

        {/* Back Link */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <a href="/" style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--orange)',
            textDecoration: 'none'
          }}>
            ← Return to Public Website
          </a>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { to { transform: rotate(360deg); } }
        .login-input:focus {
          border-color: var(--orange) !important;
        }
        .btn-login-submit:hover {
          background: #E06A00 !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(244,123,0,0.4) !important;
        }
        .btn-login-submit:active {
          transform: translateY(0);
        }
      `}} />
    </div>
  );
};

export default AdminLogin;
