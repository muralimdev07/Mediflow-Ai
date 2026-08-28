export const API_BASE_URL = 'http://localhost:8000/api/v1';
export const WS_BASE_URL = 'ws://localhost:8000/ws';

export const ROLES = {
  PATIENT: 'patient',
  NURSE: 'nurse',
  DOCTOR: 'doctor',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
};

export const TRIAGE_LEVELS = {
  P1: { label: 'P1 - Resuscitation', color: 'badge-p1', bg: 'bg-triage-p1', text: 'text-triage-p1' },
  P2: { label: 'P2 - Emergency', color: 'badge-p2', bg: 'bg-triage-p2', text: 'text-triage-p2' },
  P3: { label: 'P3 - Urgent', color: 'badge-p3', bg: 'bg-triage-p3', text: 'text-triage-p3' },
  P4: { label: 'P4 - Semi-Urgent', color: 'badge-p4', bg: 'bg-triage-p4', text: 'text-triage-p4' },
  P5: { label: 'P5 - Non-Urgent', color: 'badge-p5', bg: 'bg-triage-p5', text: 'text-triage-p5' },
};

export const QUEUE_STATUS = {
  WAITING: 'waiting',
  CALLED: 'called',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  SKIPPED: 'skipped',
};
