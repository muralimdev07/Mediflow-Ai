import React from 'react';
import { Navbar } from './Navbar/Navbar';
import './LandingPage.css';

const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="mf-landing-page">
      {/* 1. NAVBAR (Exact Standalone MediFlow AI Navbar) */}
      <Navbar onGetStarted={onGetStarted} />

      {/* 2. HERO SECTION */}
      <section id="home" className="mf-hero-section">
        <div className="mf-hero-badge">
          <span className="mf-pulse-green"></span>
          Smart Healthcare Platform
        </div>

        <h1 className="mf-hero-title">
          Smart Hospital Queue & <br />
          <span className="gradient-text">Patient Flow Management</span>
        </h1>

        <p className="mf-hero-subtitle">
          Eliminate crowded waiting rooms with automated AI triage routing, real-time token tracking, and instant digital check-ins.
        </p>

        <div className="mf-hero-actions">
          <button onClick={onGetStarted} className="mf-btn-primary">
            <span>Launch System Demo</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
          <a href="#how-it-works" className="mf-btn-secondary">
            Explore Workflow
          </a>
        </div>

        {/* Quick Metrics Strip */}
        <div className="mf-metrics-grid">
          <div className="mf-metric-card">
            <div className="mf-metric-val">70%</div>
            <div className="mf-metric-lbl">Reduced Wait Time</div>
          </div>
          <div className="mf-metric-card">
            <div className="mf-metric-val">Zero</div>
            <div className="mf-metric-lbl">Paper Queue Slips</div>
          </div>
          <div className="mf-metric-card">
            <div className="mf-metric-val">&lt; 2s</div>
            <div className="mf-metric-lbl">AI Triage Speed</div>
          </div>
          <div className="mf-metric-card">
            <div className="mf-metric-val">100%</div>
            <div className="mf-metric-lbl">Live ETA Accuracy</div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS (Original Storyteller Flow) */}
      <section id="how-it-works" className="mf-how-section">
        <div className="mf-how-container">
          
          {/* Left Sticky Header */}
          <div className="mf-sticky-side">
            <div className="mf-section-tag">
              <div className="mf-section-tag-line"></div>
              <span>The MediFlow Journey</span>
            </div>

            <h2 className="mf-section-title">
              The Patient <br /> Experience, <br />
              <span className="highlight">Reimagined.</span>
            </h2>

            <p className="mf-section-desc">
              Scroll to see how our AI-powered flow management eliminates waiting room chaos and connects patients to care instantly.
            </p>

            <button onClick={onGetStarted} className="mf-btn-primary">
              <span>Launch System Demo</span>
              <span>→</span>
            </button>
          </div>

          {/* Right Scrollable Cards */}
          <div className="mf-steps-list">
            
            {/* STEP 1 */}
            <div className="mf-step-card">
              <span className="mf-step-pill step-1">STEP 1</span>
              <h3 className="mf-step-h3">Smart Check-In</h3>
              <p className="mf-step-p">
                Patients scan a dynamic QR code at the entrance or book online. Zero reception line delay.
              </p>

              <div className="mf-step-demo-box">
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>📱</div>
                <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '15px' }}>
                  Scan QR Code to Check In
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                  Instant digital token generated
                </div>
              </div>
            </div>

            {/* STEP 2 */}
            <div className="mf-step-card">
              <span className="mf-step-pill step-2">STEP 2</span>
              <h3 className="mf-step-h3">AI Triage & Prioritization</h3>
              <p className="mf-step-p">
                Our algorithm analyzes symptoms to route critical emergencies directly to available doctors.
              </p>

              <div style={{ background: '#0F172A', borderRadius: '16px', padding: '20px', fontFamily: 'monospace', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.06)', padding: '12px 16px', borderRadius: '10px', marginBottom: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ color: '#E2E8F0', fontWeight: '600' }}>PT-45: Chest Pain & Dizziness</span>
                  <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#FCA5A5', padding: '4px 10px', borderRadius: '6px', fontWeight: '800' }}>🔴 EMERGENCY (CABIN 1)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.06)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ color: '#E2E8F0', fontWeight: '600' }}>PT-46: Routine Consultation</span>
                  <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#6EE7B7', padding: '4px 10px', borderRadius: '6px', fontWeight: '800' }}>🟢 WAITING (CABIN 3)</span>
                </div>
              </div>
            </div>

            {/* STEP 3 */}
            <div className="mf-step-card">
              <span className="mf-step-pill step-3">STEP 3</span>
              <h3 className="mf-step-h3">Live Real-Time Tracker</h3>
              <p className="mf-step-p">
                Patients monitor real-time queue position and estimated wait times on their phones from anywhere.
              </p>

              <div className="mf-token-box">
                <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#BFDBFE', fontWeight: '800' }}>
                  Your Live Queue Token
                </p>
                <p style={{ fontSize: '54px', fontWeight: '900', margin: '8px 0', fontFamily: 'Outfit, sans-serif' }}>
                  #46
                </p>
                <div style={{ background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(8px)', padding: '6px 16px', borderRadius: '99px', fontSize: '13px', fontWeight: '600', display: 'inline-block' }}>
                  Serving #45 • Estimated Wait: 12 Mins
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. ABOUT US (Why MediFlow Architecture) */}
      <section id="about-us" className="mf-about-section">
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
          <div className="mf-hero-badge" style={{ marginBottom: '16px' }}>
            About The Architecture
          </div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '38px', fontWeight: '800', color: '#0F172A', tracking: '-0.5px' }}>
            Built for High-Velocity Modern Hospitals
          </h2>
          <p style={{ color: '#64748B', fontSize: '17px', marginTop: '12px', lineHeight: '1.6' }}>
            MediFlow replaces outdated paper token dispensaries with an end-to-end cloud-native system connecting patients, doctors, and triage desks.
          </p>
        </div>

        <div className="mf-about-grid">
          <div className="mf-about-card">
            <div className="mf-icon-box">⚡</div>
            <h4 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
              WebSocket Live Sync
            </h4>
            <p style={{ color: '#64748B', fontSize: '14px', lineHeight: '1.6' }}>
              Instant sub-second queue status propagation across waiting room TV boards, doctor tablets, and patient phones.
            </p>
          </div>

          <div className="mf-about-card">
            <div className="mf-icon-box">💳</div>
            <h4 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
              Integrated Payments
            </h4>
            <p style={{ color: '#64748B', fontSize: '14px', lineHeight: '1.6' }}>
              Razorpay integration for cashless consultation booking, automated refunds, and frictionless billing.
            </p>
          </div>

          <div className="mf-about-card">
            <div className="mf-icon-box">🏥</div>
            <h4 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
              Multi-Department Triage
            </h4>
            <p style={{ color: '#64748B', fontSize: '14px', lineHeight: '1.6' }}>
              Dynamic workload balancing between General Medicine, Cardiology, Ortho, and Emergency Trauma wards.
            </p>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="mf-footer">
        <div className="mf-footer-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', background: '#2563EB', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: '800' }}>
              +
            </div>
            <span style={{ fontWeight: '800', color: '#0F172A', fontSize: '15px' }}>MediFlow Healthcare Systems</span>
          </div>
          <p style={{ fontSize: '13px', color: '#94A3B8' }}>
            © {new Date().getFullYear()} MediFlow Platform. Smart Queue & Patient Flow Management.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;