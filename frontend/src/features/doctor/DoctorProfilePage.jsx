import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { User, Stethoscope, Building2, DoorOpen, Shield, DollarSign, Award, Save } from 'lucide-react';

export const DoctorProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [consultationFee, setConsultationFee] = useState(500);
  const [consultationRoom, setConsultationRoom] = useState('Room 101');
  const [statusLabel, setStatusLabel] = useState('AVAILABLE');
  const [saving, setSaving] = useState(false);
  const { addToast } = useUiStore();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/doctor/profile');
      const data = res?.data || res;
      setProfile(data);
      setConsultationFee(data.consultation_fee || 500);
      setConsultationRoom(data.consultation_room || 'Room 101');
      setStatusLabel(data.status_label || 'AVAILABLE');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/doctor/profile', {
        consultation_fee: parseFloat(consultationFee),
        consultation_room: consultationRoom,
        status_label: statusLabel,
      });
      addToast({ type: 'success', title: 'Profile Updated', message: 'Doctor profile changes saved.' });
      fetchProfile();
    } catch (err) {
      addToast({ type: 'error', title: 'Update Failed', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[50vh] space-y-3 font-sans">
        <div className="w-10 h-10 rounded-2xl bg-[#EEF2FF] border border-indigo-100 flex items-center justify-center">
          <span className="w-5 h-5 border-2 border-[#5046E5] border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-xs font-bold text-slate-400">Loading Doctor Profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 font-sans animate-fade-in">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-[#1E293B] flex items-center gap-2">
          <User className="w-6 h-6 text-[#5046E5]" />
          Doctor Clinical Profile & Settings
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Review hospital credentials, consultation room assignments, and clinical availability.
        </p>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
          <div className="w-20 h-20 rounded-3xl bg-[#EEF2FF] border border-indigo-100 flex items-center justify-center text-2xl font-black text-[#5046E5] shadow-xs">
            {profile.full_name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'DR'}
          </div>

          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-2xl font-black text-[#1E293B]">{profile.full_name}</h2>
            <p className="text-sm font-bold text-[#5046E5]">{profile.specialization}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500 mt-2 font-medium">
              <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {profile.hospital_name}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-bold text-amber-600">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                Rating: {profile.rating} / 5.0
              </span>
              <span>•</span>
              <span className="text-slate-500 font-mono font-bold bg-[#F8FAFC] px-2 py-0.5 rounded-lg border border-slate-100">
                ID: {profile.doctor_id}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Settings Form */}
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Official Email (Fixed by Hospital Admin)
              </label>
              <input
                type="email"
                disabled
                value={profile.email}
                className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200/80 rounded-2xl text-slate-400 font-bold text-xs cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Department Assignment (Fixed by Admin)
              </label>
              <input
                type="text"
                disabled
                value={profile.department}
                className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200/80 rounded-2xl text-slate-400 font-bold text-xs cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Consultation Room
              </label>
              <input
                type="text"
                value={consultationRoom}
                onChange={(e) => setConsultationRoom(e.target.value)}
                className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200/80 rounded-2xl text-[#1E293B] font-bold text-xs focus:bg-white focus:outline-none focus:border-[#5046E5] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Consultation Fee (₹ INR)
              </label>
              <input
                type="number"
                value={consultationFee}
                onChange={(e) => setConsultationFee(e.target.value)}
                className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200/80 rounded-2xl text-[#1E293B] font-bold text-xs focus:bg-white focus:outline-none focus:border-[#5046E5] transition-all"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Availability Status
              </label>
              <select
                value={statusLabel}
                onChange={(e) => setStatusLabel(e.target.value)}
                className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200/80 rounded-2xl text-[#1E293B] font-bold text-xs focus:bg-white focus:outline-none focus:border-[#5046E5] transition-all cursor-pointer"
              >
                <option value="AVAILABLE">AVAILABLE (Accepting Patients)</option>
                <option value="BUSY">BUSY (In Complex Procedure)</option>
                <option value="ON BREAK">ON BREAK (Temporary Paused)</option>
                <option value="OFFLINE">OFFLINE (Shift Completed)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-[#5046E5] hover:bg-indigo-700 text-white font-black text-xs rounded-2xl shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorProfilePage;
