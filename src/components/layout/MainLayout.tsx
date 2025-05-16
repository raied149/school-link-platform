
import React, { useEffect, useState } from 'react';
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
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const { currentGradient, setGradient } = useGradient();
  const [studentSectionData, setStudentSectionData] = useState<{ classId: string, sectionId: string } | null>(null);

  // Check if the current path is related to class years, classes, or sections
  const isClassYearsRelated = 
    location.pathname.includes('/class-years') || 
    (location.pathname.includes('/sections/') && location.pathname.includes('/class-years/'));

  // Fetch student's section if user is a student
  useQuery({
    queryKey: ['student-section', user?.id],
    queryFn: async () => {
      if (!user || user.role !== 'student') return null;
      
      // Get the section assignment for this student
      const { data: sectionData, error: sectionError } = await supabase
        .from('student_sections')
        .select(`
          section_id,
          sections (
            id,
            class_id
          )
        `)
        .eq('student_id', user.id)
        .maybeSingle();
        
      if (sectionError) {
        console.error("Error fetching student section:", sectionError);
        return null;
      }
      
      if (sectionData && sectionData.sections) {
        setStudentSectionData({
          classId: sectionData.sections.class_id,
          sectionId: sectionData.section_id
        });
        return { 
          classId: sectionData.sections.class_id, 
          sectionId: sectionData.section_id 
        };
      }
      
      return null;
    },
    enabled: !!user && user.role === 'student'
  });

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
    } else if (location.pathname.includes('/class') || location.pathname.includes('/sections')) {
      setGradient('classes');
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
    classes: 'bg-gradient-to-br from-blue-400 via-blue-600 to-blue-700',
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
      { 
        icon: GraduationCap, 
        label: 'My Class', 
        path: studentSectionData 
          ? `/class/${studentSectionData.classId}/section/${studentSectionData.sectionId}` 
          : '/class-years' 
      },
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

  // Function to determine if a menu item is active
  const isMenuItemActive = (path: string) => {
    // Special case for My Class links for students
    if (user?.role === 'student' && studentSectionData && 
        path.includes(`/class/${studentSectionData.classId}/section/${studentSectionData.sectionId}`)) {
      return location.pathname.includes(`/class/${studentSectionData.classId}/section/${studentSectionData.sectionId}`);
    }
    
    // Special case for class-years to handle nested routes
    if (path === '/class-years' && (
      isClassYearsRelated || 
      location.pathname.startsWith('/class-years/sections/')
    )) {
      return true;
    }
    // Special case for classes to prevent class-years routes from triggering it
    if (path === '/classes' && !isClassYearsRelated && (
      location.pathname === '/classes' || 
      location.pathname.startsWith('/classes/') ||
      location.pathname.includes('/sections/') && !location.pathname.includes('/class-years/')
    )) {
      return true;
    }
    // Default case
    return location.pathname === path || 
           (location.pathname.startsWith(`${path}/`) && !path.includes('class-years'));
  };

  // Function to handle navigation
  const handleNavigation = (path: string) => {
    // Directly navigate to the path without any login logic
    navigate(path);
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
        <nav className="flex-1 space-y-1 mt-4 overflow-y-auto">
          {getMenuItems().map((item) => (
            <Button
              key={item.path}
              variant={isMenuItemActive(item.path) ? "default" : "ghost"}
              className={`w-full justify-start text-left px-4 py-2 ${
                isMenuItemActive(item.path) ? "bg-accent text-accent-foreground" : "hover:bg-accent"
              }`}
              onClick={() => handleNavigation(item.path)}
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
      <main className="flex-1 p-8 bg-white/70 backdrop-blur-sm shadow-lg rounded-l-3xl overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
