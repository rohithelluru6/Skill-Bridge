import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import FloatingChatbot from './components/common/FloatingChatbot';

// Pages
import LandingPage from './pages/LandingPage';
import ResourcesPage from './pages/ResourcesPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

import StudentDashboard from './pages/dashboard/StudentDashboard';
import SkillAssessmentPage from './pages/dashboard/SkillAssessmentPage';
import CareerGoalsPage from './pages/dashboard/CareerGoalsPage';
import GapAnalysisPage from './pages/dashboard/GapAnalysisPage';
import RoadmapPage from './pages/dashboard/RoadmapPage';
import LearningResourcesPage from './pages/dashboard/LearningResourcesPage';
import ProjectsPage from './pages/dashboard/ProjectsPage';
import ProgressPage from './pages/dashboard/ProgressPage';
import ProfilePage from './pages/dashboard/ProfilePage';

import AdminDashboard from './pages/admin/AdminDashboard';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Student Protected Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<StudentDashboard />} />
              <Route path="assessment" element={<SkillAssessmentPage />} />
              <Route path="careers" element={<CareerGoalsPage />} />
              <Route path="gap-analysis" element={<GapAnalysisPage />} />
              <Route path="roadmap" element={<RoadmapPage />} />
              <Route path="resources" element={<LearningResourcesPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="progress" element={<ProgressPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Admin Protected Portal */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
            </Route>

            {/* Catch-all redirect to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Floating AI Chatbot in bottom-right corner across all pages */}
          <FloatingChatbot />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
