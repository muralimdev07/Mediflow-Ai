import React, { useState, useEffect, useCallback } from "react";
import { useWebSocket } from "../../hooks/useWebSocket";
import api from "../../services/api";
import { Clock, Users, Activity, Stethoscope, Calendar, Zap, RefreshCw, CheckCircle2 } from "lucide-react";

const useCountdown = (targetMinutes, enteredAt) => {
  const [remaining, setRemaining] = useState(() => {
    if (enteredAt) {
      const elapsed = Math.floor((Date.now() - new Date(enteredAt).getTime()) / 1000);
      const totalSecs = (targetMinutes || 10) * 60;
      return Math.max(0, totalSecs - Math.max(0, elapsed));
    }
    return (targetMinutes || 10) * 60;
  });

  useEffect(() => {
    if (enteredAt) {
      const elapsed = Math.floor((Date.now() - new Date(enteredAt).getTime()) / 1000);
      const totalSecs = (targetMinutes || 10) * 60;
      setRemaining(Math.max(0, totalSecs - Math.max(0, elapsed)));
    } else {
      setRemaining(prev => prev > 0 ? prev : (targetMinutes || 10) * 60);
    }
  }, [targetMinutes, enteredAt]);

  useEffect(() => {
    const id = setInterval(() => setRemaining(r => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  return `${mins}m ${secs.toString().padStart(2, "0")}s`;
};

const LiveTimer = ({ minutes, enteredAt }) => {
  const time = useCountdown(minutes || 0, enteredAt);
  return <span className="font-mono text-[#D97706] font-black text-lg">{time}</span>;
};

export const QueuePage = () => {
  const [activeQueue, setActiveQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchQueue = useCallback(async () => {
    try {
      const res = await api.get("/queue/me");
      setActiveQueue(res?.data?.data || res?.data || null);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  useWebSocket([], (event) => {
    if (["queue:update", "queue:called", "queue:status_change", "queue:new_booking"].includes(event)) {
      fetchQueue();
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="flex items-center gap-3 text-slate-400">
          <span className="w-5 h-5 border-2 border-slate-300 border-t-[#5046E5] rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-500">Loading live queue...</span>
        </div>
      </div>
    );
  }

  if (!activeQueue) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#1E293B] tracking-tight">Live Queue Status</h1>
            <p className="text-xs text-slate-400 font-medium">Real-time hospital consultation queue tracker</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-[#EEF2FF] text-[#5046E5] flex items-center justify-center mx-auto shadow-sm">
            <Users className="w-8 h-8 stroke-[2]" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#1E293B]">No Active Queue</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto font-medium">
              You are not currently in any waiting room queue. Book an appointment or check in to get your live token.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const position = activeQueue.queue_position || 1;
  const ahead = activeQueue.patients_ahead !== undefined ? activeQueue.patients_ahead : Math.max(0, position - 1);
  const myToken = activeQueue.token || `A-${String(position).padStart(3, "0")}`;
  const currentToken = activeQueue.currently_serving_token || "A-001";
  const estWait = activeQueue.estimated_wait_minutes ?? ahead * 12;

  const queueList = activeQueue.queue_list && activeQueue.queue_list.length > 0
    ? activeQueue.queue_list
    : [
      { token: currentToken, status: "IN CONSULTATION", isCurrent: true, isMe: myToken === currentToken },
      { token: myToken, status: activeQueue.status?.toUpperCase() || "WAITING", isCurrent: false, isMe: true },
    ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1E293B] tracking-tight">Live Queue Status</h1>
          <p className="text-xs text-slate-400 font-medium">
            Department: <span className="text-[#5046E5] font-black">{activeQueue.department_name || "General Medicine"}</span>
            {lastUpdated && <span className="ml-2 text-slate-400">· Updated {lastUpdated.toLocaleTimeString()}</span>}
          </p>
        </div>
        <button
          onClick={fetchQueue}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50 transition-all text-xs font-bold shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" /> Refresh Queue
        </button>
      </div>

      {/* Appointment & Assigned Doctor Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(activeQueue.scheduled_date || activeQueue.scheduled_time_slot) && (
          <div className="flex items-center gap-3.5 p-4 rounded-3xl bg-white border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Scheduled Time</p>
              <p className="text-xs font-black text-[#1E293B]">
                {activeQueue.scheduled_date} {activeQueue.scheduled_time_slot && `• ${activeQueue.scheduled_time_slot}`}
              </p>
            </div>
            <div className="ml-auto">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-[#FFFBEB] text-[#D97706] border border-amber-200">
                {activeQueue.status || 'WAITING'}
              </span>
            </div>
          </div>
        )}

        {activeQueue.assigned_doctor_name && (
          <div className="flex items-center gap-3.5 p-4 rounded-3xl bg-white border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF5FF] text-[#9333EA] flex items-center justify-center shrink-0">
              <Stethoscope className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Assigned Doctor</p>
              <p className="text-xs font-black text-[#1E293B]">{activeQueue.assigned_doctor_name}</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E6FAF5] text-[#05CD99]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#05CD99] animate-pulse" />
              <span className="text-[10px] font-extrabold">In Clinic</span>
            </div>
          </div>
        )}
      </div>

      {/* Main 2-Column Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Token Details & Countdown */}
        <div className="md:col-span-6 bg-white rounded-3xl p-7 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-black text-[#1E293B] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#5046E5]" /> Current Queue Position
            </h2>
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-[#EEF2FF] text-[#5046E5]">
              Position #{position}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-slate-100">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold mb-1">Serving Token</p>
              <p className="text-2xl font-black text-[#1E293B]">{currentToken}</p>
            </div>
            <div className="p-4 bg-[#EEF2FF] rounded-2xl border border-indigo-100">
              <p className="text-[10px] text-[#5046E5] uppercase tracking-wider font-black mb-1">Your Token</p>
              <p className="text-2xl font-black text-[#5046E5]">{myToken}</p>
            </div>
          </div>

          {estWait > 0 && (
            <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-amber-200 text-center space-y-1">
              <p className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider flex items-center justify-center gap-1">
                <Zap className="w-3.5 h-3.5 text-[#D97706]" /> Live Estimated Countdown
              </p>
              <LiveTimer minutes={estWait} enteredAt={activeQueue.entered_at} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white text-slate-500 flex items-center justify-center shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-black text-[#1E293B]">{ahead}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Ahead of You</p>
              </div>
            </div>
            <div className="flex items-center gap-3 border-l border-slate-200/60 pl-4">
              <div className="w-10 h-10 rounded-xl bg-white text-slate-500 flex items-center justify-center shadow-xs">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-black text-[#1E293B]">~{estWait} mins</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Est. Wait Time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Token Progression List */}
        <div className="md:col-span-6 bg-white rounded-3xl p-7 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5">
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
              <span>Queue Progression</span>
              <span className="text-[#5046E5] font-black">{Math.max(10, 100 - (ahead / Math.max(ahead + 1, 1)) * 100).toFixed(0)}% Ready</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#5046E5] to-[#05CD99] rounded-full transition-all duration-1000"
                style={{ width: `${Math.max(10, 100 - (ahead / Math.max(ahead + 1, 1)) * 100)}%` }}
              />
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            {queueList.map((item, idx) => (
              <div
                key={idx}
                className={`flex justify-between items-center p-3.5 rounded-2xl border transition-all ${
                  item.isMe
                    ? "bg-[#EEF2FF] border-indigo-200 shadow-xs ring-1 ring-indigo-300/60"
                    : item.isCurrent
                    ? "bg-[#E6FAF5] border-emerald-200 ring-1 ring-emerald-300/40"
                    : item.is_ahead
                    ? "bg-amber-50/50 border-amber-100/80"
                    : "bg-[#F8FAFC] border-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${item.isCurrent ? "bg-[#05CD99] animate-ping" : item.isMe ? "bg-[#5046E5]" : item.is_ahead ? "bg-amber-400" : "bg-slate-300"}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-black font-mono ${item.isMe ? "text-[#5046E5]" : item.isCurrent ? "text-[#05CD99]" : "text-slate-700"}`}>
                        {item.token}
                      </span>
                      {item.isMe && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#5046E5] text-white uppercase tracking-wider">
                          YOU
                        </span>
                      )}
                      {item.isCurrent && !item.isMe && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#05CD99] text-white uppercase tracking-wider">
                          IN ROOM
                        </span>
                      )}
                      {item.is_ahead && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-700">
                          Ahead of You
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      {item.label || (item.isMe ? "Your consultation turn" : item.isCurrent ? "Currently in doctor's cabin" : "Waiting in queue")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                    item.isCurrent
                      ? "bg-[#05CD99] text-white font-black"
                      : item.isMe
                      ? "bg-[#5046E5] text-white font-black"
                      : item.is_ahead
                      ? "bg-amber-100 text-amber-800 font-bold"
                      : "bg-slate-100 text-slate-500 font-medium"
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
