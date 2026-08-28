import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useUiStore } from '../../store/uiStore';
import { Building2, Plus } from 'lucide-react';

export const DepartmentManager = () => {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useUiStore();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name || !code) return;

    setLoading(true);
    try {
      await api.post(`/departments?name=${encodeURIComponent(name)}&code=${encodeURIComponent(code)}&description=${encodeURIComponent(description)}`);
      addToast({ type: 'success', title: 'Department Created' });
      setName('');
      setCode('');
      setDescription('');
      fetchDepartments();
    } catch (err) {
      addToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Department Management</h1>
        <p className="text-sm text-slate-400">Configure medical departments and specialty codes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Add Department" className="lg:col-span-1">
          <form onSubmit={handleCreate} className="space-y-4">
            <Input label="Department Name" placeholder="e.g. Cardiology" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Department Code" placeholder="e.g. CARD" value={code} onChange={(e) => setCode(e.target.value)} required />
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Description</label>
              <textarea className="input text-xs" placeholder="Brief description..." value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <Button type="submit" variant="primary" loading={loading} className="w-full flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              Create Department
            </Button>
          </form>
        </Card>

        <Card title="Existing Departments" className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {departments.map((dept) => (
              <div key={dept.id} className="p-4 rounded-xl bg-surface border border-surface-border/40 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-100">{dept.name}</h4>
                  <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary-light font-mono font-bold">{dept.code}</span>
                </div>
                <p className="text-xs text-slate-400">{dept.description || 'No description'}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
