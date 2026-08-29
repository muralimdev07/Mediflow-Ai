import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { BarChart3, TrendingUp, Users, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export const DoctorAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/doctor/analytics');
      const data = res?.data || res;
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const summary = analytics?.summary || {};
  const hourly = analytics?.hourly_chart || [];
  const statusBreakdown = analytics?.status_breakdown || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans animate-fade-in">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-[#1E293B] flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-[#5046E5]" />
          Clinical Operations & Performance Analytics
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Real-time metrics on consultation throughput, patient waiting times, and hourly volume.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Patients Seen Today</span>
            <div className="text-2xl sm:text-3xl font-black text-[#1E293B]">
              {summary.patients_seen_today || 0}
            </div>
            <p className="text-[11px] text-slate-400 font-medium">All visits recorded</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 stroke-[2]" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Consultation Time</span>
            <div className="text-2xl sm:text-3xl font-black text-[#5046E5]">
              {summary.avg_consultation_time_mins || 7.5} <span className="text-sm font-bold">min</span>
            </div>
            <p className="text-[11px] text-[#5046E5] font-bold">Per patient pace</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] text-[#5046E5] flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 stroke-[2]" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Patient Wait Time</span>
            <div className="text-2xl sm:text-3xl font-black text-[#D97706]">
              {summary.avg_wait_time_mins || 14.2} <span className="text-sm font-bold">min</span>
            </div>
            <p className="text-[11px] text-[#D97706] font-bold">Predicted queue flow</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FFFBEB] text-[#D97706] flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6 stroke-[2]" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Consultations</span>
            <div className="text-2xl sm:text-3xl font-black text-[#05CD99]">
              {summary.completed_count || 0}
            </div>
            <p className="text-[11px] text-[#05CD99] font-bold">✓ Closed sessions</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#E6FAF5] text-[#05CD99] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 stroke-[2]" />
          </div>
        </div>
      </div>

      {/* Hourly Flow Chart & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Flow Card */}
        <div className="lg:col-span-2 p-7 rounded-3xl bg-white border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <h3 className="text-base font-black text-[#1E293B]">Patients Seen by Hour (Today)</h3>
          <div className="h-64 flex items-end justify-between gap-3 pt-6 px-2">
            {hourly.map((h, idx) => {
              const maxVal = Math.max(...hourly.map((item) => item.patients), 5);
              const heightPercent = Math.max(8, (h.patients / maxVal) * 100);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <span className="text-[10px] text-[#5046E5] font-black opacity-0 group-hover:opacity-100 transition-opacity">
                    {h.patients}
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[40px] bg-[#EEF2FF] hover:bg-[#5046E5] rounded-t-xl transition-all cursor-pointer shadow-xs"
                  />
                  <span className="text-[10px] text-slate-400 font-bold rotate-[-45deg] sm:rotate-0 mt-1">
                    {h.hour}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="p-7 rounded-3xl bg-white border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <h3 className="text-base font-black text-[#1E293B]">Queue Volume Breakdown</h3>
          <div className="space-y-4 pt-2">
            {statusBreakdown.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600 font-bold">{item.name}</span>
                  <span className="text-[#1E293B] font-black">{item.value}</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, item.value * 15)}%`, backgroundColor: item.color || '#5046E5' }}
                    className="h-full rounded-full transition-all"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorAnalyticsPage;
