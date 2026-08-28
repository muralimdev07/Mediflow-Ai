import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { HeartPulse, LogIn } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

export const LoginPage = () => {
  const [email, setEmail] = useState('patient@mediflow.ai');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const { addToast } = useUiStore();
  const navigate = useNavigate();

  const handleDevLogin = async (loginEmail) => {
    setLoading(true);
    try {
      // Dev mode login sending email code to backend
      const res = await api.post('/auth/google', { code: loginEmail });
      setAuth(res.user, res.access_token, res.refresh_token);
      addToast({ type: 'success', title: 'Welcome back!', message: `Logged in as ${res.user.full_name}` });
      navigate('/dashboard');
    } catch (err) {
      addToast({ type: 'error', title: 'Login Failed', message: err.message });
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
      addToast({ type: 'error', title: 'Google Login Failed', message: err.message });
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
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Glow backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/15 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="p-4 rounded-2xl bg-primary/20 text-primary-light border border-primary/30 shadow-2xl mb-4">
            <HeartPulse className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-black gradient-text">MediFlow AI</h1>
          <p className="text-sm text-slate-400 mt-1">Smart Hospital Queue & AI Triage Platform</p>
        </div>

        <Card title="Sign In" subtitle="Select a role or sign in with Google" className="shadow-2xl">
          <div className="space-y-4">
            <Button
              variant="secondary"
              className="w-full flex items-center justify-center gap-2 border-slate-700 hover:bg-slate-800"
              onClick={() => googleLogin()}
              loading={loading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </Button>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-surface-border/40" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-surface-card px-3 text-slate-400 font-semibold">Or use Dev Login</span>
              </div>
            </div>

            <Input
              label="Development Email Login"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. dr.sharma@mediflow.ai"
            />
            
            <Button
              variant="primary"
              className="w-full flex items-center justify-center gap-2"
              loading={loading}
              onClick={() => handleDevLogin(email)}
            >
              <LogIn className="w-4 h-4" />
              Sign In with Email (Dev Mode)
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-surface-border/40" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-surface-card px-3 text-slate-400 font-semibold">Quick Demo Login</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Button variant="secondary" size="sm" onClick={() => handleDevLogin('patient@mediflow.ai')}>
                Patient Demo
              </Button>
              <Button variant="secondary" size="sm" onClick={() => handleDevLogin('nurse.mary@mediflow.ai')}>
                Nurse Demo
              </Button>
              <Button variant="secondary" size="sm" onClick={() => handleDevLogin('dr.sharma@mediflow.ai')}>
                Doctor Demo
              </Button>
              <Button variant="secondary" size="sm" onClick={() => handleDevLogin('admin@mediflow.ai')}>
                Admin Demo
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
