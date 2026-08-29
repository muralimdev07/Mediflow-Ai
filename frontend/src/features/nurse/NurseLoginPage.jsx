import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { Eye, EyeOff, Lock, Mail, Activity, ArrowRight, HeartHandshake, ShieldCheck, UserCheck } from 'lucide-react';

export const NurseLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { setAuth } = useAuthStore();
  const { addToast } = useUiStore();
  const navigate = useNavigate();

  const handleNurseLogin = async (e, overrideEmail = null, overridePassword = null) => {
    if (e && e.preventDefault) e.preventDefault();
    const loginEmail = (overrideEmail || email || '').trim().toLowerCase();
    const loginPassword = overridePassword || password || '';

    if (!loginEmail || !loginPassword) {
      addToast({ type: 'warning', title: 'Required Fields', message: 'Please enter nurse credentials' });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/nurse/login', {
        email: loginEmail,
        password: loginPassword,
      });

      const token = res?.access_token || res?.data?.access_token;
      const refreshToken = res?.refresh_token || res?.data?.refresh_token;
      const userData = res?.user || res?.data?.user;

      if (userData && token) {
        setAuth(userData, token, refreshToken);
        addToast({
          type: 'success',
          title: 'Nursing Station Authenticated',
          message: `Welcome Staff Nurse ${userData.full_name}`,
        });
        window.location.href = '/nurse/dashboard';
      } else {
        throw new Error('Authentication response missing user token');
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Authentication Failed',
        message: err.message || 'Invalid nurse credentials or inactive account',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreloadSelect = (nurseEmail) => {
    setEmail(nurseEmail);
    setPassword('Nurse@123');
    handleNurseLogin(null, nurseEmail, 'Nurse@123');
  };

  const handleClose = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div 
      className="min-h-screen bg-[#F0FDF4] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans cursor-pointer"
      onClick={handleClose}
    >
      {/* Background Subtle Medical Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40" 
        style={{
          backgroundImage: `radial-gradient(#A7F3D0 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Main Nurse Login Card */}
      <div 
        className="w-full max-w-[480px] bg-white rounded-[28px] p-8 sm:p-10 shadow-[0_20px_50px_rgba(5,205,153,0.08),0_1px_3px_rgba(0,0,0,0.03)] border border-emerald-100 relative z-10 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button (✕) */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute -top-3.5 -right-3.5 w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-white hover:bg-rose-500 hover:border-rose-500 flex items-center justify-center transition-all duration-200 shadow-md hover:scale-110 hover:rotate-90 z-50 cursor-pointer font-bold"
          title="Close and return to Home"
        >
          ✕
        </button>
        
        {/* Top Nurse Heart Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#E6FAF5] text-[#05CD99] mb-4 border border-emerald-100 shadow-xs">
            <HeartHandshake className="w-8 h-8 stroke-[2.2]" />
          </div>
          
          <h1 className="text-2xl sm:text-[28px] font-black text-[#1E293B] tracking-tight">
            Nurse <span className="text-[#05CD99]">Station</span>
          </h1>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            PATIENT ARRIVAL &amp; VITALS ROSTER
          </p>
        </div>

        {/* Form Elements */}
        <form onSubmit={handleNurseLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              NURSE OFFICIAL EMAIL
            </label>
            <div className="relative">
              <Mail className="w-[18px] h-[18px] text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nurse.sarah@mediflow.ai"
                className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#05CD99] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              PASSWORD
            </label>
            <div className="relative">
              <Lock className="w-[18px] h-[18px] text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-[#F8FAFC] border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#05CD99] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 bg-[#05CD99] hover:bg-[#04B889] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to Nursing Station</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Quick Preload Accounts for Testing */}
        <div className="mt-7 pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              1-Click Demo Accounts (Instant Test)
            </span>
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              Password: Nurse@123
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handlePreloadSelect('nurse.anita@mediflow.ai')}
              className="p-2.5 rounded-xl border border-emerald-200 bg-[#E6FAF5]/50 hover:bg-[#E6FAF5] text-left transition-colors cursor-pointer group"
            >
              <div className="text-xs font-black text-[#1E293B] group-hover:text-[#05CD99]">Nurse Anita</div>
              <div className="text-[10px] text-slate-500 truncate">nurse.anita@mediflow.ai</div>
            </button>

            <button
              type="button"
              onClick={() => handlePreloadSelect('nurse.mary@mediflow.ai')}
              className="p-2.5 rounded-xl border border-emerald-200 bg-[#E6FAF5]/50 hover:bg-[#E6FAF5] text-left transition-colors cursor-pointer group"
            >
              <div className="text-xs font-black text-[#1E293B] group-hover:text-[#05CD99]">Nurse Mary</div>
              <div className="text-[10px] text-slate-500 truncate">nurse.mary@mediflow.ai</div>
            </button>
          </div>
        </div>

        <div className="mt-5 text-center text-xs text-slate-400">
          Doctor? <button onClick={() => navigate('/doctor/login')} className="text-[#5046E5] font-black hover:underline cursor-pointer">Doctor Portal</button>
          {' '}&bull;{' '}
          Patient? <button onClick={() => navigate('/login')} className="text-[#5046E5] font-black hover:underline cursor-pointer">Patient Portal</button>
        </div>
      </div>
    </div>
  );
};

export default NurseLoginPage;
