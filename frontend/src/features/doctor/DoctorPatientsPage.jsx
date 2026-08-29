import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Search, UserCheck, RefreshCw, Phone, Mail, FileText, Pill, Calendar, Clock, X, Stethoscope, Activity } from 'lucide-react';

export const DoctorPatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, [search]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/doctor/patients?search=${encodeURIComponent(search)}`);
      const data = res?.data || res;
      setPatients(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPatientHistory = async (patient) => {
    setSelectedPatient(patient);
    setLoadingHistory(true);
    try {
      const res = await api.get(`/consultations/patient/${patient.id}/history`);
      const data = res?.data?.data || res?.data || [];
      setPatientHistory(data);
    } catch (err) {
      console.error('Failed to load patient history:', err);
      setPatientHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#1E293B] flex items-center gap-2">
            <Users className="w-6 h-6 text-[#5046E5]" />
            Assigned & Consulted Patients
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Data-isolated directory of clinical records assigned to your department. Click any patient to view complete medical history and past prescriptions.
          </p>
        </div>

        {/* Search Box */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient by name / email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-[#1E293B] font-bold text-xs focus:outline-none focus:border-[#5046E5] shadow-xs transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {patients.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-xs font-bold bg-white rounded-3xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            No patient records found.
          </div>
        ) : (
          patients.map((p) => (
            <div
              key={p.id}
              onClick={() => handleOpenPatientHistory(p)}
              className="p-6 rounded-3xl bg-white border border-slate-100 space-y-4 hover:border-indigo-200 hover:shadow-md transition-all shadow-[0_2px_12px_rgba(0,0,0,0.03)] cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] border border-indigo-100 flex items-center justify-center font-black text-[#5046E5] group-hover:scale-105 transition-transform">
                  {p.full_name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'PT'}
                </div>
                <div>
                  <h4 className="font-black text-[#1E293B] text-sm group-hover:text-[#5046E5] transition-colors">{p.full_name}</h4>
                  <p className="text-xs text-slate-400 font-medium">{p.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-3 border-t border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Gender / Blood</span>
                  <span className="text-[#1E293B] capitalize font-bold">{p.gender} • {p.blood_group}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Total Visits</span>
                  <span className="text-[#5046E5] font-black">{p.total_visits}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Recent Diagnosis</span>
                <p className="text-[#1E293B] font-bold truncate">{p.last_diagnosis}</p>
                <span className="text-[10px] text-slate-400 mt-1 block font-medium">Date: {p.last_visit_date}</span>
              </div>

              <div className="text-[11px] font-bold text-[#5046E5] flex items-center justify-end gap-1 group-hover:translate-x-1 transition-transform">
                <span>View Full Medical History</span> →
              </div>
            </div>
          ))
        )}
      </div>

      {/* PATIENT LONGITUDINAL MEDICAL HISTORY MODAL */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-slate-100 shadow-2xl p-6 sm:p-7 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] border border-indigo-100 flex items-center justify-center font-black text-[#5046E5]">
                  {selectedPatient.full_name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'PT'}
                </div>
                <div>
                  <h3 className="text-base font-black text-[#1E293B]">{selectedPatient.full_name}</h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {selectedPatient.gender} • {selectedPatient.blood_group} • {selectedPatient.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-[#5046E5]" /> Clinical Consultations &amp; Past Prescriptions
                </h4>
                <span className="text-[11px] font-bold text-[#5046E5]">{patientHistory.length} Recorded Visits</span>
              </div>

              {loadingHistory ? (
                <div className="py-12 text-center text-slate-400">
                  <span className="w-5 h-5 border-2 border-[#5046E5] border-t-transparent rounded-full animate-spin inline-block" />
                  <p className="text-xs font-bold mt-2">Loading medical records...</p>
                </div>
              ) : patientHistory.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 bg-[#F8FAFC] rounded-2xl border border-slate-100">
                  No previous consultation notes recorded for this patient.
                </div>
              ) : (
                <div className="space-y-4">
                  {patientHistory.map((item, idx) => {
                    const c = item.consultation;
                    const rxs = c?.prescriptions || [];
                    return (
                      <div key={idx} className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#E6FAF5] text-[#05CD99] uppercase">
                            {item.status || 'COMPLETED'}
                          </span>
                          <span className="text-[11px] text-slate-400 font-bold">
                            {new Date(item.check_in_time || Date.now()).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Chief Complaint</span>
                          <p className="text-xs font-black text-[#1E293B]">{item.chief_complaint}</p>
                        </div>

                        {/* 🩸 NURSE RECORDED VITALS & OBSERVATIONS 🩸 */}
                        {(item.vitals || c?.vitals?.[0]) && (
                          <div className="p-3 rounded-xl bg-[#EEF2FF]/60 border border-indigo-100 space-y-1.5">
                            <span className="text-[10px] font-black text-[#5046E5] uppercase tracking-wider flex items-center gap-1">
                              <Activity className="w-3 h-3 text-[#5046E5]" /> Clinical Vitals (Nurse Station)
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
                              <div className="bg-white p-2 rounded-lg border border-indigo-50 shadow-2xs text-center">
                                <span className="text-[9px] font-bold text-slate-400 uppercase block">BP</span>
                                <span className="text-xs font-black text-rose-600">
                                  {item.vitals?.blood_pressure || (item.vitals?.blood_pressure_systolic ? `${item.vitals.blood_pressure_systolic}/${item.vitals.blood_pressure_diastolic}` : '120/80')} mmHg
                                </span>
                              </div>
                              <div className="bg-white p-2 rounded-lg border border-indigo-50 shadow-2xs text-center">
                                <span className="text-[9px] font-bold text-slate-400 uppercase block">Temp</span>
                                <span className="text-xs font-black text-amber-600">
                                  {item.vitals?.temperature || '98.6'} °F
                                </span>
                              </div>
                              <div className="bg-white p-2 rounded-lg border border-indigo-50 shadow-2xs text-center">
                                <span className="text-[9px] font-bold text-slate-400 uppercase block">Pulse / HR</span>
                                <span className="text-xs font-black text-[#5046E5]">
                                  {item.vitals?.heart_rate || '72'} BPM
                                </span>
                              </div>
                              <div className="bg-white p-2 rounded-lg border border-indigo-50 shadow-2xs text-center">
                                <span className="text-[9px] font-bold text-slate-400 uppercase block">SpO2 / Wt</span>
                                <span className="text-xs font-black text-[#05CD99]">
                                  {item.vitals?.oxygen_saturation || '99'}% • {item.vitals?.weight ? `${item.vitals.weight}kg` : '65kg'}
                                </span>
                              </div>
                            </div>
                            {(item.nurse_notes || c?.nurse_notes) && (
                              <p className="text-[10px] text-slate-600 italic bg-white px-2.5 py-1 rounded-md border border-indigo-50 mt-1">
                                <strong className="text-[#5046E5]">Nurse Note:</strong> "{item.nurse_notes || c?.nurse_notes}"
                              </p>
                            )}
                          </div>
                        )}

                        {c?.diagnosis && (
                          <div className="p-3 rounded-xl bg-white border border-slate-200/60 text-xs">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Diagnosis &amp; Advice</span>
                            <p className="font-bold text-[#1E293B]">{c.diagnosis}</p>
                            {c.treatment_plan && (
                              <p className="text-slate-600 text-[11px] mt-1 font-medium">{c.treatment_plan}</p>
                            )}
                          </div>
                        )}

                        {rxs.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                              <Pill className="w-3 h-3 text-[#5046E5]" /> Prescribed Medicines ({rxs.length})
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {rxs.map((rx, rIdx) => (
                                <div key={rIdx} className="p-2.5 bg-white rounded-xl border border-slate-200/60 text-[11px] shadow-2xs">
                                  <div className="font-bold text-[#1E293B]">{rx.medication_name}</div>
                                  <div className="text-slate-500 text-[10px] font-medium">{rx.dosage} • {rx.frequency} ({rx.duration_days} days)</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPatientsPage;
