import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';
import { Calendar, Clock, FileText, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BookingWizard } from './BookingWizard';

export const AppointmentsPage = () => {
  const [activeVisit, setActiveVisit] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const [activeRes, historyRes] = await Promise.all([
        api.get('/visits/me/active').catch(() => ({ data: null })),
        api.get('/visits/me/history').catch(() => ({ data: [] }))
      ]);
      setActiveVisit(activeRes?.data?.data || activeRes?.data || null);
      setHistory(historyRes?.data?.data || historyRes?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return <Badge variant="success">COMPLETED</Badge>;
      case 'cancelled': return <Badge variant="danger">CANCELLED</Badge>;
      case 'discharged': return <Badge variant="success">DISCHARGED</Badge>;
      case 'booking_confirmed': return <Badge variant="primary">CONFIRMED</Badge>;
      case 'booking_initiated': return <Badge variant="warning">PENDING</Badge>;
      default: return <Badge variant="standard">{status?.toUpperCase() || 'UNKNOWN'}</Badge>;
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading appointments...</div>;
  }

  const completedVisits = history.filter(v => ['completed', 'discharged'].includes(v.status?.toLowerCase()));
  const cancelledVisits = history.filter(v => v.status?.toLowerCase() === 'cancelled');

  return (
    <div className="space-y-8 animate-fade-in">
      <BookingWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onSuccess={() => { setShowWizard(false); fetchAppointments(); }}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Appointments & Visits</h1>
          <p className="text-sm text-slate-400">Manage your upcoming check-ins and view past visits</p>
        </div>
        <Button
          id="open-booking-wizard-btn"
          variant="primary"
          className="flex items-center gap-2"
          onClick={() => setShowWizard(true)}
        >
          <PlusCircle className="w-4 h-4" /> Book Appointment
        </Button>
      </div>

      <section>
        <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary-light" /> Upcoming & Active
        </h2>
        {activeVisit ? (
          <Card className="border-l-4 border-l-primary-light bg-gradient-to-r from-surface-card to-primary/10">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="primary">ACTIVE</Badge>
                  {activeVisit.booking_reference && (
                    <span className="font-mono text-xs text-primary-light font-bold">{activeVisit.booking_reference}</span>
                  )}
                  <span className="text-xs text-slate-400 font-semibold">
                    {new Date(activeVisit.check_in_time || Date.now()).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-1">
                  Chief Complaint: {activeVisit.chief_complaint}
                </h3>
                <p className="text-sm text-slate-400 mb-1">Status: {activeVisit.status?.toUpperCase()}</p>
                {activeVisit.scheduled_date && (
                  <p className="text-sm text-teal-400">
                    📅 Scheduled: {activeVisit.scheduled_date} at {activeVisit.scheduled_time_slot}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="primary" onClick={() => navigate('/queue')}>View Queue</Button>
                <Button variant="outline">View Details</Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="text-center py-10 border-dashed border-surface-border/50">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-surface-hover">
                <Calendar className="w-10 h-10 text-slate-500" />
              </div>
              <div>
                <p className="text-slate-300 font-semibold mb-1">No upcoming appointments</p>
                <p className="text-sm text-slate-400 mb-4">Book an appointment to get started with AI-powered doctor matching.</p>
              </div>
              <Button
                id="empty-state-book-btn"
                variant="primary"
                className="flex items-center gap-2"
                onClick={() => setShowWizard(true)}
              >
                <PlusCircle className="w-4 h-4" /> Book an Appointment
              </Button>
            </div>
          </Card>
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-teal-400" /> Completed Visits
        </h2>
        {completedVisits.length > 0 ? (
          <div className="space-y-4">
            {completedVisits.map((visit, idx) => (
              <Card key={visit.id || idx}>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      {getStatusBadge(visit.status)}
                      <span className="text-xs text-slate-400 font-semibold">
                        {new Date(visit.check_in_time).toLocaleDateString()}
                      </span>
                      {visit.booking_reference && (
                        <span className="font-mono text-xs text-slate-500">{visit.booking_reference}</span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-100">{visit.chief_complaint || 'Consultation'}</h3>
                  </div>
                  <Button variant="outline" size="sm">Details</Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic">No completed visits found.</p>
        )}
      </section>

      {cancelledVisits.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-slate-100 mb-4 text-red-400/80 flex items-center gap-2">
            <Calendar className="w-5 h-5" /> Cancelled Appointments
          </h2>
          <div className="space-y-4 opacity-70">
            {cancelledVisits.map((visit, idx) => (
              <Card key={visit.id || idx}>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      {getStatusBadge(visit.status)}
                      <span className="text-xs text-slate-400 font-semibold">
                        {new Date(visit.check_in_time).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-100">{visit.chief_complaint || 'Appointment'}</h3>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};


