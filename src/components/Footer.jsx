import React from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../assets/logo.png';

const Footer = () => {
  return (
    <footer>
      <div className="footer-main">
        {/* Brand Information */}
        <div>
          <div className="footer-logo" style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
            <img src={logoImg} alt="Solvix Go" style={{ height: '36px', objectFit: 'contain' }} />
          </div>
          <div className="footer-tagline">We Pick. We Move. We Deliver.</div>
          <p className="footer-desc">
            Solvix Go is Gombe's premier logistics and home delivery service. We cater to businesses, individuals, pharmacy runs, and merchants.
          </p>
          <div className="social-links">
            <a href="https://facebook.com/solvixgodeliveryservices" target="_blank" rel="noreferrer" className="social-link" title="Facebook">f</a>
            <a href="https://instagram.com/solvixgodeliveryservices" target="_blank" rel="noreferrer" className="social-link" title="Instagram">ig</a>
            <a href="https://twitter.com/solvixgodeliveryservices" target="_blank" rel="noreferrer" className="social-link" title="Twitter">t</a>
            <a href="https://tiktok.com/@solvixgodeliveryservices" target="_blank" rel="noreferrer" className="social-link" title="TikTok">tk</a>
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="footer-col-title">Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/#home">Home</Link></li>
            <li><Link to="/#services">Services</Link></li>
            <li><Link to="/#about">About Us</Link></li>
            <li><Link to="/blog">Blog News</Link></li>
            <li><Link to="/#contact">Contact</Link></li>
            <li><Link to="/login" style={{ fontSize: '0.78rem', opacity: 0.6 }}>Staff Portal</Link></li>
          </ul>
        </div>

        {/* Core services shortcuts */}
        <div>
          <h4 className="footer-col-title">Our Services</h4>
          <ul className="footer-links">
            <li><Link to="/#services">Pickup & Delivery</Link></li>
            <li><Link to="/#services">Buy & Deliver</Link></li>
            <li><Link to="/#services">Business Delivery</Link></li>
            <li><Link to="/#services">Express Courier</Link></li>
            <li><Link to="/#services">Subscription Plan</Link></li>
          </ul>
        </div>

        {/* Business Coordinates */}
        <div>
          <h4 className="footer-col-title">Office Address</h4>
          <div className="footer-contact-item">
            <span>📍</span>
            <span>Office No. 7, Alhajin Yara Plaza, Tashan Dukku Road, Gombe State, Nigeria</span>
          </div>
          <div className="footer-contact-item">
            <span>📞</span>
            <span>07079018011<br />08128830983</span>
          </div>
          <div className="footer-contact-item">
            <span>✉️</span>
            <span>solvixgo@gmail.com</span>
          </div>
        </div>
      </div>

      {/* Footer Bottom copyright bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p>© 2026 Solvix Go. All rights reserved.</p>
          <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>
            A product of <b>Solvix Innovations Ltd.</b>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
