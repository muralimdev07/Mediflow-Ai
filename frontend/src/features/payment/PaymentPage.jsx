import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useUiStore } from '../../store/uiStore';
import { CreditCard, CheckCircle2, DollarSign } from 'lucide-react';

export const PaymentPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const { addToast } = useUiStore();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/invoices/me');
      setInvoices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (invoiceId) => {
    setPayingId(invoiceId);
    try {
      // 1. Create Razorpay order
      const orderRes = await api.post('/payments/create-order', { invoice_id: invoiceId });
      const orderData = orderRes.data;

      // Check if Razorpay script is available or run dev mock payment
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
            fetchInvoices();
          },
          prefill: {
            name: orderData.patient_name,
            email: orderData.patient_email,
          },
          theme: {
            color: '#0F766E',
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Dev Mock Verification if script not loaded
        await api.post('/payments/verify', {
          razorpay_order_id: orderData.order_id,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: 'mock_signature',
        });
        addToast({ type: 'success', title: 'Payment Successful (Dev Mode)', message: 'Invoice marked as paid.' });
        fetchInvoices();
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Payment Failed', message: err.message });
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Invoices & Razorpay Payment</h1>
        <p className="text-sm text-slate-400">View consultation bills and pay securely online</p>
      </div>

      <div className="space-y-4">
        {invoices.length === 0 ? (
          <Card className="text-center py-12 text-slate-400">No invoices generated yet</Card>
        ) : (
          invoices.map((inv) => (
            <Card key={inv.id} className="border-l-4 border-l-primary-light">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-primary-light font-bold">{inv.invoice_number}</span>
                    <Badge variant={inv.status === 'paid' ? 'success' : 'warning'}>{inv.status}</Badge>
                  </div>
                  <h3 className="text-xl font-black text-slate-100">₹{inv.net_amount.toFixed(2)}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Date: {new Date(inv.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  {inv.status === 'paid' ? (
                    <div className="flex items-center gap-1.5 text-xs text-green-400 font-bold bg-green-500/10 px-3 py-2 rounded-xl border border-green-500/20">
                      <CheckCircle2 className="w-4 h-4" />
                      Paid Online
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      loading={payingId === inv.id}
                      onClick={() => handlePay(inv.id)}
                      className="flex items-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      Pay with Razorpay
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
