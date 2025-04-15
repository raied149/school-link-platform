
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarHeader, SidebarTrigger } from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  GraduationCap, 
  BookOpen,
  ClipboardList,
  BellRing,
  LogOut,
  CalendarCheck,
  Users,
  Calendar,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
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
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: FileText, label: 'Tests & Exams', path: '/exams' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex w-full">
      <Sidebar>
        <SidebarHeader className="border-b p-4">
          <h2 className="text-lg font-semibold">School ERP</h2>
          {user && (
            <div className="text-sm text-muted-foreground">
              {user.name} ({user.role})
            </div>
          )}
        </SidebarHeader>
        <SidebarContent>
          <nav className="space-y-1">
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
        </SidebarContent>
        <div className="mt-auto p-4 border-t">
          <Button variant="ghost" className="w-full justify-start text-left" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </Sidebar>
      <main className="flex-1 p-8 bg-background">
        <SidebarTrigger />
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
