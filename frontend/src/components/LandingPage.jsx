import React, { useState, useEffect } from 'react';
import './LandingPage.css';

const LandingPage = ({ onGetStarted }) => {
  const [activeNav, setActiveNav] = useState('Home');

  useEffect(() => {
    // Handle hash on page load or navigation from other pages (e.g. /#how-it-works)
    if (window.location.hash) {
      const hashId = window.location.hash.replace('#', '');
      const targetElem = document.getElementById(hashId);
      if (targetElem) {
        setTimeout(() => {
          targetElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }
  }, []);

  const handleNavClick = (e, navItem) => {
    e.preventDefault();
    setActiveNav(navItem);

    if (navItem === 'Home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (navItem === 'About Us' || navItem === 'About') {
      const elem = document.getElementById('about');
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.location.href = '/about';
      }
      return;
    }

    if (navItem === 'Features' || navItem === 'Services') {
      const elem = document.getElementById('features') || document.getElementById('services');
      if (elem) elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    if (navItem === 'How It Works') {
      const elem = document.getElementById('how-it-works');
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    if (navItem === 'Contact Us' || navItem === 'Contact') {
      const elem = document.getElementById('contact');
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.location.href = '/contact';
      }
      return;
    }
  };

  const handleLoginClick = () => {
    if (onGetStarted) {
      onGetStarted();
    } else {
      window.location.href = '/login';
    }
  };

  const handleRegisterClick = () => {
    window.location.href = '/register';
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
              Medi<span>Flow</span> <span style={{ color: '#05CD99', fontSize: '18px', fontWeight: 800 }}>AI</span>
            </div>
            <div className="mf-ref-brand-sub">AI POWERED QUEUE &amp; PATIENT FLOW</div>
          </div>
        </a>

        {/* Center Nav Items */}
        <ul className="mf-ref-nav-links">
          {['Home', 'About Us', 'Features', 'How It Works', 'Contact Us'].map((item) => (
            <li key={item}>
              <a
                href={item === 'Contact Us' ? '/contact' : item === 'About Us' ? '/about' : `#${item.toLowerCase().replace(/\s+/g, '-')}`}
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
          <button className="mf-ref-btn-register" onClick={handleRegisterClick}>
            Register
          </button>
        </div>
      </header>

      {/* 2. HERO SECTION MATCHING SCREENSHOT EXACT LAYOUT */}
      <section id="home" className="mf-ref-hero-sec">
        <div className="mf-ref-hero-container">
          {/* Left Column: Headline & Action Buttons */}
          <div className="mf-ref-hero-left">
            {/* Pill Tag */}
            <div className="mf-ref-hero-badge">
              <span>Smarter Healthcare</span>
              <span className="mf-ref-badge-dot">•</span>
              <span>Happier Patients</span>
            </div>

            {/* Main Headline */}
            <h1 className="mf-ref-hero-headline">
              Your <span className="mf-text-dark">Health.</span><br />
              Our <span className="mf-text-teal">Priority.</span>
            </h1>

            {/* Sub-description */}
            <p className="mf-ref-hero-subtext">
              AI-powered hospital queue and patient flow management for a faster, easier and smarter healthcare experience.
            </p>

            {/* Action Buttons */}
            <div className="mf-ref-hero-btn-row">
              <button className="mf-ref-hero-btn-find" onClick={handleLoginClick}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Find My Doctor</span>
                <span className="mf-arrow-right">→</span>
              </button>

              <button
                className="mf-ref-hero-btn-track"
                onClick={() => {
                  const el = document.getElementById('how-it-works');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>Track Queue</span>
              </button>
            </div>
          </div>

          {/* Right Column: Hero Visual with Doctor-Child Photo & Floating AI Card */}
          <div className="mf-ref-hero-right">
            {/* Main Doctor & Child Image Container */}
            <div className="mf-ref-hero-img-box">
              <img
                src="/hero_doctor_child.jpg"
                alt="Doctor caring for child patient"
                className="mf-ref-hero-main-img"
              />

              {/* Better Care Every Step Doodle Tag */}
              <div className="mf-ref-doodle-tag">
                <span className="mf-doodle-text">Better Care<br />Every Step ♡</span>
              </div>

              {/* Floating AI Symptom Analysis Card */}
              <div className="mf-ref-floating-ai-card">
                <div className="mf-ai-card-header">
                  <div className="mf-ai-card-icon-box">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>
                  <span className="mf-ai-card-title">AI Symptom Analysis</span>
                </div>

                <div className="mf-ai-card-symptoms">
                  <span className="mf-ai-sub-lbl">Symptoms detected:</span>
                  <div className="mf-ai-symptom-item">
                    <span className="mf-check-green">✔</span> Cough
                  </div>
                  <div className="mf-ai-symptom-item">
                    <span className="mf-check-green">✔</span> Fever
                  </div>
                  <div className="mf-ai-symptom-item">
                    <span className="mf-check-green">✔</span> Breathing difficulty
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FOUR FEATURE HIGHLIGHT STRIP */}
      <section id="features" className="mf-ref-strip-sec">
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

      {/* 4. HOW IT WORKS (End-to-End Workflow Step-by-Step) */}
      <section id="how-it-works" className="mf-works-sec">
        <div className="mf-works-container">
          {/* Section Header */}
          <div className="mf-works-header">
            <div className="mf-works-pill-badge">END-TO-END WORKFLOW</div>
            <h2 className="mf-works-main-title">
              How MediFlow AI Works<br />
              Step-by-Step
            </h2>
            <p className="mf-works-sub-title">
              From initial login and symptom registration to queue token allocation, doctor consultation, pharmacy dispatch, and unique report generation.
            </p>
            <div className="mf-works-brand-tagline">Simple. Smart. Secure.</div>
          </div>

          {/* Main Grid: 6 Cards (Left) + Workflow Display Board (Right) */}
          <div className="mf-works-main-grid">
            {/* Left 6-Card Grid */}
            <div className="mf-works-cards-grid">
              {/* Card 01 */}
              <div className="mf-works-card border-blue" onClick={handleLoginClick}>
                <div className="mf-card-top-row">
                  <div className="mf-card-icon-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                      <polyline points="10 17 15 12 10 7" />
                      <line x1="15" y1="12" x2="3" y2="12" />
                    </svg>
                  </div>
                  <div className="mf-card-arrow-tr">↗</div>
                </div>
                <div className="mf-card-step-num">01</div>
                <h3 className="mf-card-step-title">1. Secure Portal Login</h3>
                <p className="mf-card-step-desc">
                  Patients, Doctors, Nurses, and Admins log in securely to their dedicated portals.
                </p>
                <div className="mf-card-bottom-info">
                  <div>
                    <div className="mf-card-info-lbl">Authentication</div>
                    <div className="mf-card-info-val">OAuth2 &amp; Role-Based Access Control</div>
                  </div>
                  <span className="mf-card-pill-tag tag-blue">SECURE ACCESS</span>
                </div>
              </div>

              {/* Card 02 */}
              <div className="mf-works-card border-teal" onClick={handleLoginClick}>
                <div className="mf-card-top-row">
                  <div className="mf-card-icon-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <line x1="19" y1="8" x2="19" y2="14" />
                      <line x1="22" y1="11" x2="16" y2="11" />
                    </svg>
                  </div>
                  <div className="mf-card-arrow-tr">↗</div>
                </div>
                <div className="mf-card-step-num">02</div>
                <h3 className="mf-card-step-title">2. Patient Registration</h3>
                <p className="mf-card-step-desc">
                  New patients register demographics, medical history, and emergency contact details.
                </p>
                <div className="mf-card-bottom-info">
                  <div>
                    <div className="mf-card-info-lbl">Patient Intake</div>
                    <div className="mf-card-info-val">Unique Patient ID Record Generated</div>
                  </div>
                  <span className="mf-card-pill-tag tag-teal">INSTANT PROFILE</span>
                </div>
              </div>

              {/* Card 03 */}
              <div className="mf-works-card border-purple" onClick={handleLoginClick}>
                <div className="mf-card-top-row">
                  <div className="mf-card-icon-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                  <div className="mf-card-arrow-tr">↗</div>
                </div>
                <div className="mf-card-step-num">03</div>
                <h3 className="mf-card-step-title">3. Symptoms &amp; Specialist Search</h3>
                <p className="mf-card-step-desc">
                  Input symptoms (e.g. Fever, Cough, Chest Pain) to search available department specialists.
                </p>
                <div className="mf-card-bottom-info">
                  <div>
                    <div className="mf-card-info-lbl">Symptom Assessment</div>
                    <div className="mf-card-info-val">High Fever (102°F), Cough &amp; Fatigue</div>
                  </div>
                  <span className="mf-card-pill-tag tag-purple">AI SEARCH</span>
                </div>
              </div>

              {/* Card 04 */}
              <div className="mf-works-card border-amber" onClick={handleLoginClick}>
                <div className="mf-card-top-row">
                  <div className="mf-card-icon-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="6" width="20" height="12" rx="2" />
                      <circle cx="12" cy="12" r="2" />
                      <path d="M6 12h.01M18 12h.01" />
                    </svg>
                  </div>
                  <div className="mf-card-arrow-tr">↗</div>
                </div>
                <div className="mf-card-step-num">04</div>
                <h3 className="mf-card-step-title">4. Digital Token &amp; AI Suggestion</h3>
                <p className="mf-card-step-desc">
                  System generates live digital queue token and AI suggests the exact specialist based on urgency.
                </p>
                <div className="mf-card-bottom-info">
                  <div>
                    <div className="mf-card-info-lbl">Token &amp; AI Match</div>
                    <div className="mf-card-info-val">Token #46 • Suggested: Cardiologist</div>
                  </div>
                  <span className="mf-card-pill-tag tag-amber">&lt; 2S AI TRIAGE</span>
                </div>
              </div>

              {/* Card 05 */}
              <div className="mf-works-card border-green" onClick={handleLoginClick}>
                <div className="mf-card-top-row">
                  <div className="mf-card-icon-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
                      <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
                      <circle cx="20" cy="10" r="2" />
                    </svg>
                  </div>
                  <div className="mf-card-arrow-tr">↗</div>
                </div>
                <div className="mf-card-step-num">05</div>
                <h3 className="mf-card-step-title">5. Doctor Allotment &amp; Pharmacy</h3>
                <p className="mf-card-step-desc">
                  Patients are allotted consultation cabins based on queue priority, examined, and routed to pharmacy.
                </p>
                <div className="mf-card-bottom-info">
                  <div>
                    <div className="mf-card-info-lbl">Consultation &amp; Rx</div>
                    <div className="mf-card-info-val">Cabin 03 Visit — Direct Pharmacy Rx</div>
                  </div>
                  <span className="mf-card-pill-tag tag-green">CABIN ALLOTTED</span>
                </div>
              </div>

              {/* Card 06 */}
              <div className="mf-works-card border-indigo" onClick={handleLoginClick}>
                <div className="mf-card-top-row">
                  <div className="mf-card-icon-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <path d="m9 15 2 2 4-4" />
                    </svg>
                  </div>
                  <div className="mf-card-arrow-tr">↗</div>
                </div>
                <div className="mf-card-step-num">06</div>
                <h3 className="mf-card-step-title">6. Report Form &amp; Report ID</h3>
                <p className="mf-card-step-desc">
                  Complete medical consultation report form and unique Report ID generated for instant download.
                </p>
                <div className="mf-card-bottom-info">
                  <div>
                    <div className="mf-card-info-lbl">Unique Report ID</div>
                    <div className="mf-card-info-val">Report #REP-2026-9842 • Download PDF</div>
                  </div>
                  <span className="mf-card-pill-tag tag-indigo">REPORT GENERATED</span>
                </div>
              </div>
            </div>

            {/* Right Side: WORKFLOW DISPLAY BOARD Reel Frame */}
            <div className="mf-works-board-wrapper">
              <div className="mf-works-board-device">
                {/* Board Top Header */}
                <div className="mf-board-header">
                  <div className="mf-board-title-group">
                    <span className="mf-board-status-dot" />
                    <span className="mf-board-title">WORKFLOW DISPLAY BOARD</span>
                  </div>
                  <span className="mf-board-live-pill">LIVE REEL</span>
                </div>

                {/* Vertical Smooth Scrolling Reel with Edge Blur Effect */}
                <div className="mf-board-reel-list">
                  <div className="mf-board-reel-track">
                    {/* SET 1 */}
                    <div className="mf-reel-item">
                      <div className="mf-reel-item-img-wrap">
                        <img src="/mediflow_login_hero.jpg" alt="Secure Portal Login" className="mf-reel-img" />
                        <div className="mf-reel-step-pill pill-blue">STEP 01</div>
                        <div className="mf-reel-img-overlay">
                          <span className="mf-reel-tag">LOGIN ACCESS</span>
                          <div className="mf-reel-step-name">1. Secure Portal Login Access</div>
                        </div>
                      </div>
                    </div>

                    <div className="mf-reel-item">
                      <div className="mf-reel-item-img-wrap">
                        <img src="/real_hospital_login_hero.jpg" alt="Patient Registration" className="mf-reel-img" />
                        <div className="mf-reel-step-pill pill-teal">STEP 02</div>
                        <div className="mf-reel-img-overlay">
                          <span className="mf-reel-tag">REGISTRATION</span>
                          <div className="mf-reel-step-name">2. Patient Registration &amp; Intake Profile</div>
                        </div>
                      </div>
                    </div>

                    <div className="mf-reel-item">
                      <div className="mf-reel-item-img-wrap">
                        <img src="/mediflow_emergency_stethoscope.jpg" alt="Symptom Assessment" className="mf-reel-img" />
                        <div className="mf-reel-step-pill pill-purple">STEP 03</div>
                        <div className="mf-reel-img-overlay">
                          <span className="mf-reel-tag">SYMPTOM SEARCH</span>
                          <div className="mf-reel-step-name">3. Symptom Assessment &amp; Specialist Search</div>
                        </div>
                      </div>
                    </div>

                    <div className="mf-reel-item">
                      <div className="mf-reel-item-img-wrap">
                        <img src="/mediflow_login_hero.jpg" alt="Digital Token & AI Suggestion" className="mf-reel-img" />
                        <div className="mf-reel-step-pill pill-orange">STEP 04</div>
                        <div className="mf-reel-img-overlay">
                          <span className="mf-reel-tag">DIGITAL TOKEN</span>
                          <div className="mf-reel-step-name">4. Digital Token &amp; AI Specialist Suggestion</div>
                        </div>
                      </div>
                    </div>

                    <div className="mf-reel-item">
                      <div className="mf-reel-item-img-wrap">
                        <img src="/mediflow_hero_doctor_child.jpg" alt="Doctor Allotment" className="mf-reel-img" />
                        <div className="mf-reel-step-pill pill-green">STEP 05</div>
                        <div className="mf-reel-img-overlay">
                          <span className="mf-reel-tag">DOCTOR ALLOTMENT</span>
                          <div className="mf-reel-step-name">5. Cabin Consultation &amp; Pharmacy Dispatch</div>
                        </div>
                      </div>
                    </div>

                    <div className="mf-reel-item">
                      <div className="mf-reel-item-img-wrap">
                        <img src="/real_hospital_login_hero.jpg" alt="Report Form & ID" className="mf-reel-img" />
                        <div className="mf-reel-step-pill pill-indigo">STEP 06</div>
                        <div className="mf-reel-img-overlay">
                          <span className="mf-reel-tag">DIGITAL REPORT</span>
                          <div className="mf-reel-step-name">6. Report Form &amp; Unique Report ID</div>
                        </div>
                      </div>
                    </div>

                    {/* SET 2 (Exact Duplicate for Continuous Loop) */}
                    <div className="mf-reel-item" aria-hidden="true">
                      <div className="mf-reel-item-img-wrap">
                        <img src="/mediflow_login_hero.jpg" alt="Secure Portal Login" className="mf-reel-img" />
                        <div className="mf-reel-step-pill pill-blue">STEP 01</div>
                        <div className="mf-reel-img-overlay">
                          <span className="mf-reel-tag">LOGIN ACCESS</span>
                          <div className="mf-reel-step-name">1. Secure Portal Login Access</div>
                        </div>
                      </div>
                    </div>

                    <div className="mf-reel-item" aria-hidden="true">
                      <div className="mf-reel-item-img-wrap">
                        <img src="/real_hospital_login_hero.jpg" alt="Patient Registration" className="mf-reel-img" />
                        <div className="mf-reel-step-pill pill-teal">STEP 02</div>
                        <div className="mf-reel-img-overlay">
                          <span className="mf-reel-tag">REGISTRATION</span>
                          <div className="mf-reel-step-name">2. Patient Registration &amp; Intake Profile</div>
                        </div>
                      </div>
                    </div>

                    <div className="mf-reel-item" aria-hidden="true">
                      <div className="mf-reel-item-img-wrap">
                        <img src="/mediflow_emergency_stethoscope.jpg" alt="Symptom Assessment" className="mf-reel-img" />
                        <div className="mf-reel-step-pill pill-purple">STEP 03</div>
                        <div className="mf-reel-img-overlay">
                          <span className="mf-reel-tag">SYMPTOM SEARCH</span>
                          <div className="mf-reel-step-name">3. Symptom Assessment &amp; Specialist Search</div>
                        </div>
                      </div>
                    </div>

                    <div className="mf-reel-item" aria-hidden="true">
                      <div className="mf-reel-item-img-wrap">
                        <img src="/mediflow_login_hero.jpg" alt="Digital Token & AI Suggestion" className="mf-reel-img" />
                        <div className="mf-reel-step-pill pill-orange">STEP 04</div>
                        <div className="mf-reel-img-overlay">
                          <span className="mf-reel-tag">DIGITAL TOKEN</span>
                          <div className="mf-reel-step-name">4. Digital Token &amp; AI Specialist Suggestion</div>
                        </div>
                      </div>
                    </div>

                    <div className="mf-reel-item" aria-hidden="true">
                      <div className="mf-reel-item-img-wrap">
                        <img src="/mediflow_hero_doctor_child.jpg" alt="Doctor Allotment" className="mf-reel-img" />
                        <div className="mf-reel-step-pill pill-green">STEP 05</div>
                        <div className="mf-reel-img-overlay">
                          <span className="mf-reel-tag">DOCTOR ALLOTMENT</span>
                          <div className="mf-reel-step-name">5. Cabin Consultation &amp; Pharmacy Dispatch</div>
                        </div>
                      </div>
                    </div>

                    <div className="mf-reel-item" aria-hidden="true">
                      <div className="mf-reel-item-img-wrap">
                        <img src="/real_hospital_login_hero.jpg" alt="Report Form & ID" className="mf-reel-img" />
                        <div className="mf-reel-step-pill pill-indigo">STEP 06</div>
                        <div className="mf-reel-img-overlay">
                          <span className="mf-reel-tag">DIGITAL REPORT</span>
                          <div className="mf-reel-step-name">6. Report Form &amp; Unique Report ID</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CHOOSE YOUR SPECIALIST (ORBITAL RADIAL DESIGN) */}
      <section id="find-specialist" className="mf-spec-radial-sec">
        {/* Subtle decorative background glow and ECG pulse */}
        <div className="mf-spec-bg-glow"></div>
        <div className="mf-spec-bg-ecg"></div>

        <div className="mf-spec-container">
          {/* Left Column: Heading, Subtext, Search Box, Trust Badges */}
          <div className="mf-spec-left-content">
            {/* Badge pill */}
            <div className="mf-spec-pill-badge">
              <svg className="mf-pill-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
                <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
                <circle cx="20" cy="10" r="2" />
              </svg>
              <span>Smart Specialist Finder</span>
            </div>

            {/* Main Heading */}
            <h2 className="mf-spec-hero-title">
              Find the Right<br />
              Specialist,<br />
              <span className="mf-spec-title-accent">For Your Better<br />Health</span>
            </h2>

            {/* Subtitle */}
            <p className="mf-spec-hero-desc">
              Connect with trusted doctors and healthcare specialists. Get the right care, at the right time.
            </p>

            {/* Search Bar Input */}
            <div className="mf-spec-search-bar" onClick={handleLoginClick}>
              <div className="mf-spec-search-left">
                <svg className="mf-spec-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  placeholder="Search specialist, symptoms or department..."
                  className="mf-spec-search-input"
                  readOnly
                />
              </div>
              <button type="button" className="mf-spec-search-submit-btn" aria-label="Search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>

            {/* Feature/Trust Badges */}
            <div className="mf-spec-trust-row">
              <div className="mf-spec-trust-item">
                <div className="mf-spec-trust-icon-box blue-theme">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="10" y1="10" x2="14" y2="10"></line>
                  </svg>
                </div>
                <div className="mf-spec-trust-text">
                  <strong>Trusted</strong>
                  <span>Doctors</span>
                </div>
              </div>

              <div className="mf-spec-trust-divider"></div>

              <div className="mf-spec-trust-item">
                <div className="mf-spec-trust-icon-box cyan-theme">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                    <circle cx="8" cy="14" r="1"></circle>
                    <circle cx="12" cy="14" r="1"></circle>
                    <circle cx="16" cy="14" r="1"></circle>
                  </svg>
                </div>
                <div className="mf-spec-trust-text">
                  <strong>Easy</strong>
                  <span>Appointments</span>
                </div>
              </div>

              <div className="mf-spec-trust-divider"></div>

              <div className="mf-spec-trust-item">
                <div className="mf-spec-trust-icon-box purple-theme">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </div>
                <div className="mf-spec-trust-text">
                  <strong>Quality</strong>
                  <span>Care</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Orbital Circular Arrangement of Specialists */}
          <div className="mf-spec-orbital-wrap">
            {/* Concentric subtle background orbit rings */}
            <div className="mf-spec-orbit-ring outer"></div>
            <div className="mf-spec-orbit-ring middle"></div>
            <div className="mf-spec-orbit-ring inner"></div>

            {/* Central Master Circle */}
            <div className="mf-spec-center-hub" onClick={handleLoginClick}>
              <div className="mf-spec-center-avatar-wrap">
                <svg className="mf-spec-center-doc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4"></circle>
                  <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"></path>
                  <path d="M9 13v2a3 3 0 0 0 6 0v-2"></path>
                  <line x1="19" y1="5" x2="23" y2="5"></line>
                  <line x1="21" y1="3" x2="21" y2="7"></line>
                </svg>
              </div>
              <h3 className="mf-spec-center-title">Find Your<br />Specialist</h3>
              <span className="mf-spec-center-sub">Explore 50+ Specialists</span>
              <div className="mf-spec-center-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </div>

            {/* Orbiting Specialist Cards - 7 Items positioned radially around the hub */}

            {/* 1. Pulmonology - Top (12 o'clock) */}
            <div className="mf-spec-orbit-node pos-top" onClick={handleLoginClick}>
              <div className="mf-node-icon-circle blue-light">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 4v16a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3z"></path>
                  <path d="M18 4v16a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z"></path>
                  <line x1="12" y1="2" x2="12" y2="8"></line>
                  <line x1="12" y1="8" x2="8" y2="12"></line>
                  <line x1="12" y1="8" x2="16" y2="12"></line>
                </svg>
              </div>
              <div className="mf-node-name">Pulmonology</div>
              <div className="mf-node-count">8 Specialists</div>
            </div>

            {/* 2. Cardiology - Top Left (~10 o'clock) */}
            <div className="mf-spec-orbit-node pos-top-left" onClick={handleLoginClick}>
              <div className="mf-node-icon-circle purple-soft">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  <polyline points="7 12 10 12 11 9 13 15 14 12 17 12"></polyline>
                </svg>
              </div>
              <div className="mf-node-name">Cardiology</div>
              <div className="mf-node-count">12 Specialists</div>
            </div>

            {/* 3. Neurology - Top Right (~2 o'clock) */}
            <div className="mf-spec-orbit-node pos-top-right" onClick={handleLoginClick}>
              <div className="mf-node-icon-circle blue-violet">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04"></path>
                  <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04"></path>
                </svg>
              </div>
              <div className="mf-node-name">Neurology</div>
              <div className="mf-node-count">10 Specialists</div>
            </div>

            {/* 4. Orthopedics - Far Left (~9 o'clock) */}
            <div className="mf-spec-orbit-node pos-mid-left" onClick={handleLoginClick}>
              <div className="mf-node-icon-circle teal-soft">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3.34a10 10 0 1 1-14.995 8.984L2 12l.005-.324A10 10 0 0 1 17 3.34zm-7.5 4.16a1.5 1.5 0 0 0-1.493 1.356L8 9a1.5 1.5 0 0 0 2.993.144L11 9a1.5 1.5 0 0 0-1.5-1.5zm5 0a1.5 1.5 0 0 0-1.493 1.356L13 9a1.5 1.5 0 0 0 2.993.144L16 9a1.5 1.5 0 0 0-1.5-1.5z"></path>
                  <path d="m18 6-8.5 8.5a2.121 2.121 0 0 1-3-3L15 3"></path>
                  <circle cx="5" cy="19" r="2"></circle>
                  <circle cx="19" cy="5" r="2"></circle>
                </svg>
              </div>
              <div className="mf-node-name">Orthopedics</div>
              <div className="mf-node-count">9 Specialists</div>
            </div>

            {/* 5. Pediatrics - Far Right (~3 o'clock) */}
            <div className="mf-spec-orbit-node pos-mid-right" onClick={handleLoginClick}>
              <div className="mf-node-icon-circle red-soft">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9"></circle>
                  <path d="M9 10h.01"></path>
                  <path d="M15 10h.01"></path>
                  <path d="M10 15a2 2 0 0 0 4 0"></path>
                  <path d="M12 3a2 2 0 0 0 2 2"></path>
                </svg>
              </div>
              <div className="mf-node-name">Pediatrics</div>
              <div className="mf-node-count">11 Specialists</div>
            </div>

            {/* 6. Gynecology - Bottom Left (~7 o'clock) */}
            <div className="mf-spec-orbit-node pos-bot-left" onClick={handleLoginClick}>
              <div className="mf-node-icon-circle pink-soft">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="5"></circle>
                  <line x1="12" y1="13" x2="12" y2="21"></line>
                  <line x1="9" y1="17" x2="15" y2="17"></line>
                  <path d="M8 8a4 4 0 0 1 8 0"></path>
                </svg>
              </div>
              <div className="mf-node-name">Gynecology</div>
              <div className="mf-node-count">7 Specialists</div>
            </div>

            {/* 7. Dermatology - Bottom Center (~6 o'clock) */}
            <div className="mf-spec-orbit-node pos-bot-center" onClick={handleLoginClick}>
              <div className="mf-node-icon-circle sky-soft">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v6"></path>
                  <path d="M9 8h6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z"></path>
                  <line x1="10" y1="14" x2="14" y2="14"></line>
                </svg>
              </div>
              <div className="mf-node-name">Dermatology</div>
              <div className="mf-node-count">6 Specialists</div>
            </div>

            {/* 8. Dentistry - Bottom Right (~5 o'clock) */}
            <div className="mf-spec-orbit-node pos-bot-right" onClick={handleLoginClick}>
              <div className="mf-node-icon-circle cyan-soft">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 4.5c-4 0-6 2.5-6 6.5 0 4 1.5 9 3 10s3-2 3-4c0 2 1.5 5 3 4s3-6 3-10c0-4-2-6.5-6-6.5z"></path>
                </svg>
              </div>
              <div className="mf-node-name">Dentistry</div>
              <div className="mf-node-count">8 Specialists</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SERVICES SECTION */}
      <section id="services" className="mf-ref-services-sec">
        <div className="mf-ref-services-container">
          <div className="mf-services-pill-badge">
            <span className="mf-services-pill-dot">●</span>
            <span>OUR CLINICAL SERVICES</span>
          </div>
          <h2 className="mf-services-main-heading">
            Comprehensive AI Solutions <br />
            <span className="mf-services-heading-accent">for Modern Healthcare</span>
          </h2>
          <p className="mf-services-sub-desc">
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
            <div className="mf-about-pill-badge">
              <span className="mf-about-pill-dot">●</span>
              <span>ABOUT MEDIFLOW AI</span>
            </div>
            <h2 className="mf-about-main-heading">
              Revolutionizing Patient Experience <br />
              <span className="mf-about-heading-accent">&amp; Hospital Flow</span>
            </h2>
            <p className="mf-about-sub-desc">
              MediFlow AI is an intelligent healthcare operational platform designed to reduce emergency room wait times, streamline doctor consultations, and optimize patient triage using advanced AI algorithms.
            </p>
          </div>

          {/* Medical Oriented Health Tips & Clinical Wellness Facts */}
          <div className="mf-ref-about-stats-grid">
            <div className="mf-ref-about-stat-card">
              <div className="text-2xl mb-1">💧</div>
              <div className="mf-ref-about-stat-num" style={{ fontSize: '18px', color: '#2563EB' }}>Optimal Hydration</div>
              <div className="mf-ref-about-stat-label" style={{ marginTop: '6px', lineHeight: '1.4' }}>
                Drinking 2.5L to 3L of water daily enhances renal filtration and cellular immunity by up to 25%.
              </div>
            </div>

            <div className="mf-ref-about-stat-card">
              <div className="text-2xl mb-1">🫀</div>
              <div className="mf-ref-about-stat-num" style={{ fontSize: '18px', color: '#EF4444' }}>Cardiovascular Health</div>
              <div className="mf-ref-about-stat-label" style={{ marginTop: '6px', lineHeight: '1.4' }}>
                30 minutes of brisk walking lowers resting systolic blood pressure and reduces cardiac risk by 35%.
              </div>
            </div>

            <div className="mf-ref-about-stat-card">
              <div className="text-2xl mb-1">🧠</div>
              <div className="mf-ref-about-stat-num" style={{ fontSize: '18px', color: '#8B5CF6' }}>Circadian Sleep Cycles</div>
              <div className="mf-ref-about-stat-label" style={{ marginTop: '6px', lineHeight: '1.4' }}>
                7 to 8 hours of uninterrupted sleep accelerates neural detoxification and memory consolidation.
              </div>
            </div>

            <div className="mf-ref-about-stat-card">
              <div className="text-2xl mb-1">🥗</div>
              <div className="mf-ref-about-stat-num" style={{ fontSize: '18px', color: '#10B981' }}>Nutritional Balance</div>
              <div className="mf-ref-about-stat-label" style={{ marginTop: '6px', lineHeight: '1.4' }}>
                High-fiber, antioxidant-rich foods balance gut microbiome diversity and regulate glycemic index.
              </div>
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

      {/* 8. REDESIGNED ENTERPRISE FOOTER */}
      <footer className="mf-modern-footer">
        <div className="mf-footer-container">
          {/* Main 4-Column Grid */}
          <div className="mf-footer-main-grid">
            {/* Column 1: Brand Info & Mission */}
            <div className="mf-footer-col mf-footer-brand-col">
              <div className="mf-footer-brand-header">
                <img
                  src="/mediflow_logo.svg"
                  alt="MediFlow AI Logo"
                  className="mf-footer-logo-img"
                />
                <div>
                  <div className="mf-footer-brand-name">
                    Medi<span>Flow</span> <span className="mf-brand-ai-badge">AI</span>
                  </div>
                  <div className="mf-footer-brand-tagline">Smart Hospital Queue &amp; Patient Flow</div>
                </div>
              </div>
              <p className="mf-footer-about-text">
                Next-generation clinical orchestration platform empowering hospitals with automated triage, real-time doctor matching, and intelligent digital queue management.
              </p>
              <div className="mf-footer-badge-row">
                <span className="mf-footer-cert-badge">🛡️ HIPAA Compliant</span>
                <span className="mf-footer-cert-badge">⚡ 99.9% Uptime</span>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="mf-footer-col">
              <h4 className="mf-footer-heading">Platform Navigation</h4>
              <ul className="mf-footer-list">
                <li><a href="#home" onClick={(e) => handleNavClick(e, 'Home')}>Home Dashboard</a></li>
                <li><a href="#how-it-works" onClick={(e) => handleNavClick(e, 'How It Works')}>How It Works</a></li>
                <li><a href="#find-specialist" onClick={(e) => handleNavClick(e, 'Features')}>Find Specialists</a></li>
                <li><a href="#services" onClick={(e) => handleNavClick(e, 'Services')}>Clinical Services</a></li>
                <li><a href="#about" onClick={(e) => handleNavClick(e, 'About Us')}>About MediFlow AI</a></li>
              </ul>
            </div>

            {/* Column 3: Clinical Portals */}
            <div className="mf-footer-col">
              <h4 className="mf-footer-heading">Clinical Portals</h4>
              <ul className="mf-footer-list">
                <li><a href="/login" onClick={handleLoginClick}>Patient Queue Portal</a></li>
                <li><a href="/login" onClick={handleLoginClick}>Doctor Consultation Desk</a></li>
                <li><a href="/nurse/login">Nurse Triage Station</a></li>
                <li><a href="/login" onClick={handleLoginClick}>Hospital Administration</a></li>
                <li><a href="/login" onClick={handleLoginClick}>Live Pharmacy Token</a></li>
              </ul>
            </div>

            {/* Column 4: Hospital Contact & Support */}
            <div className="mf-footer-col">
              <h4 className="mf-footer-heading">Hospital Contact</h4>
              <div className="mf-footer-contact-items">
                <div className="mf-footer-contact-item">
                  <span className="mf-contact-icon">📍</span>
                  <span>MediFlow Smart Health Center, Clinical Tech Park, Chennai - 600001</span>
                </div>
                <div className="mf-footer-contact-item">
                  <span className="mf-contact-icon">📞</span>
                  <span>Emergency Hotline: <strong className="text-white">+91 1800-425-FLOW</strong></span>
                </div>
                <div className="mf-footer-contact-item">
                  <span className="mf-contact-icon">✉️</span>
                  <span>support@mediflow.ai</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright & Legal Strip */}
          <div className="mf-footer-bottom-bar">
            <div className="mf-footer-copy">
              © 2026 <strong>MediFlow AI</strong>. Transforming Healthcare with Smart Queue Intelligence. All rights reserved.
            </div>
            <div className="mf-footer-legal-links">
              <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
              <span className="mf-footer-sep">•</span>
              <a href="#terms" onClick={(e) => e.preventDefault()}>Terms of Service</a>
              <span className="mf-footer-sep">•</span>
              <a href="#security" onClick={(e) => e.preventDefault()}>Security &amp; Compliance</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
