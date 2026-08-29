import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { useGoogleLogin } from '@react-oauth/google';
import './LoginPage.css';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup'
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const { addToast } = useUiStore();
  const navigate = useNavigate();

  const handleDevLogin = async (loginEmail) => {
    const targetEmail = loginEmail || email || 'patient@mediflow.ai';
    setLoading(true);
    try {
      const res = await api.post('/auth/google', { code: targetEmail });
      const data = res?.data?.data || res?.data || res;
      setAuth(data.user, data.access_token, data.refresh_token);
      addToast({ type: 'success', title: 'Welcome back!', message: `Logged in as ${data.user.full_name || data.user.email}` });
      navigate('/dashboard');
    } catch (err) {
      addToast({ type: 'error', title: 'Login Failed', message: err.message || 'Error signing in' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/google', { code: tokenResponse.code });
      const data = res?.data?.data || res?.data || res;
      setAuth(data.user, data.access_token, data.refresh_token);
      addToast({ type: 'success', title: 'Google Login Success', message: `Welcome ${data.user.full_name}` });
      navigate('/dashboard');
    } catch (err) {
      addToast({ type: 'error', title: 'Google Login Failed', message: err.message || 'Error with Google auth' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    // If Google OAuth client is not configured, automatically fallback to email login
    if (email) {
      handleDevLogin(email);
    } else {
      addToast({
        type: 'info',
        title: 'Google OAuth Notice',
        message: 'No active Google Client ID found. Logging you in directly with your email...',
      });
      handleDevLogin('sakthisundar1616@gmail.com');
    }
  };

  const isRealGoogleConfigured =
    import.meta.env.VITE_GOOGLE_CLIENT_ID &&
    !import.meta.env.VITE_GOOGLE_CLIENT_ID.includes('dummy') &&
    !import.meta.env.VITE_GOOGLE_CLIENT_ID.includes('your-google-client-id');

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
    flow: 'auth-code',
  });

  const onGoogleBtnClick = () => {
    if (isRealGoogleConfigured) {
      try {
        googleLogin();
      } catch (e) {
        handleGoogleError();
      }
    } else {
      handleDevLogin(email || 'sakthisundar1616@gmail.com');
    }
  };

  const handleDemoSelect = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('••••••••');
    handleDevLogin(demoEmail);
  };

  const handleClose = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="mf-ui-wrapper" onClick={handleClose}>
      <div className="mf-ui-card" onClick={(e) => e.stopPropagation()}>
        {/* Floating Close Button (✕) */}
        <button
          type="button"
          className="mf-ui-close-btn"
          onClick={handleClose}
          title="Close and return to Home"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* LEFT PANEL: Clean Professional Smart Hospital Visual Card */}
        <div className="mf-ui-left">
          <img
            src="/real_hospital_login_hero.jpg"
            alt="MediFlow Smart Hospital Care"
            className="mf-ui-left-bg"
          />
          <div className="mf-ui-left-gradient" />

          {/* Top Bar inside Left Panel */}
          <div className="mf-ui-left-top">
            <span className="mf-ui-left-brand">Smart Patient Care</span>
            <div className="mf-ui-left-pills">
              <button
                type="button"
                className={`mf-ui-left-pill ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => setActiveTab('login')}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`mf-ui-left-pill-join`}
                onClick={() => navigate('/register')}
              >
                Join Us
              </button>
            </div>
          </div>

          {/* Clean Subtle Bottom Tag */}
          <div className="mf-ui-left-bottom">
            <div className="mf-ui-bottom-tag">
              AI-Powered Queue &amp; Patient Flow System
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Reference Style Clean White Form Panel */}
        <div className="mf-ui-right">
          {/* Top Brand Header */}
          <div className="mf-ui-right-header">
            <div className="mf-ui-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/mediflow_logo.svg" alt="MediFlow AI Logo" style={{ width: '28px', height: '28px' }} />
              <span>MEDIFLOW AI</span>
            </div>
            <div className="mf-ui-lang-selector">
              <span>🌐 EN</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </div>
          </div>

          {/* Greeting Title */}
          <div className="mf-ui-greeting-box">
            <h1 className="mf-ui-title">
              Hi {activeTab === 'login' ? 'User' : 'Patient'}
            </h1>
            <p className="mf-ui-sub">
              Welcome to {activeTab === 'login' ? 'MediFlow AI' : 'MediFlow Registration'}
            </p>
          </div>

          {/* Form Fields */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleDevLogin(email);
            }}
          >
            <div className="mf-ui-field-group">
              <input
                type="email"
                className="mf-ui-input"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mf-ui-field-group">
              <input
                type="password"
                className="mf-ui-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="mf-ui-forgot">
                <a href="#forgot" onClick={(e) => { e.preventDefault(); addToast({ type: 'info', title: 'Password Reset', message: 'Demo reset link sent' }); }}>
                  Forgot password ?
                </a>
              </div>
            </div>

            {/* Divider */}
            <div className="mf-ui-divider">
              <span>or</span>
            </div>

            {/* Google SSO Button */}
            <button
              type="button"
              className="mf-ui-google-btn"
              onClick={onGoogleBtnClick}
              disabled={loading}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Login with Google</span>
            </button>

            {/* Primary Action Button (Vibrant Coral Red / Blue Primary matching reference) */}
            <button type="submit" className="mf-ui-primary-btn" disabled={loading}>
              {loading ? 'Processing...' : activeTab === 'login' ? 'Login' : 'Sign Up'}
            </button>
          </form>

          {/* Switch Tab Subtext */}
          <div className="mf-ui-switch-text">
            Don't have an account?{' '}
            <span onClick={() => navigate('/register')}>Sign up</span>
          </div>

          {/* Quick Demo Logins Strip */}
          <div className="mf-ui-demo-strip">
            <div className="mf-ui-demo-lbl">Quick Demo Login</div>
            <div className="mf-ui-demo-btns">
              <button type="button" onClick={() => handleDemoSelect('patient@mediflow.ai')}>Patient</button>
              <button type="button" onClick={() => handleDemoSelect('nurse.mary@mediflow.ai')}>Nurse</button>
              <button type="button" onClick={() => handleDemoSelect('dr.sharma@mediflow.ai')}>Doctor</button>
              <button type="button" onClick={() => handleDemoSelect('admin@mediflow.ai')}>Admin</button>
            </div>
          </div>

          {/* Social Footer Icons */}
          <div className="mf-ui-social-footer">
            <a href="#facebook" onClick={(e) => e.preventDefault()} aria-label="Facebook">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="#twitter" onClick={(e) => e.preventDefault()} aria-label="Twitter">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
            </a>
            <a href="#linkedin" onClick={(e) => e.preventDefault()} aria-label="LinkedIn">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
            <a href="#instagram" onClick={(e) => e.preventDefault()} aria-label="Instagram">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
