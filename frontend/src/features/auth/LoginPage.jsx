import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { HeartPulse, LogIn } from 'lucide-react';

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
