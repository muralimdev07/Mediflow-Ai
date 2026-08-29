import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ToastContainer } from '../ui/ToastContainer';

export const AppShell = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto w-full bg-[#F8FAFC]">
          {children}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};
