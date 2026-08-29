import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import {
  HeartHandshake,
  Activity,
  UserCheck,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  Stethoscope,
  ChevronDown,
  Building2,
  Phone,
  Flame,
  AlertCircle,
  FileCheck,
  X,
  Plus,
} from 'lucide-react';

export const NurseDashboard = () => {
  const { user } = useAuthStore();
  const { addToast } = useUiStore();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Vitals & Arrival Modal State
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [submittingVitals, setSubmittingVitals] = useState(false);

  // Vitals Form Inputs
  const [bpSys, setBpSys] = useState('120');
  const [bpDia, setBpDia] = useState('80');
  const [temp, setTemp] = useState('98.6');
  const [heartRate, setHeartRate] = useState('72');
  const [spO2, setSpO2] = useState('99');
  const [weight, setWeight] = useState('65');
  const [height, setHeight] = useState('170');
  const [painScale, setPainScale] = useState(0);
  const [triageLevel, setTriageLevel] = useState('P3');
  const [nurseNotes, setNurseNotes] = useState('');

  const fetchTodayRoster = async () => {
    try {
      const res = await api.get('/nurse/appointments/today');
      const data = res?.data?.data || res?.data || [];
      setAppointments(data);
    } catch (err) {
      console.error('Failed to load appointments roster:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayRoster();
    const interval = setInterval(fetchTodayRoster, 15000);
    return () => clearInterval(interval);
  }, []);

  useWebSocket([], (event) => {
    if (['queue:update', 'queue:called', 'appointment:booked', 'vitals:updated', 'consultation:completed'].includes(event)) {
      fetchTodayRoster();
    }
  });

  const handleOpenVitalsModal = (visit) => {
    setSelectedVisit(visit);
    if (visit.vitals) {
      setBpSys(visit.vitals.blood_pressure_systolic || '120');
      setBpDia(visit.vitals.blood_pressure_diastolic || '80');
      setTemp(visit.vitals.temperature || '98.6');
      setHeartRate(visit.vitals.heart_rate || '72');
      setSpO2(visit.vitals.oxygen_saturation || '99');
      setWeight(visit.vitals.weight || '65');
      setHeight(visit.vitals.height || '170');
    } else {
      setBpSys('120');
      setBpDia('80');
      setTemp('98.6');
      setHeartRate('72');
      setSpO2('99');
      setWeight('65');
      setHeight('170');
    }
    setPainScale(visit.pain_scale || 0);
    setTriageLevel(visit.triage_level || 'P3');
    setNurseNotes(visit.nurse_notes || '');
  };

  const handleMarkArrivalOnly = async (visitId) => {
    try {
      await api.post(`/nurse/patient-arrival/${visitId}`);
      addToast({
        type: 'success',
        title: 'Arrival Confirmed',
        message: 'Patient marked as arrived and queued for vitals.',
      });
      fetchTodayRoster();
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const handleSubmitVitals = async (e) => {
    e.preventDefault();
    if (!selectedVisit) return;

    setSubmittingVitals(true);
    try {
      await api.post('/nurse/record-vitals', {
        visit_id: selectedVisit.visit_id,
        blood_pressure_systolic: parseInt(bpSys) || 120,
        blood_pressure_diastolic: parseInt(bpDia) || 80,
        temperature: parseFloat(temp) || 98.6,
        heart_rate: parseInt(heartRate) || 72,
        oxygen_saturation: parseFloat(spO2) || 99,
        weight: parseFloat(weight) || 65,
        height: parseFloat(height) || 170,
        pain_scale: parseInt(painScale) || 0,
        triage_level: triageLevel,
        nurse_notes: nurseNotes,
      });

      addToast({
        type: 'success',
        title: 'Vitals Synchronized',
        message: `Observations recorded. Attending Doctor ${selectedVisit.assigned_doctor_name} notified!`,
      });

      setSelectedVisit(null);
      fetchTodayRoster();
    } catch (err) {
      addToast({ type: 'error', title: 'Save Failed', message: err.message });
    } finally {
      setSubmittingVitals(false);
    }
  };

  // Filtered Appointments
  const filteredList = appointments.filter((item) => {
    const s = search.toLowerCase();
    const matchesSearch =
      (item.patient_name || '').toLowerCase().includes(s) ||
      (item.assigned_doctor_name || '').toLowerCase().includes(s) ||
      (item.token || '').toLowerCase().includes(s) ||
      (item.chief_complaint || '').toLowerCase().includes(s);

    if (!matchesSearch) return false;
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'ARRIVED') return ['in_triage', 'in_queue', 'called', 'in_consultation'].includes(item.status);
    if (statusFilter === 'WAITING_VITALS') return !item.has_vitals && !['completed', 'cancelled', 'discharged'].includes(item.status);
    if (statusFilter === 'COMPLETED') return ['completed', 'discharged'].includes(item.status);
    return true;
  });

  const totalPatients = appointments.length;
  const waitingVitalsCount = appointments.filter((a) => !a.has_vitals && !['completed', 'cancelled', 'discharged'].includes(a.status)).length;
  const vitalsCompletedCount = appointments.filter((a) => a.has_vitals).length;
  const inConsultationCount = appointments.filter((a) => a.status === 'in_consultation').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#E6FAF5] text-[#05CD99] flex items-center justify-center border border-emerald-100 shadow-2xs">
              <HeartHandshake className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#1E293B] tracking-tight">
                Nursing Station &amp; Triage
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Hospital-wide all-doctor appointment roster, arrival check-in, and live vitals capture.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchTodayRoster}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-xs shadow-2xs hover:bg-slate-50 transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Roster</span>
        </button>
      </div>

      {/* ── KPI METRICS CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Patients Today</span>
          <div className="text-2xl font-black text-[#1E293B]">{totalPatients}</div>
          <span className="text-[11px] text-slate-500 font-medium">Across all hospital doctors</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-1">
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Pending Vitals Capture</span>
          <div className="text-2xl font-black text-amber-600">{waitingVitalsCount}</div>
          <span className="text-[11px] text-slate-500 font-medium">Require BP / Temp / Weight</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-1">
          <span className="text-[10px] font-bold text-[#05CD99] uppercase tracking-wider">Vitals Synchronized</span>
          <div className="text-2xl font-black text-[#05CD99]">{vitalsCompletedCount}</div>
          <span className="text-[11px] text-slate-500 font-medium">Ready for doctor review</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-1">
          <span className="text-[10px] font-bold text-[#5046E5] uppercase tracking-wider">In Doctor Consultation</span>
          <div className="text-2xl font-black text-[#5046E5]">{inConsultationCount}</div>
          <span className="text-[11px] text-slate-500 font-medium">Currently with physician</span>
        </div>
      </div>

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient, assigned doctor, token, complaint..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-slate-200/80 rounded-2xl text-[#1E293B] font-bold text-xs focus:bg-white focus:outline-none focus:border-[#05CD99] transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {['ALL', 'WAITING_VITALS', 'ARRIVED', 'COMPLETED'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === filter
                  ? 'bg-[#05CD99] text-white shadow-xs'
                  : 'bg-[#F8FAFC] text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {filter.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* ── PATIENTS & ALL-DOCTORS APPOINTMENTS TABLE ── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-black text-[#1E293B] uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#05CD99]" /> Today's Patient Roster ({filteredList.length})
          </h3>
          <span className="text-xs text-slate-400 font-bold">Auto-updates on Patient Check-in</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <span className="w-6 h-6 border-2 border-[#05CD99] border-t-transparent rounded-full animate-spin inline-block" />
            <p className="text-xs font-bold mt-2">Loading appointments roster...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs font-bold">
            No patient appointments match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-[#F8FAFC] text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="py-3.5 px-5">Token / Patient</th>
                  <th className="py-3.5 px-4">Chief Complaint</th>
                  <th className="py-3.5 px-4">Assigned Doctor &amp; Dept</th>
                  <th className="py-3.5 px-4">Vitals Status</th>
                  <th className="py-3.5 px-4">Queue Status</th>
                  <th className="py-3.5 px-5 text-right">Nurse Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {filteredList.map((item) => (
                  <tr key={item.visit_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-xl bg-[#EEF2FF] text-[#5046E5] font-black font-mono text-[11px]">
                          {item.token}
                        </span>
                        <div>
                          <div className="font-black text-[#1E293B] text-sm">{item.patient_name}</div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {item.patient_gender} • Blood: {item.patient_blood_group}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 max-w-[200px]">
                      <div className="font-bold text-[#1E293B] truncate">{item.chief_complaint}</div>
                      <div className="text-[10px] text-slate-400">Check-in: {item.check_in_time}</div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E293B]">
                        <Stethoscope className="w-3.5 h-3.5 text-[#5046E5]" />
                        <span>{item.assigned_doctor_name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">{item.department_name} • {item.room_number}</div>
                    </td>

                    <td className="py-4 px-4">
                      {item.has_vitals ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-[#E6FAF5] text-[#05CD99]">
                            <CheckCircle2 className="w-3 h-3" /> Vitals Logged
                          </span>
                          <div className="text-[10px] text-slate-500 font-bold">
                            BP: {item.vitals?.blood_pressure || `${item.vitals?.blood_pressure_systolic}/${item.vitals?.blood_pressure_diastolic}`} | {item.vitals?.temperature}°F
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-600 border border-amber-200/60">
                          Pending Observations
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        item.status === 'in_consultation'
                          ? 'bg-[#EFF6FF] text-[#2563EB]'
                          : item.status === 'completed'
                          ? 'bg-[#E6FAF5] text-[#05CD99]'
                          : item.status === 'in_triage'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => handleOpenVitalsModal(item)}
                        className="px-3.5 py-2 rounded-xl bg-[#05CD99] hover:bg-[#04B889] text-white font-bold text-xs shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Activity className="w-3.5 h-3.5" />
                        <span>{item.has_vitals ? 'Update Vitals' : 'Take Vitals'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 🩸 MODAL: PATIENT ARRIVAL & VITALS OBSERVATION ENTRY 🩸 ── */}
      {selectedVisit && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-100 shadow-2xl p-6 sm:p-8 space-y-5 animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#EEF2FF] text-[#5046E5] font-black font-mono text-xs">
                    {selectedVisit.token}
                  </span>
                  <h3 className="text-lg font-black text-[#1E293B]">Clinical Vitals &amp; Arrival Check-in</h3>
                </div>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Patient: <strong className="text-slate-700">{selectedVisit.patient_name}</strong> • Assigned to <strong className="text-[#5046E5]">{selectedVisit.assigned_doctor_name}</strong>
                </p>
              </div>

              <button
                onClick={() => setSelectedVisit(null)}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Vitals Form */}
            <form onSubmit={handleSubmitVitals} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Blood Pressure Systolic / Diastolic */}
                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100 space-y-2">
                  <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider">
                    Blood Pressure (mmHg)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold">Systolic</span>
                      <input
                        type="number"
                        required
                        value={bpSys}
                        onChange={(e) => setBpSys(e.target.value)}
                        placeholder="120"
                        className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-xl font-black text-xs text-[#1E293B] focus:border-[#05CD99] focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold">Diastolic</span>
                      <input
                        type="number"
                        required
                        value={bpDia}
                        onChange={(e) => setBpDia(e.target.value)}
                        placeholder="80"
                        className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-xl font-black text-xs text-[#1E293B] focus:border-[#05CD99] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Temperature & Heart Rate */}
                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100 space-y-2">
                  <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider">
                    Body Temp &amp; Pulse Rate
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold">Temp (°F)</span>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={temp}
                        onChange={(e) => setTemp(e.target.value)}
                        placeholder="98.6"
                        className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-xl font-black text-xs text-[#1E293B] focus:border-[#05CD99] focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold">Heart Rate (BPM)</span>
                      <input
                        type="number"
                        required
                        value={heartRate}
                        onChange={(e) => setHeartRate(e.target.value)}
                        placeholder="72"
                        className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-xl font-black text-xs text-[#1E293B] focus:border-[#05CD99] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* SpO2 Oxygen & Body Weight */}
                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100 space-y-2">
                  <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider">
                    SpO2 Oxygen &amp; Weight
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold">SpO2 (%)</span>
                      <input
                        type="number"
                        required
                        value={spO2}
                        onChange={(e) => setSpO2(e.target.value)}
                        placeholder="99"
                        className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-xl font-black text-xs text-[#1E293B] focus:border-[#05CD99] focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold">Weight (kg)</span>
                      <input
                        type="number"
                        step="0.1"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="65"
                        className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-xl font-black text-xs text-[#1E293B] focus:border-[#05CD99] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Triage Priority Level */}
                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100 space-y-2">
                  <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider">
                    Triage Priority Category
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {['P1', 'P2', 'P3', 'P4', 'P5'].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setTriageLevel(lvl)}
                        className={`py-2 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                          triageLevel === lvl
                            ? 'bg-[#5046E5] text-white border-[#5046E5] shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {lvl} {lvl === 'P1' ? '(Critical)' : lvl === 'P2' ? '(Urgent)' : lvl === 'P3' ? '(Standard)' : ''}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Nurse Clinical Observation Notes */}
              <div>
                <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  Nurse Observation &amp; Triage Notes (Sent directly to Doctor)
                </label>
                <textarea
                  rows="3"
                  value={nurseNotes}
                  onChange={(e) => setNurseNotes(e.target.value)}
                  placeholder="Patient looks pale, complained of mild dizziness upon arrival..."
                  className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs text-[#1E293B] font-medium focus:bg-white focus:border-[#05CD99] focus:outline-none resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedVisit(null)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingVitals}
                  className="px-6 py-2.5 rounded-xl bg-[#05CD99] hover:bg-[#04B889] text-white font-black text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {submittingVitals ? 'Syncing...' : 'Save Vitals & Sync to Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NurseDashboard;
