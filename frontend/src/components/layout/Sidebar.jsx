import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { ROLES } from '../../utils/constants';
import {
  LayoutDashboard,
  Calendar,
  Ticket,
  Search,
  FileText,
  CreditCard,
  FolderOpen,
  BarChart3,
  Bell,
  Clock,
  User,
  Settings,
  Headphones,
  Users,
  Building2,
  DoorOpen,
  UserPlus,
  HeartPulse,
} from 'lucide-react';

export const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const { sidebarOpen } = useUiStore();
  const navigate = useNavigate();

  if (!sidebarOpen) return null;

  const role = user?.role;

  const patientNavItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/appointments', label: 'Appointments', icon: <Calendar className="w-4 h-4" /> },
    { to: '/queue', label: 'My Queue', icon: <Ticket className="w-4 h-4" /> },
    { to: '/find-doctor', label: 'Doctors', icon: <Search className="w-4 h-4" /> },
    { to: '/payments', label: 'Payments', icon: <CreditCard className="w-4 h-4" /> },
    { to: '/history', label: 'Health Records', icon: <FolderOpen className="w-4 h-4" /> },
    { to: '/notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { to: '/history', label: 'Visit History', icon: <Clock className="w-4 h-4" /> },
    { to: '/profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { to: '/profile', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const doctorNavItems = [
    { to: '/doctor/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/doctor/queue', label: 'Current Queue', icon: <Clock className="w-4 h-4" /> },
    { to: '/doctor/appointments', label: 'Appointments', icon: <Calendar className="w-4 h-4" /> },
    { to: '/doctor/patients', label: 'Patients', icon: <Users className="w-4 h-4" /> },
    { to: '/doctor/analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { to: '/doctor/profile', label: 'Doctor Profile', icon: <User className="w-4 h-4" /> },
  ];

  const nurseNavItems = [
    { to: '/nurse/dashboard', label: 'Nursing Station', icon: <HeartPulse className="w-4 h-4 text-[#05CD99]" /> },
    { to: '/nurse/dashboard', label: "Today's Roster", icon: <Calendar className="w-4 h-4" /> },
  ];

  const adminNavItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/users', label: 'User Management', icon: <Users className="w-4 h-4" /> },
    { to: '/departments', label: 'Departments', icon: <Building2 className="w-4 h-4" /> },
    { to: '/rooms', label: 'Rooms', icon: <DoorOpen className="w-4 h-4" /> },
    { to: '/invite', label: 'Invite Staff', icon: <UserPlus className="w-4 h-4" /> },
    { to: '/billing', label: 'Billing & Payments', icon: <CreditCard className="w-4 h-4" /> },
  ];

  const currentNav =
    role === ROLES.DOCTOR
      ? doctorNavItems
      : role === ROLES.NURSE
      ? nurseNavItems
      : role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN
      ? adminNavItems
      : patientNavItems;

  return (
    <aside className="w-60 bg-white border-r border-slate-100/80 flex flex-col justify-between min-h-[calc(100vh-4.5rem)] select-none shrink-0 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div className="p-4 space-y-4">
        {/* Logo Header */}
        <div className="px-3 pt-2 pb-1 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#5046E5] to-[#7C3AED] text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black tracking-tight text-[#1E293B] font-sans flex items-center gap-1">
              MediFlow
            </h2>
            <p className="text-[10px] text-slate-400 font-medium -mt-0.5">Smart Healthcare</p>
          </div>
        </div>

        {/* Navigation Items Matching Reference Image */}
        <nav className="space-y-1 pt-2">
          {currentNav.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#5046E5] text-white shadow-md shadow-indigo-500/20 font-extrabold'
                    : 'text-slate-500 hover:text-[#5046E5] hover:bg-slate-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span className="tracking-wide">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom "Need Help?" Card Matching Reference Image */}
      <div className="p-4 space-y-2">
        <div className="rounded-2xl p-4 bg-[#F8FAFC] border border-slate-100 text-center space-y-2">
          <div className="w-8 h-8 rounded-full bg-blue-50 text-[#5046E5] flex items-center justify-center mx-auto">
            <Headphones className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-[#1E293B]">Need Help?</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">We're here to assist you</p>
          </div>
          <button
            onClick={() => navigate('/contact')}
            className="w-full py-2 px-3 bg-[#5046E5] hover:bg-[#4338CA] text-white text-[11px] font-extrabold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            Contact Support
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
