import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute, RoleGuard } from './components/auth/RouteGuards';
import { LandingPage } from './features/landing/LandingPage';
import { LoginPage } from './features/auth/LoginPage';
import { PatientDashboard } from './features/patient/PatientDashboard';
import { SymptomForm } from './features/patient/SymptomForm';
import { DoctorDashboard } from './features/doctor/DoctorDashboard';
import { NurseDashboard } from './features/nurse/NurseDashboard';
import { AdminDashboard } from './features/admin/AdminDashboard';
import { UserManagement } from './features/admin/UserManagement';
import { DepartmentManager } from './features/admin/DepartmentManager';
import { RoomManager } from './features/admin/RoomManager';
import { InviteStaff } from './features/admin/InviteStaff';
import { BillingManagement } from './features/admin/BillingManagement';
import { PaymentPage } from './features/payment/PaymentPage';
import { useAuthStore } from './store/authStore';
import { ROLES } from './utils/constants';

const DashboardRedirect = () => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <AppShell>
      {user.role === ROLES.PATIENT && <PatientDashboard />}
      {user.role === ROLES.DOCTOR && <DoctorDashboard />}
      {user.role === ROLES.NURSE && <NurseDashboard />}
      {(user.role === ROLES.ADMIN || user.role === ROLES.SUPER_ADMIN) && <AdminDashboard />}
    </AppShell>
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/navbar',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardRedirect />,
      },
      {
        path: '/symptoms',
        element: (
          <AppShell>
            <SymptomForm />
          </AppShell>
        ),
      },
      {
        path: '/history',
        element: (
          <AppShell>
            <PatientDashboard />
          </AppShell>
        ),
      },
      {
        path: '/payments',
        element: (
          <AppShell>
            <PaymentPage />
          </AppShell>
        ),
      },
      {
        path: '/users',
        element: (
          <AppShell>
            <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
              <UserManagement />
            </RoleGuard>
          </AppShell>
        ),
      },
      {
        path: '/departments',
        element: (
          <AppShell>
            <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
              <DepartmentManager />
            </RoleGuard>
          </AppShell>
        ),
      },
      {
        path: '/rooms',
        element: (
          <AppShell>
            <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
              <RoomManager />
            </RoleGuard>
          </AppShell>
        ),
      },
      {
        path: '/invite',
        element: (
          <AppShell>
            <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
              <InviteStaff />
            </RoleGuard>
          </AppShell>
        ),
      },
      {
        path: '/billing',
        element: (
          <AppShell>
            <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
              <BillingManagement />
            </RoleGuard>
          </AppShell>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
