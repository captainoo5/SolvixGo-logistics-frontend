import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar';
import logoImg from '../../assets/logo.png';

const BillingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toast, setToast] = useState({ text: '', type: '' });

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast({ text: '', type: '' }), 5000);
  };

  const fetchInvoiceDetails = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/billing/${id}/invoice`);
      if (res.data.success) {
        setInvoice(res.data.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading invoice details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoiceDetails();
  }, [id]);

  const handleMarkPaid = async () => {
    if (!window.confirm('Are you sure you want to mark this cycle as fully cleared and paid? This will close the current cycle.')) return;
    try {
      const res = await API.patch(`/billing/${id}/mark-paid`);
      if (res.data.success) {
        showToast('Billing cycle successfully marked as PAID!');
        fetchInvoiceDetails();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error updating status', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading && !invoice) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#F4F6F9', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <h3>Loading Invoice Details...</h3>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#F4F6F9', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <h3>Invoice Not Found</h3>
      </div>
    );
  }

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
          {toast.text}
        </div>
      )}

      {/* Admin Sidebar Navigation - Hidden during printing */}
      <div className="no-print" style={{ display: 'flex' }}>
        <AdminSidebar isMobileOpen={isSidebarOpen} setMobileOpen={setIsSidebarOpen} />
      </div>

      {/* ── MAIN WORKSPACE CONTENT ── */}
      <main style={{ flexGrow: 1, padding: '2.5rem', overflowY: 'auto' }} className="print-full-width">
        
        {/* Mobile Header - Hidden during printing */}
        <div className="mobile-admin-header no-print" style={{
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

        {/* Action Header - Hidden during printing */}
        <header className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem', marginTop: '10px' }}>
          <div>
            <button 
              onClick={() => navigate('/admin/billing')}
              style={{ background: 'none', border: 'none', color: 'var(--navy)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}
            >
              ← Back to Invoices
            </button>
            <h1 style={{ color: 'var(--navy)', fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
              Invoice Details
            </h1>
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {!invoice.isPaid && (
              <button 
                onClick={handleMarkPaid}
                className="btn btn-orange"
                style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', fontWeight: 700 }}
              >
                Clear & Mark as Paid
              </button>
            )}
            <button 
              onClick={handlePrint}
              style={{ background: 'var(--navy)', color: '#fff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
            >
              Print Invoice / Save PDF
            </button>
          </div>
        </header>

        {/* ── PRINT-FRIENDLY INVOICE CONTAINER ── */}
        <div style={{
          background: '#fff',
          borderRadius: '24px',
          padding: '3rem 2.5rem',
          boxShadow: 'var(--card-shadow)',
          border: '1px solid #EDF2F7',
          maxWidth: '850px',
          margin: '0 auto'
        }} className="invoice-print-container">
          
          {/* Invoice Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #EDF2F7', paddingBottom: '2rem', marginBottom: '2.5rem' }}>
            <div>
              <img src={logoImg} alt="Solvix Go Logo" style={{ height: '48px', objectFit: 'contain', marginBottom: '0.5rem' }} />
              <h4 style={{ margin: 0, color: 'var(--navy)', fontSize: '1rem', fontWeight: 800 }}>SOLVIX GO DELIVERIES</h4>
              <p style={{ margin: '0.2rem 0 0 0', color: 'var(--gray-text)', fontSize: '0.8rem', lineHeight: 1.4 }}>
                Office No. 7, Alhajin Yara Plaza,<br />
                Tashan Dukku Road, Gombe, Nigeria<br />
                Phone: 07079018011 | solvixgo@gmail.com
              </p>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ color: 'var(--navy)', fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>INVOICE</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem' }}>
                <div><strong>Cycle Type:</strong> {invoice.cycleType} Plan</div>
                <div><strong>Billing Range:</strong> {new Date(invoice.cycleStart).toLocaleDateString()} - {invoice.cycleEnd ? new Date(invoice.cycleEnd).toLocaleDateString() : 'Active (Open)'}</div>
                <div>
                  <strong>Status:</strong>{' '}
                  <span style={{ fontWeight: 800, color: invoice.isPaid ? '#10B981' : '#D97706' }}>
                    {invoice.isPaid ? 'PAID' : 'UNPAID / OPEN'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bill To section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem', fontSize: '0.875rem' }}>
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-text)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Bill To:</span>
              <strong style={{ fontSize: '1.05rem', color: 'var(--navy)' }}>{invoice.partner.name}</strong>
              {invoice.partner.website && (
                <div style={{ color: 'var(--orange)', fontWeight: 600, marginTop: '0.2rem' }}>{invoice.partner.website}</div>
              )}
            </div>
          </div>

          {/* Orders Table */}
          <h4 style={{ color: 'var(--navy)', fontSize: '0.9rem', fontWeight: 800, marginBottom: '1rem', textTransform: 'uppercase' }}>Completed Deliveries Log</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem', marginBottom: '2.5rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #EDF2F7', color: 'var(--navy)', fontWeight: 700 }}>
                <th style={{ padding: '0.75rem', width: '100px' }}>Date</th>
                <th style={{ padding: '0.75rem', width: '140px' }}>Tracking ID</th>
                <th style={{ padding: '0.75rem' }}>Pickup ➔ Dropoff Location</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', width: '100px' }}>Base Price</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', width: '120px' }}>Extra Charges</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', width: '100px' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.orders.map((o, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #EDF2F7', verticalAlign: 'middle' }}>
                  <td style={{ padding: '0.75rem' }}>{o.date}</td>
                  <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--navy)' }}>{o.trackingId}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ fontWeight: 600 }}>From: {o.pickupAddress}</div>
                    <div style={{ color: 'var(--gray-text)', fontSize: '0.78rem' }}>To: {o.dropoffAddress}</div>
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>₦{o.basePrice}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', color: '#B91C1C' }}>
                    {o.extraCharges.length > 0 ? (
                      <div>
                        {o.extraCharges.map((ch, i) => (
                          <div key={i} style={{ fontSize: '0.72rem' }}>+{ch.amount} ({ch.reason})</div>
                        ))}
                      </div>
                    ) : '₦0'}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 700, color: 'var(--navy)' }}>₦{o.totalAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Invoice Summary Totals */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: '280px', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #EDF2F7', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--gray-text)' }}>Total Orders:</span>
                <strong style={{ color: 'var(--navy)' }}>{invoice.totalOrders}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', borderBottom: '2px double #EDF2F7', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--navy)', fontWeight: 800 }}>Total Balance Due:</span>
                <strong style={{ color: 'var(--orange)' }}>₦{invoice.totalAmount}</strong>
              </div>
            </div>
          </div>

          {/* Footer terms */}
          <div style={{ marginTop: '4rem', borderTop: '1px solid #EDF2F7', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--gray-text)' }}>
            <p style={{ margin: 0 }}>Thank you for doing business with Solvix Go Logistics State HQ.</p>
            <p style={{ margin: '0.2rem 0 0 0', fontWeight: 600 }}>Fast • Safe • Reliable dispatch courier logistics metered in real-time.</p>
          </div>

        </div>

      </main>

      {/* Print media query styling */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background: #fff !important;
            color: #000 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-full-width {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .invoice-print-container {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            max-width: 100% !important;
            margin: 0 !important;
          }
        }
      `}} />
    </div>
  );
};

export default BillingDetail;
