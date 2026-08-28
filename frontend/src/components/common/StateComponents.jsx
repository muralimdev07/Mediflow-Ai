import React from 'react';
import { Inbox, AlertTriangle } from 'lucide-react';
import { Spinner } from '../ui/Spinner';

export const EmptyState = ({ title = 'No data found', description = 'There are no items to display at this time.', action }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center glass-card border-dashed">
    <div className="p-4 rounded-full bg-surface-hover/50 text-slate-400 mb-4">
      <Inbox className="w-8 h-8" />
    </div>
    <h3 className="text-lg font-bold text-slate-200">{title}</h3>
    <p className="text-sm text-slate-400 max-w-sm mt-1 mb-6">{description}</p>
    {action}
  </div>
);

export const ErrorState = ({ title = 'Something went wrong', message = 'Unable to load content.', onRetry }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center glass-card border-red-500/30">
    <div className="p-4 rounded-full bg-red-500/10 text-red-400 mb-4">
      <AlertTriangle className="w-8 h-8" />
    </div>
    <h3 className="text-lg font-bold text-red-400">{title}</h3>
    <p className="text-sm text-slate-300 max-w-sm mt-1 mb-6">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-secondary">
        Try Again
      </button>
    )}
  </div>
);

export const LoadingState = ({ message = 'Loading details...' }) => (
  <div className="flex flex-col items-center justify-center p-12 glass-card">
    <Spinner size="lg" />
    <p className="text-sm font-medium text-slate-400 mt-4">{message}</p>
  </div>
);
