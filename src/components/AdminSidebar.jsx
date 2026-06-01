import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import logoImg from '../assets/logo.png';

const AdminSidebar = ({ activeTab = '', isMobileOpen = false, setMobileOpen = () => {} }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const adminName = localStorage.getItem('solvix_admin') || 'Admin';
  const adminRole = localStorage.getItem('solvix_admin_role') || 'admin';

  const handleLogout = () => {
    localStorage.removeItem('solvix_token');
    localStorage.removeItem('solvix_admin');
    localStorage.removeItem('solvix_admin_role');
    navigate('/admin/login');
  };

  const getLinkStyle = (path, tabName = '') => {
    const isDashboardTab = path === '/admin' && tabName;
    const isCurrentPath = location.pathname === path;
    
    let isActive = false;
    if (isDashboardTab) {
      const query = new URLSearchParams(location.search);
      const currentTab = query.get('tab') || 'overview';
      isActive = isCurrentPath && currentTab === tabName;
    } else {
      isActive = isCurrentPath && !location.search;
    }

    return {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      width: '100%',
      padding: '0.8rem 1.25rem',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontFamily: 'var(--font, sans-serif)',
      fontWeight: 600,
      fontSize: '0.85rem',
      textAlign: 'left',
      transition: 'var(--transition)',
      textDecoration: 'none',
      background: isActive ? 'var(--orange)' : 'transparent',
      color: '#fff'
    };
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)} 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'block'
          }}
        />
      )}

      {/* Sidebar Navigation */}
      <aside 
        style={{
          width: '260px',
          background: 'var(--navy)',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          padding: '2rem 1rem',
          flexShrink: 0,
          transition: 'transform 0.3s ease',
          zIndex: 1001
        }} 
        className={`sidebar ${isMobileOpen ? 'open' : ''}`}
      >
        {/* Sidebar Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <img src={logoImg} alt="Solvix Go Logo" style={{ height: '42px', objectFit: 'contain', marginBottom: '0.5rem' }} />
          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.1em', display: 'block' }}>Admin Control Hub</span>
        </div>

        {/* User Card */}
        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ width: '36px', height: '36px', background: 'var(--orange)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
            {adminName.slice(0,1).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{adminName}</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.68rem', fontWeight: 600, textTransform: 'capitalize' }}>{adminRole}</div>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flexGrow: 1, overflowY: 'auto' }}>
          
          <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontWeight: 800, padding: '0.5rem 1.25rem 0.25rem 1.25rem' }}>Operations</span>
          
          <Link to="/admin/orders" style={getLinkStyle('/admin/orders')} onClick={() => setMobileOpen(false)}>
            🚴 Orders Feed
          </Link>

          <Link to="/admin?tab=overview" style={getLinkStyle('/admin', 'overview')} onClick={() => setMobileOpen(false)}>
            📊 Dashboard Stats
          </Link>
          
          {adminRole === 'superadmin' && (
            <Link to="/admin/riders" style={getLinkStyle('/admin/riders')} onClick={() => setMobileOpen(false)}>
              👤 Dispatch Riders
            </Link>
          )}

          <Link to="/admin/billing" style={getLinkStyle('/admin/billing')} onClick={() => setMobileOpen(false)}>
            💳 Invoices & Billing
          </Link>

          <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontWeight: 800, padding: '0.75rem 1.25rem 0.25rem 1.25rem' }}>Content Management</span>

          <Link to="/admin?tab=services" style={getLinkStyle('/admin', 'services')} onClick={() => setMobileOpen(false)}>
            📦 Services Fleet
          </Link>

          <Link to="/admin?tab=partners" style={getLinkStyle('/admin', 'partners')} onClick={() => setMobileOpen(false)}>
            🤝 Retail Partners
          </Link>

          <Link to="/admin?tab=testimonials" style={getLinkStyle('/admin', 'testimonials')} onClick={() => setMobileOpen(false)}>
            ⭐ Testimonials
          </Link>

          <Link to="/admin?tab=posts" style={getLinkStyle('/admin', 'posts')} onClick={() => setMobileOpen(false)}>
            📝 Blog Articles
          </Link>

          <Link to="/admin?tab=contacts" style={getLinkStyle('/admin', 'contacts')} onClick={() => setMobileOpen(false)}>
            ✉️ Contact Messages
          </Link>
        </nav>

        {/* Sidebar Footer Logout */}
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.8rem 1.25rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--font, sans-serif)', fontWeight: 700, fontSize: '0.85rem', textAlign: 'left', transition: 'var(--transition)',
          background: 'rgba(239, 68, 68, 0.1)',
          color: '#F87171',
          marginTop: '1rem'
        }}>🚪 Sign Out</button>
      </aside>
    </>
  );
};

export default AdminSidebar;
