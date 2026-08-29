import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, ArrowRight, User } from 'lucide-react';

export const DoctorLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotModal, setForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  
  const { setAuth } = useAuthStore();
  const { addToast } = useUiStore();
  const navigate = useNavigate();

  const handleDoctorLogin = async (e, overrideEmail = null, overridePassword = null) => {
    if (e && e.preventDefault) e.preventDefault();
    const loginEmail = (overrideEmail || email || '').trim().toLowerCase();
    const loginPassword = overridePassword || password || '';

    if (!loginEmail || !loginPassword) {
      addToast({ type: 'warning', title: 'Required Fields', message: 'Please enter doctor email and password' });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/doctor/login', {
        email: loginEmail,
        password: loginPassword,
      });

      // Safely unpack token and user data from Axios or direct object
      const token = res?.access_token || res?.data?.access_token;
      const refreshToken = res?.refresh_token || res?.data?.refresh_token;
      const userData = res?.user || res?.data?.user;

      if (userData && token) {
        setAuth(userData, token, refreshToken);
        addToast({
          type: 'success',
          title: 'Doctor Portal Authenticated',
          message: `Welcome Dr. ${userData.full_name}`,
        });
        window.location.href = '/doctor/dashboard';
      } else {
        throw new Error('Authentication response missing user token');
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Access Denied',
        message: err.message || 'Invalid doctor credentials or inactive doctor role',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreloadSelect = (doctorEmail) => {
    setEmail(doctorEmail);
    setPassword('Doctor@123');
    // Instant 1-click authentication
    handleDoctorLogin(null, doctorEmail, 'Doctor@123');
  };

  return (
    <div className="min-h-screen bg-[#F4F7FC] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Background Subtle Medical Grid & Floating Accents */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40" 
        style={{
          backgroundImage: `radial-gradient(#CBD5E1 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />
      {/* Subtle Medical Plus Icon & Shapes in Background */}
      <div className="absolute right-[12%] top-[25%] opacity-15 pointer-events-none text-blue-500">
        <svg width="110" height="110" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z"/>
        </svg>
      </div>
      <div className="absolute left-[8%] bottom-[20%] opacity-10 pointer-events-none text-blue-600">
        <svg width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/>
        </svg>
      </div>

      {/* Main Doctor Card */}
      <div className="w-full max-w-[480px] bg-white rounded-[28px] p-8 sm:p-10 shadow-[0_20px_50px_rgba(15,23,42,0.06),0_1px_3px_rgba(0,0,0,0.03)] border border-slate-100/80 relative z-10">
        
        {/* Top Doctor Stethoscope Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50/80 text-blue-600 mb-4">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
              <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
              <circle cx="20" cy="10" r="2" />
            </svg>
          </div>
          
          {/* Header Title */}
          <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#0F172A] tracking-tight">
            MediFlow <span className="text-[#0052CC]">Portal</span>
          </h1>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">
            PHYSICIAN & SPECIALIST SIGN IN
          </p>
        </div>

        {/* Form Elements */}
        <form onSubmit={handleDoctorLogin} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              DOCTOR OFFICIAL EMAIL
            </label>
            <div className="relative">
              <Mail className="w-[18px] h-[18px] text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dr.sharma@mediflow.ai"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0052CC] transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                DOCTOR PASSWORD
              </label>
              <button
                type="button"
                onClick={() => setForgotModal(true)}
                className="text-[11.5px] text-[#0052CC] hover:underline font-semibold"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-[18px] h-[18px] text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0052CC] transition-all tracking-wider"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Secure Doctor Gateway Notice Card */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F0F6FF] border border-[#D0E2FF] text-[#1E3A8A]">
            <div className="p-1 rounded-full bg-blue-100/60 text-[#0052CC] flex-shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[12px] font-bold text-[#0F172A]">Secure Doctor Gateway</div>
              <div className="text-[11px] text-slate-500 leading-snug">
                Patient & external Google sign-in methods are restricted on this portal.
              </div>
            </div>
          </div>

          {/* Login Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#0052CC] hover:bg-[#0043A8] text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>LOGIN AS DOCTOR</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider OR */}
        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">OR</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Demo Fast Selection Box (Preloaded Doctor Accounts) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">
              SELECT PRELOADED DOCTOR ACCOUNT
            </span>
            <span className="text-[10px] font-semibold text-[#0052CC]">PW: Doctor@123</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handlePreloadSelect('dr.sharma@mediflow.ai')}
              className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 group cursor-pointer ${
                email === 'dr.sharma@mediflow.ai'
                  ? 'border-blue-500 bg-blue-50/70 shadow-sm ring-1 ring-blue-500/20'
                  : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/40'
              } disabled:opacity-60`}
            >
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-[12px] text-slate-800 truncate">Dr. Rajesh Sharma</div>
                <div className="text-[10px] text-slate-400 truncate">General Medicine</div>
              </div>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handlePreloadSelect('dr.patel@mediflow.ai')}
              className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 group cursor-pointer ${
                email === 'dr.patel@mediflow.ai'
                  ? 'border-blue-500 bg-blue-50/70 shadow-sm ring-1 ring-blue-500/20'
                  : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/40'
              } disabled:opacity-60`}
            >
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-[12px] text-slate-800 truncate">Dr. Priya Patel</div>
                <div className="text-[10px] text-slate-400 truncate">Cardiology</div>
              </div>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handlePreloadSelect('dr.gupta@mediflow.ai')}
              className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 group cursor-pointer ${
                email === 'dr.gupta@mediflow.ai'
                  ? 'border-blue-500 bg-blue-50/70 shadow-sm ring-1 ring-blue-500/20'
                  : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/40'
              } disabled:opacity-60`}
            >
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-[12px] text-slate-800 truncate">Dr. Sneha Gupta</div>
                <div className="text-[10px] text-slate-400 truncate">Orthopedics</div>
              </div>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handlePreloadSelect('dr.reddy@mediflow.ai')}
              className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 group cursor-pointer ${
                email === 'dr.reddy@mediflow.ai'
                  ? 'border-blue-500 bg-blue-50/70 shadow-sm ring-1 ring-blue-500/20'
                  : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/40'
              } disabled:opacity-60`}
            >
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-[12px] text-slate-800 truncate">Dr. Lakshmi Reddy</div>
                <div className="text-[10px] text-slate-400 truncate">Emergency</div>
              </div>
            </button>
          </div>
        </div>

        {/* Bottom Switch to Patient */}
        <div className="text-center mt-6 pt-2">
          <p className="text-xs text-slate-500 font-medium">
            Are you a patient?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-[#0052CC] font-bold hover:underline"
            >
              Patient Login
            </button>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-100 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Reset Doctor Password</h3>
            <p className="text-xs text-slate-500">
              Enter your registered doctor hospital email address to receive password reset instructions.
            </p>
            <input
              type="email"
              placeholder="dr.name@mediflow.ai"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-[#0052CC]"
            />
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setForgotModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setForgotModal(false);
                  addToast({
                    type: 'success',
                    title: 'Reset Request Logged',
                    message: 'Password reset instructions have been sent to hospital administration.',
                  });
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0052CC] text-white hover:bg-[#0043A8] transition-colors"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorLoginPage;

