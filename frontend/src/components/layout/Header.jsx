import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { Search, Bell, ChevronDown, User, LogOut } from 'lucide-react';
import api from '../../services/api';

export const Header = () => {
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useUiStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user?.role === 'patient') {
      api.get('/patient/notifications')
        .then((res) => {
          const list = res?.data?.data || res?.data || [];
          setUnreadCount(list.filter((n) => !n.read).length);
        })
        .catch(() => {});
    }
  }, [user]);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-[#F8FAFC] px-6 sm:px-8 flex items-center justify-between sticky top-0 z-40 select-none">
      {/* Search Bar matching Reference Image */}
      <div className="flex-1 max-w-xl">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            placeholder="Search doctors, symptoms, appointments..."
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-full text-xs text-slate-800 placeholder-slate-400 border border-slate-200/80 focus:border-[#5046E5] focus:outline-none shadow-[0_2px_6px_rgba(0,0,0,0.02)] transition-all"
          />
        </div>
      </div>

      {/* Right Controls: Notification & User Pill */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button
          onClick={() => navigate('/notifications')}
          className="w-9 h-9 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 hover:text-[#5046E5] relative shadow-sm cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#5046E5] text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Pill Matching Reference Image */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-full bg-white border border-slate-200/80 hover:border-slate-300 shadow-sm cursor-pointer transition-all"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
              ) : (
                user?.full_name?.charAt(0) || 'U'
              )}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-[#1E293B] leading-none">{user?.full_name || 'Sakthi Sundar'}</p>
              <p className="text-[10px] text-slate-400 font-medium capitalize mt-0.5">{user?.role || 'Patient'}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl p-1.5 z-50 animate-fade-in">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/profile');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-600 hover:text-[#5046E5] hover:bg-slate-50 rounded-xl transition-colors text-left"
              >
                <User className="w-4 h-4" /> My Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
