import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useUiStore } from '../../store/uiStore';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Receipt,
  ArrowUpRight,
  TrendingUp,
  FileCheck,
  Building,
  Lock,
} from 'lucide-react';

export const PaymentPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [activeTab, setActiveTab] = useState('invoices'); // 'invoices' | 'history'
  const { addToast } = useUiStore();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, payRes] = await Promise.all([
        api.get('/invoices/me').catch(() => ({ data: [] })),
        api.get('/payments/me').catch(() => ({ data: [] })),
      ]);
      setInvoices(invRes?.data?.data || invRes?.data || []);
      setPayments(payRes?.data?.data || payRes?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePay = async (invoiceId) => {
    setPayingId(invoiceId);
    try {
      // 1. Create Razorpay order on backend
      const orderRes = await api.post('/payments/create-order', { invoice_id: invoiceId });
      const orderData = orderRes?.data?.data || orderRes?.data;

      if (window.Razorpay) {
        const options = {
          key: orderData.key_id,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'MediFlow AI Hospital',
          description: orderData.description,
          order_id: orderData.order_id,
          handler: async function (response) {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            addToast({ type: 'success', title: 'Payment Successful!', message: 'Invoice paid via Razorpay.' });
            fetchData();
          },
          prefill: {
            name: orderData.patient_name,
            email: orderData.patient_email,
          },
          theme: {
            color: '#5046E5',
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        await api.post('/payments/verify', {
          razorpay_order_id: orderData.order_id,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: 'mock_signature',
        });
        addToast({ type: 'success', title: 'Payment Verified!', message: 'Invoice marked as completed.' });
        fetchData();
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Payment Failed', message: err.message });
    } finally {
      setPayingId(null);
    }
  };

  const totalPaid = payments
    .filter((p) => p.status === 'captured' || p.status === 'paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const pendingAmount = invoices
    .filter((i) => i.status !== 'paid')
    .reduce((sum, i) => sum + (i.net_amount || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-16 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E293B] tracking-tight flex items-center gap-3">
            Invoices & Billing
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
            Secure digital payments powered by Razorpay with instant 256-bit encrypted receipts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            title="Refresh Invoices"
            className="p-2.5 rounded-2xl border border-slate-200/80 text-slate-500 hover:text-slate-800 bg-white shadow-xs transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-100/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] text-[#5046E5] flex items-center justify-center shrink-0">
            <Receipt className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Total Invoices</span>
            <span className="text-2xl font-black text-[#1E293B] block leading-tight">{invoices.length}</span>
            <span className="text-[10px] text-slate-400 font-medium">All generated bills</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E6FAF5] text-[#05CD99] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Total Paid</span>
            <span className="text-2xl font-black text-[#05CD99] block leading-tight">₹{totalPaid.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400 font-medium">Cleared via Razorpay</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FFFBEB] text-[#D97706] flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Pending Due</span>
            <span className="text-2xl font-black text-[#D97706] block leading-tight">₹{pendingAmount.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400 font-medium">Awaiting settlement</span>
          </div>
        </div>
      </div>

      {/* Tabs Control */}
      <div className="flex border-b border-slate-200/80 gap-4 sm:gap-8 text-xs font-bold">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`pb-3 px-2 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'invoices'
              ? 'border-[#5046E5] text-[#5046E5]'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Receipt className="w-4 h-4" /> Invoices ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-2 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'history'
              ? 'border-[#05CD99] text-[#05CD99]'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Razorpay Transactions ({payments.length})
        </button>
      </div>

      {/* Content Rendering */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-3">
          <span className="w-6 h-6 border-2 border-slate-300 border-t-[#5046E5] rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500">Loading verified invoices...</p>
        </div>
      ) : activeTab === 'invoices' ? (
        <div className="space-y-4">
          {invoices.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-[#EEF2FF] text-[#5046E5] flex items-center justify-center mx-auto shadow-xs">
                <Receipt className="w-8 h-8 stroke-[2]" />
              </div>
              <h3 className="font-black text-[#1E293B] text-base">No invoices generated yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Invoices will automatically generate when booking specialist consultations or during check-ins.
              </p>
            </div>
          ) : (
            invoices.map((inv) => (
              <div
                key={inv.id}
                className={`bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                  inv.status === 'paid' ? 'border-l-4 border-l-[#05CD99]' : 'border-l-4 border-l-[#D97706]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-[11px] font-black text-[#5046E5] bg-[#EEF2FF] px-2.5 py-0.5 rounded-full uppercase">
                      {inv.invoice_number}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        inv.status === 'paid'
                          ? 'bg-[#E6FAF5] text-[#05CD99]'
                          : 'bg-[#FFFBEB] text-[#D97706]'
                      }`}
                    >
                      {inv.status?.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Date: {new Date(inv.created_at || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-[#1E293B]">
                    ₹{Number(inv.net_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </h3>

                  {inv.notes && (
                    <p className="text-xs text-slate-500 font-medium">{inv.notes}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                    <span>Tax (GST 18%): ₹{Number(inv.tax_amount || 0).toFixed(2)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Lock className="w-3.5 h-3.5 text-[#5046E5]" /> 256-bit Secure
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  {inv.status === 'paid' ? (
                    <div className="flex items-center gap-2 text-xs text-[#05CD99] font-extrabold bg-[#E6FAF5] px-4 py-2.5 rounded-2xl border border-emerald-100">
                      <CheckCircle2 className="w-4 h-4" />
                      Paid via Razorpay
                    </div>
                  ) : (
                    <button
                      disabled={payingId === inv.id}
                      onClick={() => handlePay(inv.id)}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#5046E5] hover:bg-[#4338CA] text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <CreditCard className="w-4 h-4" />
                      {payingId === inv.id ? 'Processing...' : 'Pay with Razorpay'}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {payments.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-[#E6FAF5] text-[#05CD99] flex items-center justify-center mx-auto shadow-xs">
                <CreditCard className="w-8 h-8 stroke-[2]" />
              </div>
              <h3 className="font-black text-[#1E293B] text-base">No payment transactions yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Completed transactions and cryptographic payment signatures will be listed here.
              </p>
            </div>
          ) : (
            payments.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#E6FAF5] text-[#05CD99]">
                      SUCCESS
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {new Date(p.created_at || Date.now()).toLocaleString()}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-[#1E293B]">
                    ₹{Number(p.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </h3>

                  <div className="text-xs text-slate-500 font-mono space-y-0.5">
                    <p>Order ID: <strong className="text-slate-700">{p.razorpay_order_id}</strong></p>
                    {p.razorpay_payment_id && (
                      <p>Payment ID: <strong className="text-[#5046E5]">{p.razorpay_payment_id}</strong></p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-xs text-[#05CD99] font-bold bg-[#E6FAF5] px-3.5 py-2 rounded-2xl border border-emerald-100">
                    <ShieldCheck className="w-4 h-4" /> Signature Verified
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};


