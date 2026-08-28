import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Bell, CheckCircle2, Clock, AlertCircle, Calendar } from 'lucide-react';

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Your turn is approaching',
    message: '2 patients are ahead of you in the General Medicine queue. Please proceed to the waiting area near Room 102.',
    time: '10 minutes ago',
    type: 'queue',
    read: false,
  },
  {
    id: 2,
    title: 'Payment Successful',
    message: 'Your payment of ₹800 for Dr. Marcus Johnson was successful. Receipt generated.',
    time: '2 hours ago',
    type: 'payment',
    read: true,
  },
  {
    id: 3,
    title: 'Appointment Confirmed',
    message: 'Your appointment for Cardiology on Aug 29, 10:00 AM is confirmed.',
    time: '1 day ago',
    type: 'appointment',
    read: true,
  }
];

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type) => {
    switch (type) {
      case 'queue': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'payment': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'appointment': return <Calendar className="w-5 h-5 text-blue-500" />;
      default: return <AlertCircle className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            Notifications 
            {unreadCount > 0 && <Badge variant="primary" className="ml-2">{unreadCount} New</Badge>}
          </h1>
          <p className="text-sm text-slate-400">Updates on your queue, appointments, and payments</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card className="text-center py-12 text-slate-400">No notifications yet.</Card>
        ) : (
          notifications.map((notif) => (
            <Card 
              key={notif.id} 
              className={`transition-colors ${!notif.read ? 'border-l-4 border-l-primary-light bg-primary/5' : ''}`}
            >
              <div className="flex gap-4">
                <div className={`p-3 rounded-full h-fit ${!notif.read ? 'bg-surface' : 'bg-surface-card border border-surface-border/50'}`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`text-sm ${!notif.read ? 'font-bold text-slate-100' : 'font-semibold text-slate-300'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-xs text-slate-500 whitespace-nowrap ml-4">{notif.time}</span>
                  </div>
                  <p className={`text-sm mt-1 ${!notif.read ? 'text-slate-300' : 'text-slate-400'}`}>
                    {notif.message}
                  </p>
                  
                  {!notif.read && (
                    <div className="mt-3">
                      <button 
                        onClick={() => markAsRead(notif.id)}
                        className="text-xs font-semibold text-primary-light hover:text-primary transition-colors"
                      >
                        Mark as read
                      </button>
                    </div>
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
