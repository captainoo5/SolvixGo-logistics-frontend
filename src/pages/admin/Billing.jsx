import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar';
import logoImg from '../../assets/logo.png';

const Billing = () => {
  const navigate = useNavigate();
  const [cycles, setCycles] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toast, setToast] = useState({ text: '', type: '' });

  // --- Filters State ---
  const [filters, setFilters] = useState({
    partner: '',
    isPaid: '',
    cycleType: ''
  });

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast({ text: '', type: '' }), 5000);
  };

  const fetchCycles = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.partner) params.partner = filters.partner;
      if (filters.isPaid) params.isPaid = filters.isPaid;
      if (filters.cycleType) params.cycleType = filters.cycleType;

      const res = await API.get('/billing', { params });
      if (res.data.success) {
        setCycles(res.data.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading billing cycles', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPartners = async () => {
    try {
      const res = await API.get('/partners/all');
      if (res.data.success) {
        setPartners(res.data.data.filter(p => p.billingPlan !== 'None'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCycles();
  }, [filters]);

  useEffect(() => {
    fetchPartners();
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F4F6F9' }}>
      {/* Toast Alert Widget */}
      {toast.text && (
        <div style={{
          position: 'fixed',
          top: '2rem',
          right: '2rem',
          zIndex: 10000,
          background: toast.type === 'error' ? '#C53030' : '#059669',
          color: '#fff',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          fontWeight: 600,
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {toast.type === 'error' ? '❌' : '✅'} {toast.text}
        </div>
      )}

      {/* Admin Sidebar Navigation */}
      <AdminSidebar isMobileOpen={isSidebarOpen} setMobileOpen={setIsSidebarOpen} />

      {/* ── MAIN WORKSPACE CONTENT ── */}
      <main style={{ flexGrow: 1, padding: '2.5rem', overflowY: 'auto' }}>
        
        {/* Mobile Header */}
        <div className="mobile-admin-header" style={{
          display: 'none',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--navy)',
          color: '#fff',
          padding: '0.75rem 1.5rem',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '60px',
          zIndex: 1000,
          boxShadow: '0 2px 10px rgba(0,0,0,0.15)'
        }}>
          <img src={logoImg} alt="Solvix Go Logo" style={{ height: '32px', objectFit: 'contain' }} />
          <button onClick={() => setIsSidebarOpen(prev => !prev)} style={{
            background: 'transparent',
            border: 'none',
            color: '#fff',
            fontSize: '1.5rem',
            cursor: 'pointer'
          }}>
            ☰
          </button>
        </div>

        {/* Title Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem', marginTop: '10px' }}>
          <div>
            <h1 style={{ color: 'var(--navy)', fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
              Partner Invoices
            </h1>
            <p style={{ color: 'var(--gray-text)', fontSize: '0.85rem' }}>Weekly & Monthly Partner Billing Cycles</p>
          </div>
        </header>

        {/* --- FILTERS ROW --- */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '1.25rem',
          boxShadow: 'var(--card-shadow)',
          marginBottom: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem' }}>Partner</label>
            <select value={filters.partner} onChange={(e) => setFilters({...filters, partner: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1.5px solid #CBD5E1' }}>
              <option value="">All Partners</option>
              {partners.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem' }}>Payment Status</label>
            <select value={filters.isPaid} onChange={(e) => setFilters({...filters, isPaid: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1.5px solid #CBD5E1' }}>
              <option value="">All Invoices</option>
              <option value="false">Unpaid (Open Cycle)</option>
              <option value="true">Paid (Cleared Cycle)</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem' }}>Cycle Type</label>
            <select value={filters.cycleType} onChange={(e) => setFilters({...filters, cycleType: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1.5px solid #CBD5E1' }}>
              <option value="">All Cycles</option>
              <option value="Weekly">Weekly Plan</option>
              <option value="Monthly">Monthly Plan</option>
            </select>
          </div>
        </div>

        {/* --- INVOICES TABLE --- */}
        <div style={{ background: '#fff', borderRadius: '16px', boxShadow: 'var(--card-shadow)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-text)', fontWeight: 600 }}>Loading Invoices...</div>
          ) : cycles.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-text)', fontWeight: 600 }}>No billing cycles found.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #EDF2F7', color: 'var(--navy)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '1rem' }}>Partner Brand</th>
                    <th style={{ padding: '1rem' }}>Cycle Type</th>
                    <th style={{ padding: '1rem' }}>Start Date</th>
                    <th style={{ padding: '1rem' }}>End Date</th>
                    <th style={{ padding: '1rem' }}>Total Orders</th>
                    <th style={{ padding: '1rem' }}>Accumulated Amount</th>
                    <th style={{ padding: '1rem' }}>Status</th>
                    <th style={{ padding: '1rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cycles.map(c => (
                    <tr key={c._id} style={{ borderBottom: '1px solid #EDF2F7', verticalAlign: 'middle', fontSize: '0.875rem' }}>
                      <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--navy)' }}>
                        {c.partner?.name || 'Deleted Partner'}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>
                        {c.cycleType}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {new Date(c.cycleStart).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--gray-text)' }}>
                        {c.cycleEnd ? new Date(c.cycleEnd).toLocaleDateString() : 'Active (Open)'}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 600, textAlign: 'center' }}>
                        {c.orders?.length || 0}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 800, color: 'var(--navy)' }}>
                        ₦{c.totalAmount}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.25rem 0.5rem',
                          borderRadius: '50px',
                          background: c.isPaid ? '#D1FAE5' : '#FEF3C7',
                          color: c.isPaid ? '#065F46' : '#D97706',
                          border: c.isPaid ? '1px solid #A7F3D0' : '1px solid #FCD34D'
                        }}>
                          {c.isPaid ? 'Paid' : 'Unpaid (Open)'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <button 
                          onClick={() => navigate(`/admin/billing/${c._id}`)}
                          style={{ background: 'var(--orange)', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}
                        >
                          View Details & Invoice ➔
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Billing;
