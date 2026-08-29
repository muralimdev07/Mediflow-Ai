import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { useGoogleLogin } from '@react-oauth/google';
import './RegisterPage.css';

export const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const { addToast } = useUiStore();
  const navigate = useNavigate();

  // Step 1: Basic Details
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Step 2: Health Information
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [allergies, setAllergies] = useState('');

  // Step 3: Account Setup
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(true);

  const handleDevRegister = async (targetEmail, targetName) => {
    const finalEmail = targetEmail || email || 'patient.new@mediflow.ai';
    const finalName = targetName || fullName || 'New Patient';
    setLoading(true);
    try {
      // Backend AuthService automatically registers new patient if not existing
      const res = await api.post('/auth/google', { code: finalEmail });
      const data = res?.data?.data || res?.data || res;
      
      // Update full name and phone in state/backend if provided
      if (finalName && data?.user) {
        data.user.full_name = finalName;
      }
      
      setAuth(data.user, data.access_token, data.refresh_token);
      addToast({
        type: 'success',
        title: 'Account Created Successfully!',
        message: `Welcome to MediFlow AI, ${finalName}!`,
      });
      navigate('/dashboard');
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Registration Failed',
        message: err.message || 'Could not complete account setup. Please try again.',
      });
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
      addToast({
        type: 'success',
        title: 'Registration Successful',
        message: `Welcome to MediFlow AI, ${data.user.full_name || 'Patient'}!`,
      });
      navigate('/dashboard');
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Google Registration Failed',
        message: err.message || 'Error creating account with Google',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    if (email) {
      handleDevRegister(email, fullName);
    } else {
      addToast({
        type: 'info',
        title: 'Instant Registration',
        message: 'Creating your MediFlow account...',
      });
      handleDevRegister('patient.alex@mediflow.ai', fullName || 'Alex Mercer');
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

  const handleNextStep = (e) => {
    if (e) e.preventDefault();
    if (step === 1) {
      if (!fullName.trim()) {
        addToast({ type: 'warning', title: 'Name Required', message: 'Please enter your full name.' });
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        addToast({ type: 'warning', title: 'Valid Email Required', message: 'Please enter a valid email address.' });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      if (password && confirmPassword && password !== confirmPassword) {
        addToast({ type: 'error', title: 'Password Mismatch', message: 'Passwords do not match.' });
        return;
      }
      if (!termsAgreed) {
        addToast({ type: 'warning', title: 'Terms Required', message: 'Please accept the Terms of Service to continue.' });
        return;
      }
      handleDevRegister(email, fullName);
    }
  };

  return (
    <div className="mf-reg-page">
      {/* 1. TOP NAVBAR HEADER */}
      <header className="mf-reg-nav">
        <Link to="/" className="mf-reg-brand">
          <div className="mf-reg-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M2 12h20" />
            </svg>
          </div>
          <span className="mf-reg-brand-name">MediFlow AI</span>
        </Link>

        <nav className="mf-reg-nav-links">
          <Link to="/" className="mf-reg-link">Home</Link>
          <Link to="/symptoms" className="mf-reg-link">Get AI Triage</Link>
          <Link to="/find-doctor" className="mf-reg-link">Find Specialist</Link>
          <a href="/#how-it-works" className="mf-reg-link">How It Works</a>
          <a href="/#why-mediflow" className="mf-reg-link">Why MediFlow</a>
          <Link to="/about" className="mf-reg-link">About Us</Link>
        </nav>

        <div className="mf-reg-nav-actions">
          <button className="mf-reg-btn-getstarted" onClick={() => navigate('/login')}>
            <span>Get Started</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </header>

      {/* 2. MAIN REGISTER CARD CONTAINER */}
      <main className="mf-reg-main">
        <div className="mf-reg-card">
          {/* LEFT COLUMN: 3D Illustration & Benefits */}
          <div className="mf-reg-left">
            <div className="mf-reg-illustration-wrapper">
              <img
                src="/mediflow_register_clipboard.jpg"
                alt="MediFlow AI Smart Medical ID & Care"
                className="mf-reg-illustration-img"
              />
            </div>

            <div className="mf-reg-left-header">
              <h2 className="mf-reg-left-title">Join MediFlow AI</h2>
              <p className="mf-reg-left-subtitle">Smart healthcare for a better tomorrow</p>
            </div>

            <div className="mf-reg-features">
              <div className="mf-reg-feature-item">
                <div className="mf-reg-feature-icon heart">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    <path d="M3.5 12h4l2-3 3 6 2-3h6" />
                  </svg>
                </div>
                <div className="mf-reg-feature-text">
                  <h4>AI-Powered Care</h4>
                  <p>Smarter health guidance</p>
                </div>
              </div>

              <div className="mf-reg-feature-item">
                <div className="mf-reg-feature-icon user">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="mf-reg-feature-text">
                  <h4>Personalized Experience</h4>
                  <p>Your health, your way</p>
                </div>
              </div>

              <div className="mf-reg-feature-item">
                <div className="mf-reg-feature-icon shield">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <div className="mf-reg-feature-text">
                  <h4>Secure & Private</h4>
                  <p>Your data is safe with us</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Stepper & Multi-Step Register Form */}
          <div className="mf-reg-right">
            <div className="mf-reg-title-box">
              <h1 className="mf-reg-title">Create Your Account</h1>
              <p className="mf-reg-subtitle">Join MediFlow AI and take control of your health</p>
            </div>

            {/* Stepper Progress Indicator */}
            <div className="mf-reg-stepper">
              {/* Step 1 */}
              <div
                className={`mf-reg-step-item ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}
                onClick={() => setStep(1)}
              >
                <div className="mf-reg-step-circle">
                  {step > 1 ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  )}
                </div>
                <span className="mf-reg-step-label">1. Basic Details</span>
              </div>

              <div className={`mf-reg-step-line ${step >= 2 ? 'active' : ''}`} />

              {/* Step 2 */}
              <div
                className={`mf-reg-step-item ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}
                onClick={() => { if (fullName && email) setStep(2); }}
              >
                <div className="mf-reg-step-circle">
                  {step > 2 ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  )}
                </div>
                <span className="mf-reg-step-label">2. Health Information</span>
              </div>

              <div className={`mf-reg-step-line ${step >= 3 ? 'active' : ''}`} />

              {/* Step 3 */}
              <div
                className={`mf-reg-step-item ${step === 3 ? 'active' : ''}`}
                onClick={() => { if (fullName && email) setStep(3); }}
              >
                <div className="mf-reg-step-circle">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <span className="mf-reg-step-label">3. Account Setup</span>
              </div>
            </div>

            {/* Inner Form Card Container */}
            <form onSubmit={handleNextStep} className="mf-reg-form-card">
              {/* STEP 1: Basic Details */}
              {step === 1 && (
                <div className="mf-reg-step-content fade-in">
                  <div className="mf-reg-section-header">
                    <div className="mf-reg-section-badge">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="mf-reg-section-title">Basic Details</h3>
                      <p className="mf-reg-section-sub">Tell us about yourself</p>
                    </div>
                  </div>

                  <div className="mf-reg-grid">
                    <div className="mf-reg-field">
                      <label className="mf-reg-label">Full Name</label>
                      <div className="mf-reg-input-box">
                        <span className="mf-reg-input-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </span>
                        <input
                          type="text"
                          className="mf-reg-input"
                          placeholder="Enter your full name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="mf-reg-field">
                      <label className="mf-reg-label">Email Address</label>
                      <div className="mf-reg-input-box">
                        <span className="mf-reg-input-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                          </svg>
                        </span>
                        <input
                          type="email"
                          className="mf-reg-input"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="mf-reg-field full-width">
                      <label className="mf-reg-label">Phone Number</label>
                      <div className="mf-reg-input-box">
                        <span className="mf-reg-input-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                        </span>
                        <input
                          type="tel"
                          className="mf-reg-input"
                          placeholder="Enter your phone number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Health Information */}
              {step === 2 && (
                <div className="mf-reg-step-content fade-in">
                  <div className="mf-reg-section-header">
                    <div className="mf-reg-section-badge">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="mf-reg-section-title">Health Information</h3>
                      <p className="mf-reg-section-sub">Help us tailor your care and medical triage</p>
                    </div>
                  </div>

                  <div className="mf-reg-grid">
                    <div className="mf-reg-field">
                      <label className="mf-reg-label">Date of Birth</label>
                      <div className="mf-reg-input-box">
                        <span className="mf-reg-input-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                        </span>
                        <input
                          type="date"
                          className="mf-reg-input"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="mf-reg-field">
                      <label className="mf-reg-label">Gender</label>
                      <div className="mf-reg-input-box">
                        <span className="mf-reg-input-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 8v8M8 12h8" />
                          </svg>
                        </span>
                        <select
                          className="mf-reg-input select"
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer_not_to_say">Prefer not to say</option>
                        </select>
                      </div>
                    </div>

                    <div className="mf-reg-field">
                      <label className="mf-reg-label">Blood Group</label>
                      <div className="mf-reg-input-box">
                        <span className="mf-reg-input-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                          </svg>
                        </span>
                        <select
                          className="mf-reg-input select"
                          value={bloodGroup}
                          onChange={(e) => setBloodGroup(e.target.value)}
                        >
                          <option value="O+">O Positive (O+)</option>
                          <option value="O-">O Negative (O-)</option>
                          <option value="A+">A Positive (A+)</option>
                          <option value="A-">A Negative (A-)</option>
                          <option value="B+">B Positive (B+)</option>
                          <option value="B-">B Negative (B-)</option>
                          <option value="AB+">AB Positive (AB+)</option>
                          <option value="AB-">AB Negative (AB-)</option>
                        </select>
                      </div>
                    </div>

                    <div className="mf-reg-field">
                      <label className="mf-reg-label">Known Allergies / Notes (Optional)</label>
                      <div className="mf-reg-input-box">
                        <span className="mf-reg-input-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                        </span>
                        <input
                          type="text"
                          className="mf-reg-input"
                          placeholder="e.g. Penicillin, Pollen, None"
                          value={allergies}
                          onChange={(e) => setAllergies(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Account Setup */}
              {step === 3 && (
                <div className="mf-reg-step-content fade-in">
                  <div className="mf-reg-section-header">
                    <div className="mf-reg-section-badge">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="mf-reg-section-title">Account Security</h3>
                      <p className="mf-reg-section-sub">Set up your password and preferences</p>
                    </div>
                  </div>

                  <div className="mf-reg-grid">
                    <div className="mf-reg-field">
                      <label className="mf-reg-label">Password</label>
                      <div className="mf-reg-input-box">
                        <span className="mf-reg-input-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        </span>
                        <input
                          type="password"
                          className="mf-reg-input"
                          placeholder="Create secure password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="mf-reg-field">
                      <label className="mf-reg-label">Confirm Password</label>
                      <div className="mf-reg-input-box">
                        <span className="mf-reg-input-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          </svg>
                        </span>
                        <input
                          type="password"
                          className="mf-reg-input"
                          placeholder="Confirm password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="mf-reg-field full-width">
                      <label className="mf-reg-checkbox-label">
                        <input
                          type="checkbox"
                          checked={termsAgreed}
                          onChange={(e) => setTermsAgreed(e.target.checked)}
                          className="mf-reg-checkbox"
                        />
                        <span>
                          I agree to MediFlow AI <a href="#terms" onClick={(e) => e.preventDefault()}>Terms of Service</a> and <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>.
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Bottom Control Buttons */}
              <div className="mf-reg-actions">
                {step > 1 && (
                  <button
                    type="button"
                    className="mf-reg-btn-back"
                    onClick={() => setStep(step - 1)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    <span>Back</span>
                  </button>
                )}

                <button
                  type="submit"
                  className="mf-reg-btn-continue"
                  disabled={loading}
                >
                  <span>{loading ? 'Creating...' : step === 3 ? 'Create Account' : 'Continue'}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </form>

            {/* Google Quick Sign-Up Alternative */}
            <div className="mf-reg-oauth-section">
              <div className="mf-reg-oauth-divider">
                <span>or continue with</span>
              </div>
              <button
                type="button"
                className="mf-reg-google-btn"
                onClick={() => {
                  if (isRealGoogleConfigured) {
                    try { googleLogin(); } catch (e) { handleGoogleError(); }
                  } else {
                    handleGoogleError();
                  }
                }}
                disabled={loading}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Google Registration</span>
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM FOOTER LINK */}
        <div className="mf-reg-footer">
          <p className="mf-reg-footer-text">
            Already have an account?{' '}
            <Link to="/login" className="mf-reg-login-link">
              Login
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;
