import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import API from '../services/api';
import StarRating from '../components/StarRating';
import fastDeliveryImg from '../assets/fast-delivery.png';
import dependableImg from '../assets/dependable.png';
import shieldImg from '../assets/shield.png';
import trustImg from '../assets/trust.png';

const Home = () => {
  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const baseURL = apiURL.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
    return `${baseURL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // --- Services State ---
  const [services, setServices] = useState([]);

  // --- Partners State ---
  const [partners, setPartners] = useState([]);

  // --- Testimonials State ---
  const [testimonials, setTestimonials] = useState([]);

  // --- Testimonials Slider State ---
  const [currentSlide, setCurrentSlide] = useState(0);

  // --- Contact Form State ---
  const [contactData, setContactData] = useState({ fullName: '', phone: '', email: '', subject: '', message: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState({ text: '', type: '' }); // type: 'success' | 'error'

  // --- Tracking State ---
  const [trackingId, setTrackingId] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState('');

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    setTrackLoading(true);
    setTrackError('');
    setTrackingResult(null);

    try {
      const res = await API.get(`/track/${trackingId.trim()}`);
      if (res.data.success) {
        setTrackingResult(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setTrackError(err.response?.data?.message || 'Tracking ID not found. Please verify the ID and try again.');
    } finally {
      setTrackLoading(false);
    }
  };

  // --- Fetch API Data ---
  useEffect(() => {
    // Fetch Services
    API.get('/services')
      .then(res => {
        if (res.data.success && res.data.data.length > 0) {
          setServices(res.data.data);
        }
      })
      .catch(err => console.log('API Service load failed - Using custom mock fallbacks.'));

    // Fetch Partners
    API.get('/partners')
      .then(res => {
        if (res.data.success && res.data.data.length > 0) {
          setPartners(res.data.data);
        }
      })
      .catch(err => console.log('API Partners load failed - Using custom mock fallbacks.'));

    // Fetch Testimonials
    API.get('/testimonials')
      .then(res => {
        if (res.data.success && res.data.data.length > 0) {
          setTestimonials(res.data.data);
        }
      })
      .catch(err => console.log('API Testimonials load failed - Using custom mock fallbacks.'));
  }, []);

  // --- Testimonials Auto Play ---
  useEffect(() => {
    if (testimonials.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % Math.max(1, testimonials.length - 2));
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials]);

  const moveSlide = (dir) => {
    const limit = Math.max(0, testimonials.length - 3);
    if (dir === 'next') {
      setCurrentSlide(prev => (prev >= limit ? 0 : prev + 1));
    } else {
      setCurrentSlide(prev => (prev <= 0 ? limit : prev - 1));
    }
  };

  // --- Form Handler ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setToastMessage({ text: '', type: '' });

    // Validate phone number format (basic check)
    if (!/^\+?[0-9]{7,15}$/.test(contactData.phone.replace(/\s+/g, ''))) {
      setToastMessage({ text: '⚠️ Please enter a valid phone number (e.g. 07079018011).', type: 'error' });
      setFormLoading(false);
      return;
    }

    try {
      const res = await API.post('/contact', contactData);
      if (res.data.success) {
        setToastMessage({ text: '🎉 Thank you! Your request has been sent. We will get back to you shortly via call or WhatsApp!', type: 'success' });
        setContactData({ fullName: '', phone: '', email: '', subject: '', message: '' });
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || '⚠️ Submission failed. Please try messaging us directly on WhatsApp!';
      setToastMessage({ text: errMsg, type: 'error' });
    } finally {
      setFormLoading(false);
    }
  };

  // --- Animation Presets ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  return (
    <div>
      {/* ── HERO SECTION ── */}
      <section id="home">
        <div className="hero-bg"></div>
        <div className="hero-glow"></div>
        <div className="hero-inner">
          <motion.div 
            className="hero-content"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="hero-badge">Now Serving Gombe Metropolis</div>
            <h1 className="hero-title">
              YOUR DELIVERY<br />PARTNER IN <span className="highlight">GOMBE</span>
            </h1>
            <p className="hero-subtitle">⚡ Fast. ✓ Reliable. 🛡️ Safe. ★ Trusted.</p>
            <p className="hero-text">
              We pick up and deliver to any location within Gombe Metropolis. Serving vendors, restaurants, pharmacies, merchants, and individuals.
            </p>
            <div className="hero-ctas">
              <a 
                href="https://wa.me/2348128830983?text=Hello%20Solvix%20Go%2C%20I%20need%20a%20delivery%20service!" 
                className="btn btn-orange" 
                target="_blank" 
                rel="noreferrer"
              >
                📦 Order Now
              </a>
              <a href="#services" className="btn btn-navy-outline">Our Services</a>
            </div>
            <div className="hero-stats">
              <div className="stat-card">
                <div className="stat-icon"><img src={fastDeliveryImg} alt="Fast" style={{ width: '32px', height: '32px', objectFit: 'contain' }} /></div>
                <div className="stat-label">Fast</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><img src={dependableImg} alt="Reliable" style={{ width: '32px', height: '32px', objectFit: 'contain' }} /></div>
                <div className="stat-label">Reliable</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><img src={shieldImg} alt="Safe" style={{ width: '32px', height: '32px', objectFit: 'contain' }} /></div>
                <div className="stat-label">Safe</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><img src={trustImg} alt="Trusted" style={{ width: '32px', height: '32px', objectFit: 'contain' }} /></div>
                <div className="stat-label">Trusted</div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="hero-visual"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="hero-card">
              <div className="delivery-illustration">
                <svg 
                  className="truck-svg" 
                  viewBox="0 0 320 220" 
                  width="320" 
                  height="220" 
                  xmlns="http://www.w3.org/2000/svg" 
                  style={{ animation: 'float 3s ease-in-out infinite' }}
                >
                  <style>
                    {`
                      @keyframes float {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-12px); }
                      }
                    `}
                  </style>
                  {/* Road */}
                  <rect x="0" y="185" width="320" height="35" rx="6" fill="rgba(255,255,255,0.06)" />
                  <rect x="20" y="196" width="40" height="6" rx="3" fill="rgba(255,255,255,0.15)" />
                  <rect x="80" y="196" width="40" height="6" rx="3" fill="rgba(255,255,255,0.15)" />
                  <rect x="140" y="196" width="40" height="6" rx="3" fill="rgba(255,255,255,0.15)" />
                  <rect x="200" y="196" width="40" height="6" rx="3" fill="rgba(255,255,255,0.15)" />
                  <rect x="260" y="196" width="40" height="6" rx="3" fill="rgba(255,255,255,0.15)" />
                  {/* Truck body */}
                  <rect x="30" y="90" width="180" height="90" rx="8" fill="#F47B00" />
                  {/* Cabin */}
                  <rect x="210" y="115" width="80" height="65" rx="8" fill="#0D1B4D" />
                  {/* Cabin window */}
                  <rect x="224" y="125" width="48" height="35" rx="5" fill="rgba(255,255,255,0.25)" />
                  {/* Truck logo */}
                  <text x="120" y="143" textAnchor="middle" fontFamily="Poppins,Arial" fontSize="14" fontWeight="800" fill="#fff">SOLVIX GO</text>
                  <text x="120" y="162" textAnchor="middle" fontFamily="Poppins,Arial" fontSize="9" fill="rgba(255,255,255,0.8)">WE PICK. WE MOVE. WE DELIVER.</text>
                  {/* Wheels */}
                  <circle cx="90" cy="185" r="22" fill="#1A1A2E" />
                  <circle cx="90" cy="185" r="13" fill="#333" stroke="#F47B00" strokeWidth="3" />
                  <circle cx="90" cy="185" r="4" fill="#F47B00" />
                  <circle cx="230" cy="185" r="22" fill="#1A1A2E" />
                  <circle cx="230" cy="185" r="13" fill="#333" stroke="#F47B00" strokeWidth="3" />
                  <circle cx="230" cy="185" r="4" fill="#F47B00" />
                  {/* Package on top */}
                  <rect x="60" y="65" width="55" height="30" rx="4" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                  <line x1="87" y1="65" x2="87" y2="95" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                  <line x1="60" y1="80" x2="115" y2="80" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                  {/* Speed lines */}
                  <line x1="0" y1="130" x2="22" y2="130" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" />
                  <line x1="0" y1="145" x2="18" y2="145" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeLinecap="round" />
                  <line x1="0" y1="160" x2="25" y2="160" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', gap: '1rem' }}>
                <div style={{ flex: 1, background: 'rgba(255, 107, 0, 0.12)', border: '1px solid rgba(255, 107, 0, 0.2)', borderRadius: '14px', padding: '1rem 0.5rem', textAlign: 'center', transition: 'var(--transition)' }}>
                  <div style={{ color: 'var(--orange-light)', fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-0.02em' }}>24/7</div>
                  <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.2rem' }}>Availability</div>
                </div>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '1rem 0.5rem', textAlign: 'center', transition: 'var(--transition)' }}>
                  <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-0.02em' }}>100%</div>
                  <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.2rem' }}>Satisfaction</div>
                </div>
                <div style={{ flex: 1, background: 'rgba(255, 107, 0, 0.12)', border: '1px solid rgba(255, 107, 0, 0.2)', borderRadius: '14px', padding: '1rem 0.5rem', textAlign: 'center', transition: 'var(--transition)' }}>
                  <div style={{ color: 'var(--orange-light)', fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-0.02em' }}>Gombe</div>
                  <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.2rem' }}>Coverage</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SERVICES SECTION ── */}
      <section id="services">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-tag">What We Offer</span>
            <h2 className="section-title">OUR <span>SERVICES</span></h2>
            <p className="section-sub">Dynamic dispatch solutions managed in real-time from our dashboard.</p>
          </div>

          <motion.div 
            className="services-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {services.map(service => (
              <motion.div 
                key={service._id} 
                className="service-card"
                variants={itemVariants}
                whileHover={{ y: -6, borderColor: 'var(--orange)', boxShadow: '0 12px 35px rgba(244, 123, 0, 0.15)' }}
              >
                <div className="service-icon">
                  {service.icon?.url ? (
                    service.icon.url.startsWith('/') || service.icon.url.startsWith('http') ? (
                      <img src={service.icon.url} alt={service.name} />
                    ) : (
                      <span>{service.icon.url}</span>
                    )
                  ) : (
                    <span>📦</span>
                  )}
                </div>
                {service.badge && <span className="service-badge">{service.badge}</span>}
                <div className="service-name">{service.name}</div>
                <p className="service-desc">{service.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-tag">Process pipeline</span>
            <h2 className="section-title">HOW IT <span>WORKS</span></h2>
            <p className="section-sub">Simple, reliable delivery within Gombe metropolis in 4 simple steps.</p>
          </div>

          <motion.div 
            className="steps-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            <motion.div className="step-card" variants={itemVariants}>
              <div className="step-num"><span className="step-emoji">💬</span></div>
              <h3 className="step-title">Send Request</h3>
              <p className="step-desc">Contact us via WhatsApp or call. Tell us what you need picked up.</p>
            </motion.div>
            <motion.div className="step-card" variants={itemVariants}>
              <div className="step-num"><span className="step-emoji">✅</span></div>
              <h3 className="step-title">Confirm & Assign</h3>
              <p className="step-desc">We confirm coordinates and assign a rider immediately.</p>
            </motion.div>
            <motion.div className="step-card" variants={itemVariants}>
              <div className="step-num"><span className="step-emoji">🚴</span></div>
              <h3 className="step-title">Pickup & Move</h3>
              <p className="step-desc">Our dedicated dispatcher handles your package with absolute care.</p>
            </motion.div>
            <motion.div className="step-card" variants={itemVariants}>
              <div className="step-num"><span className="step-emoji">🎉</span></div>
              <h3 className="step-title">Delivered</h3>
              <p className="step-desc">Safely delivered to the recipient on time. satisfaction guaranteed.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── ABOUT US SECTION ── */}
      <section id="about">
        <div className="section-inner">
          <div className="about-grid">
            <motion.div 
              className="about-img-wrap"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="about-img-box">
                <svg viewBox="0 0 400 280" width="100%" xmlns="http://www.w3.org/2000/svg">
                  <rect width="400" height="280" fill="#0D1B4D" />
                  <circle cx="200" cy="100" r="60" fill="rgba(244,123,0,0.15)" stroke="rgba(244,123,0,0.3)" strokeWidth="2" />
                  <text x="200" y="85" textAnchor="middle" fontFamily="Poppins,Arial" fontSize="36">🚴</text>
                  <text x="200" y="125" textAnchor="middle" fontFamily="Poppins,Arial" fontSize="12" fill="rgba(255,255,255,0.6)">Solvix Go Rider</text>
                  <rect x="50" y="180" width="300" height="60" rx="10" fill="rgba(244,123,0,0.1)" stroke="rgba(244,123,0,0.2)" strokeWidth="1" />
                  <text x="200" y="207" textAnchor="middle" fontFamily="Poppins,Arial" fontSize="11" fontWeight="700" fill="#F47B00">SOLVIX GO LOGISTICS</text>
                  <text x="200" y="228" textAnchor="middle" fontFamily="Poppins,Arial" fontSize="10" fill="rgba(255,255,255,0.5)">Gombe State, Nigeria</text>
                </svg>
              </div>
              <div className="about-orange-block">🚚</div>
              <div className="about-exp-badge"><span>2024</span>Est.</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="section-tag">Our Story</span>
              <h2 class="section-title">ABOUT <span>SOLVIX GO</span></h2>
              <p style={{ color: 'var(--gray-text)', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>
                Solvix Go is Gombe's premium logistics and home delivery service. A product of Solvix Innovations Ltd., we are committed to revolutionizing how individuals, vendors, pharmacies, and corporate organizations handle courier logistics.
              </p>
              <div className="about-address">
                <span style={{ fontSize: '1.2rem' }}>📍</span>
                <span>Office No. 7, Alhajin Yara Plaza, Tashan Dukku Road, Gombe, Gombe State</span>
              </div>
              <div className="values-grid">
                <div className="value-box">
                  <div className="value-icon"><img src={fastDeliveryImg} alt="Fast" style={{ width: '28px', height: '28px', objectFit: 'contain' }} /></div>
                  <div>
                    <div className="value-name">Fast</div>
                    <div className="value-desc">Swift same-day dispatches across Metropolis</div>
                  </div>
                </div>
                <div className="value-box">
                  <div className="value-icon"><img src={dependableImg} alt="Reliable" style={{ width: '28px', height: '28px', objectFit: 'contain' }} /></div>
                  <div>
                    <div className="value-name">Reliable</div>
                    <div className="value-desc">Prompt and guaranteed handling records</div>
                  </div>
                </div>
                <div className="value-box">
                  <div className="value-icon"><img src={shieldImg} alt="Safe" style={{ width: '28px', height: '28px', objectFit: 'contain' }} /></div>
                  <div>
                    <div className="value-name">Safe</div>
                    <div className="value-desc">Secured package transport practices</div>
                  </div>
                </div>
                <div className="value-box">
                  <div className="value-icon"><img src={trustImg} alt="Trusted" style={{ width: '28px', height: '28px', objectFit: 'contain' }} /></div>
                  <div>
                    <div className="value-name">Trusted</div>
                    <div className="value-desc">First choice of merchants in Gombe</div>
                  </div>
                </div>
              </div>
              <a 
                href="https://wa.me/2348128830983" 
                className="btn btn-orange" 
                style={{ marginTop: '0.5rem' }}
                target="_blank"
                rel="noreferrer"
              >
                Chat on WhatsApp →
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS SECTION ── */}
      <section id="testimonials">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-tag">Reviews</span>
            <h2 className="section-title">WHAT OUR <span>CUSTOMERS SAY</span></h2>
            <p className="section-sub">Trusted by hundreds of businesses and individuals in Gombe State.</p>
          </div>

          <div className="testimonials-carousel">
            <div 
              className="testimonials-track" 
              style={{ transform: `translateX(-${currentSlide * (100 / (window.innerWidth < 768 ? 1 : 3))}%)` }}
            >
              {testimonials.map(item => (
                <div className="testimonials-slide" key={item._id}>
                  <div className="testimonial-card">
                    <div>
                      <StarRating rating={item.rating} />
                      <p className="testimonial-text">"{item.review}"</p>
                    </div>
                    <div className="testimonial-author">
                      <div className="author-avatar">
                        {item.photo?.url ? (
                          <img src={item.photo.url} alt={item.customerName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          item.customerName.split(' ').map(n => n[0]).join('')
                        )}
                      </div>
                      <div>
                        <div className="author-name">{item.customerName}</div>
                        <div className="author-location">📍 {item.location}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="carousel-controls">
            <button className="carousel-btn" onClick={() => moveSlide('prev')}>←</button>
            <div className="carousel-dots">
              {Array.from({ length: Math.max(0, testimonials.length - 2) }).map((_, idx) => (
                <div 
                  key={idx} 
                  className={`dot ${currentSlide === idx ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(idx)}
                ></div>
              ))}
            </div>
            <button className="carousel-btn" onClick={() => moveSlide('next')}>→</button>
          </div>
        </div>
      </section>

      {/* ── PARTNERS SECTION ── */}
      <section id="partners">
        <div className="section-inner">
          <div className="section-header" style={{ textAlign: 'center' }}>
            <span className="section-tag" style={{ color: 'rgba(244,123,0,0.9)' }}>Collaborations</span>
            <h2 className="section-title" style={{ color: '#fff' }}>OUR <span>PARTNERS</span></h2>
            <p className="section-sub" style={{ color: 'rgba(255,255,255,0.6)', margin: '0 auto' }}>
              Trusted by leading retail brands and vendors in Gombe State.
            </p>
          </div>
        </div>

        <div className="marquee-wrapper">
          <div className="marquee-track">
            {/* Render partners list twice to guarantee seamless looping */}
            {[...partners, ...partners].map((partner, idx) => (
              <div className="partner-card" key={`${partner._id}-${idx}`}>
                <div className="partner-logo">
                  {partner.logo?.url ? (
                    <img src={getImageUrl(partner.logo.url)} alt={partner.name} />
                  ) : (
                    <span>🤝</span>
                  )}
                </div>
                <div className="partner-name">{partner.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRACK YOUR PARCEL ── */}
      <section id="track">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-tag">Tracking Portal</span>
            <h2 className="section-title">TRACK YOUR <span>PARCEL</span></h2>
          </div>
          <div className="track-inner" style={{ position: 'relative' }}>
            <div className="track-box">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📍</div>
              <h3 style={{ color: 'var(--navy)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Track Your Delivery
              </h3>
              <p style={{ color: 'var(--gray-text)', fontSize: '0.875rem' }}>
                Enter your Tracking ID to get real-time delivery status updates.
              </p>
              
              <form onSubmit={handleTrackSubmit} className="track-input-row" style={{ display: 'flex', gap: '0.5rem', width: '100%', marginTop: '1rem' }}>
                <input 
                  className="track-input" 
                  type="text" 
                  placeholder="Enter Tracking ID e.g. GMB-0601-001-AA" 
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  style={{ flexGrow: 1, padding: '0.75rem 1rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', outline: 'none' }}
                />
                <button 
                  type="submit" 
                  className="track-btn" 
                  disabled={trackLoading}
                  style={{ background: 'var(--orange)', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
                >
                  {trackLoading ? 'Searching...' : 'Track Order'}
                </button>
              </form>

              {trackError && (
                <div style={{ color: '#E53E3E', fontSize: '0.85rem', marginTop: '1rem', fontWeight: 600 }}>
                  ⚠️ {trackError}
                </div>
              )}

              {/* Render Tracking Result Timeline */}
              {trackingResult && (
                <div style={{
                  marginTop: '2rem',
                  background: '#f8fafc',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  width: '100%',
                  textAlign: 'left',
                  border: '1px solid #EDF2F7'
                }}>
                  <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ color: 'var(--navy)', margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>
                        📦 Parcel Found: <span style={{ color: 'var(--orange)' }}>{trackingResult.trackingId}</span>
                      </h4>
                      <p style={{ margin: '0.2rem 0 0 0', color: 'var(--gray-text)', fontSize: '0.75rem' }}>
                        Item: {trackingResult.itemDescription}
                      </p>
                    </div>
                    {trackingResult.riderName && (
                      <div style={{ background: '#E8F5E9', borderRadius: '6px', padding: '0.3rem 0.5rem', fontSize: '0.72rem', color: '#2E7D32', fontWeight: 700 }}>
                        🚴 Rider: {trackingResult.riderName}
                      </div>
                    )}
                  </div>

                  {trackingResult.status === 'Cancelled' ? (
                    <div style={{ background: '#FFEBEE', border: '1px solid #FFCDD2', color: '#C62828', borderRadius: '10px', padding: '0.8rem', fontWeight: 700, fontSize: '0.85rem', textAlign: 'center' }}>
                      ⚠️ This delivery request has been Cancelled.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', paddingLeft: '1.25rem' }}>
                      <div style={{
                        position: 'absolute',
                        left: '5px',
                        top: '10px',
                        bottom: '10px',
                        width: '2px',
                        background: '#E2E8F0',
                        zIndex: 0
                      }} />

                      {[
                        { key: 'Pending', label: 'Order Received' },
                        { key: 'Assigned', label: 'Rider Assigned' },
                        { key: 'Picked Up', label: 'Picked Up' },
                        { key: 'In Transit', label: 'In Transit' },
                        { key: 'Delivered', label: 'Delivered' }
                      ].map((step, idx) => {
                        const historyItem = trackingResult.statusHistory.find(h => h.status === step.key);
                        const stepTime = historyItem ? new Date(historyItem.timestamp).toLocaleString() : null;
                        const isCompleted = stepTime !== null;
                        const isCurrent = step.key === trackingResult.status;
                        
                        let dotColor = '#CBD5E1';
                        let dotBg = '#fff';
                        let isPulsing = false;

                        if (isCurrent) {
                          dotColor = 'var(--orange)';
                          dotBg = 'var(--orange)';
                          isPulsing = true;
                        } else if (isCompleted) {
                          dotColor = '#10B981';
                          dotBg = '#10B981';
                        }

                        return (
                          <div key={step.key} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                            <div 
                              className={isPulsing ? 'pulse-orange-dot' : ''}
                              style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                background: dotBg,
                                border: `2px solid ${dotColor}`,
                                marginLeft: '-1.5rem',
                                marginTop: '4px',
                                transition: 'all 0.3s ease'
                              }} 
                            />

                            <div>
                              <div style={{ fontWeight: 700, color: isCurrent ? 'var(--orange)' : 'var(--navy)', fontSize: '0.85rem' }}>
                                {step.label} {isCurrent && ' (Current Status)'}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--gray-text)', marginTop: '0.1rem' }}>
                                {isCompleted ? `✓ At: ${stepTime}` : 'Pending'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <p className="track-note" style={{ marginTop: '1.5rem' }}>
                ⏳ Check your WhatsApp for direct status updates once your package goes In Transit.
              </p>
            </div>
          </div>
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes pulse-orange-anim {
            0% { box-shadow: 0 0 0 0 rgba(244,123,0,0.7); }
            70% { box-shadow: 0 0 0 8px rgba(244,123,0,0); }
            100% { box-shadow: 0 0 0 0 rgba(244,123,0,0); }
          }
          .pulse-orange-dot {
            animation: pulse-orange-anim 1.5s infinite !important;
            box-shadow: 0 0 8px rgba(244,123,0,0.5);
          }
        `}} />
      </section>

      {/* ── CONTACT US SECTION ── */}
      <section id="contact">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-tag">Get In Touch</span>
            <h2 className="section-title">CONTACT <span>US</span></h2>
            <p className="section-sub">Ready to place an order or have a question? We are here to support you.</p>
          </div>

          <div className="contact-grid">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="contact-info-item">
                <div className="contact-icon-wrap">📞</div>
                <div>
                  <div className="contact-info-label">Phone Numbers</div>
                  <div className="contact-info-value">07079018011<br />08128830983</div>
                </div>
              </div>
              <div className="contact-info-item">
                <div className="contact-icon-wrap">✉️</div>
                <div>
                  <div className="contact-info-label">Email Address</div>
                  <div className="contact-info-value">solvixgo@gmail.com</div>
                </div>
              </div>
              <div className="contact-info-item">
                <div className="contact-icon-wrap">📍</div>
                <div>
                  <div className="contact-info-label">Office Plaza</div>
                  <div className="contact-info-value">Office No. 7, Alhajin Yara Plaza<br />Tashan Dukku Road, Gombe State</div>
                </div>
              </div>
              <div className="contact-info-item">
                <div className="contact-icon-wrap">📱</div>
                <div>
                  <div className="contact-info-label">Social Handle</div>
                  <div className="contact-info-value">@solvixgodeliveryservices</div>
                </div>
              </div>
              <a 
                href="https://wa.me/2348128830983?text=Hello%20Solvix%20Go%2C%20I%20want%20to%20book%20a%20delivery!" 
                className="whatsapp-btn" 
                target="_blank" 
                rel="noreferrer"
              >
                💬 Chat on WhatsApp
              </a>
              <div className="map-embed">
                <span>🗺️</span>
                <span style={{ fontWeight: 600 }}>Tashan Dukku Road, Gombe</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Alhajin Yara Plaza Complex</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <form className="contact-form" onSubmit={handleFormSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      name="fullName"
                      value={contactData.fullName}
                      onChange={handleInputChange}
                      placeholder="e.g. Aisha Bello"
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input 
                      type="tel" 
                      className="form-input" 
                      name="phone"
                      value={contactData.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. 07079018011"
                      required 
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address (Optional)</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    name="email"
                    value={contactData.email}
                    onChange={handleInputChange}
                    placeholder="e.g. customer@domain.com"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Subject *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    name="subject"
                    value={contactData.subject}
                    onChange={handleInputChange}
                    placeholder="e.g. Package delivery from Tudun Wada"
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Inquiry Message *</label>
                  <textarea 
                    className="form-input" 
                    name="message"
                    value={contactData.message}
                    onChange={handleInputChange}
                    placeholder="Provide details about what you want delivered, dimensions, pickup details..."
                    required
                  ></textarea>
                </div>
                
                <button 
                  type="submit" 
                  className="form-submit" 
                  disabled={formLoading}
                >
                  {formLoading ? '⏳ Submitting...' : '📤 Send Message'}
                </button>

                {toastMessage.text && (
                  <div className={`toast ${toastMessage.type}`}>
                    {toastMessage.text}
                  </div>
                )}
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
