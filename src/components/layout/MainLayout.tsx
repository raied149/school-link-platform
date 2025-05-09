
import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
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
  ListTodo,
  Image
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Student Details', path: '/users' }, 
    { icon: Users, label: 'Teacher Details', path: '/teachers/all' }, 
    { icon: CalendarCheck, label: 'Student Attendance', path: '/student-attendance' },
    { icon: CalendarCheck, label: 'Teacher Attendance', path: '/teacher-attendance' },
    { icon: GraduationCap, label: 'Class Years', path: '/class-years' }, 
    { icon: BookOpen, label: 'Subjects', path: '/subjects' },
    { icon: Clock, label: 'Timetable', path: '/timetable' },
    { icon: Video, label: 'Online Classes', path: '/online-classes' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: Image, label: 'Gallery', path: '/gallery' },
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
      <div className="border-r p-4 max-w-[16rem] flex flex-col shadow-md z-10 text-xs sm:text-sm">
        <div className="border-b p-4">
          <div className="flex items-center gap-2 mb-2">
            <img 
              src="/lovable-uploads/9811b7b8-6807-4171-b356-47e999d902e9.png" 
              alt="SlateEd Logo" 
              className="h-8 w-auto" 
            />
            <h2 className="text-lg font-semibold">SlateEd</h2>
          </div>
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
      </div>
      <main className="flex-1 p-8 bg-background">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
