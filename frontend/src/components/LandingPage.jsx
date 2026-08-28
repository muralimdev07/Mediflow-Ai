import React, { useState } from 'react';
import './LandingPage.css';

const LandingPage = ({ onGetStarted }) => {
  const [activeNav, setActiveNav] = useState('Home');

  const handleNavClick = (e, navItem) => {
    e.preventDefault();
    setActiveNav(navItem);
    if (navItem === 'About') {
      window.location.href = '/about';
      return;
    }
    const targetId = navItem.toLowerCase().replace(/\s+/g, '-');
    const elem = document.getElementById(targetId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
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
          <img
            src="/mediflow_logo.svg"
            alt="MediFlow AI Logo"
            className="mf-ref-logo-img"
            style={{ width: '40px', height: '40px' }}
          />
          <div>
            <div className="mf-ref-brand-title">
              Medi<span>Flow</span> AI
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

      {/* 2. HERO SECTION (Exact Match to User Screenshot Banner Ratio & Alignment) */}
      <section id="home" className="mf-screenshot-hero-sec">
        {/* Full-Width Hero Background Image (Clean Architectural Smart Hospital Reception) */}
        <img
          src="/real_hospital_login_hero.jpg"
          alt="Smart Hospital Reception and Digital Queue Lobby"
          className="mf-screenshot-hero-bg-img"
        />

        {/* Gradient Overlay for Crisp Text Contrast */}
        <div className="mf-screenshot-hero-overlay" />

        <div className="mf-screenshot-hero-container">
          {/* LEFT CONTENT AREA */}
          <div className="mf-screenshot-hero-left">
            <div className="mf-screenshot-pill">
              Smarter Healthcare • Happier Patients
            </div>

            <h1 className="mf-screenshot-hero-title">
              Your Health.<br />
              <span>Our Priority.</span>
            </h1>

            <p className="mf-screenshot-hero-sub">
              AI-powered hospital queue and patient flow management for a faster, easier and smarter healthcare experience.
            </p>

            <div className="mf-screenshot-hero-btns">
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

          {/* CENTER HANDWRITTEN QUOTE OVER DOCTOR */}
          <div className="mf-screenshot-handwritten-quote">
            Better Care Every Step ♡
          </div>

          {/* RIGHT FLOATING AI SYMPTOM ANALYSIS GLASS CARD */}
          <div className="mf-screenshot-ai-card">
            <div className="mf-ai-card-header">
              <div className="mf-ai-card-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2v20M2 12h20"/>
                </svg>
              </div>
              <div className="mf-ai-card-title">AI Symptom Analysis</div>
            </div>

            <div className="mf-ai-detected-lbl">Symptoms detected:</div>
            <ul className="mf-ai-symptoms-list">
              <li><span className="mf-check-green">✓</span> Cough</li>
              <li><span className="mf-check-green">✓</span> Fever</li>
              <li><span className="mf-check-green">✓</span> Breathing difficulty</li>
            </ul>

            <div className="mf-ai-rec-box">
              <div className="mf-ai-rec-lbl">Recommended Specialist</div>
              <div className="mf-ai-rec-item" onClick={handleLoginClick}>
                <div className="mf-ai-spec-icon">🫁</div>
                <div className="mf-ai-spec-text">Pediatric Pulmonologist</div>
                <div className="mf-ai-spec-arrow">→</div>
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

      {/* 4. HOW IT WORKS (Reference Image Editorial Asymmetrical Composition) */}
      <section id="how-it-works" className="mf-ref-how-sec">
        <div className="mf-ref-how-grid">
          {/* Left Title & Steps */}
          <div className="mf-ref-how-left">
            <div className="mf-ref-tag-sm">HOW IT WORKS</div>
            <h2 className="mf-ref-how-h2">
              Getting the Right Care <br /> is Simple
            </h2>
            <p className="mf-ref-how-p">
              Just a few easy steps to connect you with the right doctor and get the care you need.
            </p>
            <div className="mf-ref-handwriting">Simple. Smart. Secure.</div>

            {/* Step Cards Stack */}
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

          {/* Right Side: Reference Image Asymmetrical Diamond Photo Grid */}
          <div className="mf-ref-diamond-wrapper">
            <div className="mf-ref-diamond-grid">
              {/* Diamond 1 - Patient Arrival & Digital Registration */}
              <div className="mf-ref-diamond-card d-top">
                <img
                  src="/real_hospital_login_hero.jpg"
                  alt="Smart hospital reception and patient registration flow"
                />
                <div className="mf-ref-diamond-overlay">
                  <span>Patient Check-In</span>
                </div>
              </div>

              {/* Diamond 2 - Smart Queue & Digital Token Screen */}
              <div className="mf-ref-diamond-card d-right">
                <img
                  src="/mediflow_login_hero.jpg"
                  alt="Smart hospital queue display screen and waiting area"
                />
                <div className="mf-ref-diamond-overlay">
                  <span>Digital Token Queue</span>
                </div>
              </div>

              {/* Diamond 3 - Doctor Consultation & Care Flow */}
              <div className="mf-ref-diamond-card d-bottom">
                <img
                  src="/mediflow_login_hero.jpg"
                  alt="Smart hospital consultation and clinical flow"
                />
                <div className="mf-ref-diamond-overlay">
                  <span>Doctor Consultation</span>
                </div>
              </div>

              {/* Diamond 4 - Real-time Hospital Triage Care */}
              <div className="mf-ref-diamond-card d-left">
                <img
                  src="/mediflow_emergency_stethoscope.jpg"
                  alt="Real-time triage and patient flow management"
                />
                <div className="mf-ref-diamond-overlay">
                  <span>AI Triage System</span>
                </div>
              </div>

              {/* Center Floating Emblem (Reference Image Style) */}
              <div className="mf-ref-diamond-center-emblem">
                <div className="mf-emblem-inner">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 10.5H16.83L15.41 4.82C15.22 4.07 14.28 3.96 13.91 4.65L10.3 11.45L9.17 9.19C8.94 8.73 8.35 8.5 7.85 8.7L5 9.84V3H3V21H5V12.33L7.14 11.46L9.12 15.42C9.33 15.84 9.87 16.08 10.32 15.96C10.77 15.84 11.1 15.44 11.14 14.98L12.56 9.3L13.98 12.18C14.17 12.57 14.56 12.82 15 12.82H19V10.5Z" fill="#F3C969"/>
                  </svg>
                  <span>MediFlow AI</span>
                </div>
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
              <div className="mf-ref-spec-icon" style={{ background: 'rgba(37, 99, 235, 0.15)', color: '#60A5FA' }}>🫁</div>
              <div>
                <div className="mf-ref-spec-name">Pulmonology</div>
                <div className="mf-ref-spec-sub">Breathing & respiratory</div>
              </div>
            </div>

            <div className="mf-ref-spec-card" onClick={handleLoginClick}>
              <div className="mf-ref-spec-icon" style={{ background: 'rgba(225, 29, 72, 0.15)', color: '#F43F5E' }}>❤️</div>
              <div>
                <div className="mf-ref-spec-name">Cardiology</div>
                <div className="mf-ref-spec-sub">Heart related</div>
              </div>
            </div>

            <div className="mf-ref-spec-card" onClick={handleLoginClick}>
              <div className="mf-ref-spec-icon" style={{ background: 'rgba(22, 163, 74, 0.15)', color: '#4ADE80' }}>🩺</div>
              <div>
                <div className="mf-ref-spec-name">Dermatology</div>
                <div className="mf-ref-spec-sub">Skin related</div>
              </div>
            </div>

            <div className="mf-ref-spec-card" onClick={handleLoginClick}>
              <div className="mf-ref-spec-icon" style={{ background: 'rgba(147, 51, 234, 0.15)', color: '#C084FC' }}>🧠</div>
              <div>
                <div className="mf-ref-spec-name">Neurology</div>
                <div className="mf-ref-spec-sub">Brain & nervous system</div>
              </div>
            </div>

            <div className="mf-ref-spec-card" onClick={handleLoginClick}>
              <div className="mf-ref-spec-icon" style={{ background: 'rgba(217, 119, 6, 0.15)', color: '#FBBF24' }}>👂</div>
              <div>
                <div className="mf-ref-spec-name">ENT</div>
                <div className="mf-ref-spec-sub">Ear, nose & throat</div>
              </div>
            </div>

            <div className="mf-ref-spec-card" onClick={handleLoginClick}>
              <div className="mf-ref-spec-icon" style={{ background: 'rgba(2, 132, 199, 0.15)', color: '#38BDF8' }}>🦴</div>
              <div>
                <div className="mf-ref-spec-name">Orthopedics</div>
                <div className="mf-ref-spec-sub">Bones & joints</div>
              </div>
            </div>

            <div className="mf-ref-spec-card" onClick={handleLoginClick}>
              <div className="mf-ref-spec-icon" style={{ background: 'rgba(234, 88, 12, 0.15)', color: '#FB923C' }}>👶</div>
              <div>
                <div className="mf-ref-spec-name">Pediatrics</div>
                <div className="mf-ref-spec-sub">Child healthcare</div>
              </div>
            </div>

            <div className="mf-ref-spec-card" onClick={handleLoginClick}>
              <div className="mf-ref-spec-icon" style={{ background: 'rgba(79, 70, 229, 0.15)', color: '#818CF8' }}>👁️</div>
              <div>
                <div className="mf-ref-spec-name">Ophthalmology</div>
                <div className="mf-ref-spec-sub">Eye care</div>
              </div>
            </div>
          </div>

          {/* Right Emergency Help Card (Reference Glassmorphic Feature Overlay) */}
          <div className="mf-ref-emerg-card">
            <img
              src="/mediflow_emergency_stethoscope.jpg"
              alt="Smart Hospital Emergency Triage Care"
              className="mf-ref-emerg-bg-img"
            />
            <div style={{ position: 'relative', zIndex: 5 }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🚨</div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 8px 0', color: '#FFFFFF' }}>
                Need Emergency Help?
              </h3>
              <p style={{ fontSize: '12.5px', opacity: 0.9, lineHeight: 1.5, margin: 0, color: '#CBD5E1' }}>
                If you are experiencing severe symptoms, seek immediate medical attention.
              </p>
            </div>
            <button className="mf-ref-emerg-btn" onClick={handleLoginClick}>
              Get Emergency Help →
            </button>
          </div>
        </div>
      </section>

      {/* 6. SERVICES SECTION */}
      <section id="services" className="mf-ref-services-sec">
        <div className="mf-ref-services-container">
          <div className="mf-ref-tag-sm" style={{ margin: '0 auto 12px auto', width: 'fit-content' }}>OUR SERVICES</div>
          <h2 className="mf-ref-how-h2" style={{ textAlign: 'center' }}>
            Comprehensive AI Solutions <br /> for Modern Healthcare
          </h2>
          <p className="mf-ref-how-p" style={{ textAlign: 'center', maxWidth: '680px', margin: '12px auto 0 auto' }}>
            Discover how MediFlow AI automates patient flow, enhances clinical productivity, and streamlines hospital operations from check-in to discharge.
          </p>

          <div className="mf-ref-services-grid">
            <div className="mf-ref-service-card">
              <div className="mf-ref-service-icon-box" style={{ background: 'rgba(37, 99, 235, 0.15)', color: '#60A5FA' }}>🩺</div>
              <h3 className="mf-ref-service-h3">Smart Symptom Triage</h3>
              <p className="mf-ref-service-p">
                Automated intake system classifying urgency levels (P1 to P5) using machine learning models to prioritize critical care.
              </p>
            </div>

            <div className="mf-ref-service-card">
              <div className="mf-ref-service-icon-box" style={{ background: 'rgba(22, 163, 74, 0.15)', color: '#4ADE80' }}>⚡</div>
              <h3 className="mf-ref-service-h3">Live Queue Tracking</h3>
              <p className="mf-ref-service-p">
                Real-time digital token tracking and SMS queue alerts so patients can wait comfortably without crowding reception areas.
              </p>
            </div>

            <div className="mf-ref-service-card">
              <div className="mf-ref-service-icon-box" style={{ background: 'rgba(147, 51, 234, 0.15)', color: '#C084FC' }}>🏥</div>
              <h3 className="mf-ref-service-h3">Room & Bed Management</h3>
              <p className="mf-ref-service-p">
                Dynamic allocation of consultation cabins, OPD rooms, and ICU beds to eliminate operational bottlenecks.
              </p>
            </div>

            <div className="mf-ref-service-card">
              <div className="mf-ref-service-icon-box" style={{ background: 'rgba(217, 119, 6, 0.15)', color: '#FBBF24' }}>💳</div>
              <h3 className="mf-ref-service-h3">Automated Billing & Rx</h3>
              <p className="mf-ref-service-p">
                Direct integration between doctors, pharmacy counters, and payment gateways for instant invoice generation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. ABOUT US SECTION */}
      <section id="about" className="mf-ref-about-sec">
        <div className="mf-ref-about-container">
          <div className="mf-ref-about-header">
            <div className="mf-ref-tag-sm" style={{ margin: '0 auto 12px auto', width: 'fit-content' }}>ABOUT MEDIFLOW AI</div>
            <h2 className="mf-ref-how-h2" style={{ textAlign: 'center' }}>
              Revolutionizing Patient Experience <br /> & Hospital Flow
            </h2>
            <p className="mf-ref-how-p" style={{ textAlign: 'center', maxWidth: '720px', margin: '12px auto 0 auto' }}>
              MediFlow AI is an intelligent healthcare operational platform designed to reduce emergency room wait times, streamline doctor consultations, and optimize patient triage using advanced AI algorithms.
            </p>
          </div>

          <div className="mf-ref-about-stats-grid">
            <div className="mf-ref-about-stat-card">
              <div className="mf-ref-about-stat-num">99.8%</div>
              <div className="mf-ref-about-stat-label">Triage Accuracy Rate</div>
            </div>
            <div className="mf-ref-about-stat-card">
              <div className="mf-ref-about-stat-num">&lt; 12m</div>
              <div className="mf-ref-about-stat-label">Avg Hospital Wait Time</div>
            </div>
            <div className="mf-ref-about-stat-card">
              <div className="mf-ref-about-stat-num">500k+</div>
              <div className="mf-ref-about-stat-label">Patients Streamlined</div>
            </div>
            <div className="mf-ref-about-stat-card">
              <div className="mf-ref-about-stat-num">50+</div>
              <div className="mf-ref-about-stat-label">Hospitals & Clinics</div>
            </div>
          </div>

          <div className="mf-ref-about-grid">
            <div className="mf-ref-about-card">
              <div className="mf-ref-about-icon shadow-teal">🎯</div>
              <h3 className="mf-ref-about-card-title">Our Mission</h3>
              <p className="mf-ref-about-card-desc">
                To eliminate chaotic waiting rooms and ensure every patient receives prioritized, high-quality healthcare treatment precisely when they need it most.
              </p>
            </div>

            <div className="mf-ref-about-card">
              <div className="mf-ref-about-icon shadow-blue">🤖</div>
              <h3 className="mf-ref-about-card-title">Smart AI Triage</h3>
              <p className="mf-ref-about-card-desc">
                Our machine learning algorithms evaluate patient symptoms in real time, assigning dynamic urgency levels (P1 to P5) to optimize doctor allocation.
              </p>
            </div>

            <div className="mf-ref-about-card">
              <div className="mf-ref-about-icon shadow-purple">⚡</div>
              <h3 className="mf-ref-about-card-title">Real-Time Queue Tracking</h3>
              <p className="mf-ref-about-card-desc">
                Live digital tokens and SMS notifications allow patients to track their position in queue, reducing anxiety and preventing overcrowded waiting areas.
              </p>
            </div>

            <div className="mf-ref-about-card">
              <div className="mf-ref-about-icon shadow-emerald">🛡️</div>
              <h3 className="mf-ref-about-card-title">Enterprise Security & Compliance</h3>
              <p className="mf-ref-about-card-desc">
                Built with HIPAA-compliant data security, end-to-end encryption, and seamless integration capabilities with existing EHR and hospital management systems.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="mf-ref-footer">
        <div className="mf-ref-footer-inner">
          <div className="mf-ref-footer-brand">
            <img
              src="/mediflow_logo.svg"
              alt="MediFlow AI Logo"
              style={{ width: '32px', height: '32px' }}
            />
            <span>MediFlow AI</span>
          </div>

          <div className="mf-ref-footer-links">
            {['Home', 'How It Works', 'Find Specialist', 'Services', 'About'].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                className="mf-ref-footer-link"
                onClick={(e) => handleNavClick(e, link)}
              >
                {link}
              </a>
            ))}
          </div>

          <div style={{ fontSize: '13px', color: '#64748B' }}>
            © 2026 MediFlow AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;