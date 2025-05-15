
import React, { useEffect } from 'react';
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
import { useGradient } from '@/contexts/GradientContext';
import { cn } from '@/lib/utils';

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const { currentGradient, setGradient } = useGradient();

  // Update gradient based on current route
  useEffect(() => {
    if (location.pathname.includes('/dashboard')) {
      setGradient('dashboard');
    } else if (location.pathname.includes('/tasks')) {
      setGradient('tasks');
    } else if (location.pathname.includes('/users') || location.pathname.includes('/teachers')) {
      setGradient('users');
    } else if (location.pathname.includes('/calendar')) {
      setGradient('calendar');
    } else if (location.pathname.includes('/subjects')) {
      setGradient('subjects');
    } else {
      setGradient('default');
    }
  }, [location.pathname, setGradient]);

  // Define gradient classes
  const gradientClasses = {
    default: 'bg-gradient-to-br from-blue-500 to-blue-700',
    dashboard: 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-700',
    tasks: 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800',
    users: 'bg-gradient-to-br from-blue-300 via-blue-500 to-blue-700',
    calendar: 'bg-gradient-to-br from-blue-400 via-blue-600 to-indigo-800',
    subjects: 'bg-gradient-to-br from-cyan-500 via-blue-500 to-blue-700',
  };

  // Define menu items based on user role
  const getMenuItems = () => {
    const commonItems = [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: ListTodo, label: 'Tasks', path: '/tasks' },
      { icon: FileText, label: 'Notes', path: '/notes' },
      { icon: Image, label: 'Gallery', path: '/gallery' },
    ];

    // Items only for admin and teacher roles
    const adminItems = [
      { icon: Users, label: 'Student Details', path: '/users' },
      { icon: Users, label: 'Teacher Details', path: '/teachers/all' },
      { icon: GraduationCap, label: 'Class Years', path: '/class-years' },
      { icon: BookOpen, label: 'Subjects', path: '/subjects' },
      { icon: Clock, label: 'Timetable', path: '/timetable' },
      { icon: AlertTriangle, label: 'Incidents', path: '/incidents' },
      { icon: Calendar, label: 'Calendar', path: '/calendar' },
      { icon: CalendarCheck, label: 'Student Attendance', path: '/student-attendance' },
      { icon: CalendarCheck, label: 'Teacher Attendance', path: '/teacher-attendance' },
    ];

    // Items accesssible by teachers but not students
    const teacherItems = [
      { icon: Users, label: 'Student Details', path: '/users' },
      { icon: Users, label: 'Teacher Details', path: '/teachers/all' },
      { icon: GraduationCap, label: 'Class Years', path: '/class-years' },
      { icon: BookOpen, label: 'Subjects', path: '/subjects' },
      { icon: Calendar, label: 'Calendar', path: '/calendar' },
      { icon: CalendarCheck, label: 'Student Attendance', path: '/student-attendance' },
      { icon: CalendarCheck, label: 'Teacher Attendance', path: '/teacher-attendance' },
    ];

    // Items accessible by all roles including students
    const sharedItems = [
      { icon: Video, label: 'Online Classes', path: '/online-classes' },
      { icon: FileText, label: 'Tests & Exams', path: '/exams' },
    ];

    // Student-specific items
    const studentItems = [
      { icon: Users, label: 'My Profile', path: '/users' },
      { icon: GraduationCap, label: 'My Class', path: '/class-years' },
    ];

    if (user?.role === 'admin') {
      return [...commonItems, ...adminItems, ...sharedItems];
    } else if (user?.role === 'teacher') {
      return [...commonItems, ...teacherItems, ...sharedItems];
    } else if (user?.role === 'student') {
      return [...commonItems, ...studentItems, ...sharedItems];
    }
    
    return commonItems;
  };

  const menuItems = getMenuItems();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={cn("min-h-screen flex w-full transition-colors duration-500", gradientClasses[currentGradient])}>
      <div className="border-r p-4 max-w-[16rem] flex flex-col shadow-md z-10 text-xs sm:text-sm bg-white/90 backdrop-blur-sm">
        <div className="border-b p-4">
          <div className="flex items-center gap-2 mb-2">
            <img 
              src="/lovable-uploads/4567f9ca-ee69-4eae-8105-c08313459a06.png" 
              alt="SlateEd Logo" 
              className="h-10 w-auto" 
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
      <main className="flex-1 p-8 bg-white/70 backdrop-blur-sm shadow-lg rounded-l-3xl">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
