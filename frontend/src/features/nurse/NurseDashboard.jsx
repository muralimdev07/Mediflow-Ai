import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Input';
import { useUiStore } from '../../store/uiStore';
import { Activity, Sparkles, Check } from 'lucide-react';

export const NurseDashboard = () => {
  const [queue, setQueue] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [triageLevel, setTriageLevel] = useState('P3');
  const [painScale, setPainScale] = useState(5);
  const [nurseNotes, setNurseNotes] = useState('');
  const [temp, setTemp] = useState(98.6);
  const [hr, setHr] = useState(72);
  const [bpSys, setBpSys] = useState(120);
  const [bpDia, setBpDia] = useState(80);
  const [spO2, setSpO2] = useState(98);
  const [loading, setLoading] = useState(false);
  const { addToast } = useUiStore();

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const res = await api.get('/queue');
      setQueue(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelect = async (item) => {
    setSelectedItem(item);
    try {
      const aiRes = await api.get(`/triage/${item.visit_id}/ai`);
      setAiSuggestion(aiRes.data);
      setTriageLevel(aiRes.data.predicted_level);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriageSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    setLoading(true);

    try {
      await api.post(`/triage/${selectedItem.visit_id}`, {
        triage_level: triageLevel,
        pain_scale: parseInt(painScale),
        nurse_notes: nurseNotes,
        vitals: {
          temperature: parseFloat(temp),
          heart_rate: parseInt(hr),
          blood_pressure_systolic: parseInt(bpSys),
          blood_pressure_diastolic: parseInt(bpDia),
          oxygen_saturation: parseFloat(spO2),
        },
      });

      addToast({ type: 'success', title: 'Triage Submitted', message: `Priority set to ${triageLevel}` });
      setSelectedItem(null);
      setAiSuggestion(null);
      fetchQueue();
    } catch (err) {
      addToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Nurse Triage Station</h1>
        <p className="text-sm text-slate-400">Assess patient vitals, review AI triage predictions, and set priority scores</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Queue List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-200">Patients to Triage ({queue.length})</h2>
          {queue.map((item) => (
            <Card
              key={item.id}
              onClick={() => handleSelect(item)}
              className={`cursor-pointer transition-all ${
                selectedItem?.id === item.id ? 'border-primary shadow-lg ring-1 ring-primary' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Badge variant={item.triage_level}>{item.triage_level}</Badge>
                <span className="text-xs text-slate-400">Pos #{item.queue_position}</span>
              </div>
              <h4 className="font-bold text-slate-100">{item.patient_name || 'Patient'}</h4>
              <p className="text-xs text-slate-300 mt-1">{item.chief_complaint}</p>
            </Card>
          ))}
        </div>

        {/* Triage Workspace */}
        <div className="lg:col-span-2">
          {selectedItem ? (
            <Card title={`Triage Assessment: ${selectedItem.patient_name}`} subtitle={`Chief Complaint: ${selectedItem.chief_complaint}`}>
              <form onSubmit={handleTriageSubmit} className="space-y-6">
                {/* AI Suggestion Box */}
                {aiSuggestion && (
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary-light" />
                        <span className="text-xs font-bold text-primary-light uppercase">AI Suggested Level</span>
                        <Badge variant={aiSuggestion.predicted_level}>{aiSuggestion.predicted_level}</Badge>
                        <span className="text-xs text-slate-400">({(aiSuggestion.confidence_score * 100).toFixed(0)}% confidence)</span>
                      </div>
                      <p className="text-xs text-slate-300">{aiSuggestion.recommendation}</p>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setTriageLevel(aiSuggestion.predicted_level)}
                    >
                      Use AI Suggestion
                    </Button>
                  </div>
                )}

                {/* Vitals Form */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-slate-400">Temp (°F)</label>
                    <input className="input text-xs" type="number" step="0.1" value={temp} onChange={(e) => setTemp(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Heart Rate (bpm)</label>
                    <input className="input text-xs" type="number" value={hr} onChange={(e) => setHr(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">BP (Systolic)</label>
                    <input className="input text-xs" type="number" value={bpSys} onChange={(e) => setBpSys(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">SpO2 (%)</label>
                    <input className="input text-xs" type="number" value={spO2} onChange={(e) => setSpO2(e.target.value)} />
                  </div>
                </div>

                {/* Triage Level Selector */}
                <Select
                  label="Final Assigned Triage Level"
                  value={triageLevel}
                  onChange={(e) => setTriageLevel(e.target.value)}
                  options={[
                    { value: 'P1', label: 'P1 - Resuscitation (Immediate)' },
                    { value: 'P2', label: 'P2 - Emergency (< 10 mins)' },
                    { value: 'P3', label: 'P3 - Urgent (< 30 mins)' },
                    { value: 'P4', label: 'P4 - Semi-Urgent (< 60 mins)' },
                    { value: 'P5', label: 'P5 - Non-Urgent (< 120 mins)' },
                  ]}
                />

                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Nurse Clinical Notes</label>
                  <textarea
                    className="input min-h-[80px]"
                    placeholder="Observations, pain description..."
                    value={nurseNotes}
                    onChange={(e) => setNurseNotes(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => setSelectedItem(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" loading={loading} className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Confirm & Update Priority
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            <Card className="h-full flex flex-col items-center justify-center p-12 text-center text-slate-400">
              <Activity className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm font-medium">Select a patient from the left to start triage assessment</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
