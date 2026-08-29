import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import api from '../../services/api';
import {
  Mail,
  Calendar,
  Droplets,
  User as UserIcon,
  Phone,
  ShieldCheck,
  Activity,
  MapPin,
  Save,
  X,
  Edit3,
  CheckCircle2,
} from 'lucide-react';

export const PatientProfile = () => {
  const { user } = useAuthStore();
  const { addToast } = useUiStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    phone: '',
    date_of_birth: '',
    gender: '',
    blood_group: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    allergies: '',
    medical_history: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/me/patient-profile');
      const data = res?.data?.data || res?.data || {};
      setProfile(data);
      setFormData({
        phone: data.phone || '',
        date_of_birth: data.date_of_birth || '',
        gender: data.gender || '',
        blood_group: data.blood_group || '',
        address: data.address || '',
        emergency_contact_name: data.emergency_contact_name || '',
        emergency_contact_phone: data.emergency_contact_phone || '',
        allergies: data.allergies || '',
        medical_history: data.medical_history || '',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/users/me/patient-profile', formData);
      setProfile(res?.data?.data || res?.data || formData);
      addToast({ type: 'success', title: 'Profile Updated', message: 'Your personal details have been saved.' });
      setEditing(false);
    } catch (err) {
      addToast({ type: 'error', title: 'Update Failed', message: err.message || 'Could not update profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-3">
        <span className="w-6 h-6 border-2 border-slate-300 border-t-[#4318FF] rounded-full animate-spin" />
        <p className="text-xs font-bold text-[#707EAE]">Loading patient profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1B254B] tracking-tight">Patient Profile</h1>
          <p className="text-xs text-[#707EAE] font-semibold mt-0.5">Manage your authenticated personal details and medical overview</p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#4318FF] hover:bg-[#3311CC] text-white font-black text-xs rounded-2xl shadow-lg shadow-indigo-500/25 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Edit3 className="w-4 h-4" /> Edit Profile
          </button>
        ) : (
          <button
            onClick={() => setEditing(false)}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#1B254B] font-black text-xs rounded-2xl transition-all cursor-pointer self-start sm:self-auto"
          >
            <X className="w-4 h-4" /> Cancel
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Patient Identity Card */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_18px_40px_rgba(112,144,176,0.08)] border border-slate-100/80 flex flex-col items-center text-center space-y-4">
          <div className="w-24 h-24 rounded-3xl bg-[#F4F7FE] border-2 border-slate-100 text-[#4318FF] flex items-center justify-center text-2xl font-black shadow-inner overflow-hidden">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
            ) : (
              user?.full_name?.charAt(0) || 'P'
            )}
          </div>

          <div>
            <h3 className="text-lg font-black text-[#1B254B]">{user?.full_name || 'Patient'}</h3>
            <p className="text-xs text-[#707EAE] font-semibold flex items-center justify-center gap-1 mt-1">
              <Mail className="w-3.5 h-3.5 text-[#4318FF]" /> {user?.email}
            </p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-[#E6FAF5] text-[#05CD99] text-[10px] font-black uppercase">
              ● Verified Patient
            </span>
          </div>

          <div className="w-full border-t border-slate-100 pt-4 space-y-3 text-xs text-left">
            <div className="flex items-center justify-between">
              <span className="text-[#A3AED0] font-bold">Blood Group</span>
              <span className="font-black text-[#1E293B]">{profile?.blood_group || 'O+'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#A3AED0] font-bold">Gender</span>
              <span className="font-black text-[#1E293B] capitalize">{profile?.gender || 'Male'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#A3AED0] font-bold">Date of Birth</span>
              <span className="font-black text-[#1E293B]">{profile?.date_of_birth || '1998-05-14'}</span>
            </div>
          </div>
        </div>

        {/* Right Col: Details Form / View */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-[0_18px_40px_rgba(112,144,176,0.08)] border border-slate-100/80">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-[#A3AED0] uppercase tracking-wider block">Phone Number</label>
                <input
                  type="text"
                  disabled={!editing}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 rounded-2xl bg-[#F4F7FE] border border-transparent focus:border-[#4318FF] focus:bg-white text-xs font-bold text-[#1B254B] disabled:opacity-80 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-[#A3AED0] uppercase tracking-wider block">Blood Group</label>
                <input
                  type="text"
                  disabled={!editing}
                  value={formData.blood_group}
                  onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                  placeholder="e.g. O+, A+, B+"
                  className="w-full px-4 py-3 rounded-2xl bg-[#F4F7FE] border border-transparent focus:border-[#4318FF] focus:bg-white text-xs font-bold text-[#1B254B] disabled:opacity-80 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-[#A3AED0] uppercase tracking-wider block">Residential Address</label>
              <input
                type="text"
                disabled={!editing}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street address, City, State, ZIP"
                className="w-full px-4 py-3 rounded-2xl bg-[#F4F7FE] border border-transparent focus:border-[#4318FF] focus:bg-white text-xs font-bold text-[#1B254B] disabled:opacity-80 focus:outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-[#A3AED0] uppercase tracking-wider block">Emergency Contact Name</label>
                <input
                  type="text"
                  disabled={!editing}
                  value={formData.emergency_contact_name}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                  placeholder="Parent / Spouse Name"
                  className="w-full px-4 py-3 rounded-2xl bg-[#F4F7FE] border border-transparent focus:border-[#4318FF] focus:bg-white text-xs font-bold text-[#1B254B] disabled:opacity-80 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-[#A3AED0] uppercase tracking-wider block">Emergency Contact Phone</label>
                <input
                  type="text"
                  disabled={!editing}
                  value={formData.emergency_contact_phone}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 rounded-2xl bg-[#F4F7FE] border border-transparent focus:border-[#4318FF] focus:bg-white text-xs font-bold text-[#1B254B] disabled:opacity-80 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-[#A3AED0] uppercase tracking-wider block">Known Allergies</label>
              <textarea
                rows="2"
                disabled={!editing}
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                placeholder="e.g. Penicillin, Peanuts, Dust, Latex..."
                className="w-full px-4 py-3 rounded-2xl bg-[#F4F7FE] border border-transparent focus:border-[#4318FF] focus:bg-white text-xs font-bold text-[#1B254B] disabled:opacity-80 focus:outline-none transition-all resize-none"
              />
            </div>

            {editing && (
              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-8 py-3 bg-[#4318FF] hover:bg-[#3311CC] text-white font-black text-xs rounded-2xl shadow-xl shadow-indigo-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> Save Profile Details
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
