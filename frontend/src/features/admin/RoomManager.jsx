import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { useUiStore } from '../../store/uiStore';
import { DoorOpen, Plus } from 'lucide-react';

export const RoomManager = () => {
  const [rooms, setRooms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [departmentId, setDepartmentId] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [roomType, setRoomType] = useState('consultation');
  const [loading, setLoading] = useState(false);
  const { addToast } = useUiStore();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [roomRes, deptRes] = await Promise.all([api.get('/rooms'), api.get('/departments')]);
      setRooms(roomRes.data);
      setDepartments(deptRes.data);
      if (deptRes.data.length > 0) setDepartmentId(deptRes.data[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!roomNumber || !departmentId) return;

    setLoading(true);
    try {
      await api.post(`/rooms?department_id=${departmentId}&room_number=${encodeURIComponent(roomNumber)}&room_type=${roomType}`);
      addToast({ type: 'success', title: 'Room Created' });
      setRoomNumber('');
      fetchData();
    } catch (err) {
      addToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Room Management</h1>
        <p className="text-sm text-slate-400">Manage consultation and emergency room assignments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Add Room" className="lg:col-span-1">
          <form onSubmit={handleCreate} className="space-y-4">
            <Select
              label="Department"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              options={departments.map((d) => ({ value: d.id, label: d.name }))}
            />
            <Input label="Room Number" placeholder="e.g. C-101" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} required />
            <Select
              label="Room Type"
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              options={[
                { value: 'consultation', label: 'Consultation Room' },
                { value: 'emergency', label: 'Emergency Bay' },
                { value: 'examination', label: 'Examination Room' },
              ]}
            />
            <Button type="submit" variant="primary" loading={loading} className="w-full flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              Add Room
            </Button>
          </form>
        </Card>

        <Card title="Room Directory" className="lg:col-span-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {rooms.map((room) => (
              <div key={room.id} className="p-3 rounded-xl bg-surface border border-surface-border/40 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-100">{room.room_number}</h4>
                  <p className="text-[10px] text-slate-400 capitalize">{room.room_type}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-semibold capitalize ${
                  room.status === 'available' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {room.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
