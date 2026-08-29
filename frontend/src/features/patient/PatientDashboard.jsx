import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import {
  Calendar,
  Users,
  FileText,
  CreditCard,
  Search,
  Stethoscope,
  FolderOpen,
  BarChart3,
  Heart,
  ArrowRight,
  Sparkles,
  Pill,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';

export const PatientDashboard = () => {
  const { user } = useAuthStore();
  const [summary, setSummary] = useState(null);
  const [activeVisit, setActiveVisit] = useState(null);
  const [historyVisits, setHistoryVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    try {
      const [summaryRes, activeRes, historyRes] = await Promise.all([
        api.get('/patient/summary').catch(() => ({ data: null })),
        api.get('/visits/me/active').catch(() => ({ data: null })),
        api.get('/visits/me/history').catch(() => ({ data: [] })),
      ]);

      const sumData = summaryRes?.data?.data || summaryRes?.data || null;
      setSummary(sumData);
      setActiveVisit(activeRes?.data?.data || activeRes?.data || null);
      setHistoryVisits(historyRes?.data?.data || historyRes?.data || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 20000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  useWebSocket([], (event) => {
    if (['queue:update', 'queue:called', 'queue:status_change', 'room:status_change', 'payment:success', 'appointment:booked', 'consultation:completed'].includes(event)) {
      fetchDashboardData();
    }
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 select-none font-sans">
      
      {/* ── ROW 1: TOP BANNERS (GREETING HERO + BOOK APPOINTMENT CTA) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Card: Greeting & Doctor Illustration Hero */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/90 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between min-h-[190px]">
          <div className="space-y-2 z-10 text-left w-full sm:w-auto">
            <p className="text-xs font-semibold text-slate-500">{getGreeting()},</p>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1E293B] tracking-tight">
              {user?.full_name || 'Sakthi Sundar'} 👋
            </h1>
            <div className="pt-2">
              <p className="text-xs font-medium text-slate-600">Take charge of your health</p>
              <p className="text-xs text-slate-400">We're here to help you feel better every day.</p>
            </div>
          </div>

          {/* Professional High-Res Doctor Illustration matching Reference UI */}
          <div className="relative w-64 sm:w-72 md:w-80 h-48 sm:h-52 shrink-0 mt-3 sm:mt-0 flex items-center justify-center overflow-hidden">
            <img
              src="/doctor_greeting_hero.jpg"
              alt="Medical Doctor Assistant"
              className="w-full h-full object-contain object-bottom scale-105 filter drop-shadow-sm select-none pointer-events-none transition-transform duration-300"
            />
          </div>
        </div>

        {/* Right Card: Book your next appointment CTA */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/90 flex flex-col justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] text-[#5046E5] flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#1E293B]">Book your next appointment</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Schedule a visit with our trusted doctors.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/find-doctor')}
            className="mt-6 w-full py-3 px-4 bg-[#5046E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-2xl shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Book Appointment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* ── ROW 2: 4 HORIZONTAL STAT CARDS (EXACT MATCH TO REFERENCE IMAGE) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Stat 1: Upcoming Appointments */}
        <div className="bg-white rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/90 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF5FF] text-[#9333EA] flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Upcoming Appointments</span>
            <span className="text-xl font-black text-[#1E293B] block leading-snug">
              {summary ? summary.upcoming_appointments_count : 0}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block">You're all caught up!</span>
          </div>
        </div>

        {/* Stat 2: Total Visits */}
        <div className="bg-white rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/90 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Total Visits</span>
            <span className="text-xl font-black text-[#1E293B] block leading-snug">
              {summary ? summary.completed_visits_count : historyVisits.length || 0}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block">Keep tracking your health</span>
          </div>
        </div>

        {/* Stat 3: Queue Status */}
        <div className="bg-white rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/90 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-[#FDF2F8] text-[#DB2777] flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Queue Status</span>
            <span className="text-xl font-black text-[#1E293B] block leading-snug">
              {summary?.active_token || 'Normal'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block">
              {summary?.active_token ? 'Token Active' : 'No active wait'}
            </span>
          </div>
        </div>

        {/* Stat 4: Total Payments */}
        <div className="bg-white rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/90 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-[#FFFBEB] text-[#D97706] flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Total Payments</span>
            <span className="text-xl font-black text-[#1E293B] block leading-snug">
              {summary?.total_paid_formatted || '₹6,785.0'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block">All invoices cleared</span>
          </div>
        </div>

      </div>

      {/* ── ROW 2.5: LATEST CONSULTATION REPORT & PRESCRIBED MEDICINES ── */}
      {summary?.latest_consultation && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100 border-l-4 border-l-[#05CD99] animate-fade-in space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#E6FAF5] text-[#05CD99] flex items-center justify-center shrink-0">
                <FileCheck className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-[#1E293B]">Latest Consultation Report</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#E6FAF5] text-[#05CD99] uppercase">
                    COMPLETED
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Attended by <strong className="text-slate-700">{summary.latest_consultation.doctor_name}</strong> • {summary.latest_consultation.completed_at}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/appointments')}
              className="px-4 py-2 bg-[#EEF2FF] hover:bg-indigo-100 text-[#5046E5] text-xs font-bold rounded-xl transition-colors self-start sm:self-auto cursor-pointer"
            >
              View Full History →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Diagnosis & Advice */}
            <div className="md:col-span-1 p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Clinical Diagnosis
              </span>
              <p className="text-sm font-black text-[#1E293B]">
                {summary.latest_consultation.diagnosis || 'General Clinical Review'}
              </p>
              {summary.latest_consultation.treatment_plan && (
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Doctor's Advice
                  </span>
                  <p className="text-xs text-slate-600 font-medium mt-0.5 line-clamp-3">
                    {summary.latest_consultation.treatment_plan}
                  </p>
                </div>
              )}
            </div>

            {/* Prescriptions List */}
            <div className="md:col-span-2 p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-[#5046E5]" /> Prescribed Medicines ({summary.latest_consultation.prescriptions?.length || 0})
                </span>
                <span className="text-[10px] font-bold text-[#05CD99]">Active Rx</span>
              </div>

              {summary.latest_consultation.prescriptions?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {summary.latest_consultation.prescriptions.map((med, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#1E293B]">{med.medication_name}</span>
                        <span className="text-[10px] font-bold text-[#5046E5] bg-[#EEF2FF] px-2 py-0.5 rounded-md">
                          {med.dosage}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Schedule: <strong>{med.frequency}</strong></span>
                        <span>{med.duration_days} days</span>
                      </div>
                      {med.instructions && (
                        <p className="text-[10px] text-slate-400 italic">"{med.instructions}"</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-2">No medication prescribed during this visit.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── ROW 3: 3-COLUMN WORKSPACE (UPCOMING APPOINTMENTS + QUICK ACTIONS + HEALTH TIPS) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Column 1: Upcoming Appointments Empty/List Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/90 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-4">
              <Calendar className="w-4 h-4 text-[#5046E5]" />
              <h3 className="text-sm font-extrabold text-[#1E293B]">Upcoming Appointments</h3>
            </div>

            {/* Illustration & State */}
            {activeVisit ? (
              <div className="py-3 flex flex-col gap-3">
                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase bg-[#EEF2FF] text-[#5046E5] px-2 py-0.5 rounded-full">
                      {summary?.active_token || 'CONFIRMED'}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {new Date(activeVisit.check_in_time || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#1E293B] line-clamp-1">
                    {activeVisit.chief_complaint}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Status: <span className="font-bold text-[#05CD99] capitalize">{activeVisit.status?.replace('_', ' ')}</span>
                  </p>
                </div>
                <button
                  onClick={() => navigate('/appointments')}
                  className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-[#5046E5] text-xs font-bold rounded-2xl transition-all cursor-pointer"
                >
                  View Details & Token
                </button>
              </div>
            ) : (
              <div className="py-8 flex flex-col items-center text-center">
                <div className="w-24 h-24 mb-4 flex items-center justify-center relative">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* Calendar Sheet */}
                    <rect x="15" y="20" width="70" height="65" rx="12" fill="#EEF2FF" />
                    <rect x="15" y="20" width="70" height="22" rx="12" fill="#5046E5" />
                    {/* Rings */}
                    <rect x="30" y="12" width="6" height="14" rx="3" fill="#94A3B8" />
                    <rect x="64" y="12" width="6" height="14" rx="3" fill="#94A3B8" />
                    {/* Dots inside calendar */}
                    <circle cx="32" cy="55" r="3.5" fill="#CBD5E1" />
                    <circle cx="50" cy="55" r="3.5" fill="#CBD5E1" />
                    <circle cx="68" cy="55" r="3.5" fill="#CBD5E1" />
                    <circle cx="32" cy="70" r="3.5" fill="#CBD5E1" />
                    <circle cx="50" cy="70" r="3.5" fill="#CBD5E1" />
                    <circle cx="68" cy="70" r="3.5" fill="#CBD5E1" />
                    {/* Clock Badge overlay */}
                    <circle cx="72" cy="72" r="16" fill="#1E293B" />
                    <circle cx="72" cy="72" r="14" fill="#FFFFFF" />
                    <path d="M 72 64 L 72 72 L 78 72" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  </svg>
                </div>

                <h4 className="text-sm font-extrabold text-[#1E293B]">No upcoming appointments</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-[220px]">
                  You don't have any appointments scheduled.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/appointments')}
            className="w-full py-2.5 bg-[#5046E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-2xl shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            {activeVisit ? 'Manage Appointments' : 'Book an Appointment'}
          </button>
        </div>

        {/* Column 2: Quick Actions 4-Grid Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/90 flex flex-col justify-between">
          <div className="flex items-center gap-2 pb-4">
            <span className="text-[#5046E5] font-black text-sm">⚡</span>
            <h3 className="text-sm font-extrabold text-[#1E293B]">Quick Actions</h3>
          </div>

          <div className="grid grid-cols-2 gap-3.5 flex-1">
            {/* Quick Action 1: Find Doctors */}
            <div
              onClick={() => navigate('/find-doctor')}
              className="p-4 rounded-2xl bg-[#F8FAFC] hover:bg-slate-100/80 border border-slate-100 flex flex-col justify-between transition-all cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#5046E5] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Search className="w-4 h-4" />
              </div>
              <div className="mt-3">
                <h5 className="text-xs font-bold text-[#1E293B]">Find Doctors</h5>
                <p className="text-[10px] text-slate-400 mt-0.5">Search specialists</p>
              </div>
            </div>

            {/* Quick Action 2: AI Symptom Check */}
            <div
              onClick={() => navigate('/symptoms')}
              className="p-4 rounded-2xl bg-[#F8FAFC] hover:bg-slate-100/80 border border-slate-100 flex flex-col justify-between transition-all cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#9333EA] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Stethoscope className="w-4 h-4" />
              </div>
              <div className="mt-3">
                <h5 className="text-xs font-bold text-[#1E293B]">AI Symptom Check</h5>
                <p className="text-[10px] text-slate-400 mt-0.5">Check your symptoms</p>
              </div>
            </div>

            {/* Quick Action 3: Health Records */}
            <div
              onClick={() => navigate('/history')}
              className="p-4 rounded-2xl bg-[#F8FAFC] hover:bg-slate-100/80 border border-slate-100 flex flex-col justify-between transition-all cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center group-hover:scale-105 transition-transform">
                <FolderOpen className="w-4 h-4" />
              </div>
              <div className="mt-3">
                <h5 className="text-xs font-bold text-[#1E293B]">Health Records</h5>
                <p className="text-[10px] text-slate-400 mt-0.5">View your records</p>
              </div>
            </div>

            {/* Quick Action 4: View Reports */}
            <div
              onClick={() => navigate('/history')}
              className="p-4 rounded-2xl bg-[#F8FAFC] hover:bg-slate-100/80 border border-slate-100 flex flex-col justify-between transition-all cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#05CD99] flex items-center justify-center group-hover:scale-105 transition-transform">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div className="mt-3">
                <h5 className="text-xs font-bold text-[#1E293B]">View Reports</h5>
                <p className="text-[10px] text-slate-400 mt-0.5">Lab & test reports</p>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Health Tips Carousel Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/90 flex flex-col justify-between">
          <div className="flex items-center gap-2 pb-3">
            <Heart className="w-4 h-4 text-[#5046E5]" />
            <h3 className="text-sm font-extrabold text-[#1E293B]">Health Tips</h3>
          </div>

          <div className="p-5 rounded-3xl bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE]/60 flex flex-col justify-between flex-1 relative overflow-hidden">
            <div>
              <h4 className="text-base font-black text-[#1E293B] leading-tight">
                Take Care of<br />Your Health
              </h4>
              <p className="text-xs text-slate-500 mt-2 max-w-[170px] leading-relaxed">
                Small daily habits lead to a healthier you.
              </p>
              <button
                onClick={() => navigate('/about')}
                className="mt-4 px-4 py-1.5 bg-white text-[#5046E5] text-xs font-bold rounded-xl border border-indigo-100 shadow-sm hover:bg-indigo-50 transition-all cursor-pointer"
              >
                Learn More
              </button>
            </div>

            {/* Apple & Water Bottle Illustration Matching Reference Image */}
            <div className="absolute right-3 bottom-2 w-28 h-28 pointer-events-none">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Water Bottle */}
                <rect x="42" y="25" width="24" height="60" rx="8" fill="#93C5FD" opacity="0.8" />
                <rect x="47" y="16" width="14" height="9" rx="2" fill="#2563EB" />
                {/* Red Apple */}
                <circle cx="28" cy="68" r="16" fill="#EF4444" />
                <path d="M 28 52 Q 32 44 38 48" stroke="#15803D" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <ellipse cx="34" cy="46" rx="4" ry="2" fill="#22C55E" />
                {/* Leaf Decor */}
                <path d="M 70 75 Q 85 60 80 40 Q 65 60 70 75 Z" fill="#6366F1" opacity="0.6" />
                <path d="M 75 78 Q 90 70 92 55 Q 78 68 75 78 Z" fill="#818CF8" opacity="0.5" />
              </svg>
            </div>

            {/* Carousel Dots */}
            <div className="flex items-center justify-center gap-1.5 pt-4">
              <span className="w-2 h-2 rounded-full bg-[#5046E5]" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            </div>
          </div>
        </div>

      </div>

      {/* ── FOOTER: COPYRIGHT & LEGAL LINKS (MATCHING REFERENCE IMAGE) ── */}
      <footer className="pt-6 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
        <p>© 2026 MediFlow. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <span className="hover:text-slate-600 transition-colors cursor-pointer">Privacy Policy</span>
          <span>•</span>
          <span className="hover:text-slate-600 transition-colors cursor-pointer">Terms of Service</span>
        </div>
      </footer>

    </div>
  );
};

export default PatientDashboard;
