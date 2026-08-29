import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute, RoleGuard } from './components/auth/RouteGuards';
import { LandingPage } from './features/landing/LandingPage';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { DoctorLoginPage } from './features/doctor/DoctorLoginPage';
import { NurseLoginPage } from './features/nurse/NurseLoginPage';
import { PatientDashboard } from './features/patient/PatientDashboard';
import { QueuePage } from './features/patient/QueuePage';
import { AppointmentsPage } from './features/patient/AppointmentsPage';
import { FindDoctorPage } from './features/patient/FindDoctorPage';
import { NotificationsPage } from './features/patient/NotificationsPage';
import { PatientProfile } from './features/patient/PatientProfile';
import { SymptomForm } from './features/patient/SymptomForm';
import { DoctorDashboard } from './features/doctor/DoctorDashboard';
import { DoctorQueuePage } from './features/doctor/DoctorQueuePage';
import { DoctorAppointmentsPage } from './features/doctor/DoctorAppointmentsPage';
import { DoctorPatientsPage } from './features/doctor/DoctorPatientsPage';
import { DoctorAnalyticsPage } from './features/doctor/DoctorAnalyticsPage';
import { DoctorProfilePage } from './features/doctor/DoctorProfilePage';
import { NurseDashboard } from './features/nurse/NurseDashboard';
import { AdminDashboard } from './features/admin/AdminDashboard';
import { UserManagement } from './features/admin/UserManagement';
import { DepartmentManager } from './features/admin/DepartmentManager';
import { RoomManager } from './features/admin/RoomManager';
import { InviteStaff } from './features/admin/InviteStaff';
import { BillingManagement } from './features/admin/BillingManagement';
import { PaymentPage } from './features/payment/PaymentPage';
import { AboutPage } from './features/about/AboutPage';
import { ContactPage } from './features/contact/ContactPage';
import { useAuthStore } from './store/authStore';
import { ROLES } from './utils/constants';

const DashboardRedirect = () => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === ROLES.DOCTOR) return <Navigate to="/doctor/dashboard" replace />;
  if (user.role === ROLES.NURSE) return <Navigate to="/nurse/dashboard" replace />;
  return (
    <AppShell>
      {user.role === ROLES.PATIENT && <PatientDashboard />}
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
    path: '/about',
    element: <AboutPage />,
  },
  {
    path: '/contact',
    element: <ContactPage />,
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
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/doctor/login',
    element: <DoctorLoginPage />,
  },
  {
    path: '/nurse/login',
    element: <NurseLoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardRedirect />,
      },
      {
        path: '/nurse/dashboard',
        element: (
          <AppShell>
            <RoleGuard allowedRoles={[ROLES.NURSE]}>
              <NurseDashboard />
            </RoleGuard>
          </AppShell>
        ),
      },
      {
        path: '/doctor/dashboard',
        element: (
          <AppShell>
            <RoleGuard allowedRoles={[ROLES.DOCTOR]}>
              <DoctorDashboard />
            </RoleGuard>
          </AppShell>
        ),
      },
      {
        path: '/doctor/queue',
        element: (
          <AppShell>
            <RoleGuard allowedRoles={[ROLES.DOCTOR]}>
              <DoctorQueuePage />
            </RoleGuard>
          </AppShell>
        ),
      },
      {
        path: '/doctor/appointments',
        element: (
          <AppShell>
            <RoleGuard allowedRoles={[ROLES.DOCTOR]}>
              <DoctorAppointmentsPage />
            </RoleGuard>
          </AppShell>
        ),
      },
      {
        path: '/doctor/patients',
        element: (
          <AppShell>
            <RoleGuard allowedRoles={[ROLES.DOCTOR]}>
              <DoctorPatientsPage />
            </RoleGuard>
          </AppShell>
        ),
      },
      {
        path: '/doctor/analytics',
        element: (
          <AppShell>
            <RoleGuard allowedRoles={[ROLES.DOCTOR]}>
              <DoctorAnalyticsPage />
            </RoleGuard>
          </AppShell>
        ),
      },
      {
        path: '/doctor/profile',
        element: (
          <AppShell>
            <RoleGuard allowedRoles={[ROLES.DOCTOR]}>
              <DoctorProfilePage />
            </RoleGuard>
          </AppShell>
        ),
      },
      {
        path: '/queue',
        element: (
          <AppShell>
            <RoleGuard allowedRoles={[ROLES.PATIENT, ROLES.NURSE, ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
              <QueuePage />
            </RoleGuard>
          </AppShell>
        ),
      },
      {
        path: '/appointments',
        element: (
          <AppShell>
            <RoleGuard allowedRoles={[ROLES.PATIENT]}>
              <AppointmentsPage />
            </RoleGuard>
          </AppShell>
        ),
      },
      {
        path: '/find-doctor',
        element: (
          <AppShell>
            <RoleGuard allowedRoles={[ROLES.PATIENT]}>
              <FindDoctorPage />
            </RoleGuard>
          </AppShell>
        ),
      },
      {
        path: '/notifications',
        element: (
          <AppShell>
            <RoleGuard allowedRoles={[ROLES.PATIENT]}>
              <NotificationsPage />
            </RoleGuard>
          </AppShell>
        ),
      },
      {
        path: '/profile',
        element: (
          <AppShell>
            <PatientProfile />
          </AppShell>
        ),
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
            <AppointmentsPage />
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
