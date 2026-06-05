import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useRiderSocket } from '../../hooks/useSocket';
import logoImg from '../../assets/logo.png';

const RiderDashboard = () => {
  const navigate = useNavigate();
  const [rider, setRider] = useState(null);
  const [activeOrders, setActiveOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ text: '', type: '' });

  // --- Expenses State ---
  const [expenses, setExpenses] = useState([]);
  const [expenseStats, setExpenseStats] = useState({ totalRevenue: 0, totalExpenses: 0, totalFuelExpenses: 0, netProfit: 0 });
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    category: 'Fuel',
    description: ''
  });
  
  // --- Modals State ---
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

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast({ text: '', type: '' }), 5000);
  };

  useEffect(() => {
    const info = localStorage.getItem('rider_info');
    const token = localStorage.getItem('rider_token');
    if (!info || !token) {
      navigate('/rider/login');
      return;
    }
    setRider(JSON.parse(info));
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await API.get('/orders/rider/mine');
      if (res.data.success) {
        const orders = res.data.data;
        const active = orders.filter(o => ['Assigned', 'Picked Up', 'In Transit'].includes(o.status));
        const today = new Date().toDateString();
        const completed = orders.filter(o => 
          o.status === 'Delivered' && new Date(o.updatedAt).toDateString() === today
        );
        setActiveOrders(active);
        setCompletedOrders(completed);
      }

      // Fetch expenses list
      const expRes = await API.get('/expenses');
      if (expRes.data.success) {
        setExpenses(expRes.data.data);
      }

      // Fetch expenses stats
      const statsRes = await API.get('/expenses/stats');
      if (statsRes.data.success) {
        setExpenseStats(statsRes.data.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading orders & expenses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPartners = async () => {
    try {
      const res = await API.get('/partners');
      if (res.data.success) {
        setPartners(res.data.data.filter(p => p.isActive && p.billingPlan !== 'None'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (rider) {
      fetchData();
      fetchPartners();
    }
  }, [rider]);

  // --- Real-time updates ---
  useRiderSocket(
    rider?.id,
    (payload) => {
      // Order Assigned
      showToast(`🚴 New Order Assigned! From: ${payload.order.customerName}`, 'success');
      fetchData();
    },
    (payload) => {
      // Order Cancelled
      showToast(`⚠️ Assigned Order Cancelled (ID: ${payload.orderId})`, 'warning');
      fetchData();
    }
  );

  const handleLogout = () => {
    localStorage.removeItem('rider_token');
    localStorage.removeItem('rider_info');
    navigate('/rider/login');
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...createForm };
      if (!['Weekly Plan', 'Monthly Plan'].includes(payload.paymentMethod)) {
        delete payload.partner;
      }
      const res = await API.post('/orders', payload);
      if (res.data.success) {
        showToast('🎉 Order created successfully!');
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
        fetchData();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error creating order', 'error');
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        amount: Number(expenseForm.amount),
        category: expenseForm.category,
        description: expenseForm.description
      };
      const res = await API.post('/expenses', payload);
      if (res.data.success) {
        showToast('Expense recorded successfully!');
        setIsExpenseModalOpen(false);
        setExpenseForm({ amount: '', category: 'Fuel', description: '' });
        fetchData();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error recording expense', 'error');
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Delete this expense record?')) return;
    try {
      const res = await API.delete(`/expenses/${id}`);
      if (res.data.success) {
        showToast('Expense record deleted');
        fetchData();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error deleting expense', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Assigned': return '#3b82f6';
      case 'Picked Up': return '#f59e0b';
      case 'In Transit': return '#f97316';
      case 'Delivered': return '#10b981';
      default: return '#94a3b8';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#090e24',
      color: '#fff',
      paddingBottom: '3rem',
      fontFamily: 'var(--font, sans-serif)'
    }}>
      {/* Toast Alert */}
      {toast.text && (
        <div style={{
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          right: '1rem',
          zIndex: 10000,
          background: toast.type === 'error' ? '#ef4444' : toast.type === 'warning' ? '#f59e0b' : '#10b981',
          color: '#fff',
          padding: '0.9rem 1.2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          fontWeight: 700,
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'slideIn 0.3s ease'
        }}>
          {toast.type === 'error' ? '⚠️' : toast.type === 'warning' ? '🔔' : '✅'} {toast.text}
        </div>
      )}

      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.25rem 1rem',
        background: '#0e1738',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img src={logoImg} alt="Logo" style={{ height: '32px', objectFit: 'contain' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--orange)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>Rider Hub</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{rider?.name}</div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Code: {rider?.riderCode}</div>
          </div>
          <button onClick={handleLogout} style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: 'none',
            color: '#f87171',
            padding: '0.4rem 0.75rem',
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}>Logout</button>
        </div>
      </header>

      <main style={{ padding: '1rem' }}>
        {/* Create Order Trigger Button */}
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #f47b00 0%, #d95d00 100%)',
            border: 'none',
            borderRadius: '14px',
            padding: '1rem',
            color: '#fff',
            fontSize: '0.95rem',
            fontWeight: 700,
            boxShadow: '0 6px 16px rgba(244, 123, 0, 0.2)',
            cursor: 'pointer',
            marginBottom: '1.5rem'
          }}
        >
          ➕ Create New Order (At Pickup)
        </button>

        {/* Section: Active Orders */}
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--orange-light)', borderLeft: '4px solid var(--orange)', paddingLeft: '0.5rem' }}>
          Active Assignments ({activeOrders.length})
        </h2>
        
        {activeOrders.length === 0 ? (
          <div style={{
            background: '#0e1738',
            borderRadius: '16px',
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            color: 'rgba(255,255,255,0.4)',
            fontSize: '0.85rem',
            border: '1px solid rgba(255,255,255,0.05)',
            marginBottom: '2rem'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📭</div>
            No active orders assigned currently.<br />New dispatches will pop up in real-time.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
            {activeOrders.map(o => (
              <div 
                key={o._id}
                onClick={() => navigate(`/rider/orders/${o._id}`)}
                style={{
                  background: '#0e1738',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  border: '1px solid rgba(255,255,255,0.06)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>
                    {o.trackingId || 'Pending Pickup'}
                  </span>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '0.25rem 0.6rem',
                    borderRadius: '50px',
                    background: getStatusColor(o.status) + '1a',
                    color: getStatusColor(o.status),
                    border: `1px solid ${getStatusColor(o.status)}33`
                  }}>{o.status}</span>
                </div>

                <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <strong>Client:</strong> {o.customerName}
                </div>
                
                <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', color: 'rgba(255,255,255,0.7)' }}>
                  <div>📍 <strong>Pickup:</strong> {o.pickupAddress}</div>
                  <div>🏁 <strong>Dropoff:</strong> {o.dropoffAddress}</div>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '0.75rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                  fontSize: '0.8rem'
                }}>
                  <span>₦{o.totalAmount || o.basePrice} ({o.paymentMethod})</span>
                  <span style={{ color: 'var(--orange)', fontWeight: 700 }}>Manage Details →</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Section: Completed Today */}
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.75rem', color: 'rgba(255,255,255,0.7)', borderLeft: '4px solid #10b981', paddingLeft: '0.5rem' }}>
          Completed Today ({completedOrders.length})
        </h2>

        {completedOrders.length === 0 ? (
          <div style={{
            background: '#0b1129',
            borderRadius: '16px',
            padding: '1.5rem',
            textAlign: 'center',
            color: 'rgba(255,255,255,0.3)',
            fontSize: '0.8rem',
            border: '1px solid rgba(255,255,255,0.03)'
          }}>
            No orders completed yet today.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {completedOrders.map(o => (
              <div 
                key={o._id}
                style={{
                  background: '#0b1129',
                  borderRadius: '14px',
                  padding: '1rem',
                  border: '1px solid rgba(255,255,255,0.03)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{o.customerName}</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{o.trackingId} • {o.dropoffAddress}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#10b981' }}>₦{o.totalAmount}</div>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>Delivered</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Section: Expenses & Profit Tracker */}
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '2.5rem', marginBottom: '0.75rem', color: 'var(--orange-light)', borderLeft: '4px solid var(--orange)', paddingLeft: '0.5rem' }}>
          Expenses & Profit Tracker
        </h2>

        {/* Profit Stats Card */}
        <div style={{
          background: 'linear-gradient(135deg, #0e1738 0%, #080d24 100%)',
          borderRadius: '16px',
          padding: '1.25rem',
          border: '1px solid rgba(255,255,255,0.06)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '0.75rem',
          textAlign: 'center',
          marginBottom: '1.5rem'
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase' }}>Gross Revenue</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>₦{expenseStats.totalRevenue.toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase' }}>Expenses</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f87171', marginTop: '0.25rem' }}>₦{expenseStats.totalExpenses.toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase' }}>Net Profit</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--orange-light)', marginTop: '0.25rem' }}>₦{expenseStats.netProfit.toLocaleString()}</div>
          </div>
        </div>

        {/* Add Expense Trigger */}
        <button 
          onClick={() => setIsExpenseModalOpen(true)}
          style={{
            width: '100%',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px dashed #f59e0b',
            borderRadius: '12px',
            padding: '0.75rem',
            color: '#f59e0b',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            marginBottom: '1.5rem',
            transition: '0.2s'
          }}
        >
          ⛽ Record Expense (Fuel, Food, etc.)
        </button>

        {/* Expenses List */}
        {expenses.length === 0 ? (
          <div style={{
            background: '#0b1129',
            borderRadius: '16px',
            padding: '1.5rem',
            textAlign: 'center',
            color: 'rgba(255,255,255,0.3)',
            fontSize: '0.8rem',
            border: '1px solid rgba(255,255,255,0.03)'
          }}>
            No expenses recorded yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {expenses.map(e => (
              <div 
                key={e._id}
                style={{
                  background: '#0e1738',
                  borderRadius: '14px',
                  padding: '1rem',
                  border: '1px solid rgba(255,255,255,0.03)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                    {e.category} {e.description ? ` - ${e.description}` : ''}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>
                    {new Date(e.date).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f87171' }}>
                    -₦{e.amount}
                  </div>
                  <button 
                    onClick={() => handleDeleteExpense(e._id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(239, 68, 68, 0.6)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 700
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* --- CREATE ORDER MODAL --- */}
      {isCreateModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#0e1738',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '450px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '1.5rem',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--orange-light)' }}>Create New Booking</h3>
            
            <form onSubmit={handleCreateSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Customer Name *</label>
                  <input type="text" required value={createForm.customerName} onChange={(e) => setCreateForm({...createForm, customerName: e.target.value})} style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.85rem' }} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Customer Phone *</label>
                    <input type="tel" required value={createForm.customerPhone} onChange={(e) => setCreateForm({...createForm, customerPhone: e.target.value})} style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.85rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Receiver Phone *</label>
                    <input type="tel" required value={createForm.receiverPhone} onChange={(e) => setCreateForm({...createForm, receiverPhone: e.target.value})} style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.85rem' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Pickup Address *</label>
                  <input type="text" required value={createForm.pickupAddress} onChange={(e) => setCreateForm({...createForm, pickupAddress: e.target.value})} style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.85rem' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Dropoff Address *</label>
                  <input type="text" required value={createForm.dropoffAddress} onChange={(e) => setCreateForm({...createForm, dropoffAddress: e.target.value})} style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.85rem' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Item Description *</label>
                  <input type="text" required value={createForm.itemDescription} onChange={(e) => setCreateForm({...createForm, itemDescription: e.target.value})} placeholder="e.g. Clothes, Food parcel" style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.85rem' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Delivery Price / Zone *</label>
                    <select value={createForm.distanceZone} onChange={(e) => setCreateForm({...createForm, distanceZone: e.target.value})} style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0e1738', color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>
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
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Payment Method *</label>
                    <select value={createForm.paymentMethod} onChange={(e) => setCreateForm({...createForm, paymentMethod: e.target.value})} style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0e1738', color: '#fff', fontSize: '0.85rem' }}>
                      <option value="Cash">Cash</option>
                      <option value="Transfer">Transfer</option>
                      <option value="Weekly Plan">Weekly Plan</option>
                      <option value="Monthly Plan">Monthly Plan</option>
                    </select>
                  </div>
                </div>

                {['Weekly Plan', 'Monthly Plan'].includes(createForm.paymentMethod) && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Retail Partner *</label>
                    <select required value={createForm.partner} onChange={(e) => setCreateForm({...createForm, partner: e.target.value})} style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0e1738', color: '#fff', fontSize: '0.85rem' }}>
                      <option value="">-- Choose Partner --</option>
                      {partners.map(p => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.7erem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Special Notes</label>
                  <textarea rows="2" value={createForm.notes} onChange={(e) => setCreateForm({...createForm, notes: e.target.value})} placeholder="Any specific instructions" style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.85rem' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsCreateModalOpen(false)} style={{ background: '#273469', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ background: 'var(--orange)', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Create Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- RECORD EXPENSE MODAL --- */}
      {isExpenseModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#0e1738',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '400px',
            padding: '1.5rem',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--orange-light)' }}>Record Expense</h3>
            
            <form onSubmit={handleExpenseSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Amount (₦) *</label>
                  <input 
                    type="number" 
                    required 
                    min="1"
                    value={expenseForm.amount} 
                    onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})} 
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.85rem' }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Category *</label>
                  <select 
                    value={expenseForm.category} 
                    onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})} 
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0e1738', color: '#fff', fontSize: '0.85rem' }}
                  >
                    <option value="Fuel">⛽ Fuel / Petrol</option>
                    <option value="Maintenance">🛠️ Bike Maintenance</option>
                    <option value="Food">🍔 Rider feeding</option>
                    <option value="Other">❓ Other cost</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Description / Notes</label>
                  <input 
                    type="text" 
                    value={expenseForm.description} 
                    onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})} 
                    placeholder="e.g. Fuel purchase at Total" 
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.85rem' }} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsExpenseModalOpen(false)} style={{ background: '#273469', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ background: 'var(--orange)', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Save Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiderDashboard;
