import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, Clock, FileText, PlusCircle, Ticket, XCircle, RefreshCw, User, Building2, Pill } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BookingWizard } from './BookingWizard';
import { useUiStore } from '../../store/uiStore';
import { useWebSocket } from '../../hooks/useWebSocket';

export const AppointmentsPage = () => {
  const [activeVisit, setActiveVisit] = useState(null);
  const [activeQueue, setActiveQueue] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'completed' | 'cancelled'
  const [cancelling, setCancelling] = useState(false);
  const { addToast } = useUiStore();
  const navigate = useNavigate();

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const [activeRes, queueRes, historyRes] = await Promise.all([
        api.get('/visits/me/active').catch(() => ({ data: null })),
        api.get('/queue/me').catch(() => ({ data: null })),
        api.get('/visits/me/history').catch(() => ({ data: [] })),
      ]);
      setActiveVisit(activeRes?.data?.data || activeRes?.data || null);
      setActiveQueue(queueRes?.data?.data || queueRes?.data || null);
      setHistory(historyRes?.data?.data || historyRes?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  useWebSocket([], (event) => {
    if (['queue:update', 'queue:called', 'queue:status_change', 'payment:success', 'appointment:booked', 'consultation:completed'].includes(event)) {
      fetchAppointments();
    }
  });

  const handleCancelAppointment = async (visitId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    setCancelling(true);
    try {
      await api.post(`/patient/cancel-appointment/${visitId}`);
      addToast({ type: 'info', title: 'Appointment Cancelled', message: 'Your check-in has been cancelled.' });
      fetchAppointments();
    } catch (err) {
      addToast({ type: 'error', title: 'Cancellation Failed', message: err.message || 'Unable to cancel' });
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'discharged':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#E6FAF5] text-[#05CD99] uppercase">COMPLETED</span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#FEF2F2] text-rose-500 uppercase">CANCELLED</span>;
      case 'in_consultation':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#EFF6FF] text-[#2563EB] uppercase">IN CONSULTATION</span>;
      case 'called':
      case 'waiting':
      case 'checked_in':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#FFFBEB] text-[#D97706] uppercase">WAITING</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-600 uppercase">{status?.toUpperCase() || 'SCHEDULED'}</span>;
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-3">
        <span className="w-5 h-5 border-2 border-slate-300 border-t-[#5046E5] rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500">Loading appointments...</p>
      </div>
    );
  }

  const completedVisits = history.filter((v) => ['completed', 'discharged'].includes(v.status?.toLowerCase()));
  const cancelledVisits = history.filter((v) => v.status?.toLowerCase() === 'cancelled');

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-12 font-sans">
      <BookingWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onSuccess={() => {
          setShowWizard(false);
          fetchAppointments();
        }}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E293B] tracking-tight">Appointments & Visits</h1>
          <p className="text-xs text-slate-400 font-medium">Track current tokens, upcoming consultations, and medical history</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAppointments}
            title="Refresh Appointments"
            className="p-2.5 rounded-2xl border border-slate-200/80 text-slate-500 hover:text-slate-800 bg-white shadow-xs transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            id="open-booking-wizard-btn"
            onClick={() => setShowWizard(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#5046E5] hover:bg-[#4338CA] text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Book Appointment
          </button>
        </div>
      </div>

      {/* Logical Section Tabs */}
      <div className="flex border-b border-slate-200/80 gap-2 sm:gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 px-2 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'upcoming'
              ? 'border-[#5046E5] text-[#5046E5]'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Clock className="w-4 h-4" /> Upcoming & Active {activeVisit ? '(1)' : '(0)'}
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-3 px-2 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'completed'
              ? 'border-[#5046E5] text-[#5046E5]'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <FileText className="w-4 h-4" /> Completed Visits ({completedVisits.length})
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`pb-3 px-2 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'cancelled'
              ? 'border-rose-500 text-rose-500'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <XCircle className="w-4 h-4" /> Cancelled ({cancelledVisits.length})
        </button>
      </div>

      {/* TAB 1: UPCOMING & ACTIVE */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          {activeVisit ? (
            <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border-l-4 border-l-[#5046E5]">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-[#EEF2FF] text-[#5046E5] px-2.5 py-0.5 rounded-full">
                      {activeQueue?.triage_level || 'PRIORITY 3'}
                    </span>
                    <span className="text-xs font-bold text-[#1E293B] bg-[#F8FAFC] px-2.5 py-0.5 rounded-full border border-slate-200/60 uppercase">
                      {activeQueue?.department_name || 'General Medicine'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Check-in: {new Date(activeVisit.check_in_time || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-[#1E293B]">
                    Chief Complaint: {activeVisit.chief_complaint}
                  </h3>

                  {activeVisit.symptoms_description && (
                    <p className="text-xs text-slate-500 max-w-xl line-clamp-2">
                      Description: {activeVisit.symptoms_description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1 font-medium">
                    <span className="flex items-center gap-1.5">
                      <User className="w-4 h-4 text-[#5046E5]" />
                      Doctor: <strong className="text-[#1E293B]">{activeQueue?.assigned_doctor_name || 'Assigned on duty'}</strong>
                    </span>
                    {activeQueue?.token && (
                      <span className="flex items-center gap-1.5">
                        <Ticket className="w-4 h-4 text-[#D97706]" />
                        Token: <strong className="text-[#D97706] font-mono font-black">{activeQueue.token}</strong>
                      </span>
                    )}
                    {activeQueue?.room_number && (
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        Room: <strong className="text-[#1E293B]">{activeQueue.room_number}</strong>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
                  <button
                    onClick={() => navigate('/queue')}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#5046E5] hover:bg-[#4338CA] text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                  >
                    <Ticket className="w-4 h-4" /> View Live Queue
                  </button>
                  <button
                    disabled={cancelling || ['in_consultation', 'completed'].includes(activeVisit.status)}
                    onClick={() => handleCancelAppointment(activeVisit.id)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" /> Cancel Appointment
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              <div className="flex flex-col items-center gap-3 max-w-md mx-auto">
                <div className="w-16 h-16 rounded-3xl bg-[#EEF2FF] text-[#5046E5] flex items-center justify-center shadow-xs">
                  <Calendar className="w-8 h-8 stroke-[2]" />
                </div>
                <h3 className="text-lg font-black text-[#1E293B]">No active appointment</h3>
                <p className="text-xs text-slate-400 font-medium">You don't have any pending or active hospital check-ins right now.</p>
                <button
                  onClick={() => setShowWizard(true)}
                  className="mt-2 flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#5046E5] hover:bg-[#4338CA] text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" /> Book an Appointment
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COMPLETED VISITS & DIGITAL PRESCRIPTION REPORTS */}
      {activeTab === 'completed' && (
        <div className="space-y-5">
          {completedVisits.length > 0 ? (
            completedVisits.map((visit, idx) => {
              const doc = visit.doctor || visit.consultation?.doctor;
              const rxs = visit.prescriptions || visit.consultation?.prescriptions || [];
              const diag = visit.diagnosis || visit.consultation?.diagnosis;
              const advice = visit.consultation?.treatment_plan || visit.consultation?.clinical_notes;

              return (
                <div
                  key={visit.id || visit.visit_id || idx}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4 hover:border-indigo-100 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        {getStatusBadge(visit.status)}
                        {visit.token && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#EEF2FF] text-[#5046E5] border border-indigo-100">
                            Token: {visit.token}
                          </span>
                        )}
                        <span className="text-xs text-slate-400 font-bold">
                          {new Date(visit.discharge_time || visit.check_in_time || visit.created_at).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <h4 className="font-black text-[#1E293B] text-base mt-1">
                        {visit.chief_complaint || 'General Clinical Consultation'}
                      </h4>
                    </div>

                    {doc && (
                      <div className="flex items-center gap-3 bg-[#F8FAFC] px-4 py-2 rounded-2xl border border-slate-100 self-start sm:self-auto">
                        <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] text-[#5046E5] flex items-center justify-center font-bold text-xs">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-[#1E293B]">{doc.name}</div>
                          <div className="text-[10px] text-slate-400 font-semibold">{doc.specialization || doc.department}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Diagnosis & Notes */}
                    <div className="lg:col-span-4 p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100 space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Diagnosis &amp; Advice
                      </span>
                      <p className="text-xs font-black text-[#1E293B]">
                        {diag || 'Routine checkup completed'}
                      </p>
                      {advice && (
                        <div className="pt-2 border-t border-slate-200/60">
                          <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                            {advice}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Prescribed Medicines */}
                    <div className="lg:col-span-8 p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Pill className="w-3.5 h-3.5 text-[#5046E5]" /> Prescribed Medication ({rxs.length})
                        </span>
                        <span className="text-[10px] font-bold text-[#05CD99]">Official Clinical Rx</span>
                      </div>

                      {rxs.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                          {rxs.map((med, rxIdx) => (
                            <div
                              key={rxIdx}
                              className="p-3 bg-white rounded-2xl border border-slate-200/70 shadow-xs space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-[#1E293B]">{med.medication_name}</span>
                                <span className="text-[10px] font-bold text-[#5046E5] bg-[#EEF2FF] px-2 py-0.5 rounded-lg">
                                  {med.dosage}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
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
                        <p className="text-xs text-slate-400 py-3">No medications recorded for this visit.</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              <div className="w-14 h-14 rounded-3xl bg-[#EEF2FF] text-[#5046E5] flex items-center justify-center mx-auto mb-3">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-[#1E293B]">No completed records yet</h3>
              <p className="text-xs text-slate-400 font-medium mt-1 max-w-sm mx-auto">
                After a doctor finishes your consultation, your medical report and prescribed medicines will appear here automatically.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CANCELLED VISITS */}
      {activeTab === 'cancelled' && (
        <div className="space-y-4">
          {cancelledVisits.length > 0 ? (
            cancelledVisits.map((visit, idx) => (
              <div key={visit.id || visit.visit_id || idx} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusBadge(visit.status)}
                      <span className="text-xs text-slate-400 font-bold">
                        {new Date(visit.check_in_time || visit.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs font-extrabold text-[#1E293B]">{visit.chief_complaint}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              <p className="text-xs font-bold text-slate-400">No cancelled appointments recorded.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
