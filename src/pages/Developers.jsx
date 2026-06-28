import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import logoImg from '../assets/logo.png';

const Developers = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register Form States
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [description, setDescription] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

  useEffect(() => {
    // If developer already logged in, redirect to dashboard
    if (localStorage.getItem('developer_token')) {
      navigate('/developer/dashboard');
    }
  }, [navigate]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await API.post('/developer-portal/login', {
        email: loginEmail,
        password: loginPassword
      });

      if (res.data.success) {
        localStorage.setItem('developer_token', res.data.token);
        localStorage.setItem('developer_info', JSON.stringify(res.data.data));
        navigate('/developer/dashboard');
      } else {
        setLoginError(res.data.message || 'Login failed.');
      }
    } catch (err) {
      console.error(err);
      setLoginError(err.response?.data?.message || 'Invalid credentials or inactive account.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterError('');
    setRegisterSuccess('');

    try {
      const res = await API.post('/developer-portal/register', {
        companyName,
        contactPerson,
        email: registerEmail,
        phone,
        website,
        businessType,
        description,
        password: registerPassword
      });

      if (res.data.success) {
        setRegisterSuccess('Registration successful! Your application is pending admin approval.');
        // Reset fields
        setCompanyName('');
        setContactPerson('');
        setRegisterEmail('');
        setPhone('');
        setWebsite('');
        setBusinessType('');
        setDescription('');
        setRegisterPassword('');
        setActiveTab('login');
      } else {
        setRegisterError(res.data.message || 'Registration failed.');
      }
    } catch (err) {
      console.error(err);
      setRegisterError(err.response?.data?.message || 'An error occurred during registration.');
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="developers-page-wrapper" style={{ minHeight: '100vh', background: '#F8FAFC', paddingTop: '80px', fontFamily: 'var(--font)' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, var(--navy, #0A1128) 0%, #030611 100%)',
        color: '#fff',
        padding: '5rem 5% 7rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow Circles */}
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255, 107, 0, 0.15) 0%, transparent 70%)', zIndex: 0 }}></div>
        <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(10, 17, 40, 0.5) 0%, transparent 70%)', zIndex: 0 }}></div>

        <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <span style={{
            background: 'rgba(255, 107, 0, 0.1)',
            color: 'var(--orange, #FF6B00)',
            padding: '0.5rem 1.25rem',
            borderRadius: '50px',
            fontSize: '0.85rem',
            fontWeight: 700,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            display: 'inline-block',
            marginBottom: '1.5rem'
          }}>
            Developer Integration Portal
          </span>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-1px', marginBottom: '1.5rem' }}>
            Integrate Solvix Go Logistics API <br />
            <span style={{ background: 'var(--orange-gradient)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Into Your Platform
            </span>
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.7)', maxWidth: '700px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            Automate deliveries, track riders in real-time, and receive instant updates on your e-commerce platform, restaurant app, or custom marketplace.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <a href="#auth-section" className="btn btn-orange" onClick={() => setActiveTab('register')}>Get API Access</a>
            <a href="#auth-section" className="btn btn-navy-outline" onClick={() => setActiveTab('login')}>Developer Login</a>
          </div>
        </div>
      </section>

      {/* Highlights / Features Grid */}
      <section style={{ maxWidth: '1200px', margin: '-4rem auto 5rem', padding: '0 5%', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          
          <div style={{ background: '#fff', padding: '2.5rem 2rem', borderRadius: '20px', boxShadow: 'var(--card-shadow)', border: '1px solid rgba(0,0,0,0.03)' }}>
            <div style={{ width: '50px', height: '50px', background: 'rgba(255, 107, 0, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--orange)', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              ⚡
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--navy)' }}>Automated Booking</h3>
            <p style={{ color: 'var(--gray-text)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Instantly create delivery orders straight from your customer checkout flows, no manual dispatch required.
            </p>
          </div>

          <div style={{ background: '#fff', padding: '2.5rem 2rem', borderRadius: '20px', boxShadow: 'var(--card-shadow)', border: '1px solid rgba(0,0,0,0.03)' }}>
            <div style={{ width: '50px', height: '50px', background: 'rgba(255, 107, 0, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--orange)', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              📍
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--navy)' }}>Real-time Tracking</h3>
            <p style={{ color: 'var(--gray-text)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Provide your customers with exact locations of the assigned rider and ETA using our tracking hooks.
            </p>
          </div>

          <div style={{ background: '#fff', padding: '2.5rem 2rem', borderRadius: '20px', boxShadow: 'var(--card-shadow)', border: '1px solid rgba(0,0,0,0.03)' }}>
            <div style={{ width: '50px', height: '50px', background: 'rgba(255, 107, 0, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--orange)', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              🔗
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--navy)' }}>Signed Webhooks</h3>
            <p style={{ color: 'var(--gray-text)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Receive instant cryptographically-signed POST updates to your application as order status changes.
            </p>
          </div>

        </div>
      </section>

      {/* How it Works Section */}
      <section style={{ maxWidth: '1000px', margin: '0 auto 6rem', padding: '0 5%' }}>
        <h2 style={{ fontSize: '2.25rem', fontWeight: 800, textAlign: 'center', color: 'var(--navy)', marginBottom: '3rem', letterSpacing: '-0.5px' }}>
          Four Simple Steps to Go Live
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'rgba(255, 107, 0, 0.15)', marginBottom: '0.5rem' }}>01</div>
            <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--navy)' }}>Register profile</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-text)' }}>Submit your company registration and integration description below.</p>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'rgba(255, 107, 0, 0.15)', marginBottom: '0.5rem' }}>02</div>
            <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--navy)' }}>Admin Approval</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-text)' }}>Our operations team validates your profile and activates your API access.</p>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'rgba(255, 107, 0, 0.15)', marginBottom: '0.5rem' }}>03</div>
            <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--navy)' }}>Get API Keys</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-text)' }}>Generate public/secret key pairs and save your webhook callback url.</p>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'rgba(255, 107, 0, 0.15)', marginBottom: '0.5rem' }}>04</div>
            <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--navy)' }}>Start Dispatching</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-text)' }}>Send orders and track deliveries directly inside your own application.</p>
          </div>
        </div>
      </section>

      {/* Auth Portal Section */}
      <section id="auth-section" style={{
        background: '#0A1128',
        padding: '6rem 5%',
        color: '#fff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '550px',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '24px',
          padding: '3rem 2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '2.5rem' }}>
            <button
              onClick={() => setActiveTab('login')}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                color: activeTab === 'login' ? 'var(--orange)' : 'rgba(255,255,255,0.5)',
                paddingBottom: '1rem',
                fontSize: '1.05rem',
                fontWeight: 700,
                cursor: 'pointer',
                borderBottom: activeTab === 'login' ? '3px solid var(--orange)' : 'none',
                transition: 'all 0.3s ease'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('register')}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                color: activeTab === 'register' ? 'var(--orange)' : 'rgba(255,255,255,0.5)',
                paddingBottom: '1rem',
                fontSize: '1.05rem',
                fontWeight: 700,
                cursor: 'pointer',
                borderBottom: activeTab === 'register' ? '3px solid var(--orange)' : 'none',
                transition: 'all 0.3s ease'
              }}
            >
              Apply for API Access
            </button>
          </div>

          {registerSuccess && (
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', borderLeft: '4px solid #10B981', color: '#A7F3D0', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', fontSize: '0.9rem' }}>
              ✓ {registerSuccess}
            </div>
          )}

          {/* Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit}>
              {loginError && (
                <div style={{ background: 'rgba(239, 68, 68, 0.15)', borderLeft: '4px solid #EF4444', color: '#FCA5A5', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', fontSize: '0.9rem' }}>
                  ⚠ {loginError}
                </div>
              )}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem' }}>Developer Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.9rem 1.25rem', borderRadius: '12px', border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#fff', outline: 'none' }}
                />
              </div>
              <div style={{ marginBottom: '2.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem' }}>Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.9rem 1.25rem', borderRadius: '12px', border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#fff', outline: 'none' }}
                />
              </div>
              <button
                type="submit"
                disabled={loginLoading}
                className="btn btn-orange"
                style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}
              >
                {loginLoading ? 'Verifying Profile...' : 'Sign In to Developer Console'}
              </button>
            </form>
          )}

          {/* Register Form */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit}>
              {registerError && (
                <div style={{ background: 'rgba(239, 68, 68, 0.15)', borderLeft: '4px solid #EF4444', color: '#FCA5A5', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', fontSize: '0.9rem' }}>
                  ⚠ {registerError}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: '0.4rem' }}>Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Solvix Store"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#fff', outline: 'none', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: '0.4rem' }}>Contact Person Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#fff', outline: 'none', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: '0.4rem' }}>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="partner@company.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#fff', outline: 'none', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: '0.4rem' }}>Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+234..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#fff', outline: 'none', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: '0.4rem' }}>Website</label>
                  <input
                    type="url"
                    placeholder="https://company.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#fff', outline: 'none', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: '0.4rem' }}>Business Type</label>
                  <input
                    type="text"
                    placeholder="e.g. E-Commerce, Restaurant"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#fff', outline: 'none', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: '0.4rem' }}>Description of Integration Idea *</label>
                <textarea
                  required
                  placeholder="Explain how you plan to integrate our logistics APIs..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#fff', outline: 'none', fontSize: '0.85rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: '0.4rem' }}>Portal Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#fff', outline: 'none', fontSize: '0.85rem' }}
                />
              </div>

              <button
                type="submit"
                disabled={registerLoading}
                className="btn btn-orange"
                style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}
              >
                {registerLoading ? 'Submitting Application...' : 'Submit Application'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

export default Developers;
