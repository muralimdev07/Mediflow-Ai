import React, { useState } from 'react';
import './Navbar.css';

export const Navbar = ({ activeItem = 'Home', onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentActive, setCurrentActive] = useState(activeItem);

  const navItems = [
    { label: 'Home', href: '#' },
    { label: 'How It Works', href: '#' },
    { label: 'Find Specialist', href: '#' },
    { label: 'Why MediFlow', href: '#' },
    { label: 'About Us', href: '#' },
    { label: 'Contact Us', href: '#' },
  ];

  const handleItemClick = (e, item) => {
    e.preventDefault();
    setCurrentActive(item.label);
    if (onNavigate) {
      onNavigate(item.label);
    }
  };

  return (
    <header className="mf-navbar-wrapper">
      <div className="mf-navbar-container">
        {/* LEFT SIDE: Brand Logo */}
        <a href="#" className="mf-logo-group" aria-label="MediFlow Home">
          <div className="mf-logo-icon-wrapper">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V13H7V11H11V7H13V11H17V13H13V17Z"
                fill="white"
              />
            </svg>
          </div>
          <div className="mf-logo-text-box">
            <div className="mf-brand-title">
              Medi<span>Flow</span>
            </div>
            <div className="mf-brand-tagline">Smart Healthcare</div>
          </div>
        </a>

        {/* CENTER: Navigation Links in Pill Container */}
        <nav className="mf-nav-pill-container" aria-label="Main Navigation">
          <ul className="mf-nav-menu">
            {navItems.map((item) => {
              const isActive = currentActive === item.label;
              return (
                <li key={item.label}>
                  <a
                    href={item.href}
                    onClick={(e) => handleItemClick(e, item)}
                    className={`mf-nav-link ${isActive ? 'active' : ''}`}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* RIGHT SIDE: Action CTA */}
        <div className="mf-actions-group">
          <button className="mf-cta-button" onClick={() => (window.location.href = '/login')}>
            <span className="mf-status-dot" />
            <span>Get Started</span>
          </button>

          {/* Mobile Hamburger Button */}
          <button
            className="mf-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Navigation */}
      {mobileMenuOpen && (
        <div className="mf-mobile-menu open">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => {
                handleItemClick(e, item);
                setMobileMenuOpen(false);
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
