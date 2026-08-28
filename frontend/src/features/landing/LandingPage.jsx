import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar/Navbar';

export const LandingPage = () => {
  const [activeTab, setActiveTab] = useState('Home');

  return (
    <div style={{ backgroundColor: '#F7FAF9', minHeight: '100vh', color: '#16302E' }}>
      {/* Premium Modern Healthcare Navbar */}
      <Navbar activeItem={activeTab} onNavigate={(label) => setActiveTab(label)} />

      {/* Demonstration Canvas / Hero Preview */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '60px 32px', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-block',
            padding: '6px 16px',
            backgroundColor: '#E6F3F2',
            color: '#0B6E69',
            borderRadius: '9999px',
            fontSize: '13px',
            fontWeight: '700',
            letterSpacing: '0.5px',
            marginBottom: '24px',
            border: '1px solid #C5E4E2',
          }}
        >
          SMART HEALTHCARE PLATFORM
        </div>

        <h1
          style={{
            fontSize: '48px',
            fontWeight: '800',
            color: '#16302E',
            letterSpacing: '-1px',
            lineHeight: '1.2',
            marginBottom: '16px',
          }}
        >
          Smart Hospital Queue & <br />
          <span style={{ color: '#0B6E69' }}>Patient Flow Management</span>
        </h1>

        <p
          style={{
            fontSize: '18px',
            color: '#5F7875',
            maxWidth: '640px',
            margin: '0 auto 40px auto',
            lineHeight: '1.6',
          }}
        >
          Active View: <strong style={{ color: '#0B6E69' }}>"{activeTab}"</strong>. Redefining emergency triage and hospital department flow with real-time AI matching.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyCenter: 'center', justifyContent: 'center' }}>
          <a
            href="/login"
            style={{
              backgroundColor: '#0B6E69',
              color: '#FFFFFF',
              padding: '14px 28px',
              borderRadius: '10px',
              fontWeight: '600',
              textDecoration: 'none',
              fontSize: '15px',
              boxShadow: '0 4px 14px rgba(11, 110, 105, 0.22)',
            }}
          >
            Launch System Demo →
          </a>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
