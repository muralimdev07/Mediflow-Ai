import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import {
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Play,
  PhoneCall,
  UserCheck,
  Calendar,
  Sparkles,
  RefreshCw,
  ChevronDown,
  FileText,
  AlertTriangle,
  Stethoscope,
  Activity,
  Plus,
  Trash2,
  DoorOpen,
  Building2,
} from 'lucide-react';

export const DoctorDashboard = () => {
  const { user } = useAuthStore();
  const { addToast } = useUiStore();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [activeConsultationModal, setActiveConsultationModal] = useState(null);

  useEffect(() => {
    fetchDashboard();
    // Poll updates every 15 seconds to ensure live sync
    const interval = setInterval(fetchDashboard, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/doctor/dashboard');
      const data = res?.data || res;
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching doctor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setStatusDropdownOpen(false);
    try {
      await api.patch('/doctor/status', { status: newStatus });
      addToast({ type: 'success', title: 'Status Updated', message: `Availability set to ${newStatus}` });
      fetchDashboard();
    } catch (err) {
      addToast({ type: 'error', title: 'Status Update Failed', message: err.message });
    }
  };

  const handleCallNext = async () => {
    setActionLoading(true);
    try {
      const res = await api.post('/doctor/queue/call-next');
      addToast({
        type: 'success',
        title: 'Patient Called',
        message: res.message || 'Next patient notified and updated on screen.',
      });
      fetchDashboard();
    } catch (err) {
      addToast({ type: 'error', title: 'Call Failed', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleQueueTransition = async (queueId, action) => {
    setActionLoading(true);
    try {
      const res = await api.patch(`/doctor/queue/${queueId}/transition`, { action });
      addToast({
        type: 'success',
        title: `Action: ${action}`,
        message: res.message || 'Queue updated successfully',
      });
      fetchDashboard();
      if (action === 'START') {
        // Find patient data and open modal
        const item = dashboardData?.queue?.find((q) => q.queue_id === queueId) || dashboardData?.currently_serving || dashboardData?.next_patient;
        if (item) {
          setActiveConsultationModal({
            visit_id: item.visit_id,
            queue_id: item.queue_id,
            token: item.token,
            patient_name: item.patient_name,
            chief_complaint: item.chief_complaint,
            symptoms_description: item.symptoms_description,
            vitals: item.vitals,
            nurse_notes: item.nurse_notes,
          });
        }
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Transition Failed', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-400">Loading Doctor Operational Portal...</p>
      </div>
    );
  }

  const doctor = dashboardData?.doctor || {};
  const stats = dashboardData?.stats || {};
  const serving = dashboardData?.currently_serving;
  const nextPatient = dashboardData?.next_patient;
  const queue = dashboardData?.queue || [];
  const aiIntel = dashboardData?.ai_intelligence || {};

  const statusColors = {
    AVAILABLE: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    BUSY: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    'ON BREAK': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    OFFLINE: 'bg-slate-500/10 text-slate-500 border-slate-300',
  };

  return (
    <div className="space-y-6 pb-12 font-sans animate-fade-in">
      {/* ── 1. CLEAN TOP HEADER & DOCTOR PROFILE BAR ── */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-[#EEF2FF] border border-indigo-100 flex items-center justify-center overflow-hidden shadow-xs">
              {doctor.avatar_url ? (
                <img src={doctor.avatar_url} alt={doctor.full_name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-base font-black text-[#5046E5]">
                  {doctor.full_name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'DR'}
                </span>
              )}
            </div>
            <span
              className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                doctor.is_available ? 'bg-[#05CD99] ring-2 ring-emerald-500/20' : 'bg-amber-500'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-[#1E293B] tracking-tight">
                {doctor.full_name || 'Dr. Physician'}
              </h1>
              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-[#EEF2FF] text-[#5046E5] border border-indigo-100">
                Doctor Portal
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 mt-1 font-medium">
              <span className="flex items-center gap-1.5 text-[#5046E5] font-bold">
                <Stethoscope className="w-3.5 h-3.5" />
                {doctor.specialization || 'General Specialist'}
              </span>
              <span className="flex items-center gap-1.5 text-slate-500 font-semibold">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {doctor.hospital_name || 'MediFlow Hospital'}
              </span>
              <span className="flex items-center gap-1.5 text-slate-700 font-bold">
                <DoorOpen className="w-3.5 h-3.5 text-[#5046E5]" />
                {doctor.consultation_room || 'Room 101'}
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Status Dropdown & Refresh */}
        <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto">
          <button
            onClick={fetchDashboard}
            className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-slate-700 bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200/80 rounded-2xl transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Sync</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-black transition-all shadow-xs cursor-pointer ${
                doctor.status_label === 'AVAILABLE'
                  ? 'bg-[#E6FAF5] text-[#05CD99] border-emerald-200'
                  : doctor.status_label === 'BUSY'
                  ? 'bg-[#FFFBEB] text-[#D97706] border-amber-200'
                  : 'bg-[#EEF2FF] text-[#5046E5] border-indigo-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              <span>{doctor.status_label || 'AVAILABLE'}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {statusDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-100 rounded-2xl shadow-xl p-1.5 z-50 animate-fade-in">
                {['AVAILABLE', 'BUSY', 'ON BREAK', 'OFFLINE'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    className="w-full text-left px-3 py-2 text-xs font-bold rounded-xl text-slate-700 hover:text-[#5046E5] hover:bg-[#EEF2FF] flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>{st}</span>
                    {doctor.status_label === st && <CheckCircle2 className="w-3.5 h-3.5 text-[#5046E5]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. TOP METRIC CARDS (CLEAN LIGHT CARD STYLE MATCHING PATIENT PORTAL) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Appointments / Visits */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Patients</p>
            <p className="text-2xl sm:text-3xl font-black text-[#1E293B]">{stats.today_appointments || 0}</p>
            <p className="text-[11px] text-slate-400 font-medium">All time today</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 stroke-[2]" />
          </div>
        </div>

        {/* Card 2: Waiting Queue */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Waiting Patients</p>
            <p className="text-2xl sm:text-3xl font-black text-[#1E293B]">{stats.waiting || 0}</p>
            <p className="text-[11px] text-[#D97706] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" /> Need attention
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FFFBEB] text-[#D97706] flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 stroke-[2]" />
          </div>
        </div>

        {/* Card 3: In Consultation / Active */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">In Consultation</p>
            <p className="text-2xl sm:text-3xl font-black text-[#1E293B]">{stats.in_consultation || 0}</p>
            <p className="text-[11px] text-[#5046E5] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5046E5] animate-ping" /> Active session
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] text-[#5046E5] flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6 stroke-[2]" />
          </div>
        </div>

        {/* Card 4: Completed Consultations */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resolved / Completed</p>
            <p className="text-2xl sm:text-3xl font-black text-[#1E293B]">{stats.completed || 0}</p>
            <p className="text-[11px] text-[#05CD99] font-bold flex items-center gap-1">
              ✓ Marked as done
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#E6FAF5] text-[#05CD99] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 stroke-[2]" />
          </div>
        </div>
      </div>

      {/* ── 3. DUAL-PANE OPERATIONAL WORKSPACE (LIST ON LEFT, ACTIVE CARD ON RIGHT) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: All Queue Records / Waiting List */}
        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-black text-[#1E293B]">
              Live Queue ({queue.length})
            </h2>
            <button
              onClick={() => navigate('/doctor/queue')}
              className="text-xs font-bold text-[#5046E5] hover:text-indigo-700 cursor-pointer"
            >
              View Full Queue →
            </button>
          </div>

          {queue.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                <Users className="w-6 h-6 stroke-[1.5]" />
              </div>
              <p className="text-xs font-bold text-slate-400">No patients found in queue.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {queue.map((item) => (
                <div
                  key={item.queue_id}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    serving?.queue_id === item.queue_id
                      ? 'bg-[#EEF2FF] border-indigo-200 shadow-xs ring-1 ring-indigo-300/60'
                      : 'bg-[#F8FAFC] border-slate-100 hover:border-indigo-100 hover:bg-white'
                  }`}
                  onClick={() => {
                    if (item.status_raw === 'in_progress') {
                      setActiveConsultationModal({
                        visit_id: item.visit_id,
                        queue_id: item.queue_id,
                        token: item.token,
                        patient_name: item.patient_name,
                        chief_complaint: item.chief_complaint,
                        symptoms_description: item.symptoms_description,
                      });
                    }
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-black font-mono text-xs px-2.5 py-1 rounded-xl bg-[#EEF2FF] text-[#5046E5]">
                        {item.token}
                      </span>
                      <h4 className="font-black text-sm text-[#1E293B] truncate max-w-[140px] sm:max-w-[180px]">
                        {item.patient_name}
                      </h4>
                    </div>
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                        item.status_raw === 'in_progress'
                          ? 'bg-[#EEF2FF] text-[#5046E5]'
                          : item.status_raw === 'called'
                          ? 'bg-[#E6FAF5] text-[#05CD99]'
                          : 'bg-[#FFFBEB] text-[#D97706]'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-1.5 truncate font-medium">
                    {item.chief_complaint || 'General Checkup'}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2.5 pt-2 border-t border-slate-100 font-medium">
                    <span>Wait: {item.wait_time}</span>
                    {item.is_priority ? (
                      <span className="font-bold text-rose-500 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Priority
                      </span>
                    ) : (
                      <span>Time: {item.appointment_time}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Currently Active Consultation Detail / Action Board */}
        <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-black text-[#5046E5] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#5046E5] animate-ping" />
                  Currently Serving
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-[#1E293B] mt-0.5">
                  {serving ? serving.token : 'No Active Patient'}
                </h3>
              </div>

              {serving && (
                <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase bg-[#EEF2FF] text-[#5046E5]">
                  {serving.status === 'IN_CONSULTATION' ? '🩺 In Consultation' : '📢 Called'}
                </span>
              )}
            </div>

            {serving ? (
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Patient Information</span>
                    <p className="text-base font-black text-[#1E293B]">{serving.patient_name}</p>
                    <p className="text-xs text-slate-500 font-medium">
                      Age: <span className="font-bold text-slate-700">{serving.age}</span> | Gender:{' '}
                      <span className="font-bold text-slate-700">{serving.gender}</span>
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chief Complaint</span>
                    <p className="text-sm font-black text-[#5046E5]">{serving.chief_complaint}</p>
                    {serving.symptoms_description && (
                      <p className="text-xs text-slate-500 line-clamp-2 font-medium">{serving.symptoms_description}</p>
                    )}
                  </div>
                </div>

                {/* Queue Control Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {serving.status === 'CALLED' ? (
                    <button
                      onClick={() => handleQueueTransition(serving.queue_id, 'START')}
                      disabled={actionLoading}
                      className="px-5 py-3 bg-[#5046E5] hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Start Consultation
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        setActiveConsultationModal({
                          visit_id: serving.visit_id,
                          queue_id: serving.queue_id,
                          token: serving.token,
                          patient_name: serving.patient_name,
                          chief_complaint: serving.chief_complaint,
                          symptoms_description: serving.symptoms_description,
                        })
                      }
                      className="px-5 py-3 bg-[#5046E5] hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Stethoscope className="w-4 h-4" />
                      Open Consultation Notes
                    </button>
                  )}

                  <button
                    onClick={() => handleQueueTransition(serving.queue_id, 'COMPLETE')}
                    disabled={actionLoading}
                    className="px-5 py-3 bg-[#05CD99] hover:bg-emerald-600 text-white font-bold text-xs rounded-2xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Complete Visit
                  </button>

                  <button
                    onClick={() => handleQueueTransition(serving.queue_id, 'SKIP')}
                    disabled={actionLoading}
                    className="px-4 py-3 bg-[#F8FAFC] hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-2xl transition-all cursor-pointer border border-slate-200/80"
                  >
                    Skip
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-14 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-[#EEF2FF] text-[#5046E5] flex items-center justify-center shadow-xs">
                  <PhoneCall className="w-7 h-7 stroke-[2]" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-black text-[#1E293B]">No Patient in Active Consultation</h4>
                  <p className="text-xs text-slate-400 font-medium">
                    Click below to call the next awaiting patient into your consultation room.
                  </p>
                </div>

                {nextPatient ? (
                  <button
                    onClick={handleCallNext}
                    disabled={actionLoading}
                    className="px-6 py-3 bg-[#5046E5] hover:bg-indigo-700 text-white font-black text-xs rounded-2xl shadow-md shadow-indigo-500/20 transition-all inline-flex items-center gap-2 cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4" />
                    Call Next: {nextPatient.patient_name} ({nextPatient.token})
                  </button>
                ) : (
                  <p className="text-xs text-slate-400 font-bold">Waiting queue is currently clear.</p>
                )}
              </div>
            )}
          </div>

          {/* AI Intelligence Footer Badge */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5 text-slate-600 font-bold">
              <Sparkles className="w-4 h-4 text-[#5046E5]" />
              Est. Wait: <strong className="text-[#1E293B]">{aiIntel.predicted_waiting_time_minutes || 0} min</strong>
            </span>
            <span className="text-slate-400">
              Queue Load: <strong className="text-[#05CD99] font-black">{aiIntel.queue_load || 'OPTIMAL'}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* ── 4. CONSULTATION WORKSPACE MODAL ── */}
      {activeConsultationModal && (
        <ConsultationModal
          data={activeConsultationModal}
          onClose={() => {
            setActiveConsultationModal(null);
            fetchDashboard();
          }}
        />
      )}
    </div>
  );
};

// ── CLEAN CONSULTATION WORKSPACE MODAL ──
const ConsultationModal = ({ data, onClose }) => {
  const [diagnosis, setDiagnosis] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [followUpNotes, setFollowUpNotes] = useState('');
  const [prescriptions, setPrescriptions] = useState([]);

  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('1 Tablet');
  const [freq, setFreq] = useState('1-0-1');
  const [days, setDays] = useState('5');
  const [loading, setLoading] = useState(false);
  const { addToast } = useUiStore();

  const handleAddMedication = (e) => {
    e.preventDefault();
    if (!medName) return;
    setPrescriptions([
      ...prescriptions,
      {
        medication_name: medName,
        dosage,
        frequency: freq,
        duration_days: parseInt(days) || 5,
        instructions: 'After meals with water',
      },
    ]);
    setMedName('');
    setDosage('1 Tablet');
    setFreq('1-0-1');
  };

  const handleRemoveMedication = (index) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const handleSaveConsultation = async (markComplete = false) => {
    setLoading(true);
    try {
      await api.post('/doctor/consultation/save', {
        visit_id: data.visit_id,
        diagnosis,
        clinical_notes: clinicalNotes,
        treatment_plan: treatmentPlan,
        follow_up_notes: followUpNotes,
        prescriptions,
        mark_completed: markComplete,
      });

      addToast({
        type: 'success',
        title: markComplete ? 'Consultation Completed' : 'Notes Saved',
        message: markComplete
          ? `Patient ${data.patient_name} consultation completed & discharged.`
          : 'Consultation notes updated.',
      });
      onClose();
    } catch (err) {
      addToast({ type: 'error', title: 'Save Failed', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto font-sans">
      <div className="bg-white border border-slate-100 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-xl bg-[#EEF2FF] text-[#5046E5] font-black font-mono text-xs">
                TOKEN {data.token}
              </span>
              <h3 className="text-xl font-black text-[#1E293B]">Consultation Workspace</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Patient: <span className="text-[#1E293B] font-bold">{data.patient_name}</span> | Complaint:{' '}
              <span className="text-[#5046E5] font-bold">{data.chief_complaint}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors font-bold text-base cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* 🩸 NURSE RECORDED VITALS & OBSERVATIONS 🩸 */}
        <div className="p-4 rounded-2xl bg-[#EEF2FF]/60 border border-indigo-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-[#5046E5] uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" /> Clinical Vitals Recorded by Nursing Station
            </span>
            <span className="text-[10px] font-bold text-slate-500">Live Sync</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
            <div className="bg-white p-2.5 rounded-xl border border-indigo-100 text-center shadow-2xs">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Blood Pressure</span>
              <span className="text-xs font-black text-rose-600">
                {data.vitals?.blood_pressure || (data.vitals?.blood_pressure_systolic ? `${data.vitals.blood_pressure_systolic}/${data.vitals.blood_pressure_diastolic}` : '120/80')} <span className="text-[9px] text-slate-400 font-normal">mmHg</span>
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-indigo-100 text-center shadow-2xs">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Temperature</span>
              <span className="text-xs font-black text-amber-600">
                {data.vitals?.temperature || '98.6'} <span className="text-[9px] text-slate-400 font-normal">°F</span>
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-indigo-100 text-center shadow-2xs">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Pulse / HR</span>
              <span className="text-xs font-black text-[#5046E5]">
                {data.vitals?.heart_rate || '72'} <span className="text-[9px] text-slate-400 font-normal">BPM</span>
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-indigo-100 text-center shadow-2xs">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">SpO2 Oxygen</span>
              <span className="text-xs font-black text-[#05CD99]">
                {data.vitals?.oxygen_saturation || '99'} <span className="text-[9px] text-slate-400 font-normal">%</span>
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-indigo-100 text-center shadow-2xs col-span-2 sm:col-span-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Body Weight</span>
              <span className="text-xs font-black text-slate-800">
                {data.vitals?.weight ? `${data.vitals.weight} kg` : '65 kg'}
              </span>
            </div>
          </div>

          {data.nurse_notes && (
            <p className="text-[11px] text-slate-600 italic bg-white/70 px-3 py-1.5 rounded-lg border border-indigo-50">
              <strong className="text-[#5046E5]">Nurse Note:</strong> "{data.nurse_notes}"
            </p>
          )}
        </div>

        {/* Clinical Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Primary Diagnosis
            </label>
            <input
              type="text"
              placeholder="e.g. Acute Bronchitis / Viral Gastroenteritis"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200/80 rounded-2xl text-[#1E293B] font-bold text-xs focus:bg-white focus:outline-none focus:border-[#5046E5] transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Clinical Examination Notes
              </label>
              <textarea
                rows="3"
                placeholder="Physical findings, vitals observation, symptom severity..."
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200/80 rounded-2xl text-[#1E293B] font-medium text-xs focus:bg-white focus:outline-none focus:border-[#5046E5] transition-all resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Treatment Plan & Advice
              </label>
              <textarea
                rows="3"
                placeholder="Dietary precautions, rest, follow-up tests if required..."
                value={treatmentPlan}
                onChange={(e) => setTreatmentPlan(e.target.value)}
                className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200/80 rounded-2xl text-[#1E293B] font-medium text-xs focus:bg-white focus:outline-none focus:border-[#5046E5] transition-all resize-none"
              />
            </div>
          </div>

          {/* Prescriptions Subform */}
          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-100 space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Add Medical Prescription
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <input
                type="text"
                placeholder="Medicine (e.g. Paracetamol 650mg)"
                value={medName}
                onChange={(e) => setMedName(e.target.value)}
                className="sm:col-span-2 px-4 py-2.5 bg-white border border-slate-200/80 rounded-xl text-[#1E293B] font-bold text-xs focus:outline-none focus:border-[#5046E5]"
              />
              <input
                type="text"
                placeholder="Dosage (e.g. 1 Tab)"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className="px-3.5 py-2.5 bg-white border border-slate-200/80 rounded-xl text-[#1E293B] font-bold text-xs focus:outline-none focus:border-[#5046E5]"
              />
              <button
                type="button"
                onClick={handleAddMedication}
                className="px-4 py-2.5 bg-[#5046E5] hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>

            {prescriptions.length > 0 && (
              <div className="space-y-2 pt-2">
                {prescriptions.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white border border-slate-100 shadow-xs flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-black text-[#1E293B]">{p.medication_name}</span>
                      <span className="text-slate-500 text-[11px] font-medium ml-2">
                        {p.dosage} — {p.frequency} ({p.duration_days} days)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMedication(idx)}
                      className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-2xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSaveConsultation(false)}
            className="px-5 py-3 rounded-2xl bg-[#F8FAFC] hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors border border-slate-200/80 cursor-pointer"
          >
            Save Draft
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSaveConsultation(true)}
            className="px-6 py-3 rounded-2xl bg-[#5046E5] hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            Complete & Advance Queue
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
