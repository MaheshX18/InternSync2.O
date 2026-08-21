import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

import { LandingPage } from './pages/LandingPage';
import { AuthSecurityPage } from './pages/AuthSecurityPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { NotFoundPage } from './pages/NotFoundPage';

import { StudentDashboardPage } from './pages/student/StudentDashboardPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { StudentAcademicsPage } from './pages/student/StudentAcademicsPage';
import { StudentInternshipHubPage } from './pages/student/StudentInternshipHubPage';
import { StudentOffCampusPage } from './pages/student/StudentOffCampusPage';

import { CompanyDashboardPage } from './pages/company/CompanyDashboardPage';
import { CompanyProfilePage } from './pages/company/CompanyProfilePage';
import { CompanyInternManagementPage } from './pages/company/CompanyInternManagementPage';

import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUserManagementPage } from './pages/admin/AdminUserManagementPage';

import { StudentBrowseInternshipsPage } from './pages/StudentBrowseInternshipsPage';
import { InternshipDetailPage } from './pages/InternshipDetailPage';
import { StudentBookmarksPage } from './pages/StudentBookmarksPage';
import { StudentApplicationsPage } from './pages/student/StudentApplicationsPage';
import { StudentRecommendationsPage } from './pages/student/StudentRecommendationsPage';
import { StudentResumePage } from './pages/student/StudentResumePage';
import { StudentSkillRoadmapPage } from './pages/student/StudentSkillRoadmapPage';
import { StudentCareerReadinessPage } from './pages/student/StudentCareerReadinessPage';
import { CompanyPostingsPage } from './pages/CompanyPostingsPage';
import { CreateEditInternshipPage } from './pages/CreateEditInternshipPage';
import { CompanyApplicationsPage } from './pages/company/CompanyApplicationsPage';
import { AdminInternshipManagementPage } from './pages/AdminInternshipManagementPage';

import { TPODashboardPage } from './pages/tpo/TPODashboardPage';
import { TPOPlacementDrivesPage } from './pages/tpo/TPOPlacementDrivesPage';
import { TPOTrainingManagementPage } from './pages/tpo/TPOTrainingManagementPage';
import { TPOStudentInterventionsPage } from './pages/tpo/TPOStudentInterventionsPage';
import { TPOOffCampusReviewPage } from './pages/tpo/TPOOffCampusReviewPage';
import { TPOStudentRecordPage } from './pages/tpo/TPOStudentRecordPage';
import { StudentTrainingsPage } from './pages/student/StudentTrainingsPage';
import { TPOAttendancePage } from './pages/tpo/TPOAttendancePage';

import { CompanyCandidateMatchingPage } from './pages/company/CompanyCandidateMatchingPage';
import { MentorDashboardPage } from './pages/mentor/MentorDashboardPage';
import { MentorStudentDetailPage } from './pages/mentor/MentorStudentDetailPage';
import { MentorMenteesPage } from './pages/mentor/MentorMenteesPage';
import { TPOFacultyMentorsPage } from './pages/tpo/TPOFacultyMentorsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div id="app-root-layout" className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
          <Navbar />
          <main id="app-main-content" className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth-hub" element={<AuthSecurityPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="/internships" element={<StudentBrowseInternshipsPage />} />
              <Route path="/internships/:id" element={<InternshipDetailPage />} />

              {/* Student Routes */}
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <StudentDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/profile"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <StudentProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/academics"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <StudentAcademicsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/internship-hub"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <StudentInternshipHubPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/off-campus"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <StudentOffCampusPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/bookmarks"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <StudentBookmarksPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/applications"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <StudentApplicationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recommendations"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <StudentRecommendationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/recommendations"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <StudentRecommendationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/resume"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <StudentResumePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/resume"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <StudentResumePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/skill-roadmap"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <StudentSkillRoadmapPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/skill-roadmap"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <StudentSkillRoadmapPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/career-readiness"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <StudentCareerReadinessPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/career-readiness"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <StudentCareerReadinessPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/interview-prep"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <StudentCareerReadinessPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/trainings"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <StudentTrainingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Company Partner Routes */}
              <Route
                path="/company/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['COMPANY']}>
                    <CompanyDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/profile"
                element={
                  <ProtectedRoute allowedRoles={['COMPANY']}>
                    <CompanyProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/internships"
                element={
                  <ProtectedRoute allowedRoles={['COMPANY']}>
                    <CompanyPostingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/applications"
                element={
                  <ProtectedRoute allowedRoles={['COMPANY']}>
                    <CompanyApplicationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/interns"
                element={
                  <ProtectedRoute allowedRoles={['COMPANY']}>
                    <CompanyInternManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/intern-management"
                element={
                  <ProtectedRoute allowedRoles={['COMPANY']}>
                    <CompanyInternManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/internships/new"
                element={
                  <ProtectedRoute allowedRoles={['COMPANY']}>
                    <CreateEditInternshipPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/internships/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['COMPANY']}>
                    <CreateEditInternshipPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/internships/:id/candidates"
                element={
                  <ProtectedRoute allowedRoles={['COMPANY', 'ADMIN', 'TPO']}>
                    <CompanyCandidateMatchingPage />
                  </ProtectedRoute>
                }
              />

              {/* TPO Routes */}
              <Route
                path="/tpo/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'TPO']}>
                    <TPODashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tpo/off-campus"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'TPO']}>
                    <TPOOffCampusReviewPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tpo/students/:id/record"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'TPO']}>
                    <TPOStudentRecordPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tpo/drives"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'TPO']}>
                    <TPOPlacementDrivesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tpo/trainings"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'TPO']}>
                    <TPOTrainingManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tpo/interventions"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'TPO']}>
                    <TPOStudentInterventionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tpo/attendance"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'TPO']}>
                    <TPOAttendancePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tpo/mentors"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'TPO']}>
                    <TPOFacultyMentorsPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminUserManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/internships"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminInternshipManagementPage />
                  </ProtectedRoute>
                }
              />

              {/* Faculty Mentor Routes */}
              <Route
                path="/mentor/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['FACULTY_MENTOR']}>
                    <MentorDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mentor"
                element={
                  <ProtectedRoute allowedRoles={['FACULTY_MENTOR']}>
                    <MentorDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mentor/students/:id"
                element={
                  <ProtectedRoute allowedRoles={['FACULTY_MENTOR']}>
                    <MentorStudentDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mentor/students/:studentId"
                element={
                  <ProtectedRoute allowedRoles={['FACULTY_MENTOR']}>
                    <MentorStudentDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mentor/mentees"
                element={
                  <ProtectedRoute allowedRoles={['FACULTY_MENTOR']}>
                    <MentorMenteesPage />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
