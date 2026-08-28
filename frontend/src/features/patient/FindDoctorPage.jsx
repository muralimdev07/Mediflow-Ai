import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Search, Filter, Star, Calendar as CalendarIcon, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOCK_DOCTORS = [
  {
    id: 1,
    name: 'Dr. Sarah Jenkins',
    department: 'Cardiology',
    specialization: 'Interventional Cardiologist',
    experience: '12 years',
    fee: '₹1,500',
    rating: 4.9,
    available: true,
    avatar: 'https://i.pravatar.cc/150?u=sarah',
  },
  {
    id: 2,
    name: 'Dr. Rahul Sharma',
    department: 'Orthopedics',
    specialization: 'Joint Replacement',
    experience: '15 years',
    fee: '₹1,200',
    rating: 4.8,
    available: true,
    avatar: 'https://i.pravatar.cc/150?u=rahul',
  },
  {
    id: 3,
    name: 'Dr. Emily Chen',
    department: 'Neurology',
    specialization: 'Cognitive Neurology',
    experience: '8 years',
    fee: '₹1,800',
    rating: 4.7,
    available: false,
    avatar: 'https://i.pravatar.cc/150?u=emily',
  },
  {
    id: 4,
    name: 'Dr. Marcus Johnson',
    department: 'General Medicine',
    specialization: 'Internal Medicine',
    experience: '20 years',
    fee: '₹800',
    rating: 4.9,
    available: true,
    avatar: 'https://i.pravatar.cc/150?u=marcus',
  },
];

export const FindDoctorPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const navigate = useNavigate();

  const filteredDoctors = MOCK_DOCTORS.filter(doc => 
    (departmentFilter === 'All' || doc.department === departmentFilter) &&
    (doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || doc.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Find a Doctor</h1>
          <p className="text-sm text-slate-400">Search for specialists and book your consultation</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/symptoms')} className="flex items-center gap-2 w-full md:w-auto">
          <Stethoscope className="w-4 h-4" />
          AI Triage Match
        </Button>
      </div>

      <Card className="p-2 border border-surface-border/50 bg-surface-card/60">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by doctor name or specialization..." 
              className="w-full bg-surface/50 border border-surface-border/50 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-primary/50 transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative md:w-64">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <select 
              className="w-full bg-surface/50 border border-surface-border/50 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-primary/50 appearance-none cursor-pointer"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="All">All Departments</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Neurology">Neurology</option>
              <option value="General Medicine">General Medicine</option>
            </select>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredDoctors.map(doctor => (
          <Card key={doctor.id} className="hover:scale-[1.01] transition-transform duration-200 border border-surface-border/30 hover:border-primary/40 bg-gradient-to-br from-surface-card to-surface">
            <div className="flex gap-4">
              <Avatar src={doctor.avatar} name={doctor.name} size="lg" className="border-2 border-surface" />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-100">{doctor.name}</h3>
                  <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-1.5 py-0.5 rounded text-xs font-bold">
                    <Star className="w-3 h-3 fill-current" /> {doctor.rating}
                  </div>
                </div>
                <p className="text-xs text-primary-light font-semibold">{doctor.department}</p>
                <p className="text-xs text-slate-400 mt-1 line-clamp-1">{doctor.specialization}</p>
                
                <div className="mt-3 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Experience</span>
                    <span className="text-slate-200 font-medium">{doctor.experience}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Consultation Fee</span>
                    <span className="text-slate-200 font-medium">{doctor.fee}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-5 pt-4 border-t border-surface-border/40 flex items-center justify-between">
              {doctor.available ? (
                <Badge variant="success" className="text-[10px]">AVAILABLE TODAY</Badge>
              ) : (
                <Badge variant="standard" className="text-[10px] text-slate-400">NEXT AVAILABLE: TMRW</Badge>
              )}
              
              <Button 
                variant={doctor.available ? "primary" : "outline"} 
                size="sm" 
                onClick={() => navigate('/symptoms')}
                className="flex items-center gap-2"
              >
                <CalendarIcon className="w-3.5 h-3.5" /> Book
              </Button>
            </div>
          </Card>
        ))}
        
        {filteredDoctors.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400">
            No doctors found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};
