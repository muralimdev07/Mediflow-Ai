import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { useUiStore } from '../../store/uiStore';
import { Clock, PhoneCall, Play, CheckCircle2, AlertTriangle, RefreshCw, Filter } from 'lucide-react';

export const DoctorQueuePage = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const { addToast } = useUiStore();

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = async () => {
    try {
      const res = await api.get('/doctor/dashboard');
      const data = res?.data || res;
      setQueue(data.queue || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (queueId, action) => {
    try {
      await api.patch(`/doctor/queue/${queueId}/transition`, { action });
      addToast({ type: 'success', title: `Queue Updated: ${action}` });
      fetchQueue();
    } catch (err) {
      addToast({ type: 'error', title: 'Action Failed', message: err.message });
    }
  };

  const filteredQueue = queue.filter((item) => {
    if (filter === 'WAITING') return item.status_raw === 'waiting';
    if (filter === 'CALLED') return item.status_raw === 'called';
    if (filter === 'IN_CONSULTATION') return item.status_raw === 'in_progress';
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#1E293B] flex items-center gap-2">
            <Clock className="w-6 h-6 text-[#5046E5]" />
            Live Queue Command Center
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Real-time department queue control with priority sorting and token caller.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-slate-100 rounded-2xl p-1 text-xs shadow-xs">
            {['ALL', 'WAITING', 'CALLED', 'IN_CONSULTATION'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3.5 py-2 rounded-xl font-black transition-all cursor-pointer ${
                  filter === tab
                    ? 'bg-[#5046E5] text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          <button
            onClick={fetchQueue}
            className="p-2.5 rounded-2xl bg-white border border-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredQueue.map((item) => (
          <div
            key={item.queue_id}
            className="p-6 rounded-3xl bg-white border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all space-y-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
          >
            <div className="flex items-center justify-between">
              <span className="text-base font-black font-mono text-[#5046E5] px-3 py-1 rounded-xl bg-[#EEF2FF]">
                {item.token}
              </span>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
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

            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-black text-[#1E293B] text-base">{item.patient_name}</h4>
                {item.is_priority && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black uppercase flex items-center gap-1 border border-rose-100">
                    <AlertTriangle className="w-3 h-3 text-rose-500" />
                    Priority
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">{item.chief_complaint}</p>
              <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-2 font-semibold">
                <span>Check-in: {item.appointment_time}</span>
                <span>Wait: {item.wait_time}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
              {item.status_raw === 'waiting' && (
                <button
                  onClick={() => handleAction(item.queue_id, 'CALL')}
                  className="w-full py-2.5 bg-[#5046E5] hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  Call Patient
                </button>
              )}
              {item.status_raw === 'called' && (
                <button
                  onClick={() => handleAction(item.queue_id, 'START')}
                  className="w-full py-2.5 bg-[#05CD99] hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Start Consultation
                </button>
              )}
              {item.status_raw === 'in_progress' && (
                <button
                  onClick={() => handleAction(item.queue_id, 'COMPLETE')}
                  className="w-full py-2.5 bg-[#5046E5] hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Complete Visit
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorQueuePage;
