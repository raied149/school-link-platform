
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { TeacherAttendanceFilters } from "@/components/teachers/TeacherAttendanceFilters";
import { TeacherAttendanceRecord } from "@/components/teachers/TeacherAttendanceRecord";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const TeacherAttendancePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  // Fetch teachers from Supabase
  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ['teachers-attendance'],
    queryFn: async () => {
      console.log("Fetching teachers for attendance");
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'teacher');
        
      if (error) {
        console.error("Error fetching teachers:", error);
        throw error;
      }
      
      return data || [];
    }
  });
  
  const [teacherAttendance, setTeacherAttendance] = useState<Record<string, {
    status: 'present' | 'absent' | 'not-marked',
    checkIn: string | null,
    checkOut: string | null
  }>>(() => {
    const initialAttendance: Record<string, any> = {};
    teachers.forEach(teacher => {
      initialAttendance[teacher.id] = {
        status: 'not-marked',
        checkIn: null,
        checkOut: null
      };
    });
    return initialAttendance;
  });

  // Update teacherAttendance when teachers data changes
  useState(() => {
    const updatedAttendance: Record<string, any> = {};
    teachers.forEach(teacher => {
      updatedAttendance[teacher.id] = teacherAttendance[teacher.id] || {
        status: 'not-marked',
        checkIn: null,
        checkOut: null
      };
    });
    setTeacherAttendance(updatedAttendance);
  });

  const filteredTeachers = teachers.filter(teacher => {
    const fullName = `${teacher.first_name} ${teacher.last_name}`.toLowerCase();
    const matchesSearch = searchTerm === "" || 
                          fullName.includes(searchTerm.toLowerCase()) || 
                          teacher.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "present" && teacherAttendance[teacher.id]?.status === "present") ||
                         (statusFilter === "absent" && teacherAttendance[teacher.id]?.status === "absent");
    
    return matchesSearch && matchesStatus;
  });

  const handleCheckIn = (teacherId: string) => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setTeacherAttendance(prev => ({
      ...prev,
      [teacherId]: {
        ...prev[teacherId],
        status: 'present',
        checkIn: formattedTime
      }
    }));
    
    toast({
      title: "Check-in recorded",
      description: `Teacher checked in at ${formattedTime}`,
    });
  };

  const handleCheckOut = (teacherId: string) => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setTeacherAttendance(prev => ({
      ...prev,
      [teacherId]: {
        ...prev[teacherId],
        checkOut: formattedTime
      }
    }));
    
    toast({
      title: "Check-out recorded",
      description: `Teacher checked out at ${formattedTime}`,
    });
  };

  const handleMarkAbsent = (teacherId: string) => {
    setTeacherAttendance(prev => ({
      ...prev,
      [teacherId]: {
        status: 'absent',
        checkIn: null,
        checkOut: null
      }
    }));
    
    toast({
      title: "Attendance updated",
      description: "Teacher marked as absent for today",
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading teachers...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teacher Attendance</h1>
          <p className="text-muted-foreground">
            Manage and track teacher attendance records
          </p>
        </div>
      </div>

      <Card className="p-6">
        <TeacherAttendanceFilters
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onSearchChange={setSearchTerm}
          onStatusChange={setStatusFilter}
        />

        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-10 px-4 text-left align-middle font-medium">Name</th>
                <th className="h-10 px-4 text-left align-middle font-medium">Status</th>
                <th className="h-10 px-4 text-left align-middle font-medium">Check In</th>
                <th className="h-10 px-4 text-left align-middle font-medium">Check Out</th>
                <th className="h-10 px-4 text-left align-middle font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.length > 0 ? filteredTeachers.map((teacher) => (
                <TeacherAttendanceRecord
                  key={teacher.id}
                  teacherId={teacher.id}
                  teacherName={`${teacher.first_name} ${teacher.last_name}`}
                  attendance={teacherAttendance[teacher.id] || { status: 'not-marked', checkIn: null, checkOut: null }}
                  onCheckIn={handleCheckIn}
                  onCheckOut={handleCheckOut}
                  onMarkAbsent={handleMarkAbsent}
                />
              )) : (
                <tr>
                  <td colSpan={5} className="p-4 text-center">
                    No teachers found matching your search criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default TeacherAttendancePage;
