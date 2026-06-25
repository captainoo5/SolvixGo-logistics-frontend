import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';

const RiderOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ text: '', type: '' });

  // --- Extra Charge Modal State ---
  const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);
  const [chargeForm, setChargeForm] = useState({ reason: '', amount: '' });



  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast({ text: '', type: '' }), 5000);
  };

  const fetchOrderDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get(`/orders/${id}`);
      if (res.data.success) {
        setOrder(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error fetching order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const handleStatusUpdate = async (nextStatus) => {
    try {
      const res = await API.patch(`/orders/${id}/status`, { status: nextStatus });
      if (res.data.success) {
        showToast(`Status updated to: ${nextStatus}`);
        fetchOrderDetail();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error updating status', 'error');
    }
  };

  const handleAcceptAssignment = async () => {
    try {
      const res = await API.patch(`/orders/${id}/accept`);
      if (res.data.success) {
        showToast('Assignment accepted');
        fetchOrderDetail();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error accepting assignment', 'error');
    }
  };

  const handleDeclineAssignment = async () => {
    const reason = window.prompt('Please enter the reason for declining this assignment:');
    if (reason === null) return;
    try {
      const res = await API.patch(`/orders/${id}/decline`, { reason });
      if (res.data.success) {
        showToast('Assignment declined');
        navigate('/rider/dashboard');
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error declining assignment', 'error');
    }
  };

  const handleAddCharge = async (e) => {
    e.preventDefault();
    const amount = Number(chargeForm.amount);
    if (!chargeForm.reason || isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid reason and positive amount', 'error');
      return;
    }

    try {
      const res = await API.patch(`/orders/${id}/extra-charges`, {
        reason: chargeForm.reason,
        amount
      });
      if (res.data.success) {
        showToast('Extra charge added successfully');
        setIsChargeModalOpen(false);
        setChargeForm({ reason: '', amount: '' });
        fetchOrderDetail();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error adding charge', 'error');
    }
  };



  if (loading && !order) {
    return (
      <div style={{ minHeight: '100vh', background: '#f3f4f6', color: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <h3>Loading Details...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#f3f4f6', color: '#1f2937', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <p style={{ fontSize: '1rem', color: '#ef4444', marginBottom: '1.5rem' }}>{error}</p>
        <button onClick={() => navigate('/rider/dashboard')} style={{ background: '#f47b00', border: 'none', color: '#fff', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Back to Dashboard</button>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f3f4f6',
      color: '#1f2937',
      paddingBottom: '3rem',
      fontFamily: 'sans-serif'
    }}>
      {/* Toast Alert */}
      {toast.text && (
        <div style={{
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          right: '1rem',
          zIndex: 10000,
          background: toast.type === 'error' ? '#ef4444' : '#10b981',
          color: '#fff',
          padding: '0.9rem 1.2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          fontWeight: 700,
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {toast.text}
        </div>
      )}

      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        padding: '1.25rem 1rem',
        background: '#ffffff',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <button 
          onClick={() => navigate('/rider/dashboard')}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#1f2937',
            fontSize: '1.2rem',
            cursor: 'pointer',
            paddingRight: '1rem'
          }}
        >
          ←
        </button>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Order: {order.trackingId || 'Pending'}</h3>
      </header>

      <main style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto' }}>
        {/* Order Details Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '1.5rem',
          border: '1px solid #e5e7eb',
          marginBottom: '1.5rem',
          boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#4b5563', fontWeight: 700 }}>Order Details</span>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '0.25rem 0.6rem',
              borderRadius: '50px',
              background: 'rgba(244, 123, 0, 0.1)',
              color: '#f47b00'
            }}>{order.status}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.875rem' }}>
            <div>
              <span style={{ color: '#4b5563', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Customer Name</span>
              <strong>{order.customerName}</strong>
            </div>
            <div>
              <span style={{ color: '#4b5563', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Customer Phone</span>
              <a href={`tel:${order.customerPhone}`} style={{ color: '#f47b00', textDecoration: 'none', fontWeight: 700 }}>{order.customerPhone}</a>
            </div>
            <div>
              <span style={{ color: '#4b5563', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Receiver Phone</span>
              <a href={`tel:${order.receiverPhone}`} style={{ color: '#f47b00', textDecoration: 'none', fontWeight: 700 }}>{order.receiverPhone}</a>
            </div>
            <div>
              <span style={{ color: '#4b5563', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Pickup Location</span>
              <strong>{order.pickupAddress}</strong>
            </div>
            <div>
              <span style={{ color: '#4b5563', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Dropoff Location</span>
              <strong>{order.dropoffAddress}</strong>
            </div>
            <div>
              <span style={{ color: '#4b5563', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Item Description</span>
              <strong>{order.itemDescription}</strong>
            </div>
            {order.notes && (
              <div>
                <span style={{ color: '#4b5563', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Special Notes</span>
                <span style={{ fontStyle: 'italic', color: '#1f2937' }}>"{order.notes}"</span>
              </div>
            )}
          </div>
        </div>

        {/* Pricing Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '1.5rem',
          border: '1px solid #e5e7eb',
          marginBottom: '1.5rem',
          boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)'
        }}>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#4b5563', textTransform: 'uppercase', fontWeight: 700 }}>Pricing & Payment</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Base Delivery Price:</span>
              <strong>₦{order.basePrice}</strong>
            </div>

            {order.extraCharges.length > 0 && (
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '0.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#4b5563', display: 'block', marginBottom: '0.25rem' }}>Extra Charges:</span>
                {order.extraCharges.map((ch, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444', padding: '0.15rem 0' }}>
                    <span>• {ch.reason}</span>
                    <strong>+₦{ch.amount}</strong>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800, marginTop: '0.4rem' }}>
              <span>Total Amount:</span>
              <span style={{ color: '#f47b00' }}>₦{order.totalAmount || order.basePrice}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#4b5563', marginTop: '0.4rem' }}>
              <span>Payment Mode:</span>
              <span>{order.paymentMethod}</span>
            </div>
            
            {order.partner && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#4b5563' }}>
                <span>Billing Partner:</span>
                <span>{order.partner.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {order.status === 'Assigned' && !order.isAcceptedByRider ? (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={handleAcceptAssignment}
                style={{
                  flex: 1,
                  background: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '1rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Accept Assignment
              </button>
              <button 
                onClick={handleDeclineAssignment}
                style={{
                  flex: 1,
                  background: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '1rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Decline Assignment
              </button>
            </div>
          ) : order.status !== 'Delivered' && order.status !== 'Cancelled' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Update Status</label>
                <select 
                  value={order.status}
                  onChange={(e) => {
                    if (e.target.value !== order.status) {
                      handleStatusUpdate(e.target.value);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '0.9rem',
                    borderRadius: '12px',
                    border: '1px solid #d1d5db',
                    background: '#ffffff',
                    color: '#1f2937',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxSizing: 'border-box'
                  }}
                >
                  {order.status === 'Assigned' && <option value="Assigned">Assigned (Pending Pickup)</option>}
                  {['Assigned', 'Picked Up'].includes(order.status) && <option value="Picked Up">Picked Up (Generate ID)</option>}
                  {['Picked Up', 'In Transit'].includes(order.status) && <option value="In Transit">In Transit</option>}
                  {['In Transit', 'Delivered'].includes(order.status) && <option value="Delivered">Delivered (Complete)</option>}
                </select>
                <p style={{ fontSize: '0.75rem', color: '#4b5563', marginTop: '0.2rem' }}>* Select a new status to update immediately.</p>
              </div>

              {['Picked Up', 'In Transit'].includes(order.status) && (
                <button 
                  onClick={() => setIsChargeModalOpen(true)}
                  style={{
                    background: 'transparent',
                    color: '#f47b00',
                    border: '1px solid #f47b00',
                    padding: '0.9rem',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  Add Extra Charge
                </button>
              )}
            </div>
          ) : (
            <div style={{
              background: order.status === 'Delivered' ? '#ecfdf5' : '#fef2f2',
              border: `1px solid ${order.status === 'Delivered' ? '#a7f3d0' : '#fca5a5'}`,
              borderRadius: '12px',
              padding: '1rem',
              textAlign: 'center',
              color: order.status === 'Delivered' ? '#10b981' : '#ef4444',
              fontWeight: 700,
              fontSize: '0.9rem'
            }}>
              {order.status === 'Delivered' ? 'Order Successfully Delivered!' : 'Order Cancelled'}
            </div>
          )}
        </div>
      </main>

      {/* --- ADD EXTRA CHARGE MODAL --- */}
      {isChargeModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '400px',
            padding: '1.5rem',
            border: '1px solid #e5e7eb',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem', color: '#ef4444' }}>Add Extra Charge</h3>
            
            <form onSubmit={handleAddCharge}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#4b5563', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Reason / Purpose *</label>
                  <input 
                    type="text" 
                    required 
                    value={chargeForm.reason} 
                    onChange={(e) => setChargeForm({...chargeForm, reason: e.target.value})} 
                    placeholder="e.g. Waiting charge, Heavy item" 
                    style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '8px', border: '1px solid #d1d5db', background: '#f9fafb', color: '#1f2937', fontSize: '0.85rem', boxSizing: 'border-box' }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#4b5563', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Amount (₦) *</label>
                  <input 
                    type="number" 
                    required 
                    value={chargeForm.amount} 
                    onChange={(e) => setChargeForm({...chargeForm, amount: e.target.value})} 
                    placeholder="e.g. 200" 
                    style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '8px', border: '1px solid #d1d5db', background: '#f9fafb', color: '#1f2937', fontSize: '0.85rem', boxSizing: 'border-box' }} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsChargeModalOpen(false)} style={{ background: '#e5e7eb', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', color: '#374151', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ background: '#ef4444', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Add Charge</button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
};

export default RiderOrderDetail;
