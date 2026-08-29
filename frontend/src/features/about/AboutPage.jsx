import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../components/LandingPage.css';
import './AboutPage.css';

export const AboutPage = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="mf-ref-home mf-about-page-wrapper">
      {/* 1. NAVBAR HEADER */}
      <header className="mf-ref-nav">
        <Link to="/" className="mf-ref-brand">
          <img
            src="/mediflow_logo.svg"
            alt="MediFlow AI Logo"
            className="mf-ref-logo-img"
            style={{ width: '40px', height: '40px' }}
          />
          <div>
            <div className="mf-ref-brand-title">
              Medi<span>Flow</span> <span style={{ color: '#05CD99', fontSize: '18px', fontWeight: 800 }}>AI</span>
            </div>
            <div className="mf-ref-brand-sub">AI POWERED QUEUE &amp; PATIENT FLOW</div>
          </div>
        </Link>

        {/* Center Nav Items */}
        <ul className="mf-ref-nav-links">
          <li><Link to="/" className="mf-ref-nav-link">Home</Link></li>
          <li><Link to="/about" className="mf-ref-nav-link active">About Us</Link></li>
          <li><Link to="/#features" className="mf-ref-nav-link">Features</Link></li>
          <li><Link to="/#how-it-works" className="mf-ref-nav-link">How It Works</Link></li>
          <li><Link to="/contact" className="mf-ref-nav-link">Contact Us</Link></li>
        </ul>

        {/* Right Action Buttons */}
        <div className="mf-ref-nav-actions">
          <div className="mf-ref-bell" title="Notifications">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <button
            className="mf-ref-btn-login"
            style={{ borderColor: '#05CD99', color: '#05CD99' }}
            onClick={() => navigate('/nurse/login')}
          >
            Nurse Station
          </button>
          <button className="mf-ref-btn-login" onClick={handleLoginClick}>
            Login
          </button>
          <button className="mf-ref-btn-register" onClick={() => navigate('/register')}>
            Register
          </button>
        </div>
      </header>

      {/* 2. HERO BANNER FOR ABOUT US */}
      <section className="mf-about-hero-sec">
        <div className="mf-about-hero-container">
          <div className="mf-ref-tag-sm" style={{ margin: '0 auto 16px auto', width: 'fit-content' }}>
            ABOUT MEDIFLOW AI
          </div>
          <h1 className="mf-about-hero-h1">
            Transforming Healthcare Delivery <br />
            <span>Through Artificial Intelligence</span>
          </h1>
          <p className="mf-about-hero-desc">
            MediFlow AI is a next-generation hospital operational intelligence platform. We combine real-time AI triage, smart queue management, and automated patient flow to eliminate waiting room delays and optimize clinical outcomes.
          </p>
        </div>
      </section>

      {/* 3. KEY METRICS & IMPACT */}
      <section className="mf-about-stats-sec">
        <div className="mf-about-container">
          <div className="mf-ref-about-stats-grid">
            <div className="mf-ref-about-stat-card">
              <div className="mf-ref-about-stat-num">99.8%</div>
              <div className="mf-ref-about-stat-label">AI Triage Accuracy Rate</div>
            </div>
            <div className="mf-ref-about-stat-card">
              <div className="mf-ref-about-stat-num">&lt; 12m</div>
              <div className="mf-ref-about-stat-label">Average Hospital Wait Time</div>
            </div>
            <div className="mf-ref-about-stat-card">
              <div className="mf-ref-about-stat-num">500k+</div>
              <div className="mf-ref-about-stat-label">Patients Served & Streamlined</div>
            </div>
            <div className="mf-ref-about-stat-card">
              <div className="mf-ref-about-stat-num">50+</div>
              <div className="mf-ref-about-stat-label">Partner Hospitals & Clinics</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MISSION & VISION SECTION */}
      <section className="mf-about-mv-sec">
        <div className="mf-about-container">
          <div className="mf-about-mv-grid">
            <div className="mf-about-mv-card">
              <div className="mf-about-mv-icon">🎯</div>
              <h2 className="mf-about-mv-title">Our Mission</h2>
              <p className="mf-about-mv-text">
                Our mission is to eliminate overcrowded hospital waiting rooms, reduce patient anxiety, and ensure that critical emergency cases receive immediate medical attention through automated, intelligent symptom triage.
              </p>
            </div>

            <div className="mf-about-mv-card">
              <div className="mf-about-mv-icon">👁️</div>
              <h2 className="mf-about-mv-title">Our Vision</h2>
              <p className="mf-about-mv-text">
                We envision a connected healthcare system where every patient journey—from initial symptom assessment and doctor consultation to lab tests, pharmacy, and billing—is seamless, transparent, and digital-first.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CORE CAPABILITIES / PLATFORM HIGHLIGHTS */}
      <section className="mf-about-features-sec">
        <div className="mf-about-container">
          <div className="mf-about-section-header">
            <div className="mf-ref-tag-sm" style={{ margin: '0 auto 12px auto', width: 'fit-content' }}>
              OUR PLATFORM CAPABILITIES
            </div>
            <h2 className="mf-ref-how-h2" style={{ textAlign: 'center' }}>
              Built for Modern Hospitals & Clinics
            </h2>
            <p className="mf-ref-how-p" style={{ textAlign: 'center', maxWidth: '680px', margin: '12px auto 0 auto' }}>
              MediFlow AI unifies patients, triage nurses, specialized doctors, and hospital administrators in a synchronized digital ecosystem.
            </p>
          </div>

          <div className="mf-ref-about-grid" style={{ marginTop: '48px' }}>
            <div className="mf-ref-about-card">
              <div className="mf-ref-about-icon shadow-teal">🧠</div>
              <h3 className="mf-ref-about-card-title">AI Clinical Triage (P1 - P5)</h3>
              <p className="mf-ref-about-card-desc">
                Machine learning models analyze patient symptoms upon arrival, automatically categorizing urgency levels from Emergency (P1) to Routine (P5) to prioritize critical care.
              </p>
            </div>

            <div className="mf-ref-about-card">
              <div className="mf-ref-about-icon shadow-blue">📱</div>
              <h3 className="mf-ref-about-card-title">Real-Time Mobile Queue Tracking</h3>
              <p className="mf-ref-about-card-desc">
                Patients receive digital queue tokens on their phones with live estimated wait times and SMS updates, enabling comfortable waiting outside crowded lobbies.
              </p>
            </div>

            <div className="mf-ref-about-card">
              <div className="mf-ref-about-icon shadow-purple">🏥</div>
              <h3 className="mf-ref-about-card-title">Dynamic Doctor & Room Allocation</h3>
              <p className="mf-ref-about-card-desc">
                Consultation rooms, OPD cabins, and specialist schedules are dynamically managed to prevent bottlenecks and ensure maximum clinical efficiency.
              </p>
            </div>

            <div className="mf-ref-about-card">
              <div className="mf-ref-about-icon shadow-emerald">🛡️</div>
              <h3 className="mf-ref-about-card-title">HIPAA-Compliant & Secure Architecture</h3>
              <p className="mf-ref-about-card-desc">
                Built with bank-grade encryption, strict role-based access controls (RBAC), and full compliance with international medical data privacy standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="mf-about-cta-sec">
        <div className="mf-about-container">
          <div className="mf-about-cta-card">
            <h2>Ready to Experience Smarter Healthcare?</h2>
            <p>Join thousands of patients and leading healthcare providers using MediFlow AI today.</p>
            <div className="mf-about-cta-btns">
              <button className="mf-ref-btn-doctor" onClick={handleLoginClick}>
                Get Started Now →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="mf-ref-footer">
        <div className="mf-ref-footer-inner">
          <div className="mf-ref-footer-brand">
            <div style={{ width: '28px', height: '28px', background: '#0D7A73', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              +
            </div>
            <span>MediFlow AI</span>
          </div>

          <div className="mf-ref-footer-links">
            <Link to="/" className="mf-ref-footer-link">Home</Link>
            <Link to="/#how-it-works" className="mf-ref-footer-link">How It Works</Link>
            <Link to="/#find-specialist" className="mf-ref-footer-link">Find Specialist</Link>
            <Link to="/#services" className="mf-ref-footer-link">Services</Link>
            <Link to="/about" className="mf-ref-footer-link">About Us</Link>
          </div>

          <div style={{ fontSize: '13px', color: '#64748B' }}>
            © 2026 MediFlow AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
