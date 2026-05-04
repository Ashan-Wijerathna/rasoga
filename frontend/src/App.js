import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/global.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/Languagecontext';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import ApplyPage from './pages/ApplyPage';
import ApplicationsPage from './pages/ApplicationsPage';
import ResultsPage from './pages/ResultsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminApplications from './pages/admin/AdminApplications';
import AdminEvents from './pages/admin/AdminEvents';
import AdminResults from './pages/admin/AdminResults';
import AdminSchools from './pages/admin/AdminSchools';
import AdminUsers from './pages/admin/AdminUsers';
import AdminHeroSlides from './pages/admin/AdminHeroSlides';
import AdminFormBuilder from './pages/admin/AdminFormBuilder';
import AdminReports from './pages/admin/AdminReports';
import AdminUserPermissions from './pages/admin/AdminUserPermissions';
import ResozaApplicationPage from './pages/ResozaApplicationPage';
import ResozaSchoolRegistrationPage from './pages/ResozaSchoolRegistrationPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import AdminLayout from './components/admin/AdminLayout';

const PermissionRoute = ({ module, action = 'view', children }) => {
  const { user, loading, can, isMasterAdmin, isSchool } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!['admin', 'school'].includes(user.role)) return <Navigate to="/unauthorized" replace />;
  if (module === null) return children;
  if (isSchool) {
    if (module === 'applications') return children;
    return <Navigate to="/unauthorized" replace />;
  }
  if (isMasterAdmin) return children;
  if (!can(module, action)) return <Navigate to="/unauthorized" replace />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Navbar />}

      <Routes>
        {/* ── Public routes ── */}
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/apply/:eventId" element={<ApplyPage />} />
        <Route path="/apply/resoza-2026" element={<ResozaApplicationPage />} />
        <Route path="/apply/resoza-2026/:eventId" element={<ResozaApplicationPage />} />
        <Route path="/resoza-2026/school-register" element={<ResozaSchoolRegistrationPage />} />
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route
          path="/login"
          element={user ? <Navigate to={['admin', 'school'].includes(user.role) ? '/admin' : '/'} replace /> : <LoginPage />}
        />

        {/* ── Admin routes ── */}
        <Route path="/admin" element={
          <PermissionRoute module={null}>
            <AdminLayout><AdminDashboard /></AdminLayout>
          </PermissionRoute>
        } />
        <Route path="/admin/applications" element={
          <PermissionRoute module="applications" action="view">
            <AdminLayout><AdminApplications /></AdminLayout>
          </PermissionRoute>
        } />
        <Route path="/admin/events" element={
          <PermissionRoute module="events" action="view">
            <AdminLayout><AdminEvents /></AdminLayout>
          </PermissionRoute>
        } />
        <Route path="/admin/results" element={
          <PermissionRoute module="results" action="view">
            <AdminLayout><AdminResults /></AdminLayout>
          </PermissionRoute>
        } />
        <Route path="/admin/schools" element={
          <PermissionRoute module="schools" action="view">
            <AdminLayout><AdminSchools /></AdminLayout>
          </PermissionRoute>
        } />
        <Route path="/admin/users" element={
          <PermissionRoute module="users" action="view">
            <AdminLayout><AdminUsers /></AdminLayout>
          </PermissionRoute>
        } />
        <Route path="/admin/users/:userId/permissions" element={
          <PermissionRoute module="users" action="edit">
            <AdminLayout><AdminUserPermissions /></AdminLayout>
          </PermissionRoute>
        } />
        <Route path="/admin/slides" element={
          <PermissionRoute module="slides" action="view">
            <AdminLayout><AdminHeroSlides /></AdminLayout>
          </PermissionRoute>
        } />
        <Route path="/admin/reports" element={
          <PermissionRoute module="reports" action="view">
            <AdminLayout><AdminReports /></AdminLayout>
          </PermissionRoute>
        } />
        <Route path="/admin/form-builder" element={
          <PermissionRoute module={null}>
            <AdminLayout><AdminFormBuilder /></AdminLayout>
          </PermissionRoute>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {!isAdminRoute && <Footer />}
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <AppRoutes />
          <ToastContainer position="top-right" autoClose={3500} hideProgressBar={false} theme="light" />
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}
