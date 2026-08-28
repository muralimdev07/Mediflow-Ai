import React from 'react';

export const Card = ({ children, className = '', title, subtitle, action, onClick }) => {
  return (
    <div className={`glass-card p-6 ${onClick ? 'cursor-pointer hover:border-primary/40 transition-all' : ''} ${className}`} onClick={onClick}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-surface-border/30">
          <div>
            {title && <h3 className="text-lg font-semibold text-slate-100">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
