import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, Filter, RefreshCw, AlertTriangle } from 'lucide-react';

export const DoctorAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/doctor/appointments?status_filter=${statusFilter}`);
      const data = res?.data || res;
      setAppointments(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = ['ALL', 'WAITING', 'CALLED', 'IN_CONSULTATION', 'COMPLETED', 'NO_SHOW'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#1E293B] flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#5046E5]" />
            Doctor Appointments Schedule
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Track confirmed, waiting, in-consultation, and discharged appointments.
          </p>
        </div>

        <button
          onClick={fetchAppointments}
          className="p-2.5 rounded-2xl bg-white border border-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === tab
                ? 'bg-[#5046E5] text-white shadow-md shadow-indigo-500/20'
                : 'bg-white border border-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Appointments Table Card */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-slate-400 uppercase tracking-wider font-extrabold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Token</th>
                <th className="px-6 py-4">Patient Name</th>
                <th className="px-6 py-4">Chief Complaint</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Room</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center text-slate-400 text-xs font-bold">
                    No appointments match the selected filter.
                  </td>
                </tr>
              ) : (
                appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-[#EEF2FF]/40 transition-colors">
                    <td className="px-6 py-4 font-black font-mono text-[#5046E5]">{apt.token}</td>
                    <td className="px-6 py-4 text-[#1E293B] font-black">{apt.patient_name}</td>
                    <td className="px-6 py-4 text-slate-500 max-w-[220px] truncate font-medium">{apt.chief_complaint}</td>
                    <td className="px-6 py-4 text-slate-400 font-semibold">{apt.date} • {apt.appointment_time}</td>
                    <td className="px-6 py-4">
                      {apt.priority === 'Emergency' ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 font-black text-[10px] flex items-center gap-1 border border-rose-100 w-fit">
                          <AlertTriangle className="w-3 h-3 text-rose-500" />
                          Priority
                        </span>
                      ) : (
                        <span className="text-slate-400 font-semibold">Normal</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          apt.status_raw === 'completed'
                            ? 'bg-[#E6FAF5] text-[#05CD99]'
                            : apt.status_raw === 'in_progress'
                            ? 'bg-[#EEF2FF] text-[#5046E5]'
                            : 'bg-[#FFFBEB] text-[#D97706]'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-bold">{apt.room_number || 'Room 101'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointmentsPage;
