import React, { useState } from 'react';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { useUiStore } from '../../store/uiStore';
import { UserPlus, Mail } from 'lucide-react';

export const InviteStaff = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('doctor');
  const [loading, setLoading] = useState(false);
  const { addToast } = useUiStore();

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await api.post('/users/invite', { email, role });
      addToast({ type: 'success', title: 'Invitation Sent', message: `Invitation sent to ${email}` });
      setEmail('');
    } catch (err) {
      addToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Invite Hospital Staff</h1>
        <p className="text-sm text-slate-400">Pre-register doctors, nurses, and admins by email</p>
      </div>

      <Card title="Staff Invitation Form" subtitle="Invited users will auto-assign their role when signing in with Google">
        <form onSubmit={handleInvite} className="space-y-4">
          <Input
            label="Staff Email Address"
            type="email"
            placeholder="e.g. dr.smith@mediflow.ai"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Select
            label="Role Designation"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={[
              { value: 'doctor', label: 'Doctor' },
              { value: 'nurse', label: 'Nurse' },
              { value: 'admin', label: 'Admin' },
            ]}
          />

          <div className="pt-2">
            <Button type="submit" variant="primary" loading={loading} className="w-full flex items-center justify-center gap-2">
              <UserPlus className="w-4 h-4" />
              Send Staff Invitation
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
