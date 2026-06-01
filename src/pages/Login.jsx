import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import logoImg from '../assets/logo.png';
import { usePWAInstall } from '../hooks/usePWAInstall';

const Login = () => {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { isInstallable, triggerInstall } = usePWAInstall();

  useEffect(() => {
    // If already logged in, redirect accordingly
    if (localStorage.getItem('solvix_token')) {
      navigate('/admin');
    } else if (localStorage.getItem('rider_token')) {
      navigate('/rider/dashboard');
    }
  }, [navigate]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const response = await API.post('/auth/universal-login', { loginId, password });
      
      if (response.data.success) {
        const { role, token, user } = response.data;
        if (role === 'rider') {
          localStorage.setItem('rider_token', token);
          localStorage.setItem('rider_info', JSON.stringify(user));
          navigate('/rider/dashboard');
        } else {
          localStorage.setItem('solvix_token', token);
          localStorage.setItem('solvix_admin', user.name);
          localStorage.setItem('solvix_admin_role', role);
          navigate('/admin');
        }
      } else {
        setErrorMsg(response.data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login request failed', err);
      setErrorMsg(err.response?.data?.message || 'Invalid credentials or inactive account');
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
      background: 'linear-gradient(135deg, var(--navy, #0D1B4D) 0%, #080f2d 100%)',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'var(--font, sans-serif)'
    }}>
      {/* Background glow effects */}
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
        background: 'rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(16px)',
        width: '100%',
        maxWidth: '440px',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        padding: '3rem 2.5rem',
        position: 'relative',
        zIndex: 1,
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        
        {/* Brand Logo Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <img src={logoImg} alt="Solvix Go Logo" style={{ height: '50px', objectFit: 'contain', marginBottom: '0.75rem' }} />
          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.5px',
            margin: 0
          }}>
            Solvix<span style={{ color: 'var(--orange, #F47B00)' }}>Go</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Unified Dispatch & Administration Portal
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
                border: '1.5px solid var(--orange, #F47B00)',
                background: 'rgba(244,123,0,0.1)',
                color: 'var(--orange-light, #ff8c1a)',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease'
              }}
            >
              📱 Install App on Device
            </button>
          </div>
        )}

        {/* Form Error Message */}
        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            borderLeft: '4px solid #F56565',
            color: '#FEB2B2',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 500,
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>⚠️</span> {errorMsg}
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
              color: 'rgba(255,255,255,0.8)',
              marginBottom: '0.5rem'
            }}>
              Login ID (Email or Username)
            </label>
            <input
              type="text"
              required
              placeholder="Enter email or username"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.8rem 1.25rem',
                borderRadius: '12px',
                border: '1.5px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.06)',
                fontSize: '0.9rem',
                outline: 'none',
                color: '#fff',
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
              color: 'rgba(255,255,255,0.8)',
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
                  border: '1.5px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.06)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  color: '#fff',
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
                  color: 'rgba(255,255,255,0.5)',
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
              background: 'linear-gradient(135deg, #f47b00 0%, #d95d00 100%)',
              color: '#fff',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 8px 16px rgba(244,123,0,0.25)',
              transition: 'all 0.2s ease'
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
            ) : 'Sign In To Portal'}
          </button>
        </form>

        {/* Back Link */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <a href="/" style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--orange-light, #ff8c1a)',
            textDecoration: 'none'
          }}>
            ← Return to Public Website
          </a>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { to { transform: rotate(360deg); } }
        .login-input:focus {
          border-color: var(--orange, #F47B00) !important;
          background: rgba(255,255,255,0.1) !important;
        }
        .btn-login-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(244,123,0,0.4) !important;
        }
        .btn-login-submit:active {
          transform: translateY(0);
        }
      `}} />
    </div>
  );
};

export default Login;
