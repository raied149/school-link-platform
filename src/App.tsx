
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import ClassYearsPage from './pages/classes/ClassYearsPage';
import ClassesPage from './pages/classes/ClassesPage';
import LoginPage from "./pages/auth/LoginPage";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import { Toaster } from "./components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { AuthProvider } from './contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SectionsPage from './pages/classes/SectionsPage';
import ClassDetailsPage from './pages/classes/ClassDetailsPage';
import UsersPage from './pages/users/UsersPage';
import SubjectsPage from './pages/subjects/SubjectsPage';
import TeacherDetailsPage from './pages/teachers/TeacherDetailsPage';
import TeacherAttendancePage from './pages/attendance/TeacherAttendancePage';
import StudentAttendancePage from './pages/attendance/StudentAttendancePage';
import TimetablePage from './pages/timetable/TimetablePage';
import ExamsPage from './pages/exams/ExamsPage';
import ExamDetailPage from './pages/exams/ExamDetailPage';
import OnlineClassesPage from './pages/online-classes/OnlineClassesPage';
import AcademicYearsPage from './pages/academic/AcademicYearsPage';
import NotesPage from './pages/notes/NotesPage';
import CalendarPage from './pages/CalendarPage';
import IncidentDetailPage from './pages/incidents/IncidentDetailPage';
import IncidentsPage from './pages/incidents/IncidentsPage';
import TasksPage from './pages/TasksPage';
import GalleryPage from './pages/gallery/GalleryPage';
import GalleryEventDetailPage from './pages/gallery/GalleryEventDetailPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/academic-years" element={<AcademicYearsPage />} />
              <Route path="/class-years" element={<ClassYearsPage />} />
              <Route path="/classes/:yearId" element={<ClassesPage />} />
              <Route path="/class/:classId" element={<ClassDetailsPage />} />
              <Route path="/sections/:classId" element={<SectionsPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/subjects" element={<SubjectsPage />} />
              <Route path="/teachers/all" element={<TeacherDetailsPage />} /> {/* Added route for teacher listing */}
              <Route path="/teachers/:teacherId" element={<TeacherDetailsPage />} />
              <Route path="/teacher-attendance" element={<TeacherAttendancePage />} />
              <Route path="/student-attendance" element={<StudentAttendancePage />} />
              <Route path="/timetable" element={<TimetablePage />} />
              <Route path="/exams" element={<ExamsPage />} />
              <Route path="/exams/:examId" element={<ExamDetailPage />} />
              <Route path="/online-classes" element={<OnlineClassesPage />} />
              <Route path="/notes" element={<NotesPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/incidents" element={<IncidentsPage />} />
              <Route path="/incidents/:incidentId" element={<IncidentDetailPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/gallery/:eventId" element={<GalleryEventDetailPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
          <SonnerToaster />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
