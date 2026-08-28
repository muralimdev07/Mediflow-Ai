import React, { useState } from 'react';
import './Navbar.css';

export const Navbar = ({ activeItem = 'Home', onNavigate, onGetStarted }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentActive, setCurrentActive] = useState(activeItem);

  const navItems = [
    { label: 'Home', href: '#' },
    { label: 'How It Works', href: '#' },
    { label: 'Find Specialist', href: '#' },
    { label: 'Why MediFlow', href: '#' },
    { label: 'About Us', href: '#' },
    { label: 'Contact Us', href: '#' },
  ];

  const handleNavClick = (e, item) => {
    e.preventDefault();
    setCurrentActive(item.label);
    if (onNavigate) {
      onNavigate(item.label);
    }
  };

  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <header className="mf-navbar-wrapper">
      <div className="mf-navbar-container">
        {/* LEFT: MediFlow AI Brand Logo */}
        <a href="#" className="mf-brand-group" aria-label="MediFlow AI Home">
          <div className="mf-logo-badge">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M19 10.5H16.83L15.41 4.82C15.22 4.07 14.28 3.96 13.91 4.65L10.3 11.45L9.17 9.19C8.94 8.73 8.35 8.5 7.85 8.7L5 9.84V3H3V21H5V12.33L7.14 11.46L9.12 15.42C9.33 15.84 9.87 16.08 10.32 15.96C10.77 15.84 11.1 15.44 11.14 14.98L12.56 9.3L13.98 12.18C14.17 12.57 14.56 12.82 15 12.82H19V10.5Z"
                fill="white"
              />
            </svg>
          </div>
          <div className="mf-brand-title">
            Medi<span className="flow">Flow</span><span className="ai">AI</span>
          </div>
        </a>

        {/* CENTER: Flat Clean Navigation Bar */}
        <nav aria-label="Main Navigation">
          <ul className="mf-nav-flat-menu">
            {navItems.map((item) => {
              const isActive = currentActive === item.label;
              return (
                <li key={item.label}>
                  <a
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item)}
                    className={`mf-nav-link ${isActive ? 'active' : ''}`}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* RIGHT: Single Get Started CTA */}
        <div className="mf-right-actions">
          <button className="mf-primary-cta" onClick={handleGetStarted}>
            <span>Get Started</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            className="mf-mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileOpen && (
        <div className="mf-mobile-drawer active">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => {
                handleNavClick(e, item);
                setMobileOpen(false);
              }}
              className={`mf-nav-link ${currentActive === item.label ? 'active' : ''}`}
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
};

export default Navbar;
