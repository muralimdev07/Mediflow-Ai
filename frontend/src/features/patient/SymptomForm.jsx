import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useUiStore } from '../../store/uiStore';
import { Stethoscope, Send, Sparkles } from 'lucide-react';

export const SymptomForm = () => {
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [symptomsDescription, setSymptomsDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useUiStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!chiefComplaint.trim()) {
      addToast({ type: 'error', title: 'Required', message: 'Please enter your chief complaint' });
      return;
    }

    setLoading(true);
    try {
      await api.post('/visits', {
        chief_complaint: chiefComplaint,
        symptoms_description: symptomsDescription,
      });

      addToast({
        type: 'success',
        title: 'Check-In Complete',
        message: 'Your symptoms were recorded and queued for triage.',
      });
      navigate('/dashboard');
    } catch (err) {
      addToast({ type: 'error', title: 'Check-In Failed', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Patient Check-In</h1>
        <p className="text-sm text-slate-400">Describe your symptoms to enter the hospital queue</p>
      </div>

      <Card title="Describe Your Symptoms" subtitle="Our AI will analyze urgency and route you to the right department">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Chief Complaint (Primary Symptom)"
            placeholder="e.g. Severe chest pain, High fever, Sprained ankle"
            value={chiefComplaint}
            onChange={(e) => setChiefComplaint(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Detailed Symptoms & History
            </label>
            <textarea
              className="input min-h-[120px] resize-y"
              placeholder="Describe when it started, severity (1-10), any existing medical conditions or allergies..."
              value={symptomsDescription}
              onChange={(e) => setSymptomsDescription(e.target.value)}
            />
          </div>

          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary-light flex-shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-slate-100">AI Urgency Triage & Doctor Matching</p>
              <p>Your submission is scored by our XGBoost Triage AI (P1-P5 urgency scale) and matched with specialized doctors based on current workload and rating.</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={loading} className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Submit Check-In
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
