
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TeacherAttendanceTable } from "@/components/attendance/TeacherAttendanceTable";
import { TeacherAttendanceFilters } from "@/components/teachers/TeacherAttendanceFilters";
import { DateSelector } from "@/components/attendance/DateSelector";
import { useAuth } from "@/contexts/AuthContext";

const TeacherAttendancePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';

  // Fetch teachers from Supabase
  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ['teachers-attendance', user?.id],
    queryFn: async () => {
      if (isTeacher && user) {
        // If user is a teacher, only fetch their own record
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .eq('role', 'teacher');
          
        if (error) throw error;
        
        return data?.map(teacher => ({
          id: teacher.id,
          name: `${teacher.first_name} ${teacher.last_name}`
        })) || [];
      } else {
        // For admin, fetch all teachers
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'teacher');
          
        if (error) throw error;
        
        return data?.map(teacher => ({
          id: teacher.id,
          name: `${teacher.first_name} ${teacher.last_name}`
        })) || [];
      }
    }
  });

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = searchTerm === "" || 
                          teacher.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading teachers...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teacher Attendance</h1>
          <p className="text-muted-foreground">
            {isTeacher 
              ? "View your attendance records" 
              : "Manage and track teacher attendance records"}
          </p>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <DateSelector date={selectedDate} onDateChange={setSelectedDate} />
            {!isTeacher && (
              <TeacherAttendanceFilters
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                onSearchChange={setSearchTerm}
                onStatusChange={setStatusFilter}
              />
            )}
          </div>
          
          <TeacherAttendanceTable 
            selectedDate={selectedDate}
            teachers={filteredTeachers}
            isTeacherView={isTeacher}
          />
        </div>
      </Card>
    </div>
  );
};

export default TeacherAttendancePage;
