import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../services/api';
import logoImg from '../../assets/logo.png';

const RiderRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    vehicleType: 'Motorcycle',
    plateNumber: '',
    guarantorName: '',
    guarantorPhone: '',
    guarantorRelationship: '',
    guarantorAddress: '',
    username: '',
    password: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });
    if (file) {
      data.append('vehicleDocs', file);
    }

    try {
      const res = await API.post('/rider/auth/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setSuccess(true);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error submitting registration application');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f3f4f6',
        padding: '1.5rem',
        fontFamily: 'sans-serif',
        color: '#1f2937'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '480px',
          background: '#ffffff',
          borderRadius: '16px',
          padding: '2.5rem 2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          textAlign: 'center'
        }}>
          <img src={logoImg} alt="Solvix Go" style={{ height: '40px', marginBottom: '1.5rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#10b981' }}>Application Submitted</h2>
          <p style={{ color: '#4b5563', lineHeight: 1.6, marginBottom: '2rem' }}>
            Thank you for registering to be a rider with Solvix Go. Your application has been received and is pending review.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link to="/rider/status" style={{
              display: 'block',
              background: '#f47b00',
              color: '#ffffff',
              padding: '0.8rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600
            }}>
              Track Application Status
            </Link>
            <Link to="/" style={{
              display: 'block',
              color: '#4b5563',
              padding: '0.8rem',
              textDecoration: 'none',
              fontWeight: 500
            }}>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#f3f4f6',
      padding: '1.5rem 1rem',
      fontFamily: 'sans-serif',
      color: '#1f2937'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        background: '#ffffff',
        borderRadius: '16px',
        padding: '2rem 1.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        boxSizing: 'border-box'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src={logoImg} alt="Solvix Go Logo" style={{ height: '40px', marginBottom: '0.5rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Register as a Rider</h2>
          <p style={{ color: '#4b5563', fontSize: '0.875rem', marginTop: '0.25rem' }}>Join the team and start earning</p>
        </div>

        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            color: '#b91c1c',
            padding: '0.8rem',
            fontSize: '0.875rem',
            marginBottom: '1.5rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <h3 style={{ fontSize: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#f47b00' }}>Personal Details</h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Full Name</label>
            <input type="text" name="name" required value={formData.name} onChange={handleChange} style={inputStyle} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Email Address</label>
            <input type="email" name="email" required value={formData.email} onChange={handleChange} style={inputStyle} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Phone Number</label>
            <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} style={inputStyle} />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Residential Address</label>
            <textarea name="address" required value={formData.address} onChange={handleChange} style={{ ...inputStyle, height: '70px', resize: 'none' }} />
          </div>

          <h3 style={{ fontSize: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#f47b00' }}>Vehicle Information</h3>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Vehicle Type</label>
            <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} style={inputStyle}>
              <option value="Motorcycle">Motorcycle</option>
              <option value="Bicycle">Bicycle</option>
              <option value="Car">Car</option>
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Plate Number</label>
            <input type="text" name="plateNumber" required value={formData.plateNumber} onChange={handleChange} style={inputStyle} />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Vehicle Document (Image)</label>
            <input type="file" required onChange={handleFileChange} style={inputStyle} accept="image/*" />
          </div>

          <h3 style={{ fontSize: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#f47b00' }}>Guarantor Information</h3>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Guarantor Name</label>
            <input type="text" name="guarantorName" required value={formData.guarantorName} onChange={handleChange} style={inputStyle} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Guarantor Phone</label>
            <input type="tel" name="guarantorPhone" required value={formData.guarantorPhone} onChange={handleChange} style={inputStyle} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Guarantor Relationship</label>
            <input type="text" name="guarantorRelationship" required value={formData.guarantorRelationship} onChange={handleChange} style={inputStyle} />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Guarantor Address</label>
            <textarea name="guarantorAddress" required value={formData.guarantorAddress} onChange={handleChange} style={{ ...inputStyle, height: '70px', resize: 'none' }} />
          </div>

          <h3 style={{ fontSize: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#f47b00' }}>Account Credentials</h3>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Preferred Username</label>
            <input type="text" name="username" required value={formData.username} onChange={handleChange} style={inputStyle} />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Password</label>
            <input type="password" name="password" required value={formData.password} onChange={handleChange} style={inputStyle} />
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%',
            background: '#f47b00',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: 'pointer',
            opacity: loading ? 0.8 : 1
          }}>
            {loading ? 'Submitting Application...' : 'Submit Application'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
          Already applied? <Link to="/rider/status" style={{ color: '#f47b00', textDecoration: 'none', fontWeight: 600 }}>Track Status</Link>
          <br />
          <Link to="/login" style={{ display: 'inline-block', marginTop: '1rem', color: '#4b5563', textDecoration: 'none' }}>Go to Login</Link>
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  padding: '0.75rem',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box',
  background: '#f9fafb'
};

export default RiderRegister;
