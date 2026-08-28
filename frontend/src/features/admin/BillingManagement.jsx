import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { CreditCard, DollarSign } from 'lucide-react';

export const BillingManagement = () => {
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenue();
  }, []);

  const fetchRevenue = async () => {
    try {
      const res = await api.get('/analytics/revenue?days=30');
      setRevenue(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Billing & Razorpay Financial Overview</h1>
        <p className="text-sm text-slate-400">Track invoices, paid consultations, and pending payments</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <p className="text-xs text-slate-400 uppercase font-semibold">Total Revenue (30 Days)</p>
          <h3 className="text-3xl font-black text-slate-100 mt-1">₹{revenue?.total_revenue?.toLocaleString() || 0}</h3>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <p className="text-xs text-slate-400 uppercase font-semibold">Pending Invoice Amount</p>
          <h3 className="text-3xl font-black text-slate-100 mt-1">₹{revenue?.pending_amount?.toLocaleString() || 0}</h3>
        </Card>

        <Card className="border-l-4 border-l-teal-500">
          <p className="text-xs text-slate-400 uppercase font-semibold">Paid Invoices Count</p>
          <h3 className="text-3xl font-black text-slate-100 mt-1">{revenue?.paid_invoices || 0}</h3>
        </Card>
      </div>

      <Card title="Razorpay Integration Setup" subtitle="Payment Gateway Status">
        <div className="p-4 rounded-xl bg-surface border border-surface-border/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-200">Gateway Mode</span>
            <Badge variant="warning">Test / Sandbox Mode</Badge>
          </div>
          <p className="text-xs text-slate-400">
            Razorpay is currently running in test mode. When you provide your live API Secret Key, update the `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env`.
          </p>
        </div>
      </Card>
    </div>
  );
};
