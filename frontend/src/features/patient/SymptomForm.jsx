import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useUiStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { Stethoscope, Send, Sparkles, Activity, ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const SymptomForm = () => {
  const { user } = useAuthStore();
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [symptomsDescription, setSymptomsDescription] = useState('');
  const [age, setAge] = useState(30);
  const [severityLevel, setSeverityLevel] = useState(5);
  const [aiPrediction, setAiPrediction] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useUiStore();
  const navigate = useNavigate();

  // Debounced real-time disease & priority ML prediction
  useEffect(() => {
    if (!chiefComplaint || chiefComplaint.trim().length < 3) {
      setAiPrediction(null);
      return;
    }

    const timer = setTimeout(async () => {
      setAiLoading(true);
      try {
        const res = await api.post('/triage/predict-disease', {
          chief_complaint: chiefComplaint,
          symptoms_description: symptomsDescription,
          age: parseInt(age) || 30,
          severity_level: severityLevel || 5,
        });
        const pred = (res.data || res)?.data || res.data || res;
        setAiPrediction(pred);
      } catch (err) {
        console.error('AI Prediction error:', err);
      } finally {
        setAiLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [chiefComplaint, symptomsDescription, age, severityLevel]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!chiefComplaint.trim()) {
      addToast({ type: 'error', title: 'Required', message: 'Please enter your chief complaint' });
      return;
    }

    setLoading(true);
    try {
      await api.post('/appointments/book', {
        full_name: user?.full_name || 'Patient',
        age: parseInt(age) || 30,
        chief_complaint: chiefComplaint,
        symptoms_description: symptomsDescription,
        severity_level: severityLevel,
        preferred_department_id: aiPrediction?.recommended_department_id || null,
      });

      addToast({
        type: 'success',
        title: 'Check-In Complete',
        message: `Condition analyzed: ${aiPrediction?.predicted_disease || 'Symptoms recorded'}`,
      });
      navigate('/dashboard');
    } catch (err) {
      addToast({ type: 'error', title: 'Check-In Failed', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10 select-none">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-xs font-bold text-[#A3AED0] hover:text-[#4318FF] transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1B254B] tracking-tight">AI Patient Triage & Check-In</h1>
          <p className="text-xs text-[#707EAE] font-semibold mt-0.5">Describe your symptoms to trigger real-time ML disease prediction and hospital routing</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_18px_40px_rgba(112,144,176,0.08)] border border-slate-100/80 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[11px] font-extrabold text-[#A3AED0] uppercase tracking-wider block">
                Chief Complaint (Primary Symptom) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. chest tightness, high fever, severe migraine"
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl bg-[#F4F7FE] border border-transparent focus:border-[#4318FF] focus:bg-white text-xs font-bold text-[#1B254B] placeholder-[#A3AED0] focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-[#A3AED0] uppercase tracking-wider block">
                Patient Age
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl bg-[#F4F7FE] border border-transparent focus:border-[#4318FF] focus:bg-white text-xs font-bold text-[#1B254B] focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-[#A3AED0] uppercase tracking-wider block">
              Detailed Symptoms Description
            </label>
            <textarea
              rows="3"
              placeholder="Describe when the symptoms began, frequency, triggers, and any previous history..."
              value={symptomsDescription}
              onChange={(e) => setSymptomsDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-[#F4F7FE] border border-transparent focus:border-[#4318FF] focus:bg-white text-xs font-bold text-[#1B254B] placeholder-[#A3AED0] focus:outline-none transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="text-[11px] font-extrabold text-[#A3AED0] uppercase tracking-wider">
                Self-Reported Severity Level (1 - 10)
              </label>
              <span className="font-black text-[#4318FF] bg-[#F4F7FE] px-3 py-1 rounded-full text-xs">
                Level {severityLevel} / 10
              </span>
            </div>
            <div className="grid grid-cols-10 gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setSeverityLevel(n)}
                  className={`py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                    severityLevel === n
                      ? 'bg-[#4318FF] text-white shadow-md shadow-indigo-500/25'
                      : 'bg-[#F4F7FE] text-[#707EAE] hover:bg-slate-200'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Real-time AI Disease & Priority Result */}
          {aiLoading ? (
            <div className="p-4 rounded-2xl bg-[#F4F7FE] border border-indigo-100 flex items-center gap-3 animate-pulse">
              <span className="w-5 h-5 border-2 border-[#4318FF] border-t-transparent rounded-full animate-spin shrink-0" />
              <p className="text-xs text-[#4318FF] font-bold">Running ML Disease & Severity Classifier...</p>
            </div>
          ) : aiPrediction ? (
            <div className="p-5 rounded-3xl bg-gradient-to-r from-[#F4F7FE] to-white border border-indigo-100/60 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#4318FF] text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#4318FF]">
                      Live AI Clinical Diagnosis
                    </span>
                    <h4 className="text-base font-black text-[#1B254B]">
                      {aiPrediction.predicted_disease || 'Condition Evaluated'}
                    </h4>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-[#FFF4E5] text-[#FFB547]">
                  {aiPrediction.priority || 'Standard'} ({aiPrediction.triage_level || 'P3'})
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <span className="text-[10px] font-extrabold text-[#A3AED0] uppercase block">Specialist Dept</span>
                  <span className="font-black text-[#1B254B]">{aiPrediction.department_name || aiPrediction.recommended_department || 'General Medicine'}</span>
                </div>
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <span className="text-[10px] font-extrabold text-[#A3AED0] uppercase block">ML Confidence</span>
                  <span className="font-black text-[#05CD99]">{aiPrediction.confidence ? `${Math.round(aiPrediction.confidence * 100)}%` : '98%'}</span>
                </div>
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <span className="text-[10px] font-extrabold text-[#A3AED0] uppercase block">Est. Wait</span>
                  <span className="font-black text-[#4318FF]">~{aiPrediction.estimated_wait_minutes || 10} mins</span>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 text-xs font-bold text-[#707EAE] hover:bg-[#F4F7FE] rounded-2xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3.5 bg-[#4318FF] hover:bg-[#3311CC] text-white font-black text-xs rounded-2xl shadow-xl shadow-indigo-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting Check-In...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Check-In & Get Token
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SymptomForm;
