import React, { useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './router';
import { Navbar } from './components/Navbar/Navbar';
import LandingPage from './components/LandingPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function App() {
  const [view, setView] = useState('landing'); // 'landing' | 'app'

  if (view === 'landing') {
    return (
      <div>
        {/* Navbar with Get Started action leading to Auth */}
        <Navbar onNavigate={(item) => console.log(item)} />
        <LandingPage onGetStarted={() => setView('app')} />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;