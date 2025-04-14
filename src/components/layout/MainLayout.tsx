
import React from 'react';
import { Sidebar, SidebarContent, SidebarHeader, SidebarTrigger } from "@/components/ui/sidebar";
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  GraduationCap, 
  BookOpen,
  ClipboardList,
  BellRing,
  LogOut 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Users', path: '/users' },
    { icon: CalendarDays, label: 'Academic Years', path: '/academic-years' },
    { icon: GraduationCap, label: 'Classes', path: '/classes' },
    { icon: BookOpen, label: 'Subjects', path: '/subjects' },
    { icon: ClipboardList, label: 'Attendance', path: '/attendance' },
    { icon: BellRing, label: 'Notifications', path: '/notifications' },
  ];

  return (
    <div className="min-h-screen flex w-full">
      <Sidebar>
        <SidebarHeader className="border-b p-4">
          <h2 className="text-lg font-semibold">School ERP</h2>
        </SidebarHeader>
        <SidebarContent>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className="w-full justify-start text-left px-4 py-2 hover:bg-accent"
                onClick={() => navigate(item.path)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </nav>
        </SidebarContent>
        <div className="mt-auto p-4 border-t">
          <Button variant="ghost" className="w-full justify-start text-left">
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
