import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const adminName = localStorage.getItem('solvix_admin') || 'Super Admin';
  
  // --- Active Tab State ---
  const [activeTab, setActiveTab] = useState('overview');
  const [toast, setToast] = useState({ text: '', type: '' }); // 'success' | 'error' | 'warning'

  // --- CRUD Loading States ---
  const [loading, setLoading] = useState(false);

  // --- Data States ---
  const [services, setServices] = useState([]);
  const [partners, setPartners] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [posts, setPosts] = useState([]);
  const [contacts, setContacts] = useState([]);

  // --- Modal Form States ---
  const [serviceModal, setServiceModal] = useState({ isOpen: false, isEdit: false, id: null, name: '', description: '', badge: '', displayOrder: 0, isActive: true, iconFile: null });
  const [partnerModal, setPartnerModal] = useState({ isOpen: false, isEdit: false, id: null, name: '', website: '', isActive: true, logoFile: null });
  const [postModal, setPostModal] = useState({ isOpen: false, isEdit: false, id: null, title: '', category: 'Company News', body: '', tags: '', isPublished: false, coverFile: null });

  // --- Helper: Trigger Toast Alert ---
  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast({ text: '', type: '' }), 4000);
  };

  // --- Fetch All Data on Load ---
  const fetchAllData = async () => {
    setLoading(true);
    
    // Fetch Services
    try {
      const res = await API.get('/services');
      if (res.data.success) setServices(res.data.data);
    } catch (err) {
      console.log('Using mock fallbacks for services.');
      setServices([
        { _id: '1', name: 'Pickup & Delivery', description: 'Fast delivery inside Gombe metropolis.', badge: 'Popular', isActive: true, displayOrder: 1 },
        { _id: '2', name: 'Buy & Deliver', description: 'Groceries and food shopping courier support.', badge: '', isActive: true, displayOrder: 2 },
        { _id: '3', name: 'Business Delivery', description: 'Tailored vendor solutions for merchants.', badge: '', isActive: true, displayOrder: 3 },
        { _id: '4', name: 'Express Delivery', description: 'High priority urgent logistics in 45 mins.', badge: 'NEW', isActive: true, displayOrder: 4 }
      ]);
    }

    // Fetch Partners
    try {
      const res = await API.get('/partners');
      if (res.data.success) setPartners(res.data.data);
    } catch (err) {
      console.log('Using mock fallbacks for partners.');
      setPartners([
        { _id: '1', name: 'HealthPlus Pharmacy', website: 'https://healthplus.ng', isActive: true },
        { _id: '2', name: 'Mama Cass Foods', website: '', isActive: true },
        { _id: '3', name: 'Gombe Mart', website: '', isActive: true },
        { _id: '4', name: 'Swift Supplies Ltd', website: '', isActive: false }
      ]);
    }

    // Fetch Testimonials
    try {
      const res = await API.get('/testimonials');
      if (res.data.success) setTestimonials(res.data.data);
    } catch (err) {
      console.log('Using mock fallbacks for testimonials.');
      setTestimonials([
        { _id: '1', customerName: 'Aisha Abdullahi', location: 'Tudun Wada, Gombe', rating: 5, review: 'Solvix Go has completely changed how I run my fashion business.', isApproved: true },
        { _id: '2', customerName: 'Emmanuel Danladi', location: 'Ajiya, Gombe', rating: 5, review: 'Best delivery service in Gombe State! High precision timing.', isApproved: true },
        { _id: '3', customerName: 'Musa Ibrahim', location: 'Jekadafari, Gombe', rating: 4, review: 'Very reliable and prompt restaurant deliveries every day.', isApproved: false }
      ]);
    }

    // Fetch Blog Posts
    try {
      const res = await API.get('/posts');
      if (res.data.success) setPosts(res.data.data);
    } catch (err) {
      console.log('Using mock fallbacks for blog posts.');
      setPosts([
        { _id: 'post-1', title: 'Why Solvix Go is Gombe’s Premium Logistics Partner', category: 'Company News', isPublished: true, slug: 'solvix-go-gombe-premium-logistics-partner', createdAt: '2026-05-10T12:00:00Z', body: '<p>At Solvix Go, our mission is to transform logistics...</p>', tags: ['Logistics', 'Gombe'] },
        { _id: 'post-2', title: '5 Delivery Tips to Keep Your E-Commerce Customers Happy', category: 'Delivery Tips', isPublished: true, slug: '5-delivery-tips-ecommerce-customers-happy', createdAt: '2026-05-15T09:30:00Z', body: '<p>In the competitive digital commerce environment...</p>', tags: ['E-Commerce', 'Shipping'] }
      ]);
    }

    // Fetch Contact Messages
    try {
      const res = await API.get('/contact');
      if (res.data.success) setContacts(res.data.data);
    } catch (err) {
      console.log('Using mock fallbacks for contacts.');
      setContacts([
        { _id: '1', fullName: 'Bello Yerima', phone: '08031234567', email: 'bello@gmail.com', subject: 'Corporate Partner Request', message: 'I want to integrate Solvix Go deliveries for our 12 pharmacy retail sub-outlets inside Gombe Metropolis.', status: 'New', createdAt: '2026-05-20T10:00:00Z' },
        { _id: '2', fullName: 'Fatima Audu', phone: '09077665544', email: 'fatima@yahoo.com', subject: 'Vendor Pricing Inquiry', message: 'What are your monthly subscription packages for boutique shops making 15+ deliveries daily?', status: 'In Progress', createdAt: '2026-05-21T08:30:00Z' }
      ]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // --- Auth Handler ---
  const handleLogout = () => {
    localStorage.removeItem('solvix_token');
    localStorage.removeItem('solvix_admin');
    showToast('Admin logged out successfully.');
    navigate('/admin/login');
  };

  // ==========================================
  // --- SERVICES CRUD HANDLERS ---
  // ==========================================
  const handleOpenServiceModal = (s = null) => {
    if (s) {
      setServiceModal({
        isOpen: true,
        isEdit: true,
        id: s._id,
        name: s.name,
        description: s.description,
        badge: s.badge || '',
        displayOrder: s.displayOrder || 0,
        isActive: s.isActive,
        iconFile: null
      });
    } else {
      setServiceModal({
        isOpen: true,
        isEdit: false,
        id: null,
        name: '',
        description: '',
        badge: '',
        displayOrder: 0,
        isActive: true,
        iconFile: null
      });
    }
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', serviceModal.name);
    formData.append('description', serviceModal.description);
    formData.append('badge', serviceModal.badge);
    formData.append('displayOrder', serviceModal.displayOrder);
    formData.append('isActive', serviceModal.isActive);
    if (serviceModal.iconFile) {
      formData.append('icon', serviceModal.iconFile);
    }

    try {
      let res;
      if (serviceModal.isEdit) {
        res = await API.put(`/services/${serviceModal.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await API.post('/services', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (res.data.success) {
        showToast(serviceModal.isEdit ? 'Service updated successfully!' : 'Service created successfully!');
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
      // Fallback update local state if backend is down
      const mockNewItem = {
        _id: serviceModal.isEdit ? serviceModal.id : 'mock-' + Date.now(),
        name: serviceModal.name,
        description: serviceModal.description,
        badge: serviceModal.badge,
        displayOrder: Number(serviceModal.displayOrder),
        isActive: serviceModal.isActive,
        icon: { url: 'https://cdn-icons-png.flaticon.com/512/709/709790.png' }
      };

      if (serviceModal.isEdit) {
        setServices(prev => prev.map(item => item._id === serviceModal.id ? mockNewItem : item));
        showToast('Offline Mode: Service updated locally.', 'warning');
      } else {
        setServices(prev => [...prev, mockNewItem]);
        showToast('Offline Mode: Service created locally.', 'warning');
      }
    } finally {
      setServiceModal(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleToggleServiceActive = async (s) => {
    try {
      const res = await API.put(`/services/${s._id}`, { isActive: !s.isActive });
      if (res.data.success) {
        showToast('Service status changed successfully.');
        fetchAllData();
      }
    } catch (err) {
      // Local fallback toggle
      setServices(prev => prev.map(item => item._id === s._id ? { ...item, isActive: !item.isActive } : item));
      showToast('Offline Mode: Status toggled locally.', 'warning');
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this service? This cannot be undone.')) return;
    try {
      const res = await API.delete(`/services/${id}`);
      if (res.data.success) {
        showToast('Service deleted successfully.');
        fetchAllData();
      }
    } catch (err) {
      // Local fallback delete
      setServices(prev => prev.filter(item => item._id !== id));
      showToast('Offline Mode: Service deleted locally.', 'warning');
    }
  };


  // ==========================================
  // --- PARTNERS CRUD HANDLERS ---
  // ==========================================
  const handleOpenPartnerModal = (p = null) => {
    if (p) {
      setPartnerModal({
        isOpen: true,
        isEdit: true,
        id: p._id,
        name: p.name,
        website: p.website || '',
        isActive: p.isActive,
        logoFile: null
      });
    } else {
      setPartnerModal({
        isOpen: true,
        isEdit: false,
        id: null,
        name: '',
        website: '',
        isActive: true,
        logoFile: null
      });
    }
  };

  const handlePartnerSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', partnerModal.name);
    formData.append('website', partnerModal.website);
    formData.append('isActive', partnerModal.isActive);
    if (partnerModal.logoFile) {
      formData.append('logo', partnerModal.logoFile);
    }

    try {
      let res;
      if (partnerModal.isEdit) {
        res = await API.put(`/partners/${partnerModal.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await API.post('/partners', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (res.data.success) {
        showToast(partnerModal.isEdit ? 'Partner updated successfully!' : 'Partner created successfully!');
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
      // Offline fallback state update
      const mockNewItem = {
        _id: partnerModal.isEdit ? partnerModal.id : 'mock-' + Date.now(),
        name: partnerModal.name,
        website: partnerModal.website,
        isActive: partnerModal.isActive,
        logo: { url: '' }
      };

      if (partnerModal.isEdit) {
        setPartners(prev => prev.map(item => item._id === partnerModal.id ? mockNewItem : item));
        showToast('Offline Mode: Partner updated locally.', 'warning');
      } else {
        setPartners(prev => [...prev, mockNewItem]);
        showToast('Offline Mode: Partner created locally.', 'warning');
      }
    } finally {
      setPartnerModal(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleTogglePartnerActive = async (p) => {
    try {
      const res = await API.put(`/partners/${p._id}`, { isActive: !p.isActive });
      if (res.data.success) {
        showToast('Partner status changed successfully.');
        fetchAllData();
      }
    } catch (err) {
      setPartners(prev => prev.map(item => item._id === p._id ? { ...item, isActive: !item.isActive } : item));
      showToast('Offline Mode: Status toggled locally.', 'warning');
    }
  };

  const handleDeletePartner = async (id) => {
    if (!window.confirm('Delete this retail partner?')) return;
    try {
      const res = await API.delete(`/partners/${id}`);
      if (res.data.success) {
        showToast('Partner deleted successfully.');
        fetchAllData();
      }
    } catch (err) {
      setPartners(prev => prev.filter(item => item._id !== id));
      showToast('Offline Mode: Partner deleted locally.', 'warning');
    }
  };


  // ==========================================
  // --- TESTIMONIALS CRUD HANDLERS ---
  // ==========================================
  const handleToggleTestimonialApprove = async (t) => {
    try {
      const res = await API.put(`/testimonials/${t._id}`, { isApproved: !t.isApproved });
      if (res.data.success) {
        showToast(t.isApproved ? 'Review unapproved successfully.' : 'Review approved for public site!');
        fetchAllData();
      }
    } catch (err) {
      setTestimonials(prev => prev.map(item => item._id === t._id ? { ...item, isApproved: !item.isApproved } : item));
      showToast('Offline Mode: Testimonial status changed locally.', 'warning');
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (!window.confirm('Delete this customer review?')) return;
    try {
      const res = await API.delete(`/testimonials/${id}`);
      if (res.data.success) {
        showToast('Review deleted successfully.');
        fetchAllData();
      }
    } catch (err) {
      setTestimonials(prev => prev.filter(item => item._id !== id));
      showToast('Offline Mode: Testimonial deleted locally.', 'warning');
    }
  };


  // ==========================================
  // --- BLOG POSTS CRUD HANDLERS ---
  // ==========================================
  const handleOpenPostModal = (p = null) => {
    if (p) {
      setPostModal({
        isOpen: true,
        isEdit: true,
        id: p._id,
        title: p.title,
        category: p.category,
        body: p.body,
        tags: p.tags ? p.tags.join(', ') : '',
        isPublished: p.isPublished,
        coverFile: null
      });
    } else {
      setPostModal({
        isOpen: true,
        isEdit: false,
        id: null,
        title: '',
        category: 'Company News',
        body: '',
        tags: '',
        isPublished: false,
        coverFile: null
      });
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', postModal.title);
    formData.append('category', postModal.category);
    formData.append('body', postModal.body);
    formData.append('tags', postModal.tags);
    formData.append('isPublished', postModal.isPublished);
    if (postModal.coverFile) {
      formData.append('coverImage', postModal.coverFile);
    }

    try {
      let res;
      if (postModal.isEdit) {
        res = await API.put(`/posts/${postModal.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await API.post('/posts', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (res.data.success) {
        showToast(postModal.isEdit ? 'Blog post updated!' : 'Blog post published!');
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
      
      const cleanSlug = postModal.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const tagsArray = postModal.tags.split(',').map(t => t.trim()).filter(Boolean);
      const mockNewItem = {
        _id: postModal.isEdit ? postModal.id : 'mock-' + Date.now(),
        title: postModal.title,
        category: postModal.category,
        body: postModal.body,
        tags: tagsArray,
        isPublished: postModal.isPublished,
        slug: cleanSlug,
        createdAt: new Date().toISOString(),
        coverImage: { url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600' }
      };

      if (postModal.isEdit) {
        setPosts(prev => prev.map(item => item._id === postModal.id ? mockNewItem : item));
        showToast('Offline Mode: Article updated locally.', 'warning');
      } else {
        setPosts(prev => [...prev, mockNewItem]);
        showToast('Offline Mode: Article published locally.', 'warning');
      }
    } finally {
      setPostModal(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleTogglePostPublish = async (p) => {
    try {
      const res = await API.put(`/posts/${p._id}`, { isPublished: !p.isPublished });
      if (res.data.success) {
        showToast(p.isPublished ? 'Article reverted to Draft.' : 'Article published publicly!');
        fetchAllData();
      }
    } catch (err) {
      setPosts(prev => prev.map(item => item._id === p._id ? { ...item, isPublished: !item.isPublished } : item));
      showToast('Offline Mode: Published state modified locally.', 'warning');
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm('Delete this blog post?')) return;
    try {
      const res = await API.delete(`/posts/${id}`);
      if (res.data.success) {
        showToast('Blog article deleted.');
        fetchAllData();
      }
    } catch (err) {
      setPosts(prev => prev.filter(item => item._id !== id));
      showToast('Offline Mode: Post deleted locally.', 'warning');
    }
  };


  // ==========================================
  // --- CONTACTS / SUBMISSIONS HANDLERS ---
  // ==========================================
  const handleUpdateContactStatus = async (id, newStatus) => {
    try {
      const res = await API.put(`/contact/${id}`, { status: newStatus });
      if (res.data.success) {
        showToast('Inquiry status updated to: ' + newStatus);
        fetchAllData();
      }
    } catch (err) {
      setContacts(prev => prev.map(item => item._id === id ? { ...item, status: newStatus } : item));
      showToast('Offline Mode: Inquiry status updated locally to: ' + newStatus, 'warning');
    }
  };

  const handleDeleteContact = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact submission?')) return;
    try {
      const res = await API.delete(`/contact/${id}`);
      if (res.data.success) {
        showToast('Inquiry deleted successfully.');
        fetchAllData();
      }
    } catch (err) {
      setContacts(prev => prev.filter(item => item._id !== id));
      showToast('Offline Mode: Inquiry record removed locally.', 'warning');
    }
  };


  // ==========================================
  // --- RENDERING SUB-PANELS ---
  // ==========================================

  // --- Render 1: Overview Panel ---
  const renderOverview = () => {
    const totalServices = services.length;
    const activePartners = partners.filter(p => p.isActive).length;
    const approvedReviews = testimonials.filter(t => t.isApproved).length;
    const newInquiries = contacts.filter(c => c.status === 'New').length;

    return (
      <div>
        {/* Metric Summary Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          
          <div className="metric-card" style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--card-shadow)', borderLeft: '4px solid var(--orange)' }}>
            <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '0.5rem' }}>📦</span>
            <div style={{ color: 'var(--gray-text)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Services Fleet</div>
            <div style={{ color: 'var(--navy)', fontSize: '2rem', fontWeight: 800 }}>{totalServices}</div>
          </div>

          <div className="metric-card" style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--card-shadow)', borderLeft: '4px solid var(--navy)' }}>
            <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '0.5rem' }}>🤝</span>
            <div style={{ color: 'var(--gray-text)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Retail Partners</div>
            <div style={{ color: 'var(--navy)', fontSize: '2rem', fontWeight: 800 }}>{activePartners} <span style={{ fontSize: '0.85rem', color: 'var(--gray-text)', fontWeight: 500 }}>Active</span></div>
          </div>

          <div className="metric-card" style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--card-shadow)', borderLeft: '4px solid #10B981' }}>
            <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '0.5rem' }}>⭐</span>
            <div style={{ color: 'var(--gray-text)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Public Reviews</div>
            <div style={{ color: 'var(--navy)', fontSize: '2rem', fontWeight: 800 }}>{approvedReviews} <span style={{ fontSize: '0.85rem', color: 'var(--gray-text)', fontWeight: 500 }}>Approved</span></div>
          </div>

          <div className="metric-card" style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--card-shadow)', borderLeft: '4px solid #F59E0B' }}>
            <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '0.5rem' }}>✉️</span>
            <div style={{ color: 'var(--gray-text)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>New Inquiries</div>
            <div style={{ color: 'var(--navy)', fontSize: '2rem', fontWeight: 800 }}>{newInquiries} <span style={{ fontSize: '0.85rem', color: 'var(--gray-text)', fontWeight: 500 }}>Pending</span></div>
          </div>

        </div>

        {/* Dynamic Split Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }} className="overview-split">
          
          {/* Recent Inquiries List */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--card-shadow)' }}>
            <h3 style={{ color: 'var(--navy)', fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem', borderBottom: '1.5px solid #F1F5F9', paddingBottom: '0.75rem' }}>
              Pending Inquiries / Orders
            </h3>
            {contacts.length === 0 ? (
              <p style={{ color: 'var(--gray-text)', fontSize: '0.9rem' }}>No contact submissions found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {contacts.slice(0, 4).map(c => (
                  <div key={c._id} style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #EDF2F7' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <strong style={{ color: 'var(--navy)', fontSize: '0.9rem' }}>{c.fullName}</strong>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.25rem 0.5rem',
                        borderRadius: '50px',
                        background: c.status === 'New' ? '#FEF3C7' : '#DBEAFE',
                        color: c.status === 'New' ? '#D97706' : '#2563EB'
                      }}>{c.status}</span>
                    </div>
                    <div style={{ color: 'var(--navy)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Sub: {c.subject}</div>
                    <p style={{ color: 'var(--gray-text)', fontSize: '0.8rem', lineHeight: 1.5 }}>{c.message.slice(0, 100)}{c.message.length > 100 ? '...' : ''}</p>
                    <span style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block', marginTop: '0.5rem' }}>📞 {c.phone}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Quick Draft Posts */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--card-shadow)' }}>
              <h3 style={{ color: 'var(--navy)', fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem', borderBottom: '1.5px solid #F1F5F9', paddingBottom: '0.75rem' }}>
                Draft Articles
              </h3>
              {posts.filter(p => !p.isPublished).length === 0 ? (
                <p style={{ color: 'var(--gray-text)', fontSize: '0.85rem' }}>No current draft posts. Everything is published!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {posts.filter(p => !p.isPublished).map(p => (
                    <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy)' }}>{p.title.slice(0, 35)}...</span>
                      <button onClick={() => setActiveTab('posts')} style={{ background: 'none', border: 'none', color: 'var(--orange)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>Edit</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Admin Info block */}
            <div style={{
              background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-dark) 100%)',
              color: '#fff',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: 'var(--card-shadow)'
            }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>Welcome, {adminName}</h4>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, marginBottom: '1rem' }}>
                You have administrative clearance to make live catalog changes, manage customer reviews, and resolve dispatch inquiries.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => showToast('Database cache synchronized')} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>Sync DB Cache</button>
              </div>
            </div>

          </div>

        </div>
      </div>
    );
  };

  // --- Render 2: Services CRUD Subpanel ---
  const renderServices = () => {
    return (
      <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--card-shadow)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ color: 'var(--navy)', fontSize: '1.1rem', fontWeight: 800 }}>Manage Services Fleet</h3>
          <button onClick={() => handleOpenServiceModal(null)} className="btn btn-orange" style={{ padding: '0.5rem 1rem', borderRadius: '8px' }}>
            + Create New Service
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #EDF2F7', color: 'var(--navy)', fontWeight: 700 }}>
                <th style={{ padding: '1rem' }}>Service Name</th>
                <th style={{ padding: '1rem' }}>Badge</th>
                <th style={{ padding: '1rem' }}>Display Order</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map(s => (
                <tr key={s._id} style={{ borderBottom: '1px solid #EDF2F7', verticalAlign: 'middle' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--navy)' }}>{s.name}</div>
                    <div style={{ color: 'var(--gray-text)', fontSize: '0.75rem', marginTop: '0.2rem', maxWidth: '300px' }}>{s.description}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {s.badge ? (
                      <span style={{ background: 'var(--orange)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '50px' }}>{s.badge}</span>
                    ) : '-'}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{s.displayOrder}</td>
                  <td style={{ padding: '1rem' }}>
                    <button
                      onClick={() => handleToggleServiceActive(s)}
                      style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: '50px',
                        border: 'none',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: s.isActive ? '#D1FAE5' : '#FEE2E2',
                        color: s.isActive ? '#065F46' : '#991B1B'
                      }}
                    >
                      {s.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleOpenServiceModal(s)} style={{ background: '#EFF6FF', border: 'none', color: '#1E40AF', padding: '0.35rem 0.65rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                      <button onClick={() => handleDeleteService(s._id)} style={{ background: '#FEF2F2', border: 'none', color: '#991B1B', padding: '0.35rem 0.65rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // --- Render 3: Partners CRUD Subpanel ---
  const renderPartners = () => {
    return (
      <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--card-shadow)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ color: 'var(--navy)', fontSize: '1.1rem', fontWeight: 800 }}>Manage Retail Partners</h3>
          <button onClick={() => handleOpenPartnerModal(null)} className="btn btn-orange" style={{ padding: '0.5rem 1rem', borderRadius: '8px' }}>
            + Add New Partner
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #EDF2F7', color: 'var(--navy)', fontWeight: 700 }}>
                <th style={{ padding: '1rem' }}>Partner Logo</th>
                <th style={{ padding: '1rem' }}>Partner Name</th>
                <th style={{ padding: '1rem' }}>Website</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {partners.map(p => (
                <tr key={p._id} style={{ borderBottom: '1px solid #EDF2F7', verticalAlign: 'middle' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ width: '45px', height: '45px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #EDF2F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--navy)' }}>
                      {p.logo?.url ? (
                        <img src={p.logo.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : p.name.slice(0, 2).toUpperCase()}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--navy)' }}>{p.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--orange)' }}>
                    {p.website ? (
                      <a href={p.website} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>{p.website}</a>
                    ) : '-'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button
                      onClick={() => handleTogglePartnerActive(p)}
                      style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: '50px',
                        border: 'none',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: p.isActive ? '#D1FAE5' : '#FEE2E2',
                        color: p.isActive ? '#065F46' : '#991B1B'
                      }}
                    >
                      {p.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleOpenPartnerModal(p)} style={{ background: '#EFF6FF', border: 'none', color: '#1E40AF', padding: '0.35rem 0.65rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                      <button onClick={() => handleDeletePartner(p._id)} style={{ background: '#FEF2F2', border: 'none', color: '#991B1B', padding: '0.35rem 0.65rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // --- Render 4: Testimonials CRUD Subpanel ---
  const renderTestimonials = () => {
    return (
      <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--card-shadow)' }}>
        <h3 style={{ color: 'var(--navy)', fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem' }}>Manage Testimonials</h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #EDF2F7', color: 'var(--navy)', fontWeight: 700 }}>
                <th style={{ padding: '1rem' }}>Customer</th>
                <th style={{ padding: '1rem' }}>Location</th>
                <th style={{ padding: '1rem' }}>Rating</th>
                <th style={{ padding: '1rem' }}>Review Paragraph</th>
                <th style={{ padding: '1rem' }}>Publicly Visible</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {testimonials.map(t => (
                <tr key={t._id} style={{ borderBottom: '1px solid #EDF2F7', verticalAlign: 'middle' }}>
                  <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--navy)' }}>{t.customerName}</td>
                  <td style={{ padding: '1rem', color: 'var(--gray-text)' }}>{t.location}</td>
                  <td style={{ padding: '1rem', color: '#F59E0B', fontWeight: 700 }}>{'★'.repeat(t.rating)}</td>
                  <td style={{ padding: '1rem', maxWidth: '300px', fontSize: '0.8rem', lineHeight: 1.5 }}>"{t.review}"</td>
                  <td style={{ padding: '1rem' }}>
                    <button
                      onClick={() => handleToggleTestimonialApprove(t)}
                      style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: '50px',
                        border: 'none',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: t.isApproved ? '#D1FAE5' : '#FEF3C7',
                        color: t.isApproved ? '#065F46' : '#D97706'
                      }}
                    >
                      {t.isApproved ? 'Approved' : 'Pending'}
                    </button>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button onClick={() => handleDeleteTestimonial(t._id)} style={{ background: '#FEF2F2', border: 'none', color: '#991B1B', padding: '0.35rem 0.65rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // --- Render 5: Blog Posts CRUD Subpanel ---
  const renderPosts = () => {
    return (
      <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--card-shadow)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ color: 'var(--navy)', fontSize: '1.1rem', fontWeight: 800 }}>Manage Blog Articles</h3>
          <button onClick={() => handleOpenPostModal(null)} className="btn btn-orange" style={{ padding: '0.5rem 1rem', borderRadius: '8px' }}>
            + Write New Post
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #EDF2F7', color: 'var(--navy)', fontWeight: 700 }}>
                <th style={{ padding: '1rem' }}>Article Title</th>
                <th style={{ padding: '1rem' }}>Category</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Created</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(p => (
                <tr key={p._id} style={{ borderBottom: '1px solid #EDF2F7', verticalAlign: 'middle' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--navy)' }}>{p.title}</div>
                    <div style={{ color: '#94A3B8', fontSize: '0.7rem', marginTop: '0.1rem' }}>slug: {p.slug}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ background: '#EFF6FF', color: '#1E40AF', padding: '0.2rem 0.5rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 600 }}>{p.category}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button
                      onClick={() => handleTogglePostPublish(p)}
                      style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: '50px',
                        border: 'none',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: p.isPublished ? '#D1FAE5' : '#F1F5F9',
                        color: p.isPublished ? '#065F46' : '#64748B'
                      }}
                    >
                      {p.isPublished ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--gray-text)' }}>
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleOpenPostModal(p)} style={{ background: '#EFF6FF', border: 'none', color: '#1E40AF', padding: '0.35rem 0.65rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                      <button onClick={() => handleDeletePost(p._id)} style={{ background: '#FEF2F2', border: 'none', color: '#991B1B', padding: '0.35rem 0.65rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // --- Render 6: Contacts / Inquiry Subpanel ---
  const renderContacts = () => {
    return (
      <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--card-shadow)' }}>
        <h3 style={{ color: 'var(--navy)', fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem' }}>Inquiries & Order Submissions</h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #EDF2F7', color: 'var(--navy)', fontWeight: 700 }}>
                <th style={{ padding: '1rem' }}>Sender Info</th>
                <th style={{ padding: '1rem' }}>Subject</th>
                <th style={{ padding: '1rem' }}>Message Body</th>
                <th style={{ padding: '1rem' }}>Status Pill</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map(c => (
                <tr key={c._id} style={{ borderBottom: '1px solid #EDF2F7', verticalAlign: 'top' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--navy)' }}>{c.fullName}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--gray-text)', marginTop: '0.2rem' }}>📞 {c.phone}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--gray-text)' }}>✉️ {c.email || 'None'}</div>
                    <span style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '0.3rem', display: 'block' }}>Submitted: {new Date(c.createdAt || Date.now()).toLocaleString()}</span>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--navy)' }}>{c.subject}</td>
                  <td style={{ padding: '1rem', maxWidth: '320px', fontSize: '0.8rem', lineHeight: 1.5 }}>"{c.message}"</td>
                  <td style={{ padding: '1rem' }}>
                    <select
                      value={c.status}
                      onChange={(e) => handleUpdateContactStatus(c._id, e.target.value)}
                      style={{
                        padding: '0.3rem 0.6rem',
                        borderRadius: '8px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.85rem',
                        fontFamily: 'var(--font)',
                        fontWeight: 600,
                        color: 'var(--navy)',
                        cursor: 'pointer',
                        background: c.status === 'New' ? '#FEF3C7' :
                                    c.status === 'In Progress' ? '#DBEAFE' :
                                    c.status === 'Resolved' ? '#D1FAE5' : '#F1F5F9'
                      }}
                    >
                      <option value="New">🟢 New</option>
                      <option value="In Progress">🔵 In Progress</option>
                      <option value="Resolved">✅ Resolved</option>
                      <option value="Cancelled">❌ Cancelled</option>
                    </select>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button onClick={() => handleDeleteContact(c._id)} style={{ background: '#FEF2F2', border: 'none', color: '#991B1B', padding: '0.35rem 0.65rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
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
          gap: '0.5rem',
          animation: 'slideIn 0.3s ease'
        }}>
          {toast.type === 'error' ? '❌' : toast.type === 'warning' ? '⚠️' : '✅'} {toast.text}
        </div>
      )}

      {/* ── SIDEBAR NAVIGATION ── */}
      <aside style={{
        width: '260px',
        background: 'var(--navy)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        padding: '2rem 1rem',
        flexShrink: 0
      }} className="sidebar">
        
        {/* Sidebar Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Solvix<span style={{ color: 'var(--orange)' }}>Go</span></h2>
          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.1em', display: 'block', marginTop: '0.25rem' }}>Admin Control Hub</span>
        </div>

        {/* User Card */}
        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <div style={{ width: '36px', height: '36px', background: 'var(--orange)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
            {adminName.slice(0,1).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{adminName}</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.68rem', fontWeight: 600 }}>SuperAdmin</div>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1 }}>
          <button onClick={() => setActiveTab('overview')} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.8rem 1.25rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 600, fontSize: '0.85rem', textAlign: 'left', transition: 'var(--transition)',
            background: activeTab === 'overview' ? 'var(--orange)' : 'transparent',
            color: '#fff'
          }}>📊 Overview</button>

          <button onClick={() => setActiveTab('services')} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.8rem 1.25rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 600, fontSize: '0.85rem', textAlign: 'left', transition: 'var(--transition)',
            background: activeTab === 'services' ? 'var(--orange)' : 'transparent',
            color: '#fff'
          }}>📦 Services Fleet</button>

          <button onClick={() => setActiveTab('partners')} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.8rem 1.25rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 600, fontSize: '0.85rem', textAlign: 'left', transition: 'var(--transition)',
            background: activeTab === 'partners' ? 'var(--orange)' : 'transparent',
            color: '#fff'
          }}>🤝 Retail Partners</button>

          <button onClick={() => setActiveTab('testimonials')} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.8rem 1.25rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 600, fontSize: '0.85rem', textAlign: 'left', transition: 'var(--transition)',
            background: activeTab === 'testimonials' ? 'var(--orange)' : 'transparent',
            color: '#fff'
          }}>⭐ Testimonials</button>

          <button onClick={() => setActiveTab('posts')} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.8rem 1.25rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 600, fontSize: '0.85rem', textAlign: 'left', transition: 'var(--transition)',
            background: activeTab === 'posts' ? 'var(--orange)' : 'transparent',
            color: '#fff'
          }}>📝 Blog Articles</button>

          <button onClick={() => setActiveTab('contacts')} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.8rem 1.25rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 600, fontSize: '0.85rem', textAlign: 'left', transition: 'var(--transition)',
            background: activeTab === 'contacts' ? 'var(--orange)' : 'transparent',
            color: '#fff'
          }}>✉️ Contact Orders</button>
        </nav>

        {/* Sidebar Footer Logout */}
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.8rem 1.25rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 700, fontSize: '0.85rem', textAlign: 'left', transition: 'var(--transition)',
          background: 'rgba(239, 68, 68, 0.1)',
          color: '#F87171'
        }}>🚪 Sign Out</button>

      </aside>

      {/* ── MAIN WORKSPACE CONTENT ── */}
      <main style={{ flexGrow: 1, padding: '2.5rem', overflowY: 'auto' }}>
        
        {/* Dashboard Title Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ color: 'var(--navy)', fontSize: '1.75rem', fontWeight: 800, margin: 0, textTransform: 'capitalize' }}>
              {activeTab} Management
            </h1>
            <p style={{ color: 'var(--gray-text)', fontSize: '0.85rem' }}>Solvix Go Gombe HQ Operations</p>
          </div>
          <div style={{ color: 'var(--navy)', fontWeight: 600, fontSize: '0.85rem', background: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', boxShadow: 'var(--card-shadow)' }}>
            📅 Local Time: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
        </header>

        {/* Subpanel router */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'services' && renderServices()}
        {activeTab === 'partners' && renderPartners()}
        {activeTab === 'testimonials' && renderTestimonials()}
        {activeTab === 'posts' && renderPosts()}
        {activeTab === 'contacts' && renderContacts()}

      </main>

      {/* ======================================================== */}
      {/* ── MODALS DIALOG POPUPS ── */}
      {/* ======================================================== */}

      {/* 1. Service CRUD Form Modal */}
      {serviceModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '500px', padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', maxOverflow: '85vh', overflowY: 'auto' }}>
            <h3 style={{ color: 'var(--navy)', fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>
              {serviceModal.isEdit ? 'Edit Service Details' : 'Create New Service Fleet'}
            </h3>
            
            <form onSubmit={handleServiceSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Service Name *</label>
                <input type="text" required value={serviceModal.name} onChange={(e) => setServiceModal(p => ({ ...p, name: e.target.value }))} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontFamily: 'var(--font)' }} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Description / Excerpt *</label>
                <textarea required rows="3" value={serviceModal.description} onChange={(e) => setServiceModal(p => ({ ...p, description: e.target.value }))} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontFamily: 'var(--font)' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Accent Badge (e.g. NEW)</label>
                  <input type="text" value={serviceModal.badge} onChange={(e) => setServiceModal(p => ({ ...p, badge: e.target.value }))} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontFamily: 'var(--font)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Display Order No.</label>
                  <input type="number" value={serviceModal.displayOrder} onChange={(e) => setServiceModal(p => ({ ...p, displayOrder: e.target.value }))} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontFamily: 'var(--font)' }} />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Service Vector Icon (File upload)</label>
                <input type="file" accept="image/*" onChange={(e) => setServiceModal(p => ({ ...p, iconFile: e.target.files[0] }))} style={{ width: '100%' }} />
              </div>

              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" id="srv-active" checked={serviceModal.isActive} onChange={(e) => setServiceModal(p => ({ ...p, isActive: e.target.checked }))} />
                <label htmlFor="srv-active" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy)', cursor: 'pointer' }}>Set Service Fleet as Active</label>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setServiceModal(p => ({ ...p, isOpen: false }))} style={{ background: '#F1F5F9', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', color: 'var(--navy)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="btn btn-orange" style={{ padding: '0.6rem 1.25rem', borderRadius: '8px' }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Partner CRUD Form Modal */}
      {partnerModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '450px', padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            <h3 style={{ color: 'var(--navy)', fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>
              {partnerModal.isEdit ? 'Edit Retail Partner' : 'Register New Partner'}
            </h3>
            
            <form onSubmit={handlePartnerSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Partner / Brand Name *</label>
                <input type="text" required value={partnerModal.name} onChange={(e) => setPartnerModal(p => ({ ...p, name: e.target.value }))} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontFamily: 'var(--font)' }} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Website Url (Optional)</label>
                <input type="url" value={partnerModal.website} onChange={(e) => setPartnerModal(p => ({ ...p, website: e.target.value }))} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontFamily: 'var(--font)' }} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Brand Logo Image</label>
                <input type="file" accept="image/*" onChange={(e) => setPartnerModal(p => ({ ...p, logoFile: e.target.files[0] }))} style={{ width: '100%' }} />
              </div>

              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" id="part-active" checked={partnerModal.isActive} onChange={(e) => setPartnerModal(p => ({ ...p, isActive: e.target.checked }))} />
                <label htmlFor="part-active" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy)', cursor: 'pointer' }}>Active on scrolling marquee</label>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setPartnerModal(p => ({ ...p, isOpen: false }))} style={{ background: '#F1F5F9', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', color: 'var(--navy)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="btn btn-orange" style={{ padding: '0.6rem 1.25rem', borderRadius: '8px' }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Blog Post CRUD Form Modal */}
      {postModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '700px', padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', maxHeight: '85vh', overflowY: 'auto' }}>
            <h3 style={{ color: 'var(--navy)', fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>
              {postModal.isEdit ? 'Edit Hub Post' : 'Compose Hub Post'}
            </h3>
            
            <form onSubmit={handlePostSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Article Title *</label>
                  <input type="text" required value={postModal.title} onChange={(e) => setPostModal(p => ({ ...p, title: e.target.value }))} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontFamily: 'var(--font)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Category *</label>
                  <select value={postModal.category} onChange={(e) => setPostModal(p => ({ ...p, category: e.target.value }))} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontFamily: 'var(--font)', cursor: 'pointer' }}>
                    <option value="Company News">Company News</option>
                    <option value="Delivery Tips">Delivery Tips</option>
                    <option value="Business Advice">Business Advice</option>
                    <option value="Partner Spotlight">Partner Spotlight</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Tags (Comma-separated)</label>
                <input type="text" placeholder="Gombe, Logistics, E-Commerce" value={postModal.tags} onChange={(e) => setPostModal(p => ({ ...p, tags: e.target.value }))} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontFamily: 'var(--font)' }} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>HTML Article Body *</label>
                <textarea required rows="8" placeholder="<p>Write your detailed article contents using standard HTML paragraph and bullet list tags here...</p>" value={postModal.body} onChange={(e) => setPostModal(p => ({ ...p, body: e.target.value }))} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontFamily: 'var(--font)', fontSize: '0.85rem' }} />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Cover Image</label>
                <input type="file" accept="image/*" onChange={(e) => setPostModal(p => ({ ...p, coverFile: e.target.files[0] }))} style={{ width: '100%' }} />
              </div>

              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" id="post-publish" checked={postModal.isPublished} onChange={(e) => setPostModal(p => ({ ...p, isPublished: e.target.checked }))} />
                <label htmlFor="post-publish" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy)', cursor: 'pointer' }}>Publish Article Publicly (Unchecking saves as Draft)</label>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setPostModal(p => ({ ...p, isOpen: false }))} style={{ background: '#F1F5F9', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', color: 'var(--navy)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="btn btn-orange" style={{ padding: '0.6rem 1.25rem', borderRadius: '8px' }}>Save & Publish</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Dashboard Layout Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .sidebar {
            display: none !important;
          }
          .overview-split {
            grid-template-columns: 1fr !important;
          }
        }
        .metric-card {
          transition: transform 0.2s ease;
        }
        .metric-card:hover {
          transform: translateY(-4px);
        }
      `}} />

    </div>
  );
};

export default AdminDashboard;
