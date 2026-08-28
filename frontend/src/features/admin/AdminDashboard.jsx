import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Users, Clock, CreditCard, Building2, TrendingUp, RefreshCw } from 'lucide-react';

export const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [overviewRes, revenueRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/analytics/revenue?days=30'),
      ]);
      setOverview(overviewRes.data);
      setRevenue(revenueRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Hospital Admin Analytics & Overview</h1>
          <p className="text-sm text-slate-400">Live operational metrics, queue throughput, and revenue insights</p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchData} className="flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </Button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-teal-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Today's Check-Ins</p>
              <h3 className="text-2xl font-black text-slate-100 mt-1">{overview?.visits_today || 0}</h3>
            </div>
            <div className="p-3 rounded-xl bg-teal-500/20 text-teal-400">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Active Queue</p>
              <h3 className="text-2xl font-black text-slate-100 mt-1">{overview?.active_queue || 0}</h3>
            </div>
            <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Monthly Revenue</p>
              <h3 className="text-2xl font-black text-slate-100 mt-1">₹{revenue?.total_revenue?.toLocaleString() || 0}</h3>
            </div>
            <div className="p-3 rounded-xl bg-green-500/20 text-green-400">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Avg Wait Time</p>
              <h3 className="text-2xl font-black text-slate-100 mt-1">{overview?.average_wait_minutes || 0} mins</h3>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Operational Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="System Performance" subtitle="Real-time operational summary">
          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center py-2 border-b border-surface-border/30">
              <span className="text-sm text-slate-300">Total Registered Patients</span>
              <span className="font-bold text-slate-100">{overview?.total_patients || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-surface-border/30">
              <span className="text-sm text-slate-300">Active Doctors on Shift</span>
              <span className="font-bold text-slate-100">{overview?.total_doctors || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-surface-border/30">
              <span className="text-sm text-slate-300">Consultations Today</span>
              <span className="font-bold text-slate-100">{overview?.consultations_today || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-slate-300">Discharged Today</span>
              <span className="font-bold text-slate-100">{overview?.completed_today || 0}</span>
            </div>
          </div>
        </Card>

        <Card title="Revenue Breakdown (30 Days)" subtitle="Razorpay billing summary">
          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center py-2 border-b border-surface-border/30">
              <span className="text-sm text-slate-300">Total Invoices Issued</span>
              <span className="font-bold text-slate-100">{revenue?.total_invoices || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-surface-border/30">
              <span className="text-sm text-slate-300">Paid Invoices</span>
              <span className="font-bold text-green-400">{revenue?.paid_invoices || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-slate-300">Pending Amount</span>
              <span className="font-bold text-amber-400">₹{revenue?.pending_amount?.toLocaleString() || 0}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
