
import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Sidebar } from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  GraduationCap, 
  ClipboardList,
  BellRing,
  LogOut,
  CalendarCheck,
  Users,
  Calendar,
  FileText,
  AlertTriangle,
  Clock,
  BookOpen,
  Video,
  ListTodo
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Student Details', path: '/students' },
    { icon: Users, label: 'Teacher Details', path: '/teachers' },
    { icon: CalendarCheck, label: 'Student Attendance', path: '/student-attendance' },
    { icon: CalendarCheck, label: 'Teacher Attendance', path: '/teacher-attendance' },
    { icon: GraduationCap, label: 'Classes', path: '/classes' },
    { icon: BookOpen, label: 'Subjects', path: '/subjects' },
    { icon: Clock, label: 'Timetables', path: '/timetables' },
    { icon: Video, label: 'Online Classes', path: '/online-classes' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: FileText, label: 'Tests & Exams', path: '/exams' },
    { icon: FileText, label: 'Notes', path: '/notes' },
    { icon: AlertTriangle, label: 'Incidents', path: '/incidents' },
    { icon: ListTodo, label: 'Tasks', path: '/tasks' },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen flex w-full">
      <Sidebar className="border-r p-4 max-w-[16rem] flex flex-col shadow-md z-10 text-xs sm:text-sm">
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold">School ERP</h2>
          {user && (
            <div className="text-sm text-muted-foreground">
              {user.firstName} {user.lastName} ({user.role})
            </div>
          )}
        </div>
        <nav className="flex-1 space-y-1 mt-4">
          {menuItems.map((item) => (
            <Button
              key={item.path}
              variant={location.pathname === item.path ? "default" : "ghost"}
              className={`w-full justify-start text-left px-4 py-2 ${
                location.pathname === item.path ? "bg-accent text-accent-foreground" : "hover:bg-accent"
              }`}
              onClick={() => navigate(item.path)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </nav>
        <div className="mt-auto p-4 border-t">
          <Button variant="ghost" className="w-full justify-start text-left" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </Sidebar>
      <main className="flex-1 p-8 bg-background">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
