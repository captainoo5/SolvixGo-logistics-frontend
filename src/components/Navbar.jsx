import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo.png';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setMenuOpen(prev => !prev);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (e, targetHash) => {
    if (location.pathname !== '/') {
      e.preventDefault();
      navigate('/' + targetHash);
    }
    setMenuOpen(false);
  };

  const isActive = (hash) => {
    if (location.pathname !== '/') return false;
    return location.hash === hash;
  };

  return (
    <>
      <nav id="navbar" className={scrolled ? 'scrolled' : ''}>
        <div className="nav-inner">
          <Link to="/" className="nav-logo" onClick={() => window.scrollTo(0, 0)} style={{ display: 'flex', alignItems: 'center' }}>
            <img src={logoImg} alt="Solvix Go" style={{ height: '40px', objectFit: 'contain' }} />
          </Link>
          
          <ul className="nav-links">
            <li>
              <Link 
                to="/#home" 
                onClick={(e) => handleLinkClick(e, '#home')}
                className={location.pathname === '/' && (location.hash === '#home' || !location.hash) ? 'active' : ''}
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/#services" 
                onClick={(e) => handleLinkClick(e, '#services')}
                className={isActive('#services') ? 'active' : ''}
              >
                Services
              </Link>
            </li>
            <li>
              <Link 
                to="/#how-it-works" 
                onClick={(e) => handleLinkClick(e, '#how-it-works')}
                className={isActive('#how-it-works') ? 'active' : ''}
              >
                How It Works
              </Link>
            </li>
            <li>
              <Link 
                to="/#about" 
                onClick={(e) => handleLinkClick(e, '#about')}
                className={isActive('#about') ? 'active' : ''}
              >
                About Us
              </Link>
            </li>
            <li>
              <Link 
                to="/#testimonials" 
                onClick={(e) => handleLinkClick(e, '#testimonials')}
                className={isActive('#testimonials') ? 'active' : ''}
              >
                Testimonials
              </Link>
            </li>
            <li>
              <Link 
                to="/#partners" 
                onClick={(e) => handleLinkClick(e, '#partners')}
                className={isActive('#partners') ? 'active' : ''}
              >
                Partners
              </Link>
            </li>
            <li>
              <Link 
                to="/blog"
                className={location.pathname.startsWith('/blog') ? 'active' : ''}
              >
                Blog
              </Link>
            </li>
            <li>
              <Link 
                to="/#track" 
                onClick={(e) => handleLinkClick(e, '#track')}
                className={isActive('#track') ? 'active' : ''}
              >
                Track Parcel
              </Link>
            </li>
            <li>
              <Link 
                to="/#contact" 
                onClick={(e) => handleLinkClick(e, '#contact')}
                className={isActive('#contact') ? 'active' : ''}
              >
                Contact
              </Link>
            </li>
            <li>
              <a 
                href="https://wa.me/2348128830983?text=Hello%20Solvix%20Go%2C%20I%20want%20to%20place%20an%20order!" 
                className="btn btn-orange btn-nav-order" 
                target="_blank" 
                rel="noreferrer"
              >
                Order Now
              </a>
            </li>
          </ul>

          <div className="hamburger" onClick={toggleMenu} aria-label="Toggle navigation Menu">
            <span style={{ transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }}></span>
            <span style={{ opacity: menuOpen ? 0 : 1 }}></span>
            <span style={{ transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }}></span>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Navigation Overlay */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <Link to="/#home" onClick={(e) => handleLinkClick(e, '#home')}>Home</Link>
        <Link to="/#services" onClick={(e) => handleLinkClick(e, '#services')}>Services</Link>
        <Link to="/#how-it-works" onClick={(e) => handleLinkClick(e, '#how-it-works')}>How It Works</Link>
        <Link to="/#about" onClick={(e) => handleLinkClick(e, '#about')}>About Us</Link>
        <Link to="/#testimonials" onClick={(e) => handleLinkClick(e, '#testimonials')}>Testimonials</Link>
        <Link to="/#partners" onClick={(e) => handleLinkClick(e, '#partners')}>Partners</Link>
        <Link to="/blog" onClick={() => setMenuOpen(false)}>Blog</Link>
        <Link to="/#track" onClick={(e) => handleLinkClick(e, '#track')}>Track Parcel</Link>
        <Link to="/#contact" onClick={(e) => handleLinkClick(e, '#contact')}>Contact</Link>
        <a 
          href="https://wa.me/2348128830983?text=Hello%20Solvix%20Go%2C%20I%20want%20to%20place%20an%20order!" 
          target="_blank" 
          rel="noreferrer" 
          style={{ color: 'var(--orange)', fontWeight: 700 }}
        >
          Order Now →
        </a>
      </div>
    </>
  );
};

export default Navbar;
