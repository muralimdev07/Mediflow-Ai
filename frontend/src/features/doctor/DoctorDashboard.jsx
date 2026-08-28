import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useUiStore } from '../../store/uiStore';
import { Clock, UserCheck, Stethoscope, Play, CheckCircle2 } from 'lucide-react';

export const DoctorDashboard = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeConsultation, setActiveConsultation] = useState(null);
  const { addToast } = useUiStore();

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await api.get('/queue');
      setQueue(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartConsultation = async (visitId) => {
    try {
      const res = await api.post('/consultations', { visit_id: visitId });
      setActiveConsultation(res.data);
      addToast({ type: 'success', title: 'Consultation Started', message: 'Patient in workspace' });
      fetchQueue();
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Doctor Queue & Consultation Workspace</h1>
          <p className="text-sm text-slate-400">View triaged patients, start consultations, write prescriptions</p>
        </div>
        <Button variant="secondary" onClick={fetchQueue} size="sm">
          Refresh Queue
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Queue Column */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-light" />
            Waiting Patients ({queue.length})
          </h2>

          {queue.length === 0 ? (
            <Card className="text-center py-8 text-slate-400 text-sm">No patients waiting in queue</Card>
          ) : (
            queue.map((item) => (
              <Card
                key={item.id}
                className="hover:border-primary/50 transition-all border-l-4 border-l-primary-light"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={item.triage_level}>{item.triage_level}</Badge>
                      <span className="text-xs font-semibold text-slate-400">Pos #{item.queue_position}</span>
                    </div>
                    <h4 className="font-bold text-slate-100">{item.patient_name || 'Patient'}</h4>
                    <p className="text-xs text-slate-300 mt-1">{item.chief_complaint}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-surface-border/30 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Room: {item.room_number || 'Unassigned'}</span>
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => handleStartConsultation(item.visit_id)}
                  >
                    <Play className="w-3.5 h-3.5" />
                    Start
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Workspace Column */}
        <div className="lg:col-span-2">
          {activeConsultation ? (
            <ConsultationWorkspace consultation={activeConsultation} onComplete={() => { setActiveConsultation(null); fetchQueue(); }} />
          ) : (
            <Card className="h-full flex flex-col items-center justify-center p-12 text-center">
              <div className="p-4 rounded-full bg-surface-hover text-slate-400 mb-3">
                <Stethoscope className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-slate-200">No Active Consultation</h3>
              <p className="text-sm text-slate-400 max-w-sm mt-1">
                Select a patient from the queue on the left and click "Start" to open their consultation workspace.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

const ConsultationWorkspace = ({ consultation, onComplete }) => {
  const [diagnosis, setDiagnosis] = useState(consultation.diagnosis || '');
  const [clinicalNotes, setClinicalNotes] = useState(consultation.clinical_notes || '');
  const [treatmentPlan, setTreatmentPlan] = useState(consultation.treatment_plan || '');
  const [medication, setMedication] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [prescriptions, setPrescriptions] = useState(consultation.prescriptions || []);
  const [loading, setLoading] = useState(false);
  const { addToast } = useUiStore();

  const handleAddPrescription = async (e) => {
    e.preventDefault();
    if (!medication || !dosage || !frequency) return;
    try {
      const res = await api.post(`/consultations/${consultation.id}/prescriptions`, {
        medication_name: medication,
        dosage,
        frequency,
      });
      setPrescriptions([...prescriptions, res.data]);
      setMedication('');
      setDosage('');
      setFrequency('');
      addToast({ type: 'success', title: 'Prescription Added' });
    } catch (err) {
      addToast({ type: 'error', message: err.message });
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await api.patch(`/consultations/${consultation.id}`, {
        diagnosis,
        clinical_notes: clinicalNotes,
        treatment_plan: treatmentPlan,
      });
      await api.post(`/consultations/${consultation.id}/complete`);
      addToast({ type: 'success', title: 'Consultation Complete', message: 'Invoice generated & patient discharged.' });
      onComplete();
    } catch (err) {
      addToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Clinical Workspace" subtitle={`Consultation ID: ${consultation.id.slice(0, 8)}`}>
      <div className="space-y-6">
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Diagnosis</label>
          <textarea
            className="input min-h-[70px]"
            placeholder="Primary diagnosis details..."
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Clinical Notes</label>
          <textarea
            className="input min-h-[90px]"
            placeholder="Observations, examination notes..."
            value={clinicalNotes}
            onChange={(e) => setClinicalNotes(e.target.value)}
          />
        </div>

        {/* Prescription Form */}
        <div className="p-4 rounded-xl bg-surface/50 border border-surface-border/40 space-y-4">
          <h4 className="text-sm font-bold text-slate-200">Add Prescriptions</h4>
          <div className="grid grid-cols-3 gap-2">
            <input
              className="input text-xs"
              placeholder="Medication"
              value={medication}
              onChange={(e) => setMedication(e.target.value)}
            />
            <input
              className="input text-xs"
              placeholder="Dosage (e.g. 500mg)"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
            />
            <input
              className="input text-xs"
              placeholder="Frequency (e.g. 1-0-1)"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            />
          </div>
          <Button variant="secondary" size="sm" onClick={handleAddPrescription}>
            + Add Medication
          </Button>

          {prescriptions.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {prescriptions.map((p, idx) => (
                <div key={idx} className="text-xs p-2 rounded bg-surface-hover flex justify-between">
                  <span className="font-semibold text-slate-200">{p.medication_name}</span>
                  <span className="text-slate-400">{p.dosage} — {p.frequency}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-surface-border/30">
          <Button variant="primary" loading={loading} onClick={handleComplete} className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Complete Consultation & Invoice
          </Button>
        </div>
      </div>
    </Card>
  );
};
