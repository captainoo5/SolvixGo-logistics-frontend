import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar';
import logoImg from '../../assets/logo.png';

const Riders = () => {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toast, setToast] = useState({ text: '', type: '' });
  const [adminRole, setAdminRole] = useState('admin');
  const [riderViewModal, setRiderViewModal] = useState({ isOpen: false, rider: null });

  useEffect(() => {
    setAdminRole(localStorage.getItem('solvix_admin_role') || 'admin');
  }, []);

  // --- Modal Form States ---
  const [modal, setModal] = useState({
    isOpen: false,
    isEdit: false,
    id: null,
    name: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    riderCode: ''
  });

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast({ text: '', type: '' }), 5000);
  };

  const fetchRiders = async () => {
    setLoading(true);
    try {
      const res = await API.get('/riders');
      if (res.data.success) {
        setRiders(res.data.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading riders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiders();
  }, []);

  const handleOpenModal = (r = null) => {
    if (r) {
      setModal({
        isOpen: true,
        isEdit: true,
        id: r._id,
        name: r.name,
        email: r.email,
        phone: r.phone,
        username: r.username,
        password: '', // leave empty to not change password
        riderCode: r.riderCode
      });
    } else {
      setModal({
        isOpen: true,
        isEdit: false,
        id: null,
        name: '',
        email: '',
        phone: '',
        username: '',
        password: '',
        riderCode: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      const payload = {
        name: modal.name,
        email: modal.email,
        phone: modal.phone,
        username: modal.username,
        riderCode: modal.riderCode
      };

      if (modal.password) {
        payload.password = modal.password;
      }

      if (modal.isEdit) {
        res = await API.put(`/riders/${modal.id}`, payload);
      } else {
        res = await API.post('/riders', { ...payload, password: modal.password || 'solvixgo2026' });
      }

      if (res.data.success) {
        showToast(modal.isEdit ? 'Rider profile updated!' : 'Rider registered successfully!');
        setModal(p => ({ ...p, isOpen: false }));
        fetchRiders();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error processing request', 'error');
    }
  };

  const handleToggleActive = async (r) => {
    try {
      const res = await API.patch(`/riders/${r._id}/toggle`);
      if (res.data.success) {
        showToast(`Rider ${r.name} status updated!`);
        fetchRiders();
      }
    } catch (err) {
      console.error(err);
      showToast('Error toggling rider status', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this rider account?')) return;
    try {
      const res = await API.delete(`/riders/${id}`);
      if (res.data.success) {
        showToast('Rider account deleted successfully', 'warning');
        fetchRiders();
      }
    } catch (err) {
      console.error(err);
      showToast('Error deleting rider account', 'error');
    }
  };

  const handleVerifyStatus = async (riderId, verificationStatus, rejectionReason = '') => {
    try {
      const res = await API.patch(`/riders/${riderId}/verify-status`, {
        verificationStatus,
        rejectionReason
      });
      if (res.data.success) {
        showToast(`Rider status updated to: ${verificationStatus}`);
        fetchRiders();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error updating verification status', 'error');
    }
  };

  const handleOpenRiderViewModal = (r) => {
    setRiderViewModal({
      isOpen: true,
      rider: r
    });
  };

  const handleVerifyFromView = async (riderId, status, rejectionReason = '') => {
    await handleVerifyStatus(riderId, status, rejectionReason);
    setRiderViewModal(prev => {
      if (!prev.rider || prev.rider._id !== riderId) return prev;
      return {
        ...prev,
        rider: {
          ...prev.rider,
          verificationStatus: status,
          rejectionReason
        }
      };
    });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F4F6F9' }}>
      {/* Toast Alert Widget */}
      {toast.text && (
        <div style={{
          position: 'fixed',
          top: '2rem',
          right: '2rem',
          zIndex: 10000,
          background: toast.type === 'error' ? '#C53030' : toast.type === 'warning' ? '#D97706' : '#059669',
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

        {/* Header Title */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem', marginTop: '10px' }}>
          <div>
            <h1 style={{ color: 'var(--navy)', fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
              Rider Accounts
            </h1>
            <p style={{ color: 'var(--gray-text)', fontSize: '0.85rem' }}>Superadmin Rider Directory & Fleet Management</p>
          </div>
          
          <button 
            onClick={() => handleOpenModal()}
            className="btn btn-orange"
            style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: 700 }}
          >
            Register Dispatch Rider
          </button>
        </header>

        {/* --- RIDERS TABLE --- */}
        <div style={{ background: '#fff', borderRadius: '16px', boxShadow: 'var(--card-shadow)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-text)', fontWeight: 600 }}>Loading Riders...</div>
          ) : riders.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-text)', fontWeight: 600 }}>No riders registered.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #EDF2F7', color: 'var(--navy)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '1rem' }}>Rider Code</th>
                    <th style={{ padding: '1rem' }}>Name</th>
                    <th style={{ padding: '1rem' }}>Email</th>
                    <th style={{ padding: '1rem' }}>Phone Number</th>
                    <th style={{ padding: '1rem' }}>Username</th>
                    <th style={{ padding: '1rem' }}>Verification</th>
                    <th style={{ padding: '1rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {riders.map(r => (
                    <tr key={r._id} style={{ borderBottom: '1px solid #EDF2F7', verticalAlign: 'middle', fontSize: '0.875rem' }}>
                      <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--orange)' }}>
                        {r.riderCode}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--navy)' }}>
                        {r.name}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {r.email}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>
                        {r.phone}
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--gray-text)' }}>
                        @{r.username}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.25rem 0.5rem',
                          borderRadius: '50px',
                          background: 
                            r.verificationStatus === 'approved' ? '#D1FAE5' : 
                            r.verificationStatus === 'documents_verified' ? '#DBEAFE' :
                            r.verificationStatus === 'pending_review' ? '#FEF3C7' : '#FEE2E2',
                          color: 
                            r.verificationStatus === 'approved' ? '#065F46' : 
                            r.verificationStatus === 'documents_verified' ? '#1E40AF' :
                            r.verificationStatus === 'pending_review' ? '#D97706' : '#991B1B',
                          border: `1px solid ${
                            r.verificationStatus === 'approved' ? '#A7F3D0' : 
                            r.verificationStatus === 'documents_verified' ? '#BFDBFE' :
                            r.verificationStatus === 'pending_review' ? '#FDE68A' : '#FCA5A5'
                          }`
                        }}>
                          {r.verificationStatus ? r.verificationStatus.replace('_', ' ').toUpperCase() : 'PENDING REVIEW'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <button 
                            onClick={() => handleOpenRiderViewModal(r)}
                            style={{ background: '#F1F5F9', color: 'var(--navy)', border: 'none', padding: '0.35rem 0.65rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                          >
                            View
                          </button>
                          <button 
                            onClick={() => handleOpenModal(r)}
                            style={{ background: '#DBEAFE', color: '#1E40AF', border: 'none', padding: '0.35rem 0.65rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                          >
                            Edit
                          </button>

                          {r.verificationStatus === 'pending_review' && (
                            <>
                              <button 
                                onClick={() => handleVerifyStatus(r._id, 'documents_verified')}
                                style={{ background: '#D1FAE5', color: '#065F46', border: 'none', padding: '0.35rem 0.65rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                              >
                                Verify Docs
                              </button>
                              <button 
                                onClick={() => {
                                  const reason = window.prompt('Enter rejection reason:');
                                  if (reason !== null) handleVerifyStatus(r._id, 'rejected', reason);
                                }}
                                style={{ background: '#FEE2E2', color: '#991B1B', border: 'none', padding: '0.35rem 0.65rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {r.verificationStatus === 'documents_verified' && adminRole === 'superadmin' && (
                            <button 
                              onClick={() => handleVerifyStatus(r._id, 'approved')}
                              style={{ background: '#D1FAE5', color: '#065F46', border: 'none', padding: '0.35rem 0.65rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                            >
                              Approve
                            </button>
                          )}

                          {r.verificationStatus === 'approved' && adminRole === 'superadmin' && (
                            <button 
                              onClick={() => handleVerifyStatus(r._id, 'suspended')}
                              style={{ background: '#FEE2E2', color: '#991B1B', border: 'none', padding: '0.35rem 0.65rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                            >
                              Suspend
                            </button>
                          )}

                          {r.verificationStatus === 'suspended' && adminRole === 'superadmin' && (
                            <button 
                              onClick={() => handleVerifyStatus(r._id, 'approved')}
                              style={{ background: '#D1FAE5', color: '#065F46', border: 'none', padding: '0.35rem 0.65rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                            >
                              Re-Approve
                            </button>
                          )}

                          <button 
                            onClick={() => handleDelete(r._id)}
                            style={{ background: 'none', border: 'none', color: '#B91C1C', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* --- CREATE / EDIT MODAL --- */}
      {modal.isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '450px',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ color: 'var(--navy)', fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>
              {modal.isEdit ? 'Edit Rider Information' : 'Register New Rider'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Full Name *</label>
                  <input type="text" required value={modal.name} onChange={(e) => setModal({...modal, name: e.target.value})} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1.5px solid #CBD5E1' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Email Address *</label>
                    <input type="email" required value={modal.email} onChange={(e) => setModal({...modal, email: e.target.value})} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1.5px solid #CBD5E1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Phone Number *</label>
                    <input type="tel" required value={modal.phone} onChange={(e) => setModal({...modal, phone: e.target.value})} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1.5px solid #CBD5E1' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Username *</label>
                    <input type="text" required value={modal.username} onChange={(e) => setModal({...modal, username: e.target.value})} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1.5px solid #CBD5E1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Rider Code *</label>
                    <input type="text" required maxLength="2" placeholder="AA" value={modal.riderCode} onChange={(e) => setModal({...modal, riderCode: e.target.value.toUpperCase()})} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', textAlign: 'center', fontWeight: 700 }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                    Password {modal.isEdit && '(Leave blank to keep current)'}
                  </label>
                  <input type="password" required={!modal.isEdit} value={modal.password} onChange={(e) => setModal({...modal, password: e.target.value})} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1.5px solid #CBD5E1' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setModal(p => ({ ...p, isOpen: false }))} style={{ background: '#F1F5F9', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', color: 'var(--navy)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="btn btn-orange" style={{ padding: '0.6rem 1.25rem', borderRadius: '8px' }}>Save Rider</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- RIDER VIEW DETAIL & VERIFY MODAL --- */}
      {riderViewModal.isOpen && riderViewModal.rider && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #EDF2F7', paddingBottom: '0.75rem' }}>
              <h3 style={{ color: 'var(--navy)', fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                Rider Verification Panel ({riderViewModal.rider.riderCode})
              </h3>
              <button 
                onClick={() => setRiderViewModal({ isOpen: false, rider: null })} 
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--gray-text)' }}
              >
                ✕
              </button>
            </div>

            {/* Verification Status Banner */}
            <div style={{
              background: 
                riderViewModal.rider.verificationStatus === 'approved' ? '#D1FAE5' : 
                riderViewModal.rider.verificationStatus === 'documents_verified' ? '#DBEAFE' :
                riderViewModal.rider.verificationStatus === 'pending_review' ? '#FEF3C7' : '#FEE2E2',
              color: 
                riderViewModal.rider.verificationStatus === 'approved' ? '#065F46' : 
                riderViewModal.rider.verificationStatus === 'documents_verified' ? '#1E40AF' :
                riderViewModal.rider.verificationStatus === 'pending_review' ? '#D97706' : '#991B1B',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}>
              Current Verification: {riderViewModal.rider.verificationStatus ? riderViewModal.rider.verificationStatus.replace('_', ' ').toUpperCase() : 'PENDING REVIEW'}
              {riderViewModal.rider.rejectionReason && (
                <div style={{ fontSize: '0.75rem', fontWeight: 500, marginTop: '0.25rem' }}>Rejection Reason: {riderViewModal.rider.rejectionReason}</div>
              )}
            </div>

            {/* Profile Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              
              {/* Left Column: Personal info */}
              <div>
                <h4 style={{ color: 'var(--navy)', fontSize: '0.9rem', borderBottom: '1px solid #EDF2F7', paddingBottom: '0.25rem', marginBottom: '0.75rem' }}>Personal Credentials</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.50rem', fontSize: '0.85rem' }}>
                  <div><strong>Full Name:</strong> {riderViewModal.rider.name}</div>
                  <div><strong>Email:</strong> {riderViewModal.rider.email}</div>
                  <div><strong>Phone:</strong> {riderViewModal.rider.phone}</div>
                  <div><strong>Username:</strong> @{riderViewModal.rider.username}</div>
                  <div><strong>Address:</strong> {riderViewModal.rider.address || 'Not Provided'}</div>
                  <div><strong>Vehicle Type:</strong> {riderViewModal.rider.vehicleType || 'Not Provided'}</div>
                  <div><strong>Plate Number:</strong> {riderViewModal.rider.plateNumber || 'Not Provided'}</div>
                </div>
              </div>

              {/* Right Column: Guarantor info */}
              <div>
                <h4 style={{ color: 'var(--navy)', fontSize: '0.9rem', borderBottom: '1px solid #EDF2F7', paddingBottom: '0.25rem', marginBottom: '0.75rem' }}>Guarantor Details</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.50rem', fontSize: '0.85rem' }}>
                  <div><strong>Name:</strong> {riderViewModal.rider.guarantor?.name || 'Not Provided'}</div>
                  <div><strong>Phone:</strong> {riderViewModal.rider.guarantor?.phone || 'Not Provided'}</div>
                  <div><strong>Relationship:</strong> {riderViewModal.rider.guarantor?.relationship || 'Not Provided'}</div>
                  <div><strong>Address:</strong> {riderViewModal.rider.guarantor?.address || 'Not Provided'}</div>
                </div>
              </div>

            </div>

            {/* Document Images */}
            <div>
              <h4 style={{ color: 'var(--navy)', fontSize: '0.9rem', borderBottom: '1px solid #EDF2F7', paddingBottom: '0.25rem', marginBottom: '0.75rem' }}>Rider Documentation Papers</h4>
              {riderViewModal.rider.vehicleDocs?.url ? (
                <div style={{ textAlign: 'center' }}>
                  <img 
                    src={riderViewModal.rider.vehicleDocs.url} 
                    alt="Rider Documents" 
                    style={{ width: '100%', maxHeight: '280px', objectFit: 'contain', border: '1px solid #EDF2F7', borderRadius: '12px', background: '#F8FAFC', padding: '4px' }} 
                  />
                  <a href={riderViewModal.rider.vehicleDocs.url} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--orange)', fontWeight: 700, textDecoration: 'underline' }}>
                    Open Document Image in New Tab
                  </a>
                </div>
              ) : (
                <div style={{ padding: '2rem', background: '#F8FAFC', borderRadius: '12px', textAlign: 'center', color: 'var(--gray-text)', fontSize: '0.85rem', border: '1px dashed #CBD5E1' }}>
                  No vehicle or license documents uploaded yet.
                </div>
              )}
            </div>

            {/* Action Buttons inside Modal */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid #EDF2F7', paddingTop: '1.25rem', flexWrap: 'wrap' }}>
              
              {riderViewModal.rider.verificationStatus === 'pending_review' && (
                <>
                  <button 
                    onClick={() => handleVerifyFromView(riderViewModal.rider._id, 'documents_verified')}
                    style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '0.55rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}
                  >
                    Verify Documents
                  </button>
                  <button 
                    onClick={() => {
                      const reason = window.prompt('Enter rejection reason:');
                      if (reason !== null) handleVerifyFromView(riderViewModal.rider._id, 'rejected', reason);
                    }}
                    style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.55rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}
                  >
                    Reject Application
                  </button>
                </>
              )}

              {riderViewModal.rider.verificationStatus === 'documents_verified' && adminRole === 'superadmin' && (
                <>
                  <button 
                    onClick={() => handleVerifyFromView(riderViewModal.rider._id, 'approved')}
                    style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.55rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}
                  >
                    Approve Account
                  </button>
                  <button 
                    onClick={() => {
                      const reason = window.prompt('Enter rejection reason:');
                      if (reason !== null) handleVerifyFromView(riderViewModal.rider._id, 'rejected', reason);
                    }}
                    style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.55rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}
                  >
                    Reject Application
                  </button>
                </>
              )}

              {riderViewModal.rider.verificationStatus === 'approved' && adminRole === 'superadmin' && (
                <button 
                  onClick={() => handleVerifyFromView(riderViewModal.rider._id, 'suspended')}
                  style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.55rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}
                >
                  Suspend Account
                </button>
              )}

              {riderViewModal.rider.verificationStatus === 'suspended' && adminRole === 'superadmin' && (
                <button 
                  onClick={() => handleVerifyFromView(riderViewModal.rider._id, 'approved')}
                  style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.55rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}
                >
                  Re-Approve Account
                </button>
              )}

              <button 
                type="button" 
                onClick={() => setRiderViewModal({ isOpen: false, rider: null })} 
                style={{ background: '#F1F5F9', border: 'none', padding: '0.55rem 1.25rem', borderRadius: '8px', color: 'var(--navy)', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Riders;
