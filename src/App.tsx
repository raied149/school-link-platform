
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import { SidebarProvider } from "@/components/ui/sidebar";
import UsersPage from "./pages/users/UsersPage";
import ClassYearsPage from "./pages/classes/ClassYearsPage";
import ClassDetailsPage from "./pages/classes/ClassDetailsPage";
import SectionsPage from "./pages/classes/SectionsPage";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoginPage from "./pages/auth/LoginPage";
import StudentAttendancePage from "./pages/attendance/StudentAttendancePage";
import TeacherAttendancePage from "./pages/attendance/TeacherAttendancePage";
import TeacherDetailsPage from "./pages/teachers/TeacherDetailsPage";
import CalendarPage from "./pages/CalendarPage";
import ExamsPage from "./pages/exams/ExamsPage";
import ExamDetailPage from "./pages/exams/ExamDetailPage";
import IncidentsPage from "./pages/incidents/IncidentsPage";
import IncidentDetailPage from "./pages/incidents/IncidentDetailPage";
import TimetablePage from "./pages/timetable/TimetablePage";
import SubjectsPage from "./pages/subjects/SubjectsPage";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const AuthRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route 
      path="/*" 
      element={
        <ProtectedRoute>
          <MainLayout>
            <Outlet />
          </MainLayout>
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="students" element={<UsersPage />} />
      <Route path="teachers" element={<TeacherDetailsPage />} />
      <Route path="student-attendance" element={<StudentAttendancePage />} />
      <Route path="teacher-attendance" element={<TeacherAttendancePage />} />
      <Route path="classes" element={<ClassYearsPage />} />
      <Route path="classes/:yearId" element={<ClassYearsPage />} />
      <Route path="classes/:yearId/:classId" element={<SectionsPage />} />
      <Route path="classes/:yearId/:classId/:sectionId" element={<ClassDetailsPage />} />
      <Route path="subjects" element={<SubjectsPage />} />
      <Route path="timetables" element={<TimetablePage />} />
      <Route path="calendar" element={<CalendarPage />} />
      <Route path="exams" element={<ExamsPage />} />
      <Route path="exams/:examId" element={<ExamDetailPage />} />
      <Route path="incidents" element={<IncidentsPage />} />
      <Route path="incidents/:incidentId" element={<IncidentDetailPage />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <SidebarProvider>
            <Toaster />
            <Sonner />
            <AuthRoutes />
          </SidebarProvider>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
