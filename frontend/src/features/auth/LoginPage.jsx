import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { useGoogleLogin } from '@react-oauth/google';
import './LoginPage.css';

export const LoginPage = () => {
  const [email, setEmail] = useState('patient@mediflow.ai');
  const [password, setPassword] = useState('••••••••');
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup'
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const { addToast } = useUiStore();
  const navigate = useNavigate();

  const handleDevLogin = async (loginEmail) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/google', { code: loginEmail });
      setAuth(res.user, res.access_token, res.refresh_token);
      addToast({ type: 'success', title: 'Welcome back!', message: `Logged in as ${res.user.full_name}` });
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
      setAuth(res.user, res.access_token, res.refresh_token);
      addToast({ type: 'success', title: 'Google Login Success', message: `Welcome ${res.user.full_name}` });
      navigate('/dashboard');
    } catch (err) {
      addToast({ type: 'error', title: 'Google Login Failed', message: err.message || 'Error with Google auth' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    addToast({ type: 'error', title: 'Login Failed', message: 'Google authentication failed' });
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
    flow: 'auth-code',
  });

  return (
    <div className="mf-split-wrapper">
      <div className="mf-split-card">
        {/* LEFT COLUMN: Problem Statement Medical AI Hero Image */}
        <div className="mf-split-left">
          <img
            src="/mediflow_login_hero.jpg"
            alt="MediFlow AI Smart Hospital Queue Management"
            className="mf-split-left-img"
          />
          <div className="mf-split-left-overlay">
            <span className="mf-left-badge">MediFlow AI Platform</span>
            <h2 className="mf-left-title">Smart Hospital Queue & Patient Flow</h2>
            <p className="mf-left-sub">
              Automated AI triage routing, real-time token tracking, and instant digital check-ins for modern hospitals.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Matching Reference UI Form */}
        <div className="mf-split-right">
          <h1 className="mf-right-greeting">
            Hello, <span>Guys!</span>
          </h1>

          {/* Login / SignUp Tab Bar */}
          <div className="mf-auth-tabs">
            <div
              className={`mf-tab-item ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => setActiveTab('login')}
            >
              Login
            </div>
            <div
              className={`mf-tab-item ${activeTab === 'signup' ? 'active' : ''}`}
              onClick={() => setActiveTab('signup')}
            >
              SignUp
            </div>
          </div>

          {/* Form Fields (Underline Minimal Style matching reference) */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleDevLogin(email);
            }}
          >
            <div className="mf-field-container">
              <input
                type="email"
                className="mf-field-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mf-field-container">
              <input
                type="password"
                className="mf-field-input"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Primary Action Button */}
            <button type="submit" className="mf-btn-login-main" disabled={loading}>
              {loading ? 'Signing In...' : 'Login'}
            </button>
          </form>

          {/* Or Divider */}
          <div className="mf-or-divider">Or</div>

          {/* Continue with Google Only (NO Facebook!) */}
          <div className="mf-google-wrapper">
            <button className="mf-btn-continue-google" onClick={() => googleLogin()} disabled={loading}>
              <svg width="20" height="20" viewBox="0 0 24 24">
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
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Quick Demo Roles Strip */}
          <div className="mf-quick-demo-strip">
            <div className="mf-demo-title">Quick Demo Logins</div>
            <div className="mf-demo-pills">
              <button
                type="button"
                className="mf-demo-pill-btn"
                onClick={() => handleDevLogin('patient@mediflow.ai')}
              >
                Patient
              </button>
              <button
                type="button"
                className="mf-demo-pill-btn"
                onClick={() => handleDevLogin('nurse.mary@mediflow.ai')}
              >
                Nurse
              </button>
              <button
                type="button"
                className="mf-demo-pill-btn"
                onClick={() => handleDevLogin('dr.sharma@mediflow.ai')}
              >
                Doctor
              </button>
              <button
                type="button"
                className="mf-demo-pill-btn"
                onClick={() => handleDevLogin('admin@mediflow.ai')}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
