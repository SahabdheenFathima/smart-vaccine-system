import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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

// Original components (kept for fallback/reference if needed)
// import SignIn from "./components/SignIn";
// import SignUp from "./components/SignUp";
// import DashBord from "./components/DashBord";

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = window.localStorage.getItem("loggedIn");
  if (isLoggedIn !== "true") {
    return <Navigate to="/sign-in" />;
  }
  return children;
};

function App() {
  return (
    <Router>
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

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;