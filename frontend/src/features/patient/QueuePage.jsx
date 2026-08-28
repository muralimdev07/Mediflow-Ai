import React, { useState, useEffect, useCallback } from "react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { useWebSocket } from "../../hooks/useWebSocket";
import api from "../../services/api";
import { Clock, Users, Activity, Stethoscope, Calendar, Zap, RefreshCw } from "lucide-react";

const useCountdown = (targetMinutes) => {
  const [remaining, setRemaining] = useState(targetMinutes * 60);
  useEffect(() => {
    setRemaining(targetMinutes * 60);
    const id = setInterval(() => setRemaining(r => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, [targetMinutes]);
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  return `${mins}m ${secs.toString().padStart(2, "0")}s`;
};

const LiveTimer = ({ minutes }) => {
  const time = useCountdown(minutes || 0);
  return <span className="font-mono text-orange-300 font-black">{time}</span>;
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
      <div className="flex items-center justify-center p-12">
        <div className="flex items-center gap-3 text-slate-400">
          <span className="w-5 h-5 border-2 border-slate-500 border-t-primary-light rounded-full animate-spin" />
          Loading live queue...
        </div>
      </div>
    );
  }

  if (!activeQueue) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-100">Live Queue</h1>
        <Card title="No Active Queue" subtitle="You are not currently in any queue.">
          <div className="p-8 flex flex-col items-center gap-3 text-slate-400">
            <div className="p-4 rounded-full bg-surface-hover">
              <Users className="w-10 h-10" />
            </div>
            <p className="text-sm">Start a check-in from the Appointments page to join the queue.</p>
          </div>
        </Card>
      </div>
    );
  }

  const position = activeQueue.queue_position || 1;
  const ahead = Math.max(0, position - 1);
  const myToken = activeQueue.token || `A-${String(position).padStart(2, "0")}`;
  const currentToken = "A-01";
  const estWait = activeQueue.estimated_wait_minutes ?? ahead * 15;
  const displayCount = Math.min(position + 1, 6);
  const queueList = [];
  for (let i = 1; i <= displayCount; i++) {
    queueList.push({
      token: `A-${String(i).padStart(2, "0")}`,
      status: i === 1 ? "IN CONSULTATION" : i < position ? "WAITING" : i === position ? "MY SPOT" : "NEXT",
      isMe: i === position,
      isCurrent: i === 1,
    });
  }

  const statusColor = {
    waiting: "bg-amber-500/20 border-amber-500/40 text-amber-300",
    called: "bg-green-500/20 border-green-500/40 text-green-300",
    in_progress: "bg-blue-500/20 border-blue-500/40 text-blue-300",
  }[activeQueue.status] || "bg-slate-500/20 border-slate-500/40 text-slate-300";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Live Queue</h1>
          <p className="text-sm text-slate-400">
            Department: <span className="text-primary-light font-semibold">{activeQueue.department_name || "General"}</span>
            {lastUpdated && <span className="ml-3 text-slate-500">· Updated {lastUpdated.toLocaleTimeString()}</span>}
          </p>
        </div>
        <button onClick={fetchQueue} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-surface-border/40 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-all text-xs font-semibold">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {(activeQueue.scheduled_date || activeQueue.scheduled_time_slot) && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-teal-500/10 border border-teal-500/20">
          <Calendar className="w-5 h-5 text-teal-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-teal-300">Scheduled Appointment</p>
            <p className="text-xs text-teal-400">
              {activeQueue.scheduled_date}{activeQueue.scheduled_time_slot && ` at ${activeQueue.scheduled_time_slot}`}
            </p>
          </div>
          <div className="ml-auto">
            <span className={`px-3 py-1 rounded-full border text-xs font-bold ${statusColor}`}>{activeQueue.status?.toUpperCase()}</span>
          </div>
        </div>
      )}

      {activeQueue.assigned_doctor_name && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-primary-light" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned Doctor</p>
            <p className="font-bold text-slate-100">{activeQueue.assigned_doctor_name}</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400 font-semibold">Available</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-surface-card to-primary/10 border-primary/30">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Activity className="text-primary-light w-5 h-5" /> Current Status
            </h2>
            <Badge variant={activeQueue.status === "waiting" ? "warning" : "success"}>
              {activeQueue.status?.toUpperCase() || "WAITING"}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center mb-6">
            <div className="p-4 bg-surface/50 rounded-xl border border-surface-border/50">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Currently Serving</p>
              <p className="text-3xl font-black text-slate-100">{currentToken}</p>
            </div>
            <div className="p-4 bg-primary/20 rounded-xl border border-primary/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/5 animate-pulse rounded-xl" />
              <p className="text-xs text-primary-light uppercase tracking-wider font-semibold mb-1 relative">Your Token</p>
              <p className="text-3xl font-black text-primary-light relative">{myToken}</p>
            </div>
          </div>
          {estWait > 0 && (
            <div className="mb-4 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-center">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                <Zap className="w-3 h-3 inline mr-1" />Live Countdown
              </p>
              <LiveTimer minutes={estWait} />
            </div>
          )}
          <div className="flex justify-between items-center px-4 py-3 bg-surface/40 rounded-xl border border-surface-border/30">
            <div className="flex items-center gap-3">
              <Users className="text-slate-400 w-5 h-5" />
              <div>
                <p className="text-sm font-bold text-slate-100">{ahead}</p>
                <p className="text-xs text-slate-400">Patients Ahead</p>
              </div>
            </div>
            <div className="h-8 w-px bg-surface-border/50" />
            <div className="flex items-center gap-3">
              <Clock className="text-slate-400 w-5 h-5" />
              <div>
                <p className="text-sm font-bold text-slate-100">~{estWait} mins</p>
                <p className="text-xs text-slate-400">Est. Wait</p>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Queue Order" subtitle="Live position updates">
          <div className="mb-4">
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Queue Progress</span>
              <span>Position {position}</span>
            </div>
            <div className="h-2 bg-surface/50 rounded-full overflow-hidden border border-surface-border/30">
              <div className="h-full bg-gradient-to-r from-primary to-teal-400 rounded-full transition-all duration-1000"
                style={{ width: `${Math.max(10, 100 - (ahead / Math.max(ahead + 1, 1)) * 100)}%` }} />
            </div>
          </div>
          <div className="space-y-2 mt-4">
            {queueList.map((item, idx) => (
              <div key={idx} className={`flex justify-between items-center p-3 rounded-lg border transition-all ${
                item.isMe ? "bg-primary/20 border-primary/40 shadow-lg shadow-primary/10"
                : item.isCurrent ? "bg-green-500/10 border-green-500/30"
                : "bg-surface/30 border-surface-border/30"}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${item.isCurrent ? "bg-green-400 animate-pulse" : item.isMe ? "bg-primary-light animate-pulse" : "bg-slate-600"}`} />
                  <span className={`font-bold ${item.isMe ? "text-primary-light" : item.isCurrent ? "text-green-300" : "text-slate-400"}`}>{item.token}</span>
                  {item.isMe && <Badge variant="primary" className="ml-1 text-[10px] py-0">YOU</Badge>}
                </div>
                <span className={`text-xs font-semibold ${item.isCurrent ? "text-green-400" : item.isMe ? "text-primary-light" : "text-slate-500"}`}>{item.status}</span>
              </div>
            ))}
            {position > displayCount && <p className="text-center text-xs text-slate-500 pt-1">+{position - displayCount} more in queue</p>}
          </div>
        </Card>
      </div>
    </div>
  );
};
