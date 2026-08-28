import React from 'react';
import { TRIAGE_LEVELS } from '../../utils/constants';

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-surface-border/40 text-slate-300 border border-surface-border/50',
    primary: 'bg-primary/20 text-primary-light border border-primary/30',
    success: 'bg-green-500/20 text-green-400 border border-green-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/30',
    p1: TRIAGE_LEVELS.P1.color,
    p2: TRIAGE_LEVELS.P2.color,
    p3: TRIAGE_LEVELS.P3.color,
    p4: TRIAGE_LEVELS.P4.color,
    p5: TRIAGE_LEVELS.P5.color,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
        variants[variant.toLowerCase()] || variants.default
      } ${className}`}
    >
      {children}
    </span>
  );
};
