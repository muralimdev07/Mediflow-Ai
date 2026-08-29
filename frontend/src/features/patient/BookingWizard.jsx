import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { useUiStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import {
  X, ChevronRight, ChevronLeft, User, Activity, Phone,
  Calendar, CheckCircle2, CreditCard, Download, AlertCircle,
  Stethoscope, Clock, Users, Sparkles, FileText, Shield,
  MapPin, Star, RotateCcw, Check
} from 'lucide-react';

// ── Validation helpers ───────────────────────────────────────
const validators = {
  fullName: (v) => {
    if (!v?.trim()) return 'Full name is required';
    if (v.trim().split(' ').length < 2) return 'Please enter both first and last name';
    if (v.trim().length < 3) return 'Name must be at least 3 characters';
    return null;
  },
  age: (v) => {
    const n = parseInt(v);
    if (!v && v !== 0) return 'Age is required';
    if (isNaN(n) || n < 0 || n > 120) return 'Age must be between 0 and 120';
    return null;
  },
  gender: (v) => (!v ? 'Please select a gender' : null),
  chiefComplaint: (v) => {
    if (!v?.trim()) return 'Chief complaint is required';
    if (v.trim().length < 5) return 'Please describe your main symptom (min 5 chars)';
    return null;
  },
  symptomsDescription: (v) => {
    if (!v?.trim()) return 'Symptom description is required';
    if (v.trim().length < 20) return `Please provide more detail (${v.trim().length}/20 chars min)`;
    return null;
  },
  phone: (v) => {
    if (!v?.trim()) return 'Phone number is required';
    const cleaned = v.replace(/[\s\-\(\)]/g, '');
    if (!/^(\+?[0-9]{10,15})$/.test(cleaned)) return 'Enter a valid phone number (10-15 digits)';
    return null;
  },
  email: (v) => {
    if (!v) return null; // optional
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address';
    return null;
  },
  preferredDate: (v) => {
    if (!v) return 'Please select a preferred date';
    const d = new Date(v);
    const today = new Date(); today.setHours(0,0,0,0);
    if (d < today) return 'Please select a future date';
    return null;
  },
  preferredTimeSlot: (v) => (!v ? 'Please select a time slot' : null),
};

const TIME_SLOTS = [
  '09:00 AM','09:30 AM','10:00 AM','10:30 AM',
  '11:00 AM','11:30 AM','12:00 PM','12:30 PM',
  '02:00 PM','02:30 PM','03:00 PM','03:30 PM',
  '04:00 PM','04:30 PM','05:00 PM',
];

const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const SEVERITIES = [1,2,3,4,5,6,7,8,9,10];

const STEP_LABELS = [
  { label: 'Patient Info', icon: User },
  { label: 'Symptoms', icon: Activity },
  { label: 'Contact & Schedule', icon: Calendar },
  { label: 'Review', icon: FileText },
  { label: 'Payment', icon: CreditCard },
];

// ── Field component ──────────────────────────────────────────
const Field = ({ label, error, children, required, hint }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-1 text-[11px] font-extrabold text-[#1E293B] uppercase tracking-wider">
      {label}
      {required && <span className="text-rose-500">*</span>}
    </label>
    {children}
    {hint && !error && <p className="text-[11px] text-slate-400">{hint}</p>}
    {error && (
      <p className="flex items-center gap-1 text-xs text-rose-500 animate-fade-in font-semibold">
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{error}
      </p>
    )}
  </div>
);

// ── Step 1: Patient Details ──────────────────────────────────
const Step1 = ({ data, onChange, errors }) => (
  <div className="space-y-5">
    <div className="flex items-center gap-3.5 mb-5 pb-3 border-b border-slate-100">
      <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] text-[#5046E5] flex items-center justify-center shrink-0 shadow-sm">
        <User className="w-6 h-6 stroke-[2]" />
      </div>
      <div>
        <h3 className="text-lg font-black text-[#1E293B]">Patient Details</h3>
        <p className="text-xs text-slate-400 font-medium">Basic information about the patient</p>
      </div>
    </div>

    <Field label="Full Name" required error={errors.fullName}>
      <input
        id="bw-full-name"
        className={`w-full px-4 py-3 rounded-2xl bg-[#F8FAFC] border ${
          errors.fullName ? 'border-rose-400' : 'border-slate-200/80 focus:border-[#5046E5]'
        } text-xs font-bold text-[#1E293B] placeholder-slate-400 focus:bg-white focus:outline-none transition-all`}
        placeholder="e.g. Sakthi Sundar"
        value={data.fullName}
        onChange={e => onChange('fullName', e.target.value)}
      />
    </Field>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label="Age" required error={errors.age}>
        <input
          id="bw-age"
          type="number"
          min="0" max="120"
          className={`w-full px-4 py-3 rounded-2xl bg-[#F8FAFC] border ${
            errors.age ? 'border-rose-400' : 'border-slate-200/80 focus:border-[#5046E5]'
          } text-xs font-bold text-[#1E293B] placeholder-slate-400 focus:bg-white focus:outline-none transition-all`}
          placeholder="e.g. 28"
          value={data.age}
          onChange={e => onChange('age', e.target.value)}
        />
      </Field>

      <Field label="Gender" required error={errors.gender}>
        <select
          id="bw-gender"
          className={`w-full px-4 py-3 rounded-2xl bg-[#F8FAFC] border ${
            errors.gender ? 'border-rose-400' : 'border-slate-200/80 focus:border-[#5046E5]'
          } text-xs font-bold text-[#1E293B] focus:bg-white focus:outline-none transition-all cursor-pointer`}
          value={data.gender}
          onChange={e => onChange('gender', e.target.value)}
        >
          <option value="">Select gender</option>
          {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </Field>
    </div>

    <div className="p-4 rounded-2xl bg-[#EEF2FF]/60 border border-indigo-100">
      <div className="flex items-start gap-3">
        <Shield className="w-4 h-4 text-[#5046E5] mt-0.5 flex-shrink-0" />
        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          Your personal data is encrypted and stored securely. We comply with all healthcare data protection regulations.
        </p>
      </div>
    </div>
  </div>
);

// ── Step 2: Symptoms ─────────────────────────────────────────
const Step2 = ({ data, onChange, errors, aiPrediction, aiLoading }) => (
  <div className="space-y-5">
    <div className="flex items-center gap-3.5 mb-5 pb-3 border-b border-slate-100">
      <div className="w-12 h-12 rounded-2xl bg-[#FAF5FF] text-[#9333EA] flex items-center justify-center shrink-0 shadow-sm">
        <Activity className="w-6 h-6 stroke-[2]" />
      </div>
      <div>
        <h3 className="text-lg font-black text-[#1E293B]">Symptom Details</h3>
        <p className="text-xs text-slate-400 font-medium">Help our AI analyze your condition accurately</p>
      </div>
    </div>

    <Field label="Chief Complaint" required error={errors.chiefComplaint} hint="Your primary symptom or reason for visit">
      <input
        id="bw-chief-complaint"
        className={`w-full px-4 py-3 rounded-2xl bg-[#F8FAFC] border ${
          errors.chiefComplaint ? 'border-rose-400' : 'border-slate-200/80 focus:border-[#5046E5]'
        } text-xs font-bold text-[#1E293B] placeholder-slate-400 focus:bg-white focus:outline-none transition-all`}
        placeholder="e.g. high back pain, chest tightness, severe migraine"
        value={data.chiefComplaint}
        onChange={e => onChange('chiefComplaint', e.target.value)}
      />
    </Field>

    <Field label="Symptom Description" required error={errors.symptomsDescription}
      hint={`Describe onset, triggers, and any medications taken. (${data.symptomsDescription?.length || 0}/20 min chars)`}>
      <textarea
        id="bw-symptoms-desc"
        rows="3"
        className={`w-full px-4 py-3 rounded-2xl bg-[#F8FAFC] border ${
          errors.symptomsDescription ? 'border-rose-400' : 'border-slate-200/80 focus:border-[#5046E5]'
        } text-xs font-bold text-[#1E293B] placeholder-slate-400 focus:bg-white focus:outline-none transition-all resize-none`}
        placeholder="When did it start? How severe? Any existing conditions, allergies, or medications you take..."
        value={data.symptomsDescription}
        onChange={e => onChange('symptomsDescription', e.target.value)}
      />
    </Field>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label="Severity Level" hint="1 = Mild, 10 = Severe">
        <div className="grid grid-cols-5 gap-1.5">
          {SEVERITIES.map(n => (
            <button
              key={n} type="button"
              id={`bw-severity-${n}`}
              onClick={() => onChange('severityLevel', n)}
              className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                data.severityLevel === n
                  ? 'bg-[#5046E5] text-white shadow-md shadow-indigo-500/25'
                  : 'bg-[#F8FAFC] border border-slate-200/80 text-slate-600 hover:bg-slate-100'
              }`}
            >{n}</button>
          ))}
        </div>
      </Field>

      <Field label="Duration">
        <select
          id="bw-duration"
          className="w-full px-4 py-3 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 focus:border-[#5046E5] text-xs font-bold text-[#1E293B] focus:bg-white focus:outline-none transition-all cursor-pointer"
          value={data.symptomDuration}
          onChange={e => onChange('symptomDuration', e.target.value)}
        >
          <option value="">Select duration</option>
          <option value="Today">Started today</option>
          <option value="1-2 days">1-2 days</option>
          <option value="3-7 days">3-7 days</option>
          <option value="1-2 weeks">1-2 weeks</option>
          <option value="1 month+">More than a month</option>
          <option value="Chronic">Chronic / ongoing</option>
        </select>
      </Field>
    </div>

    {/* Real-time ML Prediction Card */}
    {aiLoading ? (
      <div className="p-4 rounded-2xl bg-[#EEF2FF] border border-indigo-100 flex items-center gap-3 animate-pulse">
        <span className="w-5 h-5 border-2 border-[#5046E5] border-t-transparent rounded-full animate-spin shrink-0" />
        <p className="text-xs text-[#5046E5] font-bold">Running ML Disease & Priority Classifier...</p>
      </div>
    ) : aiPrediction ? (
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#EEF2FF] to-white border border-indigo-100 shadow-sm space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#5046E5] text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#5046E5]">
                AI Detected Disease & Severity
              </span>
              <h4 className="text-sm font-black text-[#1E293B]">{aiPrediction.predicted_disease}</h4>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#FFFBEB] text-[#D97706] border border-amber-200">
              {aiPrediction.priority} ({aiPrediction.triage_level})
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs pt-1">
          <div className="p-2.5 bg-white rounded-xl shadow-xs border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Specialist</span>
            <span className="font-extrabold text-[#1E293B] truncate block">{aiPrediction.department_name}</span>
          </div>
          <div className="p-2.5 bg-white rounded-xl shadow-xs border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Age Category</span>
            <span className="font-extrabold text-[#1E293B]">{aiPrediction.age_category}</span>
          </div>
          <div className="p-2.5 bg-white rounded-xl shadow-xs border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">ML Confidence</span>
            <span className="font-extrabold text-[#05CD99]">{Math.round(aiPrediction.confidence * 100)}%</span>
          </div>
        </div>
      </div>
    ) : (
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
        <div className="flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">AI Triage & Doctor Matching</p>
            <p>Enter your chief complaint and symptoms. Our ML model will automatically analyze disease likelihood and assign the right specialist.</p>
          </div>
        </div>
      </div>
    )}
  </div>
);

// ── Step 3: Contact & Schedule ───────────────────────────────
const Step3 = ({ data, onChange, errors, departments }) => {
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3.5 mb-5 pb-3 border-b border-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 shadow-sm">
          <Calendar className="w-6 h-6 stroke-[2]" />
        </div>
        <div>
          <h3 className="text-lg font-black text-[#1E293B]">Contact & Schedule</h3>
          <p className="text-xs text-slate-400 font-medium">How to reach you and when you'd like to visit</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Phone Number" required error={errors.phone} hint="10-digit mobile or international">
          <input
            id="bw-phone"
            type="tel"
            className={`w-full px-4 py-3 rounded-2xl bg-[#F8FAFC] border ${
              errors.phone ? 'border-rose-400' : 'border-slate-200/80 focus:border-[#5046E5]'
            } text-xs font-bold text-[#1E293B] placeholder-slate-400 focus:bg-white focus:outline-none transition-all`}
            placeholder="+91 98765 43210"
            value={data.phone}
            onChange={e => onChange('phone', e.target.value)}
          />
        </Field>

        <Field label="Email Address" hint="For confirmation & PDF receipt">
          <input
            id="bw-email"
            type="email"
            className="w-full px-4 py-3 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 focus:border-[#5046E5] text-xs font-bold text-[#1E293B] placeholder-slate-400 focus:bg-white focus:outline-none transition-all"
            placeholder="patient@mediflow.ai"
            value={data.email}
            onChange={e => onChange('email', e.target.value)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Preferred Date" required error={errors.preferredDate}>
          <input
            id="bw-date"
            type="date"
            min={today}
            max={maxDateStr}
            className={`w-full px-4 py-3 rounded-2xl bg-[#F8FAFC] border ${
              errors.preferredDate ? 'border-rose-400' : 'border-slate-200/80 focus:border-[#5046E5]'
            } text-xs font-bold text-[#1E293B] focus:bg-white focus:outline-none transition-all cursor-pointer`}
            value={data.preferredDate}
            onChange={e => onChange('preferredDate', e.target.value)}
          />
        </Field>

        <Field label="Time Slot" required error={errors.preferredTimeSlot}>
          <select
            id="bw-time-slot"
            className={`input ${errors.preferredTimeSlot ? 'border-red-500/60' : ''}`}
            value={data.preferredTimeSlot}
            onChange={e => onChange('preferredTimeSlot', e.target.value)}
          >
            <option value="">Select time</option>
            {TIME_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Preferred Department" hint="Optional — AI will match based on your symptoms">
        <select
          id="bw-department"
          className="input"
          value={data.preferredDepartmentId}
          onChange={e => onChange('preferredDepartmentId', e.target.value)}
        >
          <option value="">Let AI decide (Recommended)</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </Field>
    </div>
  );
};

// ── Step 4: Review & Confirm ─────────────────────────────────
const Step4 = ({ data, bookingResult, loading, onBook, onProceedToPayment, departments, aiPrediction }) => {
  const dept = departments.find(d => d.id === data.preferredDepartmentId);

  const reviewRows = [
    { label: 'Full Name', value: data.fullName },
    { label: 'Age / Gender', value: `${data.age} yrs • ${data.gender}` },
    { label: 'Chief Complaint', value: data.chiefComplaint },
    aiPrediction && { label: 'AI Diagnosis', value: `${aiPrediction.predicted_disease} (${aiPrediction.priority} priority)` },
    { label: 'Symptoms', value: data.symptomsDescription?.slice(0, 100) + (data.symptomsDescription?.length > 100 ? '...' : '') },
    data.severityLevel && { label: 'Severity', value: `${data.severityLevel}/10` },
    data.symptomDuration && { label: 'Duration', value: data.symptomDuration },
    { label: 'Phone', value: data.phone },
    data.email && { label: 'Email', value: data.email },
    { label: 'Preferred Date', value: data.preferredDate },
    { label: 'Time Slot', value: data.preferredTimeSlot },
    (dept || aiPrediction) && { label: 'Department', value: dept?.name || aiPrediction?.department_name },
  ].filter(Boolean);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3.5 mb-5 pb-3 border-b border-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] text-[#5046E5] flex items-center justify-center shrink-0 shadow-sm">
          <FileText className="w-6 h-6 stroke-[2]" />
        </div>
        <div>
          <h3 className="text-lg font-black text-[#1E293B]">Review & Confirm</h3>
          <p className="text-xs text-slate-400 font-medium">Verify your details before storing the booking</p>
        </div>
      </div>

      {!bookingResult ? (
        <>
          <div className="rounded-2xl border border-slate-200/80 overflow-hidden divide-y divide-slate-100 bg-white">
            {reviewRows.map((row, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3 bg-white hover:bg-slate-50/50 transition-colors">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider w-32 flex-shrink-0 pt-0.5">{row.label}</span>
                <span className="text-xs font-bold text-[#1E293B] break-words">{row.value}</span>
              </div>
            ))}
          </div>

          {aiPrediction && (
            <div className="p-4 rounded-2xl bg-[#EEF2FF] border border-indigo-100 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#5046E5] mt-0.5 flex-shrink-0" />
              <div className="text-xs text-slate-700">
                <span className="font-bold text-[#5046E5]">AI Matched Diagnosis:</span> {aiPrediction.predicted_disease} — {aiPrediction.ai_summary}
              </div>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-amber-200">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#D97706] mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-900 font-medium">Clicking "Store & Generate Booking" will securely save your information and generate a unique Booking Reference ID. Payment is the next step.</p>
            </div>
          </div>

          <button
            id="bw-confirm-booking-btn"
            disabled={loading}
            onClick={onBook}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-[#5046E5] hover:bg-[#4338CA] text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</>
            ) : (
              <><Shield className="w-4 h-4" />Store Booking & Generate Reference ID</>
            )}
          </button>
        </>
      ) : (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#E6FAF5] border border-emerald-200 text-center">
            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-full bg-emerald-100 text-[#05CD99]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            </div>
            <h4 className="text-lg font-black text-[#1E293B] mb-1">Booking Stored Successfully!</h4>
            <p className="text-xs text-slate-500">Your booking reference ID has been generated</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Booking Reference</p>
              <p className="font-mono font-black text-[#5046E5] text-sm">{bookingResult.booking_reference}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Queue Position</p>
              <p className="text-2xl font-black text-[#1E293B]">#{bookingResult.queue_position}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Est. Wait</p>
              <p className="text-xl font-black text-[#FFB547]">~{bookingResult.estimated_wait_minutes} min</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Consultation Fee</p>
              <p className="text-xl font-black text-[#05CD99]">₹{bookingResult.consultation_fee?.toFixed(0) || bookingResult.net_amount?.toFixed(0)}</p>
            </div>
          </div>

          {bookingResult.matched_doctor && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EEF2FF] text-[#5046E5] flex items-center justify-center">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-[#1E293B] text-xs">{bookingResult.matched_doctor.doctor_name}</p>
                <p className="text-[10px] text-slate-400">{bookingResult.matched_doctor.match_reason || 'AI Matched Specialist'}</p>
              </div>
              <div className="ml-auto flex items-center gap-1 text-amber-500">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="text-xs font-bold">{bookingResult.matched_doctor.score?.toFixed(1) || '4.8'}</span>
              </div>
            </div>
          )}

          <button
            id="bw-proceed-payment-btn"
            onClick={onProceedToPayment}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-[#5046E5] hover:bg-[#4338CA] text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer mt-4"
          >
            <CreditCard className="w-4 h-4" />
            Proceed to Payment & Receipt (Step 5)
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

// ── Step 5: Payment & Confirmation ───────────────────────────
const Step5 = ({ bookingResult, data, onClose }) => {
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle | processing | success | failed
  const [paymentData, setPaymentData] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const { addToast } = useUiStore();
  const printRef = useRef();

  const handlePay = async () => {
    if (!bookingResult?.invoice_id) return;
    setPaymentStatus('processing');
    try {
      const orderRes = await api.post('/payments/create-order', { invoice_id: bookingResult.invoice_id });
      const orderData = (orderRes.data || orderRes)?.data || orderRes.data || orderRes;

      const keyId = orderData.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TVC8OpWDA53FeX';

      const handleSuccess = async (razorpayResponse) => {
        try {
          const verifyRes = await api.post('/payments/verify', {
            razorpay_order_id: razorpayResponse.razorpay_order_id,
            razorpay_payment_id: razorpayResponse.razorpay_payment_id,
            razorpay_signature: razorpayResponse.razorpay_signature,
          });
          const payData = (verifyRes.data || verifyRes)?.data || verifyRes.data || verifyRes;
          setPaymentData(payData);
          setPaymentStatus('success');
          addToast({ type: 'success', title: 'Payment Successful!', message: `Booking ${bookingResult.booking_reference} confirmed.` });
        } catch (err) {
          setPaymentStatus('failed');
          addToast({ type: 'error', title: 'Verification Failed', message: err.message || 'Payment verification failed' });
        }
      };

      const isMockOrder = String(orderData.order_id).startsWith("order_mock_");

      if (window.Razorpay && !isMockOrder && keyId && !keyId.includes("your_key")) {
        try {
          const options = {
            key: keyId,
            amount: orderData.amount,
            currency: orderData.currency || 'INR',
            name: 'MediFlow AI Hospital',
            description: `Booking ${bookingResult.booking_reference}`,
            order_id: orderData.order_id,
            handler: handleSuccess,
            prefill: {
              name: data.fullName,
              email: data.email || orderData.patient_email || '',
              contact: data.phone || '',
            },
            notes: { booking_reference: bookingResult.booking_reference },
            theme: { color: '#0F766E' },
            modal: {
              ondismiss: () => {
                setPaymentStatus('idle');
                addToast({ type: 'warning', title: 'Payment Cancelled', message: 'Razorpay checkout was dismissed.' });
              }
            }
          };
          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', (response) => {
            setPaymentStatus('failed');
            const errReason = response?.error?.description || response?.error?.reason || 'Payment failed';
            addToast({ type: 'error', title: 'Payment Failed', message: errReason });
          });
          rzp.open();
        } catch (e) {
          console.error("Razorpay modal error:", e);
          // Fallback to simulated test payment
          await handleSuccess({
            razorpay_order_id: orderData.order_id,
            razorpay_payment_id: `pay_sandbox_${Date.now()}`,
            razorpay_signature: 'mock_signature_dev',
          });
        }
      } else {
        // Dev / Sandbox fallback payment flow
        await handleSuccess({
          razorpay_order_id: orderData.order_id,
          razorpay_payment_id: `pay_sandbox_${Date.now()}`,
          razorpay_signature: 'mock_signature_dev',
        });
      }
    } catch (err) {
      setPaymentStatus('failed');
      addToast({ type: 'error', title: 'Payment Failed', message: err.message || 'Error initiating payment' });
    }
  };

  const handleDownloadBill = () => {
    const content = printRef.current;
    if (!content) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>MediFlow AI — Bill ${bookingResult.booking_reference}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #111; }
            h1 { font-size: 22px; margin-bottom: 4px; }
            .subtitle { color: #666; font-size: 13px; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; margin: 16px 0; }
            th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
            th { background: #f3f4f6; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
            .total-row td { font-weight: bold; font-size: 16px; border-top: 2px solid #111; }
            .badge { display: inline-block; background: #d1fae5; color: #065f46; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: bold; }
            .ref { font-family: monospace; font-size: 13px; color: #0F766E; }
            .footer { margin-top: 40px; color: #666; font-size: 11px; border-top: 1px solid #e5e7eb; padding-top: 12px; }
          </style>
        </head>
        <body>
          <h1>🏥 MediFlow AI Hospital</h1>
          <p class="subtitle">Official Booking Receipt</p>
          <table>
            <tr><th>Field</th><th>Details</th></tr>
            <tr><td>Booking Reference</td><td class="ref">${bookingResult.booking_reference}</td></tr>
            <tr><td>Patient Name</td><td>${data.fullName}</td></tr>
            <tr><td>Phone</td><td>${data.phone}</td></tr>
            <tr><td>Chief Complaint</td><td>${data.chiefComplaint}</td></tr>
            <tr><td>Appointment Date</td><td>${data.preferredDate}</td></tr>
            <tr><td>Time Slot</td><td>${data.preferredTimeSlot}</td></tr>
            <tr><td>Invoice Number</td><td>${bookingResult.invoice_number}</td></tr>
            <tr><td>Payment ID</td><td>${paymentData?.razorpay_payment_id || paymentData?.id || 'N/A'}</td></tr>
            <tr><td>Payment Status</td><td><span class="badge">PAID</span></td></tr>
          </table>
          <table>
            <tr><th>Description</th><th>Qty</th><th>Amount</th></tr>
            <tr><td>Consultation Fee</td><td>1</td><td>₹${bookingResult.consultation_fee?.toFixed(2) || (bookingResult.amount).toFixed(2)}</td></tr>
            <tr><td>GST (18%)</td><td>—</td><td>₹${bookingResult.tax_amount?.toFixed(2)}</td></tr>
            <tr class="total-row"><td colspan="2">Total Amount Paid</td><td>₹${bookingResult.net_amount?.toFixed(2)}</td></tr>
          </table>
          <p class="footer">Generated on ${new Date().toLocaleString()} | MediFlow AI Hospital Management System | This is a computer-generated receipt.</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  if (paymentStatus === 'success') {
    return (
      <div className="space-y-5" ref={printRef}>
        {/* Confirmation Header */}
        <div className="text-center py-4">
          <div className="flex justify-center mb-3">
            <div className="p-3.5 rounded-full bg-[#E6FAF5] text-[#05CD99]">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          </div>
          <h3 className="text-xl font-black text-[#1E293B] mb-1">Your booking is confirmed!</h3>
          <p className="text-xs text-slate-400 font-medium">Payment received • Appointment scheduled</p>
        </div>

        {/* Reference and Token Box */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-[#EEF2FF] border border-indigo-100 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Booking Reference</p>
            <p className="font-mono text-sm font-black text-[#5046E5]">{bookingResult.booking_reference}</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-amber-200 text-center">
            <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1">Your Unique Token</p>
            <p className="font-mono text-2xl font-black text-[#D97706] tracking-wider">
              {bookingResult.token || `A-${String(bookingResult.queue_position || 1).padStart(3, '0')}`}
            </p>
          </div>
        </div>

        {/* Itemized Bill */}
        <div className="rounded-2xl border border-slate-200/80 overflow-hidden bg-white">
          <div className="px-4 py-3 bg-[#F8FAFC] border-b border-slate-100 flex items-center justify-between">
            <h4 className="text-xs font-black text-[#1E293B] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#5046E5]" /> Generated Hospital Bill
            </h4>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#E6FAF5] text-[#05CD99] uppercase">
              PAID VIA RAZORPAY
            </span>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            <div className="flex justify-between px-4 py-2.5">
              <span className="text-slate-500 font-medium">Consultation Fee</span>
              <span className="text-[#1E293B] font-bold">₹{bookingResult.consultation_fee?.toFixed(2) || bookingResult.amount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between px-4 py-2.5">
              <span className="text-slate-500 font-medium">GST (18%)</span>
              <span className="text-[#1E293B] font-bold">₹{bookingResult.tax_amount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between px-4 py-3 text-sm font-black bg-[#F8FAFC]">
              <span className="text-[#5046E5]">Total Paid</span>
              <span className="text-[#5046E5]">₹{bookingResult.net_amount?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            id="bw-download-bill-btn"
            onClick={handleDownloadBill}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download Bill Receipt
          </button>
          <button
            id="bw-done-btn"
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#5046E5] hover:bg-[#4338CA] text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" /> Track Live Queue & Token
          </button>
        </div>
      </div>
    );
  }

  // Idle / Processing / Failed states
  const isFailed = paymentStatus === 'failed';
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3.5 mb-5 pb-3 border-b border-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-[#E6FAF5] text-[#05CD99] flex items-center justify-center shrink-0 shadow-sm">
          <CreditCard className="w-6 h-6 stroke-[2]" />
        </div>
        <div>
          <h3 className="text-lg font-black text-[#1E293B]">Complete Payment</h3>
          <p className="text-xs text-slate-400 font-medium">Secure payment via Razorpay</p>
        </div>
      </div>

      {isFailed && (
        <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-rose-200">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-rose-700 mb-0.5">Payment Failed</p>
              <p className="text-xs text-rose-600">Your payment was not processed. Please try again. Your booking reference is saved.</p>
            </div>
          </div>
        </div>
      )}

      {/* Booking summary */}
      <div className="rounded-2xl border border-slate-200/80 overflow-hidden bg-white">
        <div className="px-4 py-3 border-b border-slate-100 bg-[#F8FAFC]">
          <p className="text-[10px] font-black text-[#5046E5] uppercase tracking-wider">Booking Payment Summary</p>
        </div>
        <div className="divide-y divide-slate-100 text-xs">
          <div className="flex justify-between px-4 py-2.5">
            <span className="text-slate-500 font-medium">Booking Reference</span>
            <span className="font-mono font-bold text-[#5046E5]">{bookingResult?.booking_reference}</span>
          </div>
          <div className="flex justify-between px-4 py-2.5">
            <span className="text-slate-500 font-medium">Consultation Fee</span>
            <span className="text-[#1E293B] font-bold">₹{bookingResult?.consultation_fee?.toFixed(2) || bookingResult?.amount?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between px-4 py-2.5">
            <span className="text-slate-500 font-medium">GST (18%)</span>
            <span className="text-[#1E293B] font-bold">₹{bookingResult?.tax_amount?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between px-4 py-3 font-black text-sm bg-[#F8FAFC]">
            <span className="text-[#5046E5]">Total Amount</span>
            <span className="text-[#5046E5]">₹{bookingResult?.net_amount?.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <button
        id="bw-pay-btn"
        disabled={paymentStatus === 'processing'}
        onClick={handlePay}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-[#5046E5] hover:bg-[#4338CA] text-white font-black text-xs shadow-md shadow-indigo-500/20 transition-all disabled:opacity-60 cursor-pointer"
      >
        {paymentStatus === 'processing' ? (
          <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing Payment...</>
        ) : isFailed ? (
          <><RotateCcw className="w-4 h-4" />Retry Payment — ₹{bookingResult?.net_amount?.toFixed(2)}</>
        ) : (
          <><CreditCard className="w-4 h-4" />Pay ₹{bookingResult?.net_amount?.toFixed(2)} via Razorpay</>
        )}
      </button>

      <p className="text-center text-[11px] text-slate-400 font-medium">
        🔒 Payments are encrypted and processed securely by Razorpay
      </p>
    </div>
  );
};

// ── Main BookingWizard Component ─────────────────────────────
export const BookingWizard = ({ isOpen, onClose, onSuccess, initialDoctor = null }) => {
  const [step, setStep] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [bookingResult, setBookingResult] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [aiPrediction, setAiPrediction] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const { addToast } = useUiStore();
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    fullName: user?.full_name || '',
    age: '',
    gender: '',
    chiefComplaint: '',
    symptomsDescription: '',
    severityLevel: null,
    symptomDuration: '',
    phone: '',
    email: user?.email || '',
    preferredDate: '',
    preferredTimeSlot: '',
    preferredDepartmentId: '',
    preferredDoctorId: '',
  });

  const [errors, setErrors] = useState({});

  // Sync initialDoctor when opened
  useEffect(() => {
    if (initialDoctor && isOpen) {
      setFormData(prev => ({
        ...prev,
        preferredDoctorId: initialDoctor.id || initialDoctor.user_id || '',
        preferredDepartmentId: initialDoctor.department_id || prev.preferredDepartmentId,
      }));
    }
  }, [initialDoctor, isOpen]);

  // Fetch departments on mount
  useEffect(() => {
    if (!isOpen) return;
    api.get('/appointments/departments')
      .then(res => setDepartments((res.data || res)?.data || []))
      .catch(() => {
        api.get('/departments')
          .then(res => setDepartments((res.data || res)?.data || []))
          .catch(() => {});
      });
  }, [isOpen]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setBookingResult(null);
      setAiPrediction(null);
      setErrors({});
    }
  }, [isOpen]);

  // Real-time debounced AI disease and priority prediction (instant 150ms response)
  useEffect(() => {
    const complaint = formData.chiefComplaint?.trim();
    if (!complaint || complaint.length < 2) {
      setAiPrediction(null);
      return;
    }

    const timer = setTimeout(async () => {
      setAiLoading(true);
      try {
        const res = await api.post('/triage/predict-disease', {
          chief_complaint: formData.chiefComplaint,
          symptoms_description: formData.symptomsDescription || '',
          age: parseInt(formData.age) || 30,
          severity_level: formData.severityLevel || 5,
        });
        const pred = (res.data || res)?.data || res.data || res;
        setAiPrediction(pred);

        // Auto-select matching department if not manually selected
        if (pred?.recommended_department_id && !formData.preferredDepartmentId) {
          setFormData(prev => ({ ...prev, preferredDepartmentId: pred.recommended_department_id }));
        }
      } catch (err) {
        console.error('AI disease prediction error:', err);
      } finally {
        setAiLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [formData.chiefComplaint, formData.symptomsDescription, formData.age, formData.severityLevel]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validateStep = (stepNum) => {
    const newErrors = {};
    if (stepNum === 1) {
      newErrors.fullName = validators.fullName(formData.fullName);
      newErrors.age = validators.age(formData.age);
      newErrors.gender = validators.gender(formData.gender);
    } else if (stepNum === 2) {
      newErrors.chiefComplaint = validators.chiefComplaint(formData.chiefComplaint);
      newErrors.symptomsDescription = validators.symptomsDescription(formData.symptomsDescription);
    } else if (stepNum === 3) {
      newErrors.phone = validators.phone(formData.phone);
      newErrors.email = validators.email(formData.email);
      newErrors.preferredDate = validators.preferredDate(formData.preferredDate);
      newErrors.preferredTimeSlot = validators.preferredTimeSlot(formData.preferredTimeSlot);
    }
    const cleaned = Object.fromEntries(Object.entries(newErrors).filter(([, v]) => v !== null));
    setErrors(cleaned);
    return Object.keys(cleaned).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep(s => Math.min(s + 1, 5));
  };

  const handleBack = () => {
    setErrors({});
    setStep(s => Math.max(s - 1, 1));
  };

  const handleBook = async () => {
    setBookingLoading(true);
    try {
      const payload = {
        full_name: formData.fullName,
        age: parseInt(formData.age) || 30,
        gender: formData.gender,
        chief_complaint: formData.chiefComplaint,
        symptoms_description: formData.symptomsDescription,
        severity_level: formData.severityLevel || 5,
        symptom_duration: formData.symptomDuration || null,
        phone: formData.phone,
        email: formData.email || null,
        preferred_date: formData.preferredDate,
        preferred_time_slot: formData.preferredTimeSlot,
        preferred_department_id: formData.preferredDepartmentId || null,
        preferred_doctor_id: formData.preferredDoctorId || (initialDoctor?.id || null),
      };

      const res = await api.post('/appointments/book', payload);
      const result = (res.data || res)?.data || res.data || res;
      setBookingResult(result);
      addToast({ type: 'success', title: 'Booking Confirmed!', message: `Reference: ${result.booking_reference}` });
    } catch (err) {
      addToast({ type: 'error', title: 'Booking Failed', message: err.message });
    } finally {
      setBookingLoading(false);
    }
  };

  const handleClose = () => {
    if (onSuccess && bookingResult) onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  const canGoNext = step < 4 || (step === 4 && !!bookingResult);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-white border border-slate-100 rounded-3xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0 bg-white">
          <div>
            <h2 className="text-xl font-black text-[#1E293B]">Book an Appointment</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">Step {step} of 5 — {STEP_LABELS[step - 1].label}</p>
          </div>
          <button
            id="bw-close-btn"
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar in Clean Theme */}
        <div className="px-6 py-3.5 border-b border-slate-100 flex-shrink-0 bg-[#F8FAFC]">
          <div className="flex items-center gap-1.5">
            {STEP_LABELS.map((s, i) => {
              const StepIcon = s.icon;
              const isComplete = i + 1 < step;
              const isCurrent = i + 1 === step;
              return (
                <React.Fragment key={i}>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                    isCurrent ? 'bg-[#EEF2FF] text-[#5046E5] font-extrabold shadow-xs' :
                    isComplete ? 'text-[#05CD99] font-bold' : 'text-slate-400'
                  }`}>
                    {isComplete
                      ? <CheckCircle2 className="w-4 h-4 text-[#05CD99]" />
                      : <StepIcon className={`w-4 h-4 ${isCurrent ? 'text-[#5046E5]' : ''}`} />
                    }
                    <span className="text-xs hidden sm:block">{s.label}</span>
                  </div>
                  {i < STEP_LABELS.length - 1 && (
                    <div className={`flex-1 h-0.5 rounded-full ${i + 1 < step ? 'bg-[#05CD99]' : 'bg-slate-200'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 bg-white">
          {step === 1 && <Step1 data={formData} onChange={handleChange} errors={errors} />}
          {step === 2 && (
            <Step2
              data={formData}
              onChange={handleChange}
              errors={errors}
              aiPrediction={aiPrediction}
              aiLoading={aiLoading}
            />
          )}
          {step === 3 && <Step3 data={formData} onChange={handleChange} errors={errors} departments={departments} />}
          {step === 4 && (
            <Step4
              data={formData}
              bookingResult={bookingResult}
              loading={bookingLoading}
              onBook={handleBook}
              onProceedToPayment={() => setStep(5)}
              departments={departments}
              aiPrediction={aiPrediction}
            />
          )}
          {step === 5 && (
            <Step5
              bookingResult={bookingResult}
              data={formData}
              onClose={handleClose}
            />
          )}
        </div>

        {/* Footer Navigation — hidden on step 4 (has own button) and step 5 */}
        {step !== 4 && step !== 5 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 flex-shrink-0 bg-white">
            <button
              id="bw-back-btn"
              disabled={step === 1}
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            <div className="flex items-center gap-1.5">
              {[1,2,3,4,5].map(n => (
                <div key={n} className={`h-2 rounded-full transition-all ${n === step ? 'bg-[#5046E5] w-6' : n < step ? 'bg-[#05CD99] w-2' : 'bg-slate-200 w-2'}`} />
              ))}
            </div>

            <button
              id="bw-next-btn"
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#5046E5] hover:bg-[#4338CA] text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
            >
              {step === 3 ? 'Review Details' : 'Next'} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 4 footer — just back */}
        {step === 4 && !bookingResult && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 flex-shrink-0 bg-white">
            <button
              id="bw-back-btn-step4"
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all text-xs font-bold cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <div className="flex items-center gap-1.5">
              {[1,2,3,4,5].map(n => (
                <div key={n} className={`h-2 rounded-full transition-all ${n === step ? 'bg-[#5046E5] w-6' : n < step ? 'bg-[#05CD99] w-2' : 'bg-slate-200 w-2'}`} />
              ))}
            </div>
          </div>
        )}

        {/* Step 4 — after booking, show Proceed to Payment */}
        {step === 4 && bookingResult && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 flex-shrink-0 bg-white">
            <span className="text-xs text-slate-400 font-medium">Data stored securely ✓</span>
            <button
              id="bw-proceed-payment-btn"
              onClick={() => setStep(5)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#5046E5] hover:bg-[#4338CA] text-white font-black text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <CreditCard className="w-4 h-4" /> Confirm Booking & Pay
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
