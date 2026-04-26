import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import './globals.css';

// New Atomic Pages
import LoginPage from "./pages/LoginPage";
import RegistrationPage from "./pages/RegistrationPage";
import DashboardPage from "./pages/DashboardPage";
import BabyFormPage from "./pages/BabyFormPage";
import VaccineSchedulePage from "./pages/VaccineSchedulePage";
import AnalyticsPage from "./pages/AnalyticsPage";
import DevelopmentStagesPage from "./pages/DevelopmentStagesPage";
import BabyHistoryPage from "./pages/BabyHistoryPage";
import RemindersDashboardPage from "./pages/RemindersDashboardPage";
import AdminConsultantsPage from "./pages/AdminConsultantsPage";
import AdminDashboardOverview from "./pages/AdminDashboardOverview";
import AdminParentsPage from "./pages/AdminParentsPage";
import AdminChildrenPage from "./pages/AdminChildrenPage";
import AdminAppointmentsPage from "./pages/AdminAppointmentsPage";
import AdminVaccinesPage from "./pages/AdminVaccinesPage";
import AdminQueuePage from "./pages/AdminQueuePage";
import AdminNotificationsPage from "./pages/AdminNotificationsPage";
import AdminReportsPage from "./pages/AdminReportsPage";
import AdminVaccineSchedulePage from "./pages/AdminVaccineSchedulePage";
import BookConsultationPage from "./pages/BookConsultationPage";
import ConsultantDashboardPage from "./pages/ConsultantDashboardPage";
import ParentClinicalNotesPage from "./pages/ParentClinicalNotesPage";

// Original components (kept for fallback/reference if needed)
// import SignIn from "./components/SignIn";
// import SignUp from "./components/SignUp";
// import DashBord from "./components/DashBord";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const isLoggedIn = window.localStorage.getItem("loggedIn");
  const token = window.localStorage.getItem("token");
  
  if (isLoggedIn !== "true" || !token) {
    return <Navigate to="/sign-in" />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!allowedRoles.includes(payload.role)) {
        return <Navigate to="/" />; // Redirect unauthorized to their main dashboard
      }
    } catch (e) {
      return <Navigate to="/sign-in" />;
    }
  }

  return children;
};

function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/sign-in" element={<LoginPage />} />
          <Route path="/sign-up" element={<RegistrationPage />} />

          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />

          <Route path="/dashbord" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />

          <Route path="/add-baby" element={
            <ProtectedRoute>
              <BabyFormPage />
            </ProtectedRoute>
          } />

          <Route path="/vaccine-table" element={
            <ProtectedRoute>
              <VaccineSchedulePage />
            </ProtectedRoute>
          } />

          <Route path="/analytics" element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          } />

          <Route path="/milestones" element={
            <ProtectedRoute>
              <DevelopmentStagesPage />
            </ProtectedRoute>
          } />

          <Route path="/baby-history" element={
            <ProtectedRoute>
              <BabyHistoryPage />
            </ProtectedRoute>
          } />

          <Route path="/reminders" element={
            <ProtectedRoute>
              <RemindersDashboardPage />
            </ProtectedRoute>
          } />

          <Route path="/admin-dashboard" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboardOverview />
            </ProtectedRoute>
          } />

          <Route path="/admin-consultants" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminConsultantsPage />
            </ProtectedRoute>
          } />

          <Route path="/admin-parents" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminParentsPage />
            </ProtectedRoute>
          } />

          <Route path="/admin-children" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminChildrenPage />
            </ProtectedRoute>
          } />

          <Route path="/admin-appointments" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminAppointmentsPage />
            </ProtectedRoute>
          } />

          <Route path="/admin-queue" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminQueuePage />
            </ProtectedRoute>
          } />

          <Route path="/admin-notifications" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminNotificationsPage />
            </ProtectedRoute>
          } />

          <Route path="/admin-reports" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminReportsPage />
            </ProtectedRoute>
          } />

          <Route path="/admin-vaccine-schedules" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminVaccineSchedulePage />
            </ProtectedRoute>
          } />

          <Route path="/book-consultation" element={
            <ProtectedRoute allowedRoles={['PARENT']}>
              <BookConsultationPage />
            </ProtectedRoute>
          } />

          <Route path="/consultant-dashboard" element={
            <ProtectedRoute allowedRoles={['CONSULTANT']}>
              <ConsultantDashboardPage />
            </ProtectedRoute>
          } />

          <Route path="/parent/clinical-notes" element={
            <ProtectedRoute allowedRoles={['PARENT']}>
              <ParentClinicalNotesPage />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;