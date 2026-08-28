import React, { useState } from 'react';
import './LandingPage.css';

const LandingPage = ({ onGetStarted }) => {
  const [activeNav, setActiveNav] = useState('Home');

  const handleNavClick = (e, navItem) => {
    e.preventDefault();
    setActiveNav(navItem);
  };

  const handleLoginClick = () => {
    if (onGetStarted) {
      onGetStarted();
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <div className="mf-ref-home">
      {/* 1. NAVBAR HEADER */}
      <header className="mf-ref-nav">
        <a href="#home" className="mf-ref-brand">
          <div className="mf-ref-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M19 10.5H16.83L15.41 4.82C15.22 4.07 14.28 3.96 13.91 4.65L10.3 11.45L9.17 9.19C8.94 8.73 8.35 8.5 7.85 8.7L5 9.84V3H3V21H5V12.33L7.14 11.46L9.12 15.42C9.33 15.84 9.87 16.08 10.32 15.96C10.77 15.84 11.1 15.44 11.14 14.98L12.56 9.3L13.98 12.18C14.17 12.57 14.56 12.82 15 12.82H19V10.5Z"
                fill="white"
              />
            </svg>
          </div>
          <div>
            <div className="mf-ref-brand-title">
              Smart<span>Hospital</span>
            </div>
            <div className="mf-ref-brand-sub">AI Powered Queue & Patient Flow</div>
          </div>
        </a>

        {/* Center Nav Items */}
        <ul className="mf-ref-nav-links">
          {['Home', 'How It Works', 'Find Specialist', 'Services', 'About'].map((item) => (
            <li key={item}>
              <a
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                className={`mf-ref-nav-link ${activeNav === item ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, item)}
              >
                {item}
              </a>
            </li>
          ))}
        </ul>

        {/* Right Action Buttons */}
        <div className="mf-ref-nav-actions">
          <div className="mf-ref-bell" title="Notifications">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <button className="mf-ref-btn-login" onClick={handleLoginClick}>
            Login
          </button>
          <button className="mf-ref-btn-register" onClick={handleLoginClick}>
            Register
          </button>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section id="home" className="mf-ref-hero-sec">
        <div className="mf-ref-hero-grid">
          {/* Left Text */}
          <div className="mf-ref-hero-left">
            <div className="mf-ref-hero-pill">
              Smarter Healthcare • Happier Patients
            </div>

            <h1 className="mf-ref-hero-title">
              Your Health.<br />
              <span>Our Priority.</span>
            </h1>

            <p className="mf-ref-hero-sub">
              AI-powered hospital queue and patient flow management for a faster, easier and smarter healthcare experience.
            </p>

            <div className="mf-ref-hero-btns">
              <button className="mf-ref-btn-doctor" onClick={handleLoginClick}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
                <span>Find My Doctor</span>
                <span>→</span>
              </button>

              <button className="mf-ref-btn-track" onClick={handleLoginClick}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <line x1="7" y1="8" x2="17" y2="8" />
                  <line x1="7" y1="12" x2="13" y2="12" />
                </svg>
                <span>Track Queue</span>
              </button>
            </div>
          </div>

          {/* Right Hero Graphic & Floating AI Card Overlay */}
          <div className="mf-ref-hero-right">
            <div className="mf-ref-hero-img-box">
              {/* Handwritten Quote above Doctor */}
              <div className="mf-handwritten-quote">
                Better Care Every Step ♡
              </div>

              <img
                src="/mediflow_hero_doctor_child_v2.jpg"
                alt="Indian female doctor examining child patient"
                className="mf-ref-hero-img"
              />

              {/* Floating AI Symptom Overlay Card */}
              <div className="mf-ref-ai-card">
                <div className="mf-ref-ai-header">
                  <div className="mf-ref-ai-icon">⚙️</div>
                  <div className="mf-ref-ai-title">AI Symptom Analysis</div>
                </div>

                <div className="mf-ref-ai-symptoms-lbl">Symptoms detected:</div>
                <div className="mf-ref-symptom-item">
                  <span>✓</span> Cough
                </div>
                <div className="mf-ref-symptom-item">
                  <span>✓</span> Fever
                </div>
                <div className="mf-ref-symptom-item">
                  <span>✓</span> Breathing difficulty
                </div>

                <div className="mf-ref-rec-box">
                  <div className="mf-ref-rec-lbl">Recommended Specialist</div>
                  <div className="mf-ref-rec-doctor">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🫁</span> Pediatric Pulmonologist
                    </div>
                    <span>→</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FOUR FEATURE HIGHLIGHT STRIP */}
      <section className="mf-ref-strip-sec">
        <div className="mf-ref-strip-grid">
          <div className="mf-ref-strip-item">
            <div className="mf-ref-strip-icon icon-1">👥</div>
            <div>
              <h4 className="mf-ref-strip-title">Faster Queue</h4>
              <p className="mf-ref-strip-desc">Reduce waiting time with smart queue management</p>
            </div>
          </div>

          <div className="mf-ref-strip-item">
            <div className="mf-ref-strip-icon icon-2">💻</div>
            <div>
              <h4 className="mf-ref-strip-title">AI Recommendations</h4>
              <p className="mf-ref-strip-desc">Get the right specialist based on your symptoms</p>
            </div>
          </div>

          <div className="mf-ref-strip-item">
            <div className="mf-ref-strip-icon icon-3">🛡️</div>
            <div>
              <h4 className="mf-ref-strip-title">Better Patient Flow</h4>
              <p className="mf-ref-strip-desc">Seamless journey from consultation to pharmacy</p>
            </div>
          </div>

          <div className="mf-ref-strip-item">
            <div className="mf-ref-strip-icon icon-4">💜</div>
            <div>
              <h4 className="mf-ref-strip-title">Trusted Care</h4>
              <p className="mf-ref-strip-desc">Your health, our commitment</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS (Ultra-Rich Detailed Step Cards) */}
      <section id="how-it-works" className="mf-ref-how-sec">
        <div className="mf-ref-how-grid">
          {/* Left Title */}
          <div className="mf-ref-how-left">
            <div className="mf-ref-tag-sm">HOW IT WORKS</div>
            <h2 className="mf-ref-how-h2">
              Getting the Right Care <br /> is Simple
            </h2>
            <p className="mf-ref-how-p">
              Just a few easy steps to connect you with the right doctor and get the care you need.
            </p>
            <div className="mf-ref-handwriting">Simple. Smart. Secure.</div>
          </div>

          {/* Right 4 Horizontal Step Cards with Rich Detail Boxes */}
          <div className="mf-ref-steps-grid">
            {/* Step 01 */}
            <div className="mf-ref-step-card" onClick={handleLoginClick}>
              <div className="mf-step-top-bar s1" />
              <div>
                <div className="mf-ref-step-icon-box s1">📄</div>
                <div className="mf-ref-step-num">01</div>
                <h3 className="mf-ref-step-h3">Tell Us Your Symptoms</h3>
                <p className="mf-ref-step-desc">Enter your symptoms and basic details online or via kiosk.</p>
              </div>
              <div className="mf-step-detail-box">
                <div className="mf-step-detail-header">
                  <span>Symptom Input</span>
                  <span className="mf-step-badge-tag tag1">INSTANT</span>
                </div>
                <div className="mf-step-detail-txt">e.g. Fever, Cough, Chest Pain</div>
              </div>
              <div className="mf-ref-arrow-next">→</div>
            </div>

            {/* Step 02 */}
            <div className="mf-ref-step-card" onClick={handleLoginClick}>
              <div className="mf-step-top-bar s2" />
              <div>
                <div className="mf-ref-step-icon-box s2">🧠</div>
                <div className="mf-ref-step-num">02</div>
                <h3 className="mf-ref-step-h3">AI Analysis & Triage</h3>
                <p className="mf-ref-step-desc">Our AI algorithm classifies urgency level from P1 to P5.</p>
              </div>
              <div className="mf-step-detail-box">
                <div className="mf-step-detail-header">
                  <span>AI ML Engine</span>
                  <span className="mf-step-badge-tag tag2">&lt; 2s TRIAGE</span>
                </div>
                <div className="mf-step-detail-txt">P1 Emergency to P5 Routine</div>
              </div>
              <div className="mf-ref-arrow-next">→</div>
            </div>

            {/* Step 03 */}
            <div className="mf-ref-step-card" onClick={handleLoginClick}>
              <div className="mf-step-top-bar s3" />
              <div>
                <div className="mf-ref-step-icon-box s3">👨‍⚕️</div>
                <div className="mf-ref-step-num">03</div>
                <h3 className="mf-ref-step-h3">Find Your Doctor</h3>
                <p className="mf-ref-step-desc">Matched with specialty doctor & active consultation room.</p>
              </div>
              <div className="mf-step-detail-box">
                <div className="mf-step-detail-header">
                  <span>Doctor Match</span>
                  <span className="mf-step-badge-tag tag3">LIVE CABIN</span>
                </div>
                <div className="mf-step-detail-txt">Dr. Sharma • Cardiology Cabin 1</div>
              </div>
              <div className="mf-ref-arrow-next">→</div>
            </div>

            {/* Step 04 */}
            <div className="mf-ref-step-card" onClick={handleLoginClick}>
              <div className="mf-step-top-bar s4" />
              <div>
                <div className="mf-ref-step-icon-box s4">🎫</div>
                <div className="mf-ref-step-num">04</div>
                <h3 className="mf-ref-step-h3">Join Queue & Track</h3>
                <p className="mf-ref-step-desc">Get a digital token and monitor live ETA on your phone.</p>
              </div>
              <div className="mf-step-detail-box">
                <div className="mf-step-detail-header">
                  <span>Live Queue</span>
                  <span className="mf-step-badge-tag tag4">#46 TOKEN</span>
                </div>
                <div className="mf-step-detail-txt">Serving #45 • Est. Wait: 12m</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CHOOSE YOUR SPECIALIST & EMERGENCY BANNER */}
      <section id="find-specialist" className="mf-ref-spec-sec">
        <div className="mf-ref-spec-layout">
          {/* Left Header */}
          <div className="mf-ref-spec-left">
            <div className="mf-ref-tag-sm">FIND SPECIALIST</div>
            <h2 className="mf-ref-how-h2">Choose Your Specialist</h2>
            <p className="mf-ref-how-p" style={{ marginBottom: '16px' }}>
              Browse through our medical specialties and find the right doctor for your needs.
            </p>
            <button className="mf-ref-btn-all-spec" onClick={handleLoginClick}>
              View All Specialists →
            </button>
          </div>

          {/* Center 8 Specialties Cards */}
          <div className="mf-ref-spec-grid">
            <div className="mf-ref-spec-card" onClick={handleLoginClick}>
              <div className="mf-ref-spec-icon" style={{ background: '#DBEAFE', color: '#2563EB' }}>🫁</div>
              <div>
                <div className="mf-ref-spec-name">Pulmonology</div>
                <div className="mf-ref-spec-sub">Breathing & respiratory</div>
              </div>
            </div>

            <div className="mf-ref-spec-card" onClick={handleLoginClick}>
              <div className="mf-ref-spec-icon" style={{ background: '#FFE4E6', color: '#E11D48' }}>❤️</div>
              <div>
                <div className="mf-ref-spec-name">Cardiology</div>
                <div className="mf-ref-spec-sub">Heart related</div>
              </div>
            </div>

            <div className="mf-ref-spec-card" onClick={handleLoginClick}>
              <div className="mf-ref-spec-icon" style={{ background: '#DCFCE7', color: '#16A34A' }}>🩺</div>
              <div>
                <div className="mf-ref-spec-name">Dermatology</div>
                <div className="mf-ref-spec-sub">Skin related</div>
              </div>
            </div>

            <div className="mf-ref-spec-card" onClick={handleLoginClick}>
              <div className="mf-ref-spec-icon" style={{ background: '#F3E8FF', color: '#9333EA' }}>🧠</div>
              <div>
                <div className="mf-ref-spec-name">Neurology</div>
                <div className="mf-ref-spec-sub">Brain & nervous system</div>
              </div>
            </div>

            <div className="mf-ref-spec-card" onClick={handleLoginClick}>
              <div className="mf-ref-spec-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>👂</div>
              <div>
                <div className="mf-ref-spec-name">ENT</div>
                <div className="mf-ref-spec-sub">Ear, nose & throat</div>
              </div>
            </div>

            <div className="mf-ref-spec-card" onClick={handleLoginClick}>
              <div className="mf-ref-spec-icon" style={{ background: '#E0F2FE', color: '#0284C7' }}>🦴</div>
              <div>
                <div className="mf-ref-spec-name">Orthopedics</div>
                <div className="mf-ref-spec-sub">Bones & joints</div>
              </div>
            </div>

            <div className="mf-ref-spec-card" onClick={handleLoginClick}>
              <div className="mf-ref-spec-icon" style={{ background: '#FFEDD5', color: '#EA580C' }}>👶</div>
              <div>
                <div className="mf-ref-spec-name">Pediatrics</div>
                <div className="mf-ref-spec-sub">Child healthcare</div>
              </div>
            </div>

            <div className="mf-ref-spec-card" onClick={handleLoginClick}>
              <div className="mf-ref-spec-icon" style={{ background: '#E0E7FF', color: '#4F46E5' }}>👁️</div>
              <div>
                <div className="mf-ref-spec-name">Ophthalmology</div>
                <div className="mf-ref-spec-sub">Eye care</div>
              </div>
            </div>
          </div>

          {/* Right Emergency Help Card */}
          <div className="mf-ref-emerg-card">
            <img
              src="/mediflow_emergency_stethoscope.jpg"
              alt="Emergency Stethoscope"
              className="mf-ref-emerg-bg-img"
            />
            <div style={{ position: 'relative', zIndex: 5 }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🚨</div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 8px 0' }}>
                Need Emergency Help?
              </h3>
              <p style={{ fontSize: '12.5px', opacity: 0.9, lineHeight: 1.5, margin: 0 }}>
                If you are experiencing severe symptoms, seek immediate medical attention.
              </p>
            </div>
            <button className="mf-ref-emerg-btn" onClick={handleLoginClick}>
              Get Emergency Help →
            </button>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="mf-ref-footer">
        <div className="mf-ref-footer-inner">
          <div className="mf-ref-footer-brand">
            <div style={{ width: '28px', height: '28px', background: '#0D7A73', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              +
            </div>
            <span>SmartHospital</span>
          </div>

          <div className="mf-ref-footer-links">
            {['Home', 'How It Works', 'Find Specialist', 'Services', 'About'].map((link) => (
              <a key={link} href={`#${link.toLowerCase().replace(/\s+/g, '-')}`} className="mf-ref-footer-link">
                {link}
              </a>
            ))}
          </div>

          <div style={{ fontSize: '13px', color: '#64748B' }}>
            © 2026 SmartHospital. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;