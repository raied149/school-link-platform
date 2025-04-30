
import { NavLink } from "react-router-dom";
import {
  Book,
  CalendarDays,
  Users,
  School,
  GraduationCap,
  BookOpen,
  Calendar,
  Bell,
  Languages,
  Video,
  FileText,
  ListTodo
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function Sidebar() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: School },
    { name: "Academic Years", href: "/academic-years", icon: Calendar },
    { name: "Class Years", href: "/class-years", icon: GraduationCap },
    { name: "Calendar", href: "/calendar", icon: CalendarDays },
    { name: "Tasks", href: "/tasks", icon: ListTodo },
    { name: "Users", href: "/users", icon: Users },
    { name: "Subjects", href: "/subjects", icon: Book },
    { name: "Timetable", href: "/timetable", icon: Calendar },
    { name: "Teacher Attendance", href: "/teacher-attendance", icon: Bell },
    { name: "Student Attendance", href: "/student-attendance", icon: Bell },
    { name: "Online Classes", href: "/online-classes", icon: Video },
    { name: "Notes", href: "/notes", icon: FileText },
    { name: "Exams", href: "/exams", icon: BookOpen },
    { name: "Incidents", href: "/incidents", icon: Bell },
  ];

  return (
    <div className="h-full bg-sidebar text-sidebar-foreground max-w-[16rem] flex flex-col shadow-md z-10 text-xs sm:text-sm">
      <div className="py-4 px-6">
        <h2 className="text-lg font-bold">School System</h2>
      </div>

      <nav className="flex-1 overflow-y-auto">
        <ul className="px-2 space-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center rounded-md px-3 py-2 transition-colors ${
                    isActive
                      ? "bg-sidebar-active text-sidebar-active-foreground"
                      : "hover:bg-sidebar-hover hover:text-sidebar-hover-foreground"
                  }`
                }
              >
                <item.icon className="mr-2 h-4 w-4 flex-shrink-0" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-sidebar-hover px-6 py-4">
        <p className="text-xs text-sidebar-muted">
          Logged in as: <span className="font-medium">{user.firstName} {user.lastName}</span>
        </p>
      </div>
    </div>
  );
}
