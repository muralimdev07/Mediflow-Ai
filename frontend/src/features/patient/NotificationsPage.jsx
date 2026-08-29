import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Clock, AlertCircle, Calendar, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import { useWebSocket } from '../../hooks/useWebSocket';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/patient/notifications');
      const list = res?.data?.data || res?.data || [];
      setNotifications(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useWebSocket([], (event) => {
    if (['queue:update', 'queue:called', 'queue:status_change', 'payment:success', 'appointment:booked'].includes(event)) {
      fetchNotifications();
    }
  });

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type) => {
    switch (type) {
      case 'queue':
        return <Clock className="w-5 h-5 text-[#D97706]" />;
      case 'payment':
        return <CheckCircle2 className="w-5 h-5 text-[#05CD99]" />;
      case 'appointment':
        return <Calendar className="w-5 h-5 text-[#5046E5]" />;
      default:
        return <AlertCircle className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-12 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E293B] tracking-tight flex items-center gap-3">
            Notifications
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#EEF2FF] text-[#5046E5]">
                {unreadCount} New
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-400 font-medium">Live updates on appointment bookings, queue tokens, and bills</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchNotifications}
            title="Refresh Notifications"
            className="p-2.5 rounded-2xl border border-slate-200/80 text-slate-500 hover:text-slate-800 bg-white shadow-xs transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3.5">
        {loading ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-3">
            <span className="w-5 h-5 border-2 border-slate-300 border-t-[#5046E5] rounded-full animate-spin" />
            <p className="text-xs font-bold text-slate-500">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-[#EEF2FF] text-[#5046E5] flex items-center justify-center mx-auto shadow-xs">
              <Bell className="w-8 h-8 stroke-[2]" />
            </div>
            <p className="font-extrabold text-[#1E293B] text-sm">No notifications right now</p>
            <p className="text-xs text-slate-400 font-medium">You're all caught up on hospital bookings, queue alerts, and receipts.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-5 rounded-3xl border transition-all ${
                !notif.read
                  ? 'border-indigo-100 bg-white shadow-[0_4px_16px_rgba(80,70,229,0.06)] border-l-4 border-l-[#5046E5]'
                  : 'border-slate-100 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.02)]'
              }`}
            >
              <div className="flex gap-4 items-start">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    !notif.read ? 'bg-[#EEF2FF]' : 'bg-[#F8FAFC]'
                  }`}
                >
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className={`text-sm ${!notif.read ? 'font-black text-[#1E293B]' : 'font-bold text-slate-700'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">{notif.time}</span>
                  </div>
                  <p className={`text-xs mt-1 leading-relaxed ${!notif.read ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                    {notif.message}
                  </p>

                  {!notif.read && (
                    <div className="mt-2.5">
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="text-[11px] font-black text-[#5046E5] hover:text-[#4338CA] transition-colors cursor-pointer"
                      >
                        Mark as read
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

