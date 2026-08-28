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
    <label className="flex items-center gap-1 text-xs font-semibold text-slate-300 uppercase tracking-wider">
      {label}
      {required && <span className="text-red-400">*</span>}
    </label>
    {children}
    {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    {error && (
      <p className="flex items-center gap-1 text-xs text-red-400 animate-fade-in">
        <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
      </p>
    )}
  </div>
);

// ── Step 1: Patient Details ──────────────────────────────────
const Step1 = ({ data, onChange, errors }) => (
  <div className="space-y-5">
    <div className="flex items-center gap-3 mb-6">
      <div className="p-3 rounded-xl bg-primary/20 border border-primary/30">
        <User className="w-6 h-6 text-primary-light" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-100">Patient Details</h3>
        <p className="text-sm text-slate-400">Basic information about the patient</p>
      </div>
    </div>

    <Field label="Full Name" required error={errors.fullName}>
      <input
        id="bw-full-name"
        className={`input ${errors.fullName ? 'border-red-500/60 focus:border-red-500' : ''}`}
        placeholder="e.g. Arjun Sharma"
        value={data.fullName}
        onChange={e => onChange('fullName', e.target.value)}
      />
    </Field>

    <div className="grid grid-cols-2 gap-4">
      <Field label="Age" required error={errors.age}>
        <input
          id="bw-age"
          type="number"
          min="0" max="120"
          className={`input ${errors.age ? 'border-red-500/60' : ''}`}
          placeholder="e.g. 28"
          value={data.age}
          onChange={e => onChange('age', e.target.value)}
        />
      </Field>

      <Field label="Gender" required error={errors.gender}>
        <select
          id="bw-gender"
          className={`input ${errors.gender ? 'border-red-500/60' : ''}`}
          value={data.gender}
          onChange={e => onChange('gender', e.target.value)}
        >
          <option value="">Select gender</option>
          {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </Field>
    </div>

    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
      <div className="flex items-start gap-2.5">
        <Shield className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-300">Your personal data is encrypted and stored securely. We comply with all healthcare data protection regulations.</p>
      </div>
    </div>
  </div>
);

// ── Step 2: Symptoms ─────────────────────────────────────────
const Step2 = ({ data, onChange, errors }) => (
  <div className="space-y-5">
    <div className="flex items-center gap-3 mb-6">
      <div className="p-3 rounded-xl bg-orange-500/20 border border-orange-500/30">
        <Activity className="w-6 h-6 text-orange-400" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-100">Symptom Details</h3>
        <p className="text-sm text-slate-400">Help our AI analyze your condition accurately</p>
      </div>
    </div>

    <Field label="Chief Complaint" required error={errors.chiefComplaint} hint="Your primary symptom or reason for visit">
      <input
        id="bw-chief-complaint"
        className={`input ${errors.chiefComplaint ? 'border-red-500/60' : ''}`}
        placeholder="e.g. Severe chest pain, High fever, Back pain"
        value={data.chiefComplaint}
        onChange={e => onChange('chiefComplaint', e.target.value)}
      />
    </Field>

    <Field label="Symptom Description" required error={errors.symptomsDescription}
      hint={`Describe onset, triggers, and any medications taken. (${data.symptomsDescription?.length || 0}/20 min chars)`}>
      <textarea
        id="bw-symptoms-desc"
        className={`input min-h-[110px] resize-y ${errors.symptomsDescription ? 'border-red-500/60' : ''}`}
        placeholder="When did it start? How severe? Any existing conditions, allergies, or medications you take..."
        value={data.symptomsDescription}
        onChange={e => onChange('symptomsDescription', e.target.value)}
      />
    </Field>

    <div className="grid grid-cols-2 gap-4">
      <Field label="Severity Level" hint="1 = Mild, 10 = Severe">
        <div className="grid grid-cols-5 gap-1.5">
          {SEVERITIES.map(n => (
            <button
              key={n} type="button"
              id={`bw-severity-${n}`}
              onClick={() => onChange('severityLevel', n)}
              className={`py-2 rounded-lg text-sm font-bold border transition-all ${
                data.severityLevel === n
                  ? n <= 3 ? 'bg-green-500/30 border-green-500 text-green-300'
                  : n <= 6 ? 'bg-yellow-500/30 border-yellow-500 text-yellow-300'
                  : 'bg-red-500/30 border-red-500 text-red-300'
                  : 'bg-surface/40 border-surface-border/30 text-slate-400 hover:border-slate-500'
              }`}
            >{n}</button>
          ))}
        </div>
      </Field>

      <Field label="Duration">
        <select
          id="bw-duration"
          className="input"
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

    <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
      <div className="flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-primary-light mt-0.5 flex-shrink-0" />
        <div className="text-xs text-slate-300 space-y-1">
          <p className="font-semibold text-slate-100">AI Triage & Doctor Matching</p>
          <p>Your symptoms are analyzed by our XGBoost AI model (P1-P5 urgency scale) to route you to the right specialist instantly.</p>
        </div>
      </div>
    </div>
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
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-teal-500/20 border border-teal-500/30">
          <Phone className="w-6 h-6 text-teal-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-100">Contact & Schedule</h3>
          <p className="text-sm text-slate-400">How to reach you and when you'd like to visit</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Phone Number" required error={errors.phone} hint="10-digit mobile or international">
          <input
            id="bw-phone"
            type="tel"
            className={`input ${errors.phone ? 'border-red-500/60' : ''}`}
            placeholder="e.g. 9876543210"
            value={data.phone}
            onChange={e => onChange('phone', e.target.value)}
          />
        </Field>

        <Field label="Email Address" error={errors.email} hint="Optional — for bill delivery">
          <input
            id="bw-email"
            type="email"
            className={`input ${errors.email ? 'border-red-500/60' : ''}`}
            placeholder="you@example.com"
            value={data.email}
            onChange={e => onChange('email', e.target.value)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Preferred Date" required error={errors.preferredDate}>
          <input
            id="bw-preferred-date"
            type="date"
            min={today}
            max={maxDateStr}
            className={`input ${errors.preferredDate ? 'border-red-500/60' : ''}`}
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
const Step4 = ({ data, bookingResult, loading, onBook, onProceedToPayment, departments }) => {
  const dept = departments.find(d => d.id === data.preferredDepartmentId);

  const reviewRows = [
    { label: 'Full Name', value: data.fullName },
    { label: 'Age / Gender', value: `${data.age} yrs • ${data.gender}` },
    { label: 'Chief Complaint', value: data.chiefComplaint },
    { label: 'Symptoms', value: data.symptomsDescription?.slice(0, 100) + (data.symptomsDescription?.length > 100 ? '...' : '') },
    data.severityLevel && { label: 'Severity', value: `${data.severityLevel}/10` },
    data.symptomDuration && { label: 'Duration', value: data.symptomDuration },
    { label: 'Phone', value: data.phone },
    data.email && { label: 'Email', value: data.email },
    { label: 'Preferred Date', value: data.preferredDate },
    { label: 'Time Slot', value: data.preferredTimeSlot },
    dept && { label: 'Department', value: dept.name },
  ].filter(Boolean);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-violet-500/20 border border-violet-500/30">
          <FileText className="w-6 h-6 text-violet-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-100">Review & Confirm</h3>
          <p className="text-sm text-slate-400">Verify your details before storing the booking</p>
        </div>
      </div>

      {!bookingResult ? (
        <>
          <div className="rounded-xl border border-surface-border/40 overflow-hidden">
            {reviewRows.map((row, i) => (
              <div key={i} className={`flex items-start gap-3 px-4 py-3 ${i % 2 === 0 ? 'bg-surface/30' : 'bg-surface/10'}`}>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider w-32 flex-shrink-0 pt-0.5">{row.label}</span>
                <span className="text-sm text-slate-100 break-words">{row.value}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-300">Clicking "Store & Generate Booking" will securely save your information and generate a unique Booking Reference ID. Payment is the next step.</p>
            </div>
          </div>

          <button
            id="bw-confirm-booking-btn"
            disabled={loading}
            onClick={onBook}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-bold text-sm shadow-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="p-5 rounded-xl bg-green-500/10 border border-green-500/30 text-center">
            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-full bg-green-500/20">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <h4 className="text-lg font-bold text-green-300 mb-1">Booking Stored Successfully!</h4>
            <p className="text-sm text-slate-400">Your booking reference ID has been generated</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-surface/40 border border-surface-border/30 text-center">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Booking Reference</p>
              <p className="font-mono font-bold text-primary-light text-sm">{bookingResult.booking_reference}</p>
            </div>
            <div className="p-4 rounded-xl bg-surface/40 border border-surface-border/30 text-center">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Queue Position</p>
              <p className="text-2xl font-black text-slate-100">#{bookingResult.queue_position}</p>
            </div>
            <div className="p-4 rounded-xl bg-surface/40 border border-surface-border/30 text-center">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Est. Wait</p>
              <p className="text-xl font-black text-amber-400">~{bookingResult.estimated_wait_minutes} min</p>
            </div>
            <div className="p-4 rounded-xl bg-surface/40 border border-surface-border/30 text-center">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Consultation Fee</p>
              <p className="text-xl font-black text-teal-400">₹{bookingResult.consultation_fee?.toFixed(0) || bookingResult.net_amount?.toFixed(0)}</p>
            </div>
          </div>

          {bookingResult.matched_doctor && (
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-primary-light" />
              </div>
              <div>
                <p className="font-bold text-slate-100 text-sm">{bookingResult.matched_doctor.doctor_name}</p>
                <p className="text-xs text-primary-light">{bookingResult.matched_doctor.match_reason || 'AI Matched Specialist'}</p>
              </div>
              <div className="ml-auto flex items-center gap-1 text-yellow-400">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="text-xs font-bold">{bookingResult.matched_doctor.score?.toFixed(1) || '4.8'}</span>
              </div>
            </div>
          )}

          {bookingResult.ai_suggestion && (
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
              <p className="text-xs font-bold text-primary-light mb-1">
                AI Triage: {bookingResult.ai_suggestion.predicted_level}
              </p>
              <p className="text-xs text-slate-300">{bookingResult.ai_suggestion.recommendation}</p>
            </div>
          )}

          <button
            id="bw-proceed-payment-btn"
            onClick={onProceedToPayment}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm shadow-xl transition-all mt-4"
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
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-green-400/20" />
              <div className="relative p-4 rounded-full bg-green-500/20 border border-green-500/30">
                <CheckCircle2 className="w-12 h-12 text-green-400" />
              </div>
            </div>
          </div>
          <h3 className="text-2xl font-black text-green-300 mb-1">Your booking is confirmed!</h3>
          <p className="text-sm text-slate-400">Payment received • Appointment scheduled</p>
        </div>

        {/* Reference Box */}
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 text-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Booking Reference ID</p>
          <p className="font-mono text-xl font-black text-primary-light">{bookingResult.booking_reference}</p>
        </div>

        {/* Appointment Details */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-surface/40 border border-surface-border/30">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-semibold text-slate-400 uppercase">Date</span>
            </div>
            <p className="font-bold text-slate-100 text-sm">{data.preferredDate}</p>
          </div>
          <div className="p-3 rounded-xl bg-surface/40 border border-surface-border/30">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-semibold text-slate-400 uppercase">Time</span>
            </div>
            <p className="font-bold text-slate-100 text-sm">{data.preferredTimeSlot}</p>
          </div>
          <div className="p-3 rounded-xl bg-surface/40 border border-surface-border/30">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-slate-400 uppercase">Queue</span>
            </div>
            <p className="font-bold text-amber-300 text-sm">Position #{bookingResult.queue_position}</p>
          </div>
          <div className="p-3 rounded-xl bg-surface/40 border border-surface-border/30">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-semibold text-slate-400 uppercase">Est. Wait</span>
            </div>
            <p className="font-bold text-orange-300 text-sm">~{bookingResult.estimated_wait_minutes} min</p>
          </div>
        </div>

        {/* Itemized Bill */}
        <div className="rounded-xl border border-surface-border/40 overflow-hidden">
          <div className="px-4 py-3 bg-surface/50 border-b border-surface-border/30">
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary-light" /> Payment Receipt
            </h4>
          </div>
          <div className="divide-y divide-surface-border/20">
            <div className="flex justify-between px-4 py-2.5 text-sm">
              <span className="text-slate-300">Invoice No.</span>
              <span className="font-mono text-xs text-primary-light font-bold">{bookingResult.invoice_number}</span>
            </div>
            <div className="flex justify-between px-4 py-2.5 text-sm">
              <span className="text-slate-300">Payment ID</span>
              <span className="font-mono text-xs text-slate-400">{paymentData?.razorpay_payment_id || paymentData?.id || '—'}</span>
            </div>
            <div className="flex justify-between px-4 py-2.5 text-sm">
              <span className="text-slate-300">Consultation Fee</span>
              <span className="text-slate-100">₹{bookingResult.consultation_fee?.toFixed(2) || bookingResult.amount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between px-4 py-2.5 text-sm">
              <span className="text-slate-300">GST (18%)</span>
              <span className="text-slate-100">₹{bookingResult.tax_amount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between px-4 py-3 text-base font-black bg-teal-500/10">
              <span className="text-teal-300">Total Paid</span>
              <span className="text-teal-300">₹{bookingResult.net_amount?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            id="bw-download-bill-btn"
            onClick={handleDownloadBill}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-surface-border/50 text-slate-300 hover:bg-surface-hover hover:text-slate-100 transition-all text-sm font-semibold"
          >
            <Download className="w-4 h-4" /> Download Bill
          </button>
          <button
            id="bw-done-btn"
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-primary text-white font-bold text-sm shadow-lg hover:opacity-90 transition-all"
          >
            <Check className="w-4 h-4" /> Done
          </button>
        </div>
      </div>
    );
  }

  // Idle / Processing / Failed states
  const isFailed = paymentStatus === 'failed';
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-green-500/20 border border-green-500/30">
          <CreditCard className="w-6 h-6 text-green-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-100">Complete Payment</h3>
          <p className="text-sm text-slate-400">Secure payment via Razorpay</p>
        </div>
      </div>

      {isFailed && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-300 mb-1">Payment Failed</p>
              <p className="text-xs text-red-400">Your payment was not processed. Please try again. Your booking reference is saved — you won't lose your spot.</p>
            </div>
          </div>
        </div>
      )}

      {/* Booking summary */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 overflow-hidden">
        <div className="px-4 py-3 border-b border-primary/20 bg-primary/10">
          <p className="text-xs font-bold text-primary-light uppercase tracking-wider">Booking Summary</p>
        </div>
        <div className="divide-y divide-surface-border/20">
          <div className="flex justify-between px-4 py-2.5 text-sm">
            <span className="text-slate-400">Reference</span>
            <span className="font-mono font-bold text-primary-light text-xs">{bookingResult.booking_reference}</span>
          </div>
          <div className="flex justify-between px-4 py-2.5 text-sm">
            <span className="text-slate-400">Invoice No.</span>
            <span className="font-mono text-xs text-slate-300">{bookingResult.invoice_number}</span>
          </div>
          <div className="flex justify-between px-4 py-2.5 text-sm">
            <span className="text-slate-400">Consultation Fee</span>
            <span className="text-slate-100">₹{bookingResult.consultation_fee?.toFixed(2) || bookingResult.amount?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between px-4 py-2.5 text-sm">
            <span className="text-slate-400">GST (18%)</span>
            <span className="text-slate-100">₹{bookingResult.tax_amount?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between px-4 py-3 font-black text-base">
            <span className="text-teal-300">Total</span>
            <span className="text-teal-300">₹{bookingResult.net_amount?.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <button
        id="bw-pay-btn"
        disabled={paymentStatus === 'processing'}
        onClick={handlePay}
        className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-gradient-to-r from-teal-600 to-primary text-white font-black text-base shadow-xl hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {paymentStatus === 'processing' ? (
          <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing Payment...</>
        ) : isFailed ? (
          <><RotateCcw className="w-5 h-5" />Retry Payment — ₹{bookingResult.net_amount?.toFixed(2)}</>
        ) : (
          <><CreditCard className="w-5 h-5" />Pay ₹{bookingResult.net_amount?.toFixed(2)} via Razorpay</>
        )}
      </button>

      {isFailed && (
        <button
          id="bw-pay-later-btn"
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl border border-surface-border/40 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-all text-sm font-semibold"
        >
          Pay Later — Your booking is saved
        </button>
      )}

      <p className="text-center text-xs text-slate-500">
        🔒 Payments are encrypted and processed securely by Razorpay
      </p>
    </div>
  );
};

// ── Main BookingWizard Component ─────────────────────────────
export const BookingWizard = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [bookingResult, setBookingResult] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
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
  });

  const [errors, setErrors] = useState({});

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
      setErrors({});
    }
  }, [isOpen]);

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
        age: parseInt(formData.age),
        gender: formData.gender,
        chief_complaint: formData.chiefComplaint,
        symptoms_description: formData.symptomsDescription,
        severity_level: formData.severityLevel,
        symptom_duration: formData.symptomDuration || null,
        phone: formData.phone,
        email: formData.email || null,
        preferred_date: formData.preferredDate,
        preferred_time_slot: formData.preferredTimeSlot,
        preferred_department_id: formData.preferredDepartmentId || null,
      };

      const res = await api.post('/appointments/book', payload);
      const result = (res.data || res)?.data || res.data || res;
      setBookingResult(result);
      addToast({ type: 'success', title: 'Booking Stored!', message: `Reference: ${result.booking_reference}` });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-surface-card border border-surface-border/50 rounded-2xl shadow-2xl flex flex-col max-h-[95vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border/30 flex-shrink-0">
          <div>
            <h2 className="text-xl font-black text-slate-100">Book an Appointment</h2>
            <p className="text-xs text-slate-400 mt-0.5">Step {step} of 5 — {STEP_LABELS[step - 1].label}</p>
          </div>
          <button
            id="bw-close-btn"
            onClick={handleClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-surface-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 border-b border-surface-border/20 flex-shrink-0">
          <div className="flex items-center gap-1">
            {STEP_LABELS.map((s, i) => {
              const StepIcon = s.icon;
              const isComplete = i + 1 < step;
              const isCurrent = i + 1 === step;
              return (
                <React.Fragment key={i}>
                  <div className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all ${
                    isCurrent ? 'bg-primary/20 border border-primary/40' :
                    isComplete ? 'text-green-400' : 'text-slate-600'
                  }`}>
                    {isComplete
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                      : <StepIcon className={`w-3.5 h-3.5 ${isCurrent ? 'text-primary-light' : ''}`} />
                    }
                    <span className={`text-xs font-semibold hidden sm:block ${
                      isCurrent ? 'text-primary-light' : isComplete ? 'text-green-400' : 'text-slate-600'
                    }`}>{s.label}</span>
                  </div>
                  {i < STEP_LABELS.length - 1 && (
                    <div className={`flex-1 h-0.5 rounded ${i + 1 < step ? 'bg-green-500/40' : 'bg-surface-border/30'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 1 && <Step1 data={formData} onChange={handleChange} errors={errors} />}
          {step === 2 && <Step2 data={formData} onChange={handleChange} errors={errors} />}
          {step === 3 && <Step3 data={formData} onChange={handleChange} errors={errors} departments={departments} />}
          {step === 4 && (
            <Step4
              data={formData}
              bookingResult={bookingResult}
              loading={bookingLoading}
              onBook={handleBook}
              onProceedToPayment={() => setStep(5)}
              departments={departments}
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
          <div className="flex items-center justify-between px-6 py-4 border-t border-surface-border/30 flex-shrink-0">
            <button
              id="bw-back-btn"
              disabled={step === 1}
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-surface-border/40 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-all text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              {[1,2,3,4,5].map(n => (
                <div key={n} className={`w-2 h-2 rounded-full transition-all ${n === step ? 'bg-primary-light w-4' : n < step ? 'bg-green-500' : 'bg-surface-border/40'}`} />
              ))}
            </div>

            <button
              id="bw-next-btn"
              onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-bold text-sm shadow-lg hover:opacity-90 transition-all"
            >
              {step === 3 ? 'Review' : 'Next'} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 4 footer — just back */}
        {step === 4 && !bookingResult && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-surface-border/30 flex-shrink-0">
            <button
              id="bw-back-btn-step4"
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-surface-border/40 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-all text-sm font-semibold"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {[1,2,3,4,5].map(n => (
                <div key={n} className={`w-2 h-2 rounded-full transition-all ${n === step ? 'bg-primary-light w-4' : n < step ? 'bg-green-500' : 'bg-surface-border/40'}`} />
              ))}
            </div>
          </div>
        )}

        {/* Step 4 — after booking, show Proceed to Payment */}
        {step === 4 && bookingResult && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-surface-border/30 flex-shrink-0">
            <span className="text-xs text-slate-500 italic">Data stored securely ✓</span>
            <button
              id="bw-proceed-payment-btn"
              onClick={() => setStep(5)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-primary text-white font-bold text-sm shadow-lg hover:opacity-90 transition-all"
            >
              <CreditCard className="w-4 h-4" /> Confirm Booking & Pay
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
