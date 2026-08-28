import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useUiStore } from '../../store/uiStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import { Stethoscope, Clock, CheckCircle2, CreditCard, ChevronRight } from 'lucide-react';

export const PatientDashboard = () => {
  const [activeVisit, setActiveVisit] = useState(null);
  const [activeQueue, setActiveQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [visitRes, queueRes] = await Promise.all([
        api.get('/visits/me/active'),
        api.get('/queue/me'),
      ]);
      setActiveVisit(visitRes.data);
      setActiveQueue(queueRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useWebSocket([], (event, data) => {
    if (['queue:update', 'queue:called', 'queue:status_change', 'room:status_change'].includes(event)) {
      fetchData(); // Refresh the data when any relevant queue event happens
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Patient Portal</h1>
          <p className="text-sm text-slate-400">Manage check-ins, view live queue position, and pay invoices</p>
        </div>
        {!activeVisit && (
          <Button variant="primary" onClick={() => navigate('/symptoms')} className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4" />
            Check-In with Symptoms
          </Button>
        )}
      </div>

      {activeQueue ? (
        <Card className="border-l-4 border-l-primary-light bg-gradient-to-r from-surface-card to-primary/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={activeQueue.triage_level}>{activeQueue.triage_level}</Badge>
                <span className="text-xs text-slate-400 font-semibold uppercase">{activeQueue.department_name}</span>
              </div>
              <h2 className="text-3xl font-black text-slate-100">
                Position #{activeQueue.queue_position || 1} in Queue
              </h2>
              <p className="text-sm text-slate-300">
                Chief Complaint: <span className="font-semibold text-slate-100">{activeVisit?.chief_complaint}</span>
              </p>
            </div>

            <div className="flex items-center gap-6 bg-surface/60 p-4 rounded-2xl border border-surface-border/40">
              <div className="text-center px-4">
                <p className="text-xs text-slate-400">Est. Wait</p>
                <p className="text-xl font-bold text-primary-light">{activeQueue.estimated_wait_minutes || 15} mins</p>
              </div>
              <div className="h-8 w-px bg-surface-border/50" />
              <div className="text-center px-4">
                <p className="text-xs text-slate-400">Room</p>
                <p className="text-xl font-bold text-slate-100">{activeQueue.room_number || 'TBD'}</p>
              </div>
              <div className="h-8 w-px bg-surface-border/50" />
              <div className="text-center px-4">
                <p className="text-xs text-slate-400">Doctor</p>
                <p className="text-sm font-bold text-slate-100">{activeQueue.assigned_doctor_name || 'Assigning...'}</p>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card title="No Active Visit" subtitle="You are currently not in any hospital queue">
          <div className="py-8 flex flex-col items-center text-center space-y-4">
            <div className="p-4 rounded-full bg-primary/10 text-primary-light">
              <Clock className="w-10 h-10" />
            </div>
            <p className="text-sm text-slate-400 max-w-md">
              Need medical assistance? Submit your symptoms to automatically get AI triage and get matched with the best available doctor.
            </p>
            <Button variant="primary" onClick={() => navigate('/symptoms')}>
              Start Check-In Now
            </Button>
          </div>
        </Card>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card onClick={() => navigate('/history')} className="hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-teal-500/20 text-teal-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">Medical History</h3>
          <p className="text-xs text-slate-400 mt-1">View past visits, doctor notes, and prescriptions</p>
        </Card>

        <Card onClick={() => navigate('/payments')} className="hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400">
              <CreditCard className="w-6 h-6" />
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">Invoices & Payments</h3>
          <p className="text-xs text-slate-400 mt-1">Pay consultation fees securely via Razorpay UPI/Cards</p>
        </Card>
      </div>
    </div>
  );
};
