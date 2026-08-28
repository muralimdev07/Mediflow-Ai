import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { ROLES } from '../../utils/constants';
import {
  LayoutDashboard,
  Users,
  Activity,
  Calendar,
  CreditCard,
  Building2,
  DoorOpen,
  UserPlus,
  Stethoscope,
  Clock,
  FileText,
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuthStore();
  const { sidebarOpen } = useUiStore();

  if (!sidebarOpen) return null;

  const role = user?.role;

  const navItemsByRole = {
    [ROLES.PATIENT]: [
      { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
      { to: '/symptoms', label: 'New Check-In', icon: <Stethoscope className="w-5 h-5" /> },
      { to: '/history', label: 'Medical History', icon: <FileText className="w-5 h-5" /> },
      { to: '/payments', label: 'My Payments', icon: <CreditCard className="w-5 h-5" /> },
    ],
    [ROLES.DOCTOR]: [
      { to: '/dashboard', label: 'Patient Queue', icon: <Clock className="w-5 h-5" /> },
      { to: '/consultation', label: 'Workspace', icon: <Activity className="w-5 h-5" /> },
      { to: '/schedule', label: 'Schedule', icon: <Calendar className="w-5 h-5" /> },
    ],
    [ROLES.NURSE]: [
      { to: '/dashboard', label: 'Triage Station', icon: <Activity className="w-5 h-5" /> },
      { to: '/queue', label: 'Hospital Queue', icon: <Clock className="w-5 h-5" /> },
    ],
    [ROLES.ADMIN]: [
      { to: '/dashboard', label: 'Analytics', icon: <LayoutDashboard className="w-5 h-5" /> },
      { to: '/users', label: 'User Management', icon: <Users className="w-5 h-5" /> },
      { to: '/departments', label: 'Departments', icon: <Building2 className="w-5 h-5" /> },
      { to: '/rooms', label: 'Rooms', icon: <DoorOpen className="w-5 h-5" /> },
      { to: '/invite', label: 'Invite Staff', icon: <UserPlus className="w-5 h-5" /> },
      { to: '/billing', label: 'Billing & Payments', icon: <CreditCard className="w-5 h-5" /> },
    ],
    [ROLES.SUPER_ADMIN]: [
      { to: '/dashboard', label: 'Analytics', icon: <LayoutDashboard className="w-5 h-5" /> },
      { to: '/users', label: 'User Management', icon: <Users className="w-5 h-5" /> },
      { to: '/departments', label: 'Departments', icon: <Building2 className="w-5 h-5" /> },
      { to: '/rooms', label: 'Rooms', icon: <DoorOpen className="w-5 h-5" /> },
      { to: '/invite', label: 'Invite Staff', icon: <UserPlus className="w-5 h-5" /> },
      { to: '/billing', label: 'Billing & Payments', icon: <CreditCard className="w-5 h-5" /> },
    ],
  };

  const currentNav = navItemsByRole[role] || navItemsByRole[ROLES.PATIENT];

  return (
    <aside className="w-64 bg-surface-card border-r border-surface-border/30 flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
          Main Navigation
        </div>
        {currentNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => (isActive ? 'sidebar-item-active' : 'sidebar-item')}
          >
            {item.icon}
            <span className="font-medium text-sm">{item.label}</span>
          </NavLink>
        ))}
      </div>
      
      <div className="p-3 bg-surface/50 rounded-xl border border-surface-border/30">
        <p className="text-xs text-slate-400 font-medium">Logged in as</p>
        <p className="text-xs font-bold text-primary-light capitalize">{role || 'User'}</p>
      </div>
    </aside>
  );
};
