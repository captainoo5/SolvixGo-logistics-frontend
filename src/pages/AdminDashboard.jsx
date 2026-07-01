import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import logoImg from '../assets/logo.png';
import { subscribeToWebPush } from '../utils/webPushHelper';

const AdminDashboard = () => {
  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const baseURL = apiURL.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
    return `${baseURL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const navigate = useNavigate();
  const location = useLocation();
  const adminName = localStorage.getItem('solvix_admin') || 'Super Admin';
  
  // --- Active Tab State ---
  const query = new URLSearchParams(location.search);
  const activeTab = query.get('tab') || 'overview';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toast, setToast] = useState({ text: '', type: '' }); // 'success' | 'error' | 'warning'

  // --- CRUD Loading States ---
  const [loading, setLoading] = useState(false);

  // --- Data States ---
  const [services, setServices] = useState([]);
  const [partners, setPartners] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [posts, setPosts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [revenueStats, setRevenueStats] = useState({ totalRevenue: 0, totalExpenses: 0, totalFuelExpenses: 0, netProfit: 0 });
  
  // --- Admin/Manager Management States ---
  const [admins, setAdmins] = useState([]);
  const [adminModal, setAdminModal] = useState({ isOpen: false, isEdit: false, id: null, name: '', email: '', password: '', role: 'admin' });

  // --- Member Management States ---
  const [members, setMembers] = useState([]);
  const [memberModal, setMemberModal] = useState({ isOpen: false, isEdit: false, id: null, name: '', role: '', hobby: '', history: '', isActive: true, imageFile: null });

  // --- Performance Tracking States ---
  const [ridersList, setRidersList] = useState([]);
  const [historyType, setHistoryType] = useState('rider'); // 'rider' | 'admin'
  const [historySelectedId, setHistorySelectedId] = useState('');
  const [historyRange, setHistoryRange] = useState('weekly'); // 'weekly' | 'monthly'
  const [historyData, setHistoryData] = useState([]);

  // --- Modal Form States ---
  const [serviceModal, setServiceModal] = useState({ isOpen: false, isEdit: false, id: null, name: '', description: '', badge: '', displayOrder: 0, isActive: true, iconFile: null });
  const [partnerModal, setPartnerModal] = useState({ isOpen: false, isEdit: false, id: null, name: '', website: '', isActive: true, logoFile: null, billingPlan: 'None', billingDueDay: '' });
  const [partnerViewModal, setPartnerViewModal] = useState({ isOpen: false, partner: null, apiKey: '' });
  const [postModal, setPostModal] = useState({ isOpen: false, isEdit: false, id: null, title: '', category: 'Company News', body: '', tags: '', isPublished: false, coverFile: null });
  const [testimonialModal, setTestimonialModal] = useState({ isOpen: false, isEdit: false, id: null, customerName: '', location: '', rating: 5, review: '', isApproved: true, photoFile: null });

  // --- Helper: Trigger Toast Alert ---
  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast({ text: '', type: '' }), 4000);
  };

  // --- Fetch All Data on Load ---
  const fetchAllData = async () => {
    setLoading(true);
    const isSuperAdmin = localStorage.getItem('solvix_admin_role') === 'superadmin';

    const fetchService = async () => {
      try {
        const res = await API.get('/services');
        if (res.data.success) setServices(res.data.data);
      } catch (err) {
        console.log('Error loading services.', err);
        setServices([]);
      }
    };

    const fetchPartner = async () => {
      try {
        const res = await API.get('/partners');
        if (res.data.success) setPartners(res.data.data);
      } catch (err) {
        console.log('Error loading partners.', err);
        setPartners([]);
      }
    };

    const fetchTestimonial = async () => {
      try {
        const res = await API.get('/testimonials/all');
        if (res.data.success) setTestimonials(res.data.data);
      } catch (err) {
        console.log('Error loading testimonials.', err);
        setTestimonials([]);
      }
    };

    const fetchPost = async () => {
      try {
        const res = await API.get('/posts');
        if (res.data.success) setPosts(res.data.data);
      } catch (err) {
        console.log('Error loading blog posts.', err);
        setPosts([]);
      }
    };

    const fetchContact = async () => {
      try {
        const res = await API.get('/contact');
        if (res.data.success) setContacts(res.data.data);
      } catch (err) {
        console.log('Error loading contacts.', err);
        setContacts([]);
      }
    };

    const fetchStats = async () => {
      try {
        const res = await API.get('/expenses/stats');
        if (res.data.success) setRevenueStats(res.data.data);
      } catch (err) {
        console.log('Error loading revenue stats.', err);
      }
    };

    const fetchAdminsList = async () => {
      try {
        const res = await API.get('/auth/admins');
        if (res.data.success) setAdmins(res.data.data);
      } catch (err) {
        console.log('Error loading admins list.', err);
      }
    };

    const fetchRidersList = async () => {
      try {
        const res = await API.get('/riders');
        if (res.data.success) setRidersList(res.data.data);
      } catch (err) {
        console.log('Error loading riders list.', err);
      }
    };

    const fetchMembersList = async () => {
      try {
        const res = await API.get('/members');
        if (res.data.success) setMembers(res.data.data);
      } catch (err) {
        console.log('Error loading members list.', err);
      }
    };

    const promises = [
      fetchService(),
      fetchPartner(),
      fetchTestimonial(),
      fetchPost(),
      fetchContact(),
      fetchStats()
    ];

    if (isSuperAdmin) {
      promises.push(fetchAdminsList());
      promises.push(fetchRidersList());
      promises.push(fetchMembersList());
    }

    await Promise.all(promises);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
    subscribeToWebPush().catch(err => console.error('PWA push registration failed:', err.message));
  }, []);

  const selectTab = (tab) => {
    navigate(`/admin?tab=${tab}`);
    setIsSidebarOpen(false);
  };

  // --- Auth Handler ---
  const handleLogout = () => {
    localStorage.removeItem('solvix_token');
    localStorage.removeItem('solvix_admin');
    showToast('Admin logged out successfully.');
    navigate('/login');
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
        logoFile: null,
        billingPlan: p.billingPlan || 'None',
        billingDueDay: p.billingDueDay || ''
      });
    } else {
      setPartnerModal({
        isOpen: true,
        isEdit: false,
        id: null,
        name: '',
        website: '',
        isActive: true,
        logoFile: null,
        billingPlan: 'None',
        billingDueDay: ''
      });
    }
  };

  const handlePartnerSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', partnerModal.name);
    formData.append('website', partnerModal.website);
    formData.append('isActive', partnerModal.isActive);
    formData.append('billingPlan', partnerModal.billingPlan);
    formData.append('billingDueDay', partnerModal.billingDueDay);
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

  const handleOpenPartnerViewModal = (p) => {
    setPartnerViewModal({
      isOpen: true,
      partner: p,
      apiKey: ''
    });
  };

  const handleGenerateApiKey = async (partnerId) => {
    try {
      const res = await API.post(`/partners/${partnerId}/keys`);
      if (res.data.success) {
        showToast('API key generated successfully!');
        setPartnerViewModal(p => ({
          ...p,
          apiKey: res.data.apiKey,
          partner: res.data.data
        }));
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error generating API key', 'error');
    }
  };

  const handlePrintPartnerDocs = () => {
    const printWindow = window.open('', '_blank');
    const docsContent = document.getElementById('partner-api-docs-content').innerHTML;
    printWindow.document.write(`
      <html>
        <head>
          <title>Solvix Go - Partner API Documentation</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 2rem; color: #1f2937; line-height: 1.6; }
            pre { background: #f3f4f6; padding: 1rem; border-radius: 8px; font-family: monospace; overflow-x: auto; }
            code { font-family: monospace; color: #f47b00; background: #fff3e6; padding: 2px 4px; border-radius: 4px; }
            h1, h2, h3 { color: #0D1B4D; }
            h1 { border-bottom: 2px solid #f3f4f6; padding-bottom: 0.5rem; }
            .header { text-align: center; margin-bottom: 2rem; border-bottom: 2px double #e5e7eb; padding-bottom: 1.5rem; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>SOLVIX GO DELIVERIES</h2>
            <h3>PARTNER API INTEGRATION MANUAL</h3>
            <p>Partner: ${partnerViewModal.partner?.name}</p>
          </div>
          \${docsContent}
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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

  const handleOpenTestimonialModal = (t = null) => {
    if (t) {
      setTestimonialModal({
        isOpen: true,
        isEdit: true,
        id: t._id,
        customerName: t.customerName,
        location: t.location,
        rating: t.rating || 5,
        review: t.review,
        isApproved: t.isApproved,
        photoFile: null
      });
    } else {
      setTestimonialModal({
        isOpen: true,
        isEdit: false,
        id: null,
        customerName: '',
        location: '',
        rating: 5,
        review: '',
        isApproved: true,
        photoFile: null
      });
    }
  };

  const handleTestimonialSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('customerName', testimonialModal.customerName);
    formData.append('location', testimonialModal.location);
    formData.append('rating', testimonialModal.rating);
    formData.append('review', testimonialModal.review);
    formData.append('isApproved', testimonialModal.isApproved);
    if (testimonialModal.photoFile) {
      formData.append('photo', testimonialModal.photoFile);
    }

    try {
      let res;
      if (testimonialModal.isEdit) {
        res = await API.put(`/testimonials/${testimonialModal.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await API.post('/testimonials', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (res.data.success) {
        showToast(testimonialModal.isEdit ? 'Testimonial updated!' : 'Testimonial created successfully!');
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
      
      const mockNewItem = {
        _id: testimonialModal.isEdit ? testimonialModal.id : 'mock-' + Date.now(),
        customerName: testimonialModal.customerName,
        location: testimonialModal.location,
        rating: Number(testimonialModal.rating),
        review: testimonialModal.review,
        isApproved: testimonialModal.isApproved,
        photo: testimonialModal.photoFile ? { url: URL.createObjectURL(testimonialModal.photoFile) } : null,
        createdAt: new Date().toISOString()
      };

      if (testimonialModal.isEdit) {
        setTestimonials(prev => prev.map(item => item._id === testimonialModal.id ? mockNewItem : item));
        showToast('Offline Mode: Testimonial updated locally.', 'warning');
      } else {
        setTestimonials(prev => [mockNewItem, ...prev]);
        showToast('Offline Mode: Testimonial created locally.', 'warning');
      }
    } finally {
      setTestimonialModal(prev => ({ ...prev, isOpen: false }));
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
  // --- ADMIN/MANAGER CRUD HANDLERS ---
  // ==========================================
  const handleOpenAdminModal = (a = null) => {
    if (a) {
      setAdminModal({
        isOpen: true,
        isEdit: true,
        id: a._id,
        name: a.name,
        email: a.email,
        password: '',
        role: a.role || 'admin'
      });
    } else {
      setAdminModal({
        isOpen: true,
        isEdit: false,
        id: null,
        name: '',
        email: '',
        password: '',
        role: 'admin'
      });
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: adminModal.name,
      email: adminModal.email,
      role: adminModal.role
    };
    if (adminModal.password) {
      payload.password = adminModal.password;
    } else if (!adminModal.isEdit) {
      showToast('Password is required for new admins', 'error');
      return;
    }

    try {
      let res;
      if (adminModal.isEdit) {
        res = await API.put(`/auth/admins/${adminModal.id}`, payload);
      } else {
        res = await API.post('/auth/register-admin', { ...payload, password: adminModal.password });
      }

      if (res.data.success) {
        showToast(adminModal.isEdit ? 'Admin profile updated successfully!' : 'Admin registered successfully!');
        setAdminModal(prev => ({ ...prev, isOpen: false }));
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error processing admin request', 'error');
    }
  };

  const handleToggleAdminActive = async (a) => {
    try {
      const res = await API.put(`/auth/admins/${a._id}`, { isActive: !a.isActive });
      if (res.data.success) {
        showToast('Admin status toggled successfully.');
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
      showToast('Error toggling admin status', 'error');
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (!window.confirm('Are you sure you want to delete this admin account? This cannot be undone.')) return;
    try {
      const res = await API.delete(`/auth/admins/${id}`);
      if (res.data.success) {
        showToast('Admin deleted successfully.');
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error deleting admin', 'error');
    }
  };

  // ==========================================
  // --- MEMBER (STAFF) CRUD HANDLERS ---
  // ==========================================
  const handleOpenMemberModal = (m = null) => {
    if (m) {
      setMemberModal({
        isOpen: true,
        isEdit: true,
        id: m._id,
        name: m.name,
        role: m.role,
        hobby: m.hobby || '',
        history: m.history || '',
        isActive: m.isActive,
        imageFile: null
      });
    } else {
      setMemberModal({
        isOpen: true,
        isEdit: false,
        id: null,
        name: '',
        role: '',
        hobby: '',
        history: '',
        isActive: true,
        imageFile: null
      });
    }
  };

  const handleMemberSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', memberModal.name);
    formData.append('role', memberModal.role);
    formData.append('hobby', memberModal.hobby);
    formData.append('history', memberModal.history);
    formData.append('isActive', memberModal.isActive);
    if (memberModal.imageFile) {
      formData.append('image', memberModal.imageFile);
    }

    try {
      let res;
      if (memberModal.isEdit) {
        res = await API.put(`/members/${memberModal.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await API.post('/members', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (res.data.success) {
        showToast(memberModal.isEdit ? 'Member updated successfully!' : 'Member created successfully!');
        setMemberModal(prev => ({ ...prev, isOpen: false }));
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error saving member profile', 'error');
    }
  };

  const handleToggleMemberActive = async (m) => {
    try {
      const res = await API.put(`/members/${m._id}`, { isActive: !m.isActive });
      if (res.data.success) {
        showToast('Member status changed successfully.');
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
      showToast('Error changing member status', 'error');
    }
  };

  const handleDeleteMember = async (id) => {
    if (!window.confirm('Are you sure you want to delete this company member? This cannot be undone.')) return;
    try {
      const res = await API.delete(`/members/${id}`);
      if (res.data.success) {
        showToast('Member deleted successfully.');
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error deleting member', 'error');
    }
  };


  // ==========================================
  // --- PERFORMANCE HISTORY HANDLERS ---
  // ==========================================
  const fetchHistoryStats = async () => {
    if (!historySelectedId) return;
    try {
      const res = await API.get('/orders/stats/history', {
        params: {
          type: historyType,
          id: historySelectedId,
          range: historyRange
        }
      });
      if (res.data.success) {
        setHistoryData(res.data.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading performance history stats', 'error');
    }
  };

  useEffect(() => {
    if (historySelectedId) {
      fetchHistoryStats();
    } else {
      setHistoryData([]);
    }
  }, [historyType, historySelectedId, historyRange]);

  // Reset selected ID when type changes
  useEffect(() => {
    setHistorySelectedId('');
    setHistoryData([]);
  }, [historyType]);

  // --- Developer Integration Platform States & Fetchers ---
  const [developers, setDevelopers] = useState([]);
  const [developersLoading, setDevelopersLoading] = useState(false);
  const [apiLogs, setApiLogs] = useState([]);
  const [apiLogsLoading, setApiLogsLoading] = useState(false);
  const [newCredentials, setNewCredentials] = useState(null);

  const fetchAdminDevelopers = async () => {
    setDevelopersLoading(true);
    try {
      const res = await API.get('/admin/developers');
      if (res.data.success) {
        setDevelopers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch developers', err);
      showToast(err.response?.data?.message || 'Failed to fetch developers', 'error');
    } finally {
      setDevelopersLoading(false);
    }
  };

  const fetchAdminApiLogs = async () => {
    setApiLogsLoading(true);
    try {
      const res = await API.get('/admin/developers/logs');
      if (res.data.success) {
        setApiLogs(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch API logs', err);
      showToast(err.response?.data?.message || 'Failed to fetch API logs', 'error');
    } finally {
      setApiLogsLoading(false);
    }
  };

  useEffect(() => {
    if (['developer-applications', 'developer-management'].includes(activeTab)) {
      fetchAdminDevelopers();
    }
    if (activeTab === 'api-logs') {
      fetchAdminApiLogs();
    }
  }, [activeTab]);

  const handleApproveDeveloper = async (dev) => {
    if (!window.confirm(`Are you sure you want to approve ${dev.companyName}?`)) return;
    try {
      const res = await API.patch(`/admin/developers/${dev._id}/approve`);
      if (res.data.success) {
        showToast('Developer approved and API keys generated!', 'success');
        fetchAdminDevelopers();
        setNewCredentials({
          companyName: dev.companyName,
          publicKey: res.data.data.credentials.publicKey,
          secretKey: res.data.data.credentials.secretKey
        });
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to approve developer', 'error');
    }
  };

  const handleRejectDeveloper = async (dev) => {
    if (!window.confirm(`Are you sure you want to reject ${dev.companyName}?`)) return;
    try {
      const res = await API.patch(`/admin/developers/${dev._id}/reject`);
      if (res.data.success) {
        showToast('Developer application rejected.', 'success');
        fetchAdminDevelopers();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reject developer', 'error');
    }
  };

  const handleSuspendDeveloper = async (dev) => {
    if (!window.confirm(`Are you sure you want to suspend ${dev.companyName}?`)) return;
    try {
      const res = await API.patch(`/admin/developers/${dev._id}/suspend`);
      if (res.data.success) {
        showToast('Developer account suspended and API keys disabled.', 'success');
        fetchAdminDevelopers();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to suspend developer', 'error');
    }
  };

  const handleActivateDeveloper = async (dev) => {
    if (!window.confirm(`Are you sure you want to activate ${dev.companyName}?`)) return;
    try {
      const res = await API.patch(`/admin/developers/${dev._id}/activate`);
      if (res.data.success) {
        showToast('Developer account reactivated and API keys enabled.', 'success');
        fetchAdminDevelopers();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to activate developer', 'error');
    }
  };

  const handleAdminRegenerateKeys = async (dev) => {
    if (!window.confirm(`Are you sure you want to regenerate API keys for ${dev.companyName}? The existing keys will be disabled.`)) return;
    try {
      const res = await API.post(`/admin/developers/${dev._id}/regenerate-keys`);
      if (res.data.success) {
        showToast('API keys regenerated successfully!', 'success');
        fetchAdminDevelopers();
        setNewCredentials({
          companyName: dev.companyName,
          publicKey: res.data.data.publicKey,
          secretKey: res.data.data.secretKey
        });
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to regenerate keys', 'error');
    }
  };

  const renderDeveloperApplications = () => {
    const pendingDevs = developers.filter(d => d.status === 'pending');
    return (
      <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--card-shadow)' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '1.5rem' }}>Pending Developer Applications</h3>
        {developersLoading ? (
          <div>Loading applications...</div>
        ) : pendingDevs.length === 0 ? (
          <div style={{ color: 'var(--gray-light)', padding: '2rem 0' }}>No pending developer applications.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #F1F5F9', color: 'var(--gray-light)', fontWeight: 700 }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Company</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Contact</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Email / Phone</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Business Type</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Description</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingDevs.map(dev => (
                  <tr key={dev._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--navy)' }}>
                      {dev.companyName}
                      {dev.website && <a href={dev.website} target="_blank" rel="noreferrer" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--orange)' }}>Visit Web</a>}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--gray-text)' }}>{dev.contactPerson}</td>
                    <td style={{ padding: '1rem', color: 'var(--gray-text)' }}>
                      <div>{dev.email}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--gray-light)' }}>{dev.phone}</div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--gray-text)' }}>{dev.businessType || 'N/A'}</td>
                    <td style={{ padding: '1rem', color: 'var(--gray-text)', fontSize: '0.8rem', maxWidth: '250px', whiteSpace: 'normal', wordBreak: 'break-word' }}>{dev.description}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleApproveDeveloper(dev)}
                          style={{ padding: '0.4rem 0.8rem', background: '#10B981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectDeveloper(dev)}
                          style={{ padding: '0.4rem 0.8rem', background: 'transparent', color: '#EF4444', border: '1px solid #EF4444', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
                        >
                          Reject
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
    );
  };

  const renderDeveloperManagement = () => {
    return (
      <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--card-shadow)' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '1.5rem' }}>Registered Developers Directory</h3>
        {developersLoading ? (
          <div>Loading developers...</div>
        ) : developers.length === 0 ? (
          <div style={{ color: 'var(--gray-light)', padding: '2rem 0' }}>No registered developers found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #F1F5F9', color: 'var(--gray-light)', fontWeight: 700 }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Company</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Contact</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>API Integration</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Created Date</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {developers.map(dev => (
                  <tr key={dev._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--navy)' }}>
                      {dev.companyName}
                      <div style={{ fontSize: '0.8rem', color: 'var(--gray-light)', fontWeight: 500 }}>{dev.email}</div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--gray-text)' }}>{dev.contactPerson}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        textTransform: 'uppercase',
                        background: dev.status === 'approved' ? '#ECFDF5' : (dev.status === 'pending' ? '#FFFBEB' : '#FEF2F2'),
                        color: dev.status === 'approved' ? '#10B981' : (dev.status === 'pending' ? '#F59E0B' : '#EF4444')
                      }}>
                        {dev.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        background: dev.apiEnabled ? '#EFF6FF' : '#F1F5F9',
                        color: dev.apiEnabled ? '#3B82F6' : '#64748B'
                      }}>
                        {dev.apiEnabled ? 'API Enabled' : 'API Disabled'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--gray-light)', fontSize: '0.85rem' }}>{new Date(dev.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {dev.status === 'approved' && (
                          <>
                            <button
                              onClick={() => handleSuspendDeveloper(dev)}
                              style={{ padding: '0.4rem 0.8rem', background: '#F59E0B', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
                            >
                              Suspend
                            </button>
                            <button
                              onClick={() => handleAdminRegenerateKeys(dev)}
                              style={{ padding: '0.4rem 0.8rem', background: '#8B5CF6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
                            >
                              Regenerate Keys
                            </button>
                          </>
                        )}
                        {dev.status === 'suspended' && (
                          <button
                            onClick={() => handleActivateDeveloper(dev)}
                            style={{ padding: '0.4rem 0.8rem', background: '#10B981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
                          >
                            Reactivate
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
    );
  };

  const renderApiLogs = () => {
    return (
      <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--card-shadow)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--navy)' }}>System API Integration Logs</h3>
          <button
            onClick={fetchAdminApiLogs}
            disabled={apiLogsLoading}
            style={{ padding: '0.4rem 0.8rem', background: '#F1F5F9', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
          >
            Refresh Logs
          </button>
        </div>
        {apiLogsLoading && apiLogs.length === 0 ? (
          <div>Loading API logs...</div>
        ) : apiLogs.length === 0 ? (
          <div style={{ color: 'var(--gray-light)', padding: '2rem 0' }}>No developer API request logs recorded in the system.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #F1F5F9', color: 'var(--gray-light)', fontWeight: 700 }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Developer Company</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Method</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Endpoint</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status Code</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Response Time</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {apiLogs.map(log => {
                  const isErr = log.statusCode >= 400;
                  return (
                    <tr key={log._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '0.8rem 1rem', fontWeight: 700, color: 'var(--navy)' }}>
                        {log.developerId?.companyName || 'Deleted Developer'}
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-light)', fontWeight: 500 }}>{log.developerId?.email}</div>
                      </td>
                      <td style={{ padding: '0.8rem 1rem', fontWeight: 700, color: log.method === 'POST' ? '#3B82F6' : '#10B981' }}>{log.method}</td>
                      <td style={{ padding: '0.8rem 1rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>{log.endpoint}</td>
                      <td style={{ padding: '0.8rem 1rem' }}>
                        <span style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          background: isErr ? '#FEF2F2' : '#ECFDF5',
                          color: isErr ? '#EF4444' : '#10B981'
                        }}>
                          {log.statusCode}
                        </span>
                      </td>
                      <td style={{ padding: '0.8rem 1rem', color: 'var(--gray-text)' }}>{log.responseTime}ms</td>
                      <td style={{ padding: '0.8rem 1rem', color: 'var(--gray-light)', fontSize: '0.85rem' }}>{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
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
    const isSuperadmin = localStorage.getItem('solvix_admin_role') === 'superadmin';

    return (
      <div>
        {/* Superadmin Financial Metrics Row */}
        {isSuperadmin && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div className="metric-card" style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--card-shadow)', borderLeft: '4px solid #10B981' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              </div>
              <div style={{ color: 'var(--gray-text)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Generated Revenue</div>
              <div style={{ color: 'var(--navy)', fontSize: '1.6rem', fontWeight: 800, wordBreak: 'break-all', overflowWrap: 'break-word' }}>₦{revenueStats.totalRevenue.toLocaleString()}</div>
              <p style={{ color: 'var(--gray-text)', fontSize: '0.75rem', margin: '0.25rem 0 0 0' }}>Delivered orders total billing</p>
            </div>

            <div className="metric-card" style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--card-shadow)', borderLeft: '4px solid #EF4444' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 22h12M4 2h8a2 2 0 0 1 2 2v18H4V4a2 2 0 0 1 2-2zM14 9h4a2 2 0 0 1 2 2v6a2 2 0 0 0 2 2h0M9 6h2v4H9z"/></svg>
              </div>
              <div style={{ color: 'var(--gray-text)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Fuel Costs (Expenses)</div>
              <div style={{ color: 'var(--navy)', fontSize: '1.6rem', fontWeight: 800, wordBreak: 'break-all', overflowWrap: 'break-word' }}>₦{revenueStats.totalFuelExpenses.toLocaleString()}</div>
              <p style={{ color: 'var(--gray-text)', fontSize: '0.75rem', margin: '0.25rem 0 0 0' }}>Total rider fuel expenditures</p>
            </div>

            <div className="metric-card" style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--card-shadow)', borderLeft: '4px solid #2563EB' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              </div>
              <div style={{ color: 'var(--gray-text)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Net Profit (Revenue - Fuel)</div>
              <div style={{ color: 'var(--navy)', fontSize: '1.6rem', fontWeight: 800, wordBreak: 'break-all', overflowWrap: 'break-word' }}>₦{revenueStats.netProfit.toLocaleString()}</div>
              <p style={{ color: 'var(--gray-text)', fontSize: '0.75rem', margin: '0.25rem 0 0 0' }}>Profits after daily cost removal</p>
            </div>
          </div>
        )}

        {/* Metric Summary Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          
          <div className="metric-card" style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--card-shadow)', borderLeft: '4px solid var(--orange)' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
            <div style={{ color: 'var(--gray-text)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Services Fleet</div>
            <div style={{ color: 'var(--navy)', fontSize: '1.6rem', fontWeight: 800, wordBreak: 'break-all', overflowWrap: 'break-word' }}>{totalServices}</div>
          </div>

          <div className="metric-card" style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--card-shadow)', borderLeft: '4px solid var(--navy)' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--navy)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <div style={{ color: 'var(--gray-text)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Retail Partners</div>
            <div style={{ color: 'var(--navy)', fontSize: '1.6rem', fontWeight: 800, wordBreak: 'break-all', overflowWrap: 'break-word' }}>{activePartners} <span style={{ fontSize: '0.85rem', color: 'var(--gray-text)', fontWeight: 500 }}>Active</span></div>
          </div>

          <div className="metric-card" style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--card-shadow)', borderLeft: '4px solid #10B981' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </div>
            <div style={{ color: 'var(--gray-text)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Public Reviews</div>
            <div style={{ color: 'var(--navy)', fontSize: '1.6rem', fontWeight: 800, wordBreak: 'break-all', overflowWrap: 'break-word' }}>{approvedReviews} <span style={{ fontSize: '0.85rem', color: 'var(--gray-text)', fontWeight: 500 }}>Approved</span></div>
          </div>

          <div className="metric-card" style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--card-shadow)', borderLeft: '4px solid #F59E0B' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </div>
            <div style={{ color: 'var(--gray-text)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>New Inquiries</div>
            <div style={{ color: 'var(--navy)', fontSize: '1.6rem', fontWeight: 800, wordBreak: 'break-all', overflowWrap: 'break-word' }}>{newInquiries} <span style={{ fontSize: '0.85rem', color: 'var(--gray-text)', fontWeight: 500 }}>Pending</span></div>
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
                    <span style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block', marginTop: '0.5rem' }}>Phone: {c.phone}</span>
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
                      <button onClick={() => navigate('/admin?tab=posts')} style={{ background: 'none', border: 'none', color: 'var(--orange)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>Edit</button>
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
                        <img src={getImageUrl(p.logo.url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ color: 'var(--navy)', fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Manage Testimonials</h3>
          <button onClick={() => handleOpenTestimonialModal(null)} className="btn btn-orange" style={{ padding: '0.5rem 1rem', borderRadius: '8px' }}>
            + Create New Testimonial
          </button>
        </div>

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
                  <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--navy)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {t.photo?.url ? (
                        <img src={getImageUrl(t.photo.url)} alt={t.customerName} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#475569', fontSize: '0.85rem' }}>
                          {t.customerName ? t.customerName.charAt(0).toUpperCase() : 'C'}
                        </div>
                      )}
                      <span>{t.customerName}</span>
                    </div>
                  </td>
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
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleOpenTestimonialModal(t)} style={{ background: '#EFF6FF', border: 'none', color: '#1E40AF', padding: '0.35rem 0.65rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                      <button onClick={() => handleDeleteTestimonial(t._id)} style={{ background: '#FEF2F2', border: 'none', color: '#991B1B', padding: '0.35rem 0.65rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
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
                    <div style={{ fontSize: '0.78rem', color: 'var(--gray-text)', marginTop: '0.2rem' }}>Phone: {c.phone}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--gray-text)' }}>Email: {c.email || 'None'}</div>
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
                      <option value="New">New</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Cancelled">Cancelled</option>
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

  // --- Render 7: Manage Admins Subpanel ---
  const renderManagers = () => {
    return (
      <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--card-shadow)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--navy)', fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>System Administrators / Managers</h3>
          <button 
            onClick={() => handleOpenAdminModal(null)} 
            className="btn btn-orange"
            style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', fontWeight: 700 }}
          >
            🛡️ Add New Admin
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #EDF2F7', color: 'var(--navy)', fontWeight: 700 }}>
                <th style={{ padding: '1rem' }}>Name</th>
                <th style={{ padding: '1rem' }}>Email Address</th>
                <th style={{ padding: '1rem' }}>Role</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map(a => (
                <tr key={a._id} style={{ borderBottom: '1px solid #EDF2F7', verticalAlign: 'middle' }}>
                  <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--navy)' }}>{a.name}</td>
                  <td style={{ padding: '1rem' }}>{a.email}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.25rem 0.5rem',
                      borderRadius: '50px',
                      background: a.role === 'superadmin' ? '#FEE2E2' : '#DBEAFE',
                      color: a.role === 'superadmin' ? '#991B1B' : '#1E40AF'
                    }}>{a.role}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.25rem 0.5rem',
                      borderRadius: '50px',
                      background: a.isActive ? '#D1FAE5' : '#F1F5F9',
                      color: a.isActive ? '#065F46' : '#64748B'
                    }}>{a.isActive ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleOpenAdminModal(a)} style={{ background: '#EFF6FF', border: 'none', color: '#1E40AF', padding: '0.35rem 0.65rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                      {a._id !== localStorage.getItem('solvix_admin_id') && (
                        <button onClick={() => handleDeleteAdmin(a._id)} style={{ background: '#FEF2F2', border: 'none', color: '#991B1B', padding: '0.35rem 0.65rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
                      )}
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

  // --- Render 8: Performance Tracking Subpanel ---
  const renderHistory = () => {
    return (
      <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--card-shadow)' }}>
        <h3 style={{ color: 'var(--navy)', fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem' }}>Performance History Tracking</h3>
        
        {/* Selection / Controls Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem', background: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', border: '1px solid #EDF2F7' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Select Type</label>
            <select 
              value={historyType} 
              onChange={(e) => setHistoryType(e.target.value)} 
              style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontWeight: 600 }}
            >
              <option value="rider">🏍️ Dispatch Rider</option>
              <option value="admin">🛡️ Admin / Superadmin (Created Orders)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Select Name</label>
            <select 
              value={historySelectedId} 
              onChange={(e) => setHistorySelectedId(e.target.value)} 
              style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontWeight: 600 }}
            >
              <option value="">-- Choose Name --</option>
              {historyType === 'rider' ? (
                ridersList.map(r => (
                  <option key={r._id} value={r._id}>{r.name} ({r.riderCode})</option>
                ))
              ) : (
                admins.map(a => (
                  <option key={a._id} value={a._id}>{a.name} ({a.role})</option>
                ))
              )}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Select Time Range</label>
            <div style={{ display: 'flex', gap: '0.5rem', background: '#fff', padding: '0.2rem', borderRadius: '8px', border: '1.5px solid #CBD5E1' }}>
              <button 
                type="button" 
                onClick={() => setHistoryRange('weekly')} 
                style={{ flex: 1, border: 'none', background: historyRange === 'weekly' ? 'var(--orange)' : 'transparent', color: historyRange === 'weekly' ? '#fff' : 'var(--navy)', padding: '0.45rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem' }}
              >
                Weekly (7 Days)
              </button>
              <button 
                type="button" 
                onClick={() => setHistoryRange('monthly')} 
                style={{ flex: 1, border: 'none', background: historyRange === 'monthly' ? 'var(--orange)' : 'transparent', color: historyRange === 'monthly' ? '#fff' : 'var(--navy)', padding: '0.45rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem' }}
              >
                Monthly (30 Days)
              </button>
            </div>
          </div>
        </div>

        {/* Performance Results */}
        {!historySelectedId ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-text)', fontWeight: 600 }}>
            Select a rider or admin name above to populate history tracking charts and records.
          </div>
        ) : historyData.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-text)', fontWeight: 600 }}>
            No completed deliveries or records found for the selected timeframe.
          </div>
        ) : (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '1.25rem', border: '1px solid #EDF2F7', textAlign: 'center' }}>
                <div style={{ color: 'var(--gray-text)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Total Completed Deliveries</div>
                <div style={{ color: 'var(--navy)', fontSize: '1.6rem', fontWeight: 800, wordBreak: 'break-all', overflowWrap: 'break-word' }}>
                  {historyData.reduce((sum, day) => sum + day.completedOrders, 0)}
                </div>
              </div>
              <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '1.25rem', border: '1px solid #EDF2F7', textAlign: 'center' }}>
                <div style={{ color: 'var(--gray-text)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Total Revenue Generated</div>
                <div style={{ color: '#10B981', fontSize: '1.6rem', fontWeight: 800, wordBreak: 'break-all', overflowWrap: 'break-word' }}>
                  ₦{historyData.reduce((sum, day) => sum + day.revenue, 0).toLocaleString()}
                </div>
              </div>
            </div>

            <h4 style={{ color: 'var(--navy)', fontSize: '0.95rem', fontWeight: 800, marginBottom: '1rem' }}>Daily Tracking Breakdown</h4>
            <div style={{ overflowX: 'auto', maxHeight: '400px', overflowY: 'auto', border: '1px solid #EDF2F7', borderRadius: '12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #EDF2F7', color: 'var(--navy)', fontWeight: 700, position: 'sticky', top: 0 }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Completed Orders</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Revenue Generated</th>
                  </tr>
                </thead>
                <tbody>
                  {[...historyData].reverse().map(day => (
                    <tr key={day.date} style={{ borderBottom: '1px solid #EDF2F7', background: day.completedOrders > 0 ? '#F0FDF4' : 'transparent' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--navy)' }}>
                        {day.completedOrders} orders
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: day.revenue > 0 ? '#10B981' : 'var(--gray-text)' }}>
                        ₦{day.revenue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMembers = () => {
    return (
      <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--card-shadow)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ color: 'var(--navy)', fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Company Members Registry</h3>
            <p style={{ color: 'var(--gray-text)', fontSize: '0.8rem', margin: '0.25rem 0 0 0' }}>Register staff and generate verified ID card QR codes</p>
          </div>
          <button onClick={() => handleOpenMemberModal(null)} className="btn btn-orange" style={{ padding: '0.5rem 1rem', borderRadius: '8px' }}>
            + Add New Member
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #EDF2F7', color: 'var(--navy)', fontWeight: 700 }}>
                <th style={{ padding: '1rem' }}>Staff Photo</th>
                <th style={{ padding: '1rem' }}>Name & Slug</th>
                <th style={{ padding: '1rem' }}>Role</th>
                <th style={{ padding: '1rem' }}>Hobby</th>
                <th style={{ padding: '1rem' }}>Verification URL</th>
                <th style={{ padding: '1rem' }}>QR Code ID</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-text)' }}>
                    No company members registered yet. Click "+ Add New Member" to create one.
                  </td>
                </tr>
              ) : (
                members.map(m => {
                  const localUrl = `${window.location.origin}/member/${m.slug}`;
                  const prodUrl = `https://solvixgo.com/member/${m.slug}`;
                  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(localUrl)}`;

                  return (
                    <tr key={m._id} style={{ borderBottom: '1px solid #EDF2F7', verticalAlign: 'middle' }}>
                      <td style={{ padding: '1rem' }}>
                        <img 
                          src={m.image?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'} 
                          alt={m.name} 
                          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '50%', border: '2px solid var(--orange)' }} 
                        />
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{m.name}</div>
                        <div style={{ color: 'var(--gray-text)', fontSize: '0.72rem', fontFamily: 'monospace' }}>/{m.slug}</div>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--navy)' }}>{m.role}</td>
                      <td style={{ padding: '1rem', color: 'var(--gray-text)' }}>{m.hobby || '-'}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxWidth: '220px' }}>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(localUrl);
                              showToast('Local Link copied to clipboard!');
                            }} 
                            style={{ 
                              background: '#F1F5F9', 
                              border: '1px solid #CBD5E1', 
                              padding: '0.35rem 0.65rem', 
                              borderRadius: '6px', 
                              cursor: 'pointer', 
                              fontSize: '0.72rem', 
                              fontWeight: 700, 
                              color: 'var(--navy)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.25rem'
                            }}
                            title="Copy link for local testing"
                          >
                            Copy Local Link
                          </button>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(prodUrl);
                              showToast('Production Link copied to clipboard!');
                            }} 
                            style={{ 
                              background: '#FEF3C7', 
                              border: '1px solid #FDE68A', 
                              padding: '0.35rem 0.65rem', 
                              borderRadius: '6px', 
                              cursor: 'pointer', 
                              fontSize: '0.72rem', 
                              fontWeight: 700, 
                              color: '#B45309',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.25rem'
                            }}
                            title="Copy link for production (solvixgo.com)"
                          >
                            Copy Prod Link
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                          <img 
                            src={qrCodeApiUrl} 
                            alt="QR Code" 
                            style={{ width: '40px', height: '40px', border: '1px solid #EDF2F7', padding: '2px', background: '#fff', borderRadius: '4px' }} 
                            title="Scan to verify staff"
                          />
                          <a 
                            href={qrCodeApiUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            style={{ fontSize: '0.65rem', color: 'var(--orange)', fontWeight: 700, textDecoration: 'none' }}
                          >
                            Download QR
                          </a>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <button
                          onClick={() => handleToggleMemberActive(m)}
                          style={{
                            padding: '0.25rem 0.65rem',
                            borderRadius: '50px',
                            border: 'none',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            background: m.isActive ? '#D1FAE5' : '#FEE2E2',
                            color: m.isActive ? '#065F46' : '#991B1B'
                          }}
                        >
                          {m.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleOpenMemberModal(m)} style={{ background: '#EFF6FF', border: 'none', color: '#1E40AF', padding: '0.35rem 0.65rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                          <button onClick={() => handleDeleteMember(m._id)} style={{ background: '#FEF2F2', border: 'none', color: '#991B1B', padding: '0.35rem 0.65rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
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
          {toast.text}
        </div>
      )}

      {/* ── MOBILE TOP HEADER ── */}
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
          cursor: 'pointer',
          padding: '0.25rem 0.5rem'
        }}>
          ☰
        </button>
      </div>

      {/* ── SIDEBAR NAVIGATION ── */}
      <AdminSidebar activeTab={activeTab} isMobileOpen={isSidebarOpen} setMobileOpen={setIsSidebarOpen} />

      {/* ── MAIN WORKSPACE CONTENT ── */}
      <main className="main-content" style={{ flexGrow: 1, padding: '2.5rem', overflowY: 'auto' }}>
        
        {/* Dashboard Title Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ color: 'var(--navy)', fontSize: '1.75rem', fontWeight: 800, margin: 0, textTransform: 'capitalize' }}>
              {activeTab} Management
            </h1>
            <p style={{ color: 'var(--gray-text)', fontSize: '0.85rem' }}>Solvix Go Gombe HQ Operations</p>
          </div>
          <div style={{ color: 'var(--navy)', fontWeight: 600, fontSize: '0.85rem', background: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', boxShadow: 'var(--card-shadow)' }}>
            Local Time: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
        </header>

        {/* Subpanel router */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'services' && renderServices()}
        {activeTab === 'partners' && renderPartners()}
        {activeTab === 'testimonials' && renderTestimonials()}
        {activeTab === 'posts' && renderPosts()}
        {activeTab === 'contacts' && renderContacts()}
        {activeTab === 'managers' && renderManagers()}
        {activeTab === 'members' && renderMembers()}
        {activeTab === 'history' && renderHistory()}
        {activeTab === 'developer-applications' && renderDeveloperApplications()}
        {activeTab === 'developer-management' && renderDeveloperManagement()}
        {activeTab === 'api-logs' && renderApiLogs()}

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

      {/* 4. Admin register/edit Form Modal */}
      {adminModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '450px', padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            <h3 style={{ color: 'var(--navy)', fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>
              {adminModal.isEdit ? 'Edit System Manager Details' : 'Register New Manager (Admin)'}
            </h3>
            
            <form onSubmit={handleAdminSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Full Name *</label>
                <input type="text" required value={adminModal.name} onChange={(e) => setAdminModal(p => ({ ...p, name: e.target.value }))} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontFamily: 'var(--font)' }} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Email Address *</label>
                <input type="email" required value={adminModal.email} onChange={(e) => setAdminModal(p => ({ ...p, email: e.target.value }))} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontFamily: 'var(--font)' }} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Password {adminModal.isEdit ? '(leave blank to keep current)' : '*'}</label>
                <input type="password" required={!adminModal.isEdit} value={adminModal.password} onChange={(e) => setAdminModal(p => ({ ...p, password: e.target.value }))} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontFamily: 'var(--font)' }} />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Access Role</label>
                <select value={adminModal.role} onChange={(e) => setAdminModal(p => ({ ...p, role: e.target.value }))} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontFamily: 'var(--font)', cursor: 'pointer', fontWeight: 600 }}>
                  <option value="admin">Admin Manager</option>
                  <option value="superadmin">Super Administrator</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setAdminModal(p => ({ ...p, isOpen: false }))} style={{ background: '#F1F5F9', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', color: 'var(--navy)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="btn btn-orange" style={{ padding: '0.6rem 1.25rem', borderRadius: '8px' }}>Save Admin</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Member CRUD Form Modal */}
      {memberModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '500px', padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', maxHeight: '85vh', overflowY: 'auto' }}>
            <h3 style={{ color: 'var(--navy)', fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>
              {memberModal.isEdit ? 'Edit Member Profile' : 'Register New Company Member'}
            </h3>
            
            <form onSubmit={handleMemberSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Full Name *</label>
                <input type="text" required value={memberModal.name} onChange={(e) => setMemberModal(p => ({ ...p, name: e.target.value }))} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontFamily: 'var(--font)' }} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Professional Role *</label>
                <input type="text" required placeholder="e.g. Lead Dispatcher, Operations Manager" value={memberModal.role} onChange={(e) => setMemberModal(p => ({ ...p, role: e.target.value }))} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontFamily: 'var(--font)' }} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Hobby / Interests</label>
                <input type="text" placeholder="e.g. Photography, Cycling, Chess" value={memberModal.hobby} onChange={(e) => setMemberModal(p => ({ ...p, hobby: e.target.value }))} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontFamily: 'var(--font)' }} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Profile History / Brief Bio</label>
                <textarea rows="4" placeholder="Brief history or professional background of the staff member..." value={memberModal.history} onChange={(e) => setMemberModal(p => ({ ...p, history: e.target.value }))} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontFamily: 'var(--font)' }} />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Staff Photo (Image upload)</label>
                <input type="file" accept="image/*" onChange={(e) => setMemberModal(p => ({ ...p, imageFile: e.target.files[0] }))} style={{ width: '100%' }} />
              </div>

              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" id="memb-active" checked={memberModal.isActive} onChange={(e) => setMemberModal(p => ({ ...p, isActive: e.target.checked }))} />
                <label htmlFor="memb-active" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy)', cursor: 'pointer' }}>Active (Allows ID card verification check)</label>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setMemberModal(p => ({ ...p, isOpen: false }))} style={{ background: '#F1F5F9', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', color: 'var(--navy)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="btn btn-orange" style={{ padding: '0.6rem 1.25rem', borderRadius: '8px' }}>Save Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Testimonial CRUD Form Modal */}
      {testimonialModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '500px', padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', maxHeight: '85vh', overflowY: 'auto' }}>
            <h3 style={{ color: 'var(--navy)', fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>
              {testimonialModal.isEdit ? 'Edit Testimonial Details' : 'Create New Testimonial'}
            </h3>
            
            <form onSubmit={handleTestimonialSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Customer Name *</label>
                <input type="text" required value={testimonialModal.customerName} onChange={(e) => setTestimonialModal(p => ({ ...p, customerName: e.target.value }))} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontFamily: 'var(--font)' }} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Location *</label>
                <input type="text" required placeholder="e.g. Tudun Wada, Gombe" value={testimonialModal.location} onChange={(e) => setTestimonialModal(p => ({ ...p, location: e.target.value }))} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontFamily: 'var(--font)' }} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Rating *</label>
                <select value={testimonialModal.rating} onChange={(e) => setTestimonialModal(p => ({ ...p, rating: Number(e.target.value) }))} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontFamily: 'var(--font)', cursor: 'pointer', fontWeight: 600 }}>
                  <option value={5}>★★★★★ (5 Stars)</option>
                  <option value={4}>★★★★☆ (4 Stars)</option>
                  <option value={3}>★★★☆☆ (3 Stars)</option>
                  <option value={2}>★★☆☆☆ (2 Stars)</option>
                  <option value={1}>★☆☆☆☆ (1 Star)</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Review / Feedback *</label>
                <textarea required rows="4" placeholder="What did the customer say about Solvix Go?" value={testimonialModal.review} onChange={(e) => setTestimonialModal(p => ({ ...p, review: e.target.value }))} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontFamily: 'var(--font)' }} />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Customer Photo (Optional)</label>
                <input type="file" accept="image/*" onChange={(e) => setTestimonialModal(p => ({ ...p, photoFile: e.target.files[0] }))} style={{ width: '100%' }} />
              </div>

              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" id="testi-approved" checked={testimonialModal.isApproved} onChange={(e) => setTestimonialModal(p => ({ ...p, isApproved: e.target.checked }))} />
                <label htmlFor="testi-approved" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy)', cursor: 'pointer' }}>Approved / Publicly Visible</label>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setTestimonialModal(p => ({ ...p, isOpen: false }))} style={{ background: '#F1F5F9', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', color: 'var(--navy)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="btn btn-orange" style={{ padding: '0.6rem 1.25rem', borderRadius: '8px' }}>Save Testimonial</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credentials display modal after approve / regenerate */}
      {newCredentials && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10010, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '550px', padding: '2.5rem 2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)', position: 'relative' }}>
            <h3 style={{ color: '#6B21A8', fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>🔑 New Credentials Created</h3>
            <p style={{ color: 'var(--gray-text)', fontSize: '0.9rem', marginBottom: '2rem' }}>
              These API keys are generated for <strong>{newCredentials.companyName}</strong>. Copy the secret key now; it will not be shown again.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--gray-light)', marginBottom: '0.4rem' }}>Public Key</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    readOnly
                    value={newCredentials.publicKey}
                    style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.88rem', background: '#F8FAFC', outline: 'none' }}
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(newCredentials.publicKey) & alert('Public Key copied')}
                    style={{ padding: '0.75rem 1rem', background: 'var(--navy)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--gray-light)', marginBottom: '0.4rem' }}>Secret Key (SHOWING ONCE)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    readOnly
                    value={newCredentials.secretKey}
                    style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '8px', border: '1.5px dashed #A855F7', fontSize: '0.88rem', background: '#FAF5FF', color: '#6B21A8', fontWeight: 'bold', outline: 'none' }}
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(newCredentials.secretKey) & alert('Secret Key copied')}
                    style={{ padding: '0.75rem 1rem', background: '#A855F7', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setNewCredentials(null)}
              style={{ width: '100%', padding: '0.85rem', background: 'var(--navy)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700 }}
            >
              Done, I have saved the credentials safely
            </button>
          </div>
        </div>
      )}

      {/* Global Dashboard Layout Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
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
