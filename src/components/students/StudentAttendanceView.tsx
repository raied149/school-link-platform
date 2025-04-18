
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { supabase } from "@/integrations/supabase/client";
import { AttendanceDateRangePicker } from "./AttendanceDateRangePicker";
import { StudentAttendanceRecord } from "./StudentAttendanceRecord";

interface StudentAttendanceViewProps {
  classId?: string;
  sectionId?: string;
  studentId?: string;
}

interface AttendanceRecord {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  attendance: {
    present: number;
    absent: number;
    total: number;
    percentage: number;
  };
}

export function StudentAttendanceView({ 
  classId, 
  sectionId, 
  studentId 
}: StudentAttendanceViewProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  // Fetch student profiles from Supabase
  const { data: students = [], isLoading: isLoadingStudents } = useQuery({
    queryKey: ['students', studentId],
    queryFn: async () => {
      console.log("Fetching students for attendance view");
      const query = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student');
        
      // Filter by studentId if provided
      if (studentId) {
        query.eq('id', studentId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching students:", error);
        throw error;
      }
      
      return data || [];
    }
  });

  // Fetch attendance records (currently mock data, you can replace with real attendance data from Supabase later)
  const { data: attendanceRecords, isLoading: isLoadingAttendance } = useQuery({
    queryKey: ['attendance', students, dateRange],
    queryFn: async () => {
      // Generate attendance records for the fetched students
      return students.map(student => {
        // Generate random attendance data for demonstration
        const totalDays = 48;
        const presentDays = Math.floor(Math.random() * 20) + 25; // Between 25 and 45 days
        const absentDays = totalDays - presentDays;
        const percentage = (presentDays / totalDays) * 100;
        
        return {
          studentId: student.id,
          studentName: `${student.first_name} ${student.last_name}`,
          admissionNumber: student.id.substring(0, 8),
          attendance: {
            present: presentDays,
            absent: absentDays,
            total: totalDays,
            percentage: parseFloat(percentage.toFixed(2))
          }
        };
      });
    },
    enabled: students.length > 0
  });

  const isLoading = isLoadingStudents || isLoadingAttendance;

  if (isLoading) {
    return <div className="text-center py-8">Loading student attendance data...</div>;
  }

  if (!attendanceRecords || attendanceRecords.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {students.length > 0 
          ? "No attendance records found for the selected students." 
          : "No students found in the database."}
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Student Attendance Records</h2>
          <AttendanceDateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
        </div>
      </div>

      <div className="mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Present Days</TableHead>
              <TableHead>Absent Days</TableHead>
              <TableHead>Attendance %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendanceRecords.map((record) => (
              <StudentAttendanceRecord key={record.studentId} record={record} />
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
