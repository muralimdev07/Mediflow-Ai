import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Calendar as CalendarIcon, Stethoscope, RefreshCw, CheckCircle2, Clock, MapPin, Award, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BookingWizard } from './BookingWizard';
import api from '../../services/api';

export const FindDoctorPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); // 'all' | 'available'
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [docRes, deptRes] = await Promise.all([
        api.get('/doctors').catch(() => ({ data: [] })),
        api.get('/departments').catch(() => ({ data: [] })),
      ]);
      setDoctors(docRes?.data?.data || docRes?.data || []);
      setDepartments(deptRes?.data?.data || deptRes?.data || []);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBookDoctor = (doc) => {
    setSelectedDoctor(doc);
    setShowWizard(true);
  };

  const filteredDoctors = doctors.filter((doc) => {
    const matchesDept =
      departmentFilter === 'All' ||
      doc.department === departmentFilter ||
      (doc.all_departments && doc.all_departments.includes(departmentFilter));
    const matchesSearch =
      doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAvailability =
      availabilityFilter === 'all' || (availabilityFilter === 'available' && doc.is_available);
    return matchesDept && matchesSearch && matchesAvailability;
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-16 font-sans">
      <BookingWizard
        isOpen={showWizard}
        initialDoctor={selectedDoctor}
        onClose={() => {
          setShowWizard(false);
          setSelectedDoctor(null);
        }}
        onSuccess={() => {
          setShowWizard(false);
          setSelectedDoctor(null);
          navigate('/appointments');
        }}
      />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E293B] tracking-tight flex items-center gap-3">
            Find Doctors & Specialists
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Search verified hospital consultants, check availability, and book appointments instantly
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            title="Refresh Doctor Directory"
            className="p-2.5 rounded-2xl border border-slate-200/80 text-slate-500 hover:text-slate-800 bg-white shadow-xs transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/symptoms')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#5046E5] hover:bg-[#4338CA] text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Stethoscope className="w-4 h-4" />
            AI Symptom Check
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          {/* Search Input */}
          <div className="relative md:col-span-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by doctor name, specialty, or department..."
              className="w-full bg-[#F8FAFC] border border-slate-200/80 rounded-2xl pl-11 pr-4 py-2.5 text-xs sm:text-sm text-[#1E293B] placeholder-slate-400 focus:outline-none focus:border-[#5046E5] focus:bg-white transition-all shadow-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Department Select */}
          <div className="relative md:col-span-3">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <select
              className="w-full bg-[#F8FAFC] border border-slate-200/80 rounded-2xl pl-11 pr-8 py-2.5 text-xs sm:text-sm font-semibold text-[#1E293B] focus:outline-none focus:border-[#5046E5] focus:bg-white appearance-none cursor-pointer transition-all shadow-xs"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="All">All Departments</option>
              {departments.map((d) => (
                <option key={d.id || d.name} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Select */}
          <div className="relative md:col-span-3">
            <select
              className="w-full bg-[#F8FAFC] border border-slate-200/80 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#1E293B] focus:outline-none focus:border-[#5046E5] focus:bg-white appearance-none cursor-pointer transition-all shadow-xs"
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
            >
              <option value="all">All Availabilities</option>
              <option value="available">Available Today Only</option>
            </select>
          </div>
        </div>

        {/* Department Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs pt-1 no-scrollbar">
          <button
            onClick={() => setDepartmentFilter('All')}
            className={`px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer shrink-0 ${
              departmentFilter === 'All'
                ? 'bg-[#5046E5] text-white shadow-xs'
                : 'bg-[#F1F5F9] text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            All ({doctors.length})
          </button>
          {departments.map((dept) => {
            const count = doctors.filter((d) => d.department === dept.name || d.all_departments?.includes(dept.name)).length;
            return (
              <button
                key={dept.id || dept.name}
                onClick={() => setDepartmentFilter(dept.name)}
                className={`px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer shrink-0 ${
                  departmentFilter === dept.name
                    ? 'bg-[#5046E5] text-white shadow-xs'
                    : 'bg-[#F1F5F9] text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {dept.name} {count > 0 ? `(${count})` : ''}
              </button>
            );
          })}
        </div>
      </div>

      {/* Doctor Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-3">
          <span className="w-6 h-6 border-2 border-slate-300 border-t-[#5046E5] rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500">Loading verified doctors...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <div
              key={doctor.id || doctor.profile_id}
              className="bg-white rounded-3xl p-6 border border-slate-100/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Doctor Avatar & Top Info */}
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center text-base font-extrabold text-[#5046E5]">
                      {doctor.avatar_url ? (
                        <img src={doctor.avatar_url} alt={doctor.name} className="w-full h-full object-cover" />
                      ) : (
                        doctor.name?.charAt(0) || 'D'
                      )}
                    </div>
                    {doctor.is_available && (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#05CD99] border-2 border-white rounded-full" title="Available" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="font-extrabold text-sm sm:text-base text-[#1E293B] truncate leading-tight group-hover:text-[#5046E5] transition-colors">
                        {doctor.name}
                      </h3>
                      <div className="flex items-center gap-1 bg-[#FFFBEB] text-[#D97706] px-2 py-0.5 rounded-full text-xs font-extrabold shrink-0">
                        <Star className="w-3 h-3 fill-current text-[#F59E0B]" />
                        <span>{doctor.rating || 4.8}</span>
                      </div>
                    </div>

                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-[#EEF2FF] text-[#5046E5] uppercase tracking-wide">
                      {doctor.department}
                    </span>
                    <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-1">
                      {doctor.specialization || `${doctor.department} Specialist`}
                    </p>
                  </div>
                </div>

                {/* Info Pills & Stats */}
                <div className="mt-5 grid grid-cols-2 gap-2.5 bg-[#F8FAFC] p-3 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">Experience</span>
                    <span className="text-xs font-black text-[#1E293B] block mt-0.5">
                      {doctor.experience || `${doctor.experience_years || 8} Years`}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">Consultation Fee</span>
                    <span className="text-xs font-black text-[#05CD99] block mt-0.5">
                      {doctor.fee || `₹${doctor.consultation_fee || 500}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Availability Status & CTA */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                {doctor.is_available ? (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#05CD99] bg-[#E6FAF5] px-2.5 py-1 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-[#05CD99] animate-pulse" />
                    Available Today
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                    <Clock className="w-3 h-3 text-slate-400" /> Tomorrow
                  </span>
                )}

                <button
                  onClick={() => handleBookDoctor(doctor)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#5046E5] hover:bg-[#4338CA] text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                >
                  <CalendarIcon className="w-3.5 h-3.5" /> Book Now
                </button>
              </div>
            </div>
          ))}

          {filteredDoctors.length === 0 && (
            <div className="col-span-full py-16 bg-white rounded-3xl border border-slate-100 text-center text-slate-400">
              <Stethoscope className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-bold text-slate-600 text-sm">No doctors found matching your criteria</p>
              <p className="text-xs text-slate-400 mt-1">Try resetting filters or searching with another term</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


