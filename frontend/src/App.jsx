import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import FacultyManagement from './pages/admin/FacultyManagement';
import StudentManagement from './pages/admin/StudentManagement';
import CourseManagement from './pages/admin/CourseManagement';
import TimetableManagement from './pages/admin/TimetableManagement';
import AttendanceMonitoring from './pages/admin/AttendanceMonitoring';
import ReportsPage from './pages/admin/ReportsPage';
import SettingsPage from './pages/admin/SettingsPage';

// Faculty
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultyProfile from './pages/faculty/FacultyProfile';
import FacultyCourses from './pages/faculty/FacultyCourses';
import CourseDetail from './pages/faculty/CourseDetail';
import FacultyTimetable from './pages/faculty/FacultyTimetable';
import AttendanceRNS from './pages/faculty/AttendanceRNS';
import AttendanceRegister from './pages/faculty/AttendanceRegister';
import FacultyReports from './pages/faculty/FacultyReports';
import FacultyMaterials from './pages/faculty/FacultyMaterials';

// Student
import StudentDashboard from './pages/student/StudentDashboard';
import StudentCourses from './pages/student/StudentCourses';
import StudentMaterials from './pages/student/StudentMaterials';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentTimetable from './pages/student/StudentTimetable';
import StudentProfile from './pages/student/StudentProfile';

const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === 'faculty') return <Navigate to="/faculty/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login & Registration */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* ADMIN PORTAL */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/faculty" element={<FacultyManagement />} />
              <Route path="/admin/students" element={<StudentManagement />} />
              <Route path="/admin/courses" element={<CourseManagement />} />
              <Route path="/admin/timetable" element={<TimetableManagement />} />
              <Route path="/admin/attendance" element={<AttendanceMonitoring />} />
              <Route path="/admin/reports" element={<ReportsPage />} />
              <Route path="/admin/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* FACULTY PORTAL */}
          <Route element={<ProtectedRoute allowedRoles={['faculty']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
              <Route path="/faculty/profile" element={<FacultyProfile />} />
              <Route path="/faculty/courses" element={<FacultyCourses />} />
              <Route path="/faculty/courses/:courseId" element={<CourseDetail />} />
              <Route path="/faculty/timetable" element={<FacultyTimetable />} />
              <Route path="/faculty/attendance" element={<AttendanceRNS />} />
              <Route path="/faculty/attendance/register/:sessionId" element={<AttendanceRegister />} />
              <Route path="/faculty/reports" element={<FacultyReports />} />
              <Route path="/faculty/materials" element={<FacultyMaterials />} />
              <Route path="/faculty/students" element={<FacultyCourses />} />
            </Route>
          </Route>

          {/* STUDENT PORTAL */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/courses" element={<StudentCourses />} />
              <Route path="/student/materials" element={<StudentMaterials />} />
              <Route path="/student/attendance" element={<StudentAttendance />} />
              <Route path="/student/timetable" element={<StudentTimetable />} />
              <Route path="/student/profile" element={<StudentProfile />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
