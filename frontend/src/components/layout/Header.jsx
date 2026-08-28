import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { Avatar } from '../ui/Avatar';
import { Menu, LogOut, HeartPulse } from 'lucide-react';

export const Header = () => {
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useUiStore();

  return (
    <header className="h-16 bg-surface-card border-b border-surface-border/30 px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-surface-hover transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/20 text-primary-light border border-primary/30">
            <HeartPulse className="w-6 h-6" />
          </div>
          <span className="text-xl font-black gradient-text tracking-tight">MediFlow AI</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 pl-4 border-l border-surface-border/40">
          <Avatar name={user?.full_name} src={user?.avatar_url} size="sm" />
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-200">{user?.full_name}</p>
            <p className="text-[10px] text-slate-400 capitalize">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors ml-2"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
