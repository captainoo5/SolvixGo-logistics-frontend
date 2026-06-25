import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAdminSocket } from '../../hooks/useSocket';
import AdminSidebar from '../../components/AdminSidebar';
import logoImg from '../../assets/logo.png';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [riders, setRiders] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toast, setToast] = useState({ text: '', type: '' });

  // --- Filtering States ---
  const [filters, setFilters] = useState({
    status: '',
    rider: '',
    partner: '',
    paymentMethod: '',
    date: ''
  });

  // --- Modal Form States ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    customerName: '',
    customerPhone: '',
    receiverPhone: '',
    pickupAddress: '',
    dropoffAddress: '',
    itemDescription: '',
    distanceZone: '500',
    paymentMethod: 'Cash',
    partner: '',
    notes: ''
  });

  const [assignModal, setAssignModal] = useState({
    isOpen: false,
    orderId: null,
    riderId: ''
  });

  const [priceModal, setPriceModal] = useState({
    isOpen: false,
    orderId: null,
    basePrice: ''
  });

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast({ text: '', type: '' }), 5000);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {};
      Object.keys(filters).forEach(key => {
        if (filters[key]) params[key] = filters[key];
      });
      const res = await API.get('/orders', { params });
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRiders = async () => {
    try {
      const res = await API.get('/riders');
      if (res.data.success) {
        setRiders(res.data.data.filter(r => r.isActive));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPartners = async () => {
    try {
      const res = await API.get('/partners/all');
      if (res.data.success) {
        setPartners(res.data.data.filter(p => p.isActive && p.billingPlan !== 'None'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  useEffect(() => {
    fetchRiders();
    fetchPartners();
  }, []);

  // --- Real-time updates with Socket.io ---
  useAdminSocket(
    (payload) => {
      // order:new event
      showToast(`New Order Created for ${payload.order.customerName}!`, 'success');
      // Append if it matches current filter or just refetch
      fetchOrders();
    },
    (payload) => {
      // order:status_updated event
      showToast(`Order Status Updated: ${payload.status}`, 'info');
      fetchOrders();
    }
  );

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...createForm };
      if (!['Weekly Plan', 'Monthly Plan'].includes(payload.paymentMethod)) {
        delete payload.partner;
      }
      const res = await API.post('/orders', payload);
      if (res.data.success) {
        showToast('Order created successfully!');
        setIsCreateModalOpen(false);
        setCreateForm({
          customerName: '',
          customerPhone: '',
          receiverPhone: '',
          pickupAddress: '',
          dropoffAddress: '',
          itemDescription: '',
          distanceZone: '500',
          paymentMethod: 'Cash',
          partner: '',
          notes: ''
        });
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error creating order', 'error');
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.patch(`/orders/${assignModal.orderId}/assign`, {
        riderId: assignModal.riderId
      });
      if (res.data.success) {
        showToast('Rider assigned successfully!');
        setAssignModal({ isOpen: false, orderId: null, riderId: '' });
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error assigning rider', 'error');
    }
  };

  const handleUpdatePriceSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.patch(`/orders/${priceModal.orderId}/update-price`, {
        basePrice: Number(priceModal.basePrice)
      });
      if (res.data.success) {
        showToast('Delivery price updated successfully!');
        setPriceModal({ isOpen: false, orderId: null, basePrice: '' });
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error updating delivery price', 'error');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await API.patch(`/orders/${orderId}/cancel`);
      if (res.data.success) {
        showToast('Order cancelled successfully', 'warning');
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error cancelling order', 'error');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Delete order record permanently? This cannot be undone.')) return;
    try {
      const res = await API.delete(`/orders/${orderId}`);
      if (res.data.success) {
        showToast('Order record deleted successfully');
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error deleting order', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#94a3b8';
      case 'Assigned': return '#3b82f6';
      case 'Picked Up': return '#eab308';
      case 'In Transit': return '#f97316';
      case 'Delivered': return '#10b981';
      case 'Cancelled': return '#ef4444';
      default: return '#94a3b8';
    }
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
          background: toast.type === 'error' ? '#C53030' : toast.type === 'warning' ? '#D97706' : toast.type === 'info' ? '#2563EB' : '#059669',
          color: '#fff',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          fontWeight: 600,
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'slideIn 0.3s ease'
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

        {/* Dashboard Title Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem', marginTop: '10px' }}>
          <div>
            <h1 style={{ color: 'var(--navy)', fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
              Order Management
            </h1>
            <p style={{ color: 'var(--gray-text)', fontSize: '0.85rem' }}>Solvix Go Real-Time Operations Pipeline</p>
          </div>
          
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-orange"
            style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: 700 }}
          >
            Create New Order
          </button>
        </header>

        {/* --- FILTERS ROW --- */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '1.25rem',
          boxShadow: 'var(--card-shadow)',
          marginBottom: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem'
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem' }}>Status</label>
            <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1.5px solid #CBD5E1' }}>
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option>
              <option value="Picked Up">Picked Up</option>
              <option value="In Transit">In Transit</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem' }}>Rider</label>
            <select value={filters.rider} onChange={(e) => setFilters({...filters, rider: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1.5px solid #CBD5E1' }}>
              <option value="">All Riders</option>
              {riders.map(r => (
                <option key={r._id} value={r._id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem' }}>Billing Plan Partner</label>
            <select value={filters.partner} onChange={(e) => setFilters({...filters, partner: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1.5px solid #CBD5E1' }}>
              <option value="">All Partners</option>
              {partners.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem' }}>Payment Method</label>
            <select value={filters.paymentMethod} onChange={(e) => setFilters({...filters, paymentMethod: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1.5px solid #CBD5E1' }}>
              <option value="">All Methods</option>
              <option value="Cash">Cash</option>
              <option value="Transfer">Transfer</option>
              <option value="Weekly Plan">Weekly Plan</option>
              <option value="Monthly Plan">Monthly Plan</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem' }}>Pickup/Booking Date</label>
            <input type="date" value={filters.date} onChange={(e) => setFilters({...filters, date: e.target.value})} style={{ width: '100%', padding: '0.45rem', borderRadius: '8px', border: '1.5px solid #CBD5E1' }} />
          </div>
        </div>

        {/* --- ORDERS TABLE --- */}
        <div style={{ background: '#fff', borderRadius: '16px', boxShadow: 'var(--card-shadow)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-text)', fontWeight: 600 }}>Loading Orders Feed...</div>
          ) : orders.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-text)', fontWeight: 600 }}>No orders match the selected filters.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #EDF2F7', color: 'var(--navy)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '1rem' }}>Tracking ID</th>
                    <th style={{ padding: '1rem' }}>Customer / Contact</th>
                    <th style={{ padding: '1rem' }}>Receiver Phone</th>
                    <th style={{ padding: '1rem' }}>Pickup ➔ Dropoff</th>
                    <th style={{ padding: '1rem' }}>Assigned Rider</th>
                    <th style={{ padding: '1rem' }}>Status</th>
                    <th style={{ padding: '1rem' }}>Amount</th>
                    <th style={{ padding: '1rem' }}>Date</th>
                    <th style={{ padding: '1rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o._id} style={{ borderBottom: '1px solid #EDF2F7', verticalAlign: 'middle', fontSize: '0.875rem' }}>
                      <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--navy)' }}>
                        {o.trackingId || 'Pending Pickup'}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 600 }}>{o.customerName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-text)' }}>Phone: {o.customerPhone}</div>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>
                        {o.receiverPhone}
                      </td>
                      <td style={{ padding: '1rem', maxWidth: '250px' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Pickup: {o.pickupAddress}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--gray-text)', marginTop: '0.2rem' }}>Dropoff: {o.dropoffAddress}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {o.assignedRider ? (
                          <div>
                            <div style={{ fontWeight: 600 }}>{o.assignedRider.name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--orange)', fontWeight: 700 }}>Code: {o.assignedRider.riderCode}</div>
                          </div>
                        ) : (
                          <span style={{ color: 'rgba(239, 68, 68, 0.7)', fontWeight: 600 }}>Not Assigned</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.25rem 0.5rem',
                          borderRadius: '50px',
                          background: getStatusColor(o.status) + '1a',
                          color: getStatusColor(o.status),
                          border: `1.5px solid ${getStatusColor(o.status)}33`
                        }}>
                          {o.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--navy)' }}>
                        ₦{o.totalAmount || o.basePrice}
                        <div style={{ fontSize: '0.68rem', color: 'var(--gray-text)', fontWeight: 500 }}>{o.paymentMethod}</div>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--gray-text)' }}>
                        {new Date(o.createdAt).toLocaleString()}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {!['Delivered', 'Cancelled'].includes(o.status) && (
                            <button 
                              onClick={() => setAssignModal({ isOpen: true, orderId: o._id, riderId: o.assignedRider?._id || '' })}
                              style={{ background: '#DBEAFE', color: '#1E40AF', border: 'none', padding: '0.35rem 0.65rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                            >
                              {o.assignedRider ? 'Reassign' : 'Assign Rider'}
                            </button>
                          )}
                          {!['Delivered', 'Cancelled'].includes(o.status) && (
                            <button 
                              onClick={() => handleCancelOrder(o._id)}
                              style={{ background: '#FEF2F2', color: '#991B1B', border: 'none', padding: '0.35rem 0.65rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                            >
                              Cancel
                            </button>
                          )}
                          {!['Delivered', 'Cancelled'].includes(o.status) && (
                            <button 
                              onClick={() => setPriceModal({ isOpen: true, orderId: o._id, basePrice: o.basePrice })}
                              style={{ background: '#FEF3C7', color: '#D97706', border: 'none', padding: '0.35rem 0.65rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                            >
                              Update Price
                            </button>
                          )}
                          {localStorage.getItem('solvix_admin_role') === 'superadmin' && (
                            <button 
                              onClick={() => handleDeleteOrder(o._id)}
                              style={{ background: 'none', border: 'none', color: '#B91C1C', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
                            >
                              Delete
                            </button>
                          )}
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

      {/* --- CREATE ORDER MODAL --- */}
      {isCreateModalOpen && (
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
            maxWidth: '500px',
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ color: 'var(--navy)', fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>Create New Delivery Order</h3>
            
            <form onSubmit={handleCreateSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Customer Name *</label>
                  <input type="text" required value={createForm.customerName} onChange={(e) => setCreateForm({...createForm, customerName: e.target.value})} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1.5px solid #CBD5E1' }} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Customer Phone *</label>
                    <input type="tel" required value={createForm.customerPhone} onChange={(e) => setCreateForm({...createForm, customerPhone: e.target.value})} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1.5px solid #CBD5E1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Receiver Phone (WhatsApp) *</label>
                    <input type="tel" required value={createForm.receiverPhone} onChange={(e) => setCreateForm({...createForm, receiverPhone: e.target.value})} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1.5px solid #CBD5E1' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Pickup Address *</label>
                  <input type="text" required value={createForm.pickupAddress} onChange={(e) => setCreateForm({...createForm, pickupAddress: e.target.value})} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1.5px solid #CBD5E1' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Dropoff Address *</label>
                  <input type="text" required value={createForm.dropoffAddress} onChange={(e) => setCreateForm({...createForm, dropoffAddress: e.target.value})} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1.5px solid #CBD5E1' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Item Description *</label>
                  <input type="text" required value={createForm.itemDescription} onChange={(e) => setCreateForm({...createForm, itemDescription: e.target.value})} placeholder="e.g. 5kg Food bag" style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1.5px solid #CBD5E1' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Delivery Price / Zone *</label>
                    <select value={createForm.distanceZone} onChange={(e) => setCreateForm({...createForm, distanceZone: e.target.value})} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontWeight: 600 }}>
                      <option value="500">₦500</option>
                      <option value="600">₦600</option>
                      <option value="700">₦700</option>
                      <option value="800">₦800</option>
                      <option value="900">₦900</option>
                      <option value="1000">₦1,000</option>
                      <option value="1500">₦1,500</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Payment Method *</label>
                    <select value={createForm.paymentMethod} onChange={(e) => setCreateForm({...createForm, paymentMethod: e.target.value})} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1.5px solid #CBD5E1' }}>
                      <option value="Cash">Cash</option>
                      <option value="Transfer">Transfer</option>
                      <option value="Weekly Plan">Weekly Plan</option>
                      <option value="Monthly Plan">Monthly Plan</option>
                    </select>
                  </div>
                </div>

                {['Weekly Plan', 'Monthly Plan'].includes(createForm.paymentMethod) && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Partner *</label>
                    <select required value={createForm.partner} onChange={(e) => setCreateForm({...createForm, partner: e.target.value})} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1.5px solid #CBD5E1' }}>
                      <option value="">-- Select Retail Partner --</option>
                      {partners.map(p => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Special Instructions / Notes</label>
                  <textarea rows="2" value={createForm.notes} onChange={(e) => setCreateForm({...createForm, notes: e.target.value})} placeholder="Deliver to third floor..." style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1.5px solid #CBD5E1' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsCreateModalOpen(false)} style={{ background: '#F1F5F9', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', color: 'var(--navy)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="btn btn-orange" style={{ padding: '0.6rem 1.25rem', borderRadius: '8px' }}>Create Order</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ASSIGN RIDER MODAL --- */}
      {assignModal.isOpen && (
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
            maxWidth: '400px',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ color: 'var(--navy)', fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>Assign Dispatch Rider</h3>
            
            <form onSubmit={handleAssignSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Select Active Rider *</label>
                <select 
                  required 
                  value={assignModal.riderId} 
                  onChange={(e) => setAssignModal({...assignModal, riderId: e.target.value})}
                  style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem' }}
                >
                  <option value="">-- Choose Rider --</option>
                  {riders.map(r => (
                    <option key={r._id} value={r._id}>{r.name} ({r.riderCode})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setAssignModal({ isOpen: false, orderId: null, riderId: '' })} style={{ background: '#F1F5F9', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', color: 'var(--navy)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="btn btn-orange" style={{ padding: '0.6rem 1.25rem', borderRadius: '8px' }}>Confirm Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- UPDATE PRICE MODAL --- */}
      {priceModal.isOpen && (
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
            maxWidth: '400px',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ color: 'var(--navy)', fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>Update Delivery Price</h3>
            
            <form onSubmit={handleUpdatePriceSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Delivery Base Price (₦) *</label>
                <input 
                  type="number" 
                  required 
                  min="0"
                  value={priceModal.basePrice} 
                  onChange={(e) => setPriceModal({...priceModal, basePrice: e.target.value})} 
                  style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1.5px solid #CBD5E1' }} 
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setPriceModal({ isOpen: false, orderId: null, basePrice: '' })} style={{ background: '#F1F5F9', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', color: 'var(--navy)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="btn btn-orange" style={{ padding: '0.6rem 1.25rem', borderRadius: '8px' }}>Update Price</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
