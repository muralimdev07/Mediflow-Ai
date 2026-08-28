import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { Mail, Calendar, Droplets, User as UserIcon, Phone, ShieldCheck, Activity } from 'lucide-react';

export const PatientProfile = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/me/patient-profile');
      setProfile(res?.data?.data || res?.data || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading profile...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">My Profile</h1>
        <p className="text-sm text-slate-400">Manage your personal and medical information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Identity Card */}
        <Card className="md:col-span-1 text-center bg-gradient-to-b from-surface-card to-surface">
          <div className="flex flex-col items-center py-6">
            <Avatar 
              src={user?.avatar_url} 
              name={user?.full_name} 
              size="lg" 
              className="w-24 h-24 text-3xl border-4 border-surface shadow-xl mb-4" 
            />
            <h2 className="text-xl font-bold text-slate-100">{user?.full_name}</h2>
            <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
              <Mail className="w-3.5 h-3.5" /> {user?.email}
            </p>
            
            <div className="mt-6 flex items-center gap-2 bg-green-500/10 text-green-400 px-3 py-1.5 rounded-full text-xs font-bold border border-green-500/20">
              <ShieldCheck className="w-4 h-4" />
              Verified via Google
            </div>
            
            <div className="mt-8 w-full">
              <Button variant="outline" className="w-full">Edit Profile</Button>
            </div>
          </div>
        </Card>

        {/* Details Card */}
        <Card className="md:col-span-2 p-0 overflow-hidden">
          <div className="p-4 border-b border-surface-border/30 bg-surface/30">
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-primary-light" /> Personal Details
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wider">Date of Birth</p>
              <p className="text-slate-200 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                {profile?.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wider">Gender</p>
              <p className="text-slate-200 capitalize">{profile?.gender || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wider">Blood Group</p>
              <p className="text-slate-200 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-red-400" />
                {profile?.blood_group || 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wider">Emergency Contact</p>
              <p className="text-slate-200 flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                {profile?.emergency_contact || 'Not provided'}
              </p>
            </div>
          </div>

          <div className="p-4 border-y border-surface-border/30 bg-surface/30">
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-400" /> Medical Overview
            </h3>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wider">Allergies</p>
              <p className="text-slate-200">{profile?.allergies || 'None recorded'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wider">Medical History</p>
              <p className="text-slate-200 whitespace-pre-line">{profile?.medical_history || 'No significant medical history.'}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
