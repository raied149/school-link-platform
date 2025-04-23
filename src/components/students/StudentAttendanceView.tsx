
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { supabase } from "@/integrations/supabase/client";
import { AttendanceDateRangePicker } from "./AttendanceDateRangePicker";
import { StudentAttendanceRecord } from "./StudentAttendanceRecord";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface StudentAttendanceViewProps {
  classId?: string;
  sectionId?: string;
  studentId?: string;
}

interface AttendanceRecord {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  attendanceRecord?: {
    id: string;
    date: string;
    status: string;
  };
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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  // Fetch students for this section
  const { data: students = [], isLoading: isLoadingStudents } = useQuery({
    queryKey: ['section-students-for-attendance', sectionId],
    queryFn: async () => {
      if (!sectionId) return [];
      
      // First get student IDs from student_sections table
      const { data: studentSections, error: sectionsError } = await supabase
        .from('student_sections')
        .select('student_id')
        .eq('section_id', sectionId);
        
      if (sectionsError) {
        console.error("Error fetching student sections:", sectionsError);
        throw sectionsError;
      }
      
      if (!studentSections || studentSections.length === 0) {
        console.log("No students assigned to this section");
        return [];
      }
      
      const studentIds = studentSections.map(row => row.student_id);
      
      // Then get actual student details from profiles table
      const { data: studentsData, error: studentsError } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          email,
          role,
          student_details (*)
        `)
        .in('id', studentIds)
        .eq('role', 'student');
        
      if (studentsError) {
        console.error("Error fetching student profiles:", studentsError);
        throw studentsError;
      }
      
      return studentsData || [];
    },
    enabled: !!sectionId
  });

  // Format current date to string for Supabase query
  const currentDate = dateRange?.from 
    ? format(dateRange.from, 'yyyy-MM-dd') 
    : format(new Date(), 'yyyy-MM-dd');
  
  // Fetch today's attendance records
  const { data: attendanceRecords = [], isLoading: isLoadingAttendance } = useQuery({
    queryKey: ['attendance-records', sectionId, currentDate],
    queryFn: async () => {
      if (!sectionId) return [];
      
      const { data, error } = await supabase
        .from('student_attendance')
        .select('*')
        .eq('section_id', sectionId)
        .eq('date', currentDate);
        
      if (error) {
        console.error("Error fetching attendance records:", error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!sectionId
  });

  // Fetch historical attendance data for percentage calculation
  const { data: attendanceStats = [], isLoading: isLoadingStats } = useQuery({
    queryKey: ['attendance-stats', sectionId],
    queryFn: async () => {
      if (!sectionId) return [];
      
      const { data, error } = await supabase
        .from('student_attendance')
        .select('student_id, status')
        .eq('section_id', sectionId);
        
      if (error) {
        console.error("Error fetching attendance stats:", error);
        throw error;
      }
      
      // Calculate attendance statistics
      const stats: Record<string, {present: number, absent: number, total: number}> = {};
      
      (data || []).forEach(record => {
        if (!stats[record.student_id]) {
          stats[record.student_id] = { present: 0, absent: 0, total: 0 };
        }
        
        stats[record.student_id].total += 1;
        
        if (record.status === 'present') {
          stats[record.student_id].present += 1;
        } else if (record.status === 'absent') {
          stats[record.student_id].absent += 1;
        }
      });
      
      return stats;
    },
    enabled: !!sectionId
  });

  // Mark attendance mutation
  const markAttendanceMutation = useMutation({
    mutationFn: async ({ studentId, status }: { studentId: string, status: string }) => {
      setLoading(prev => ({ ...prev, [studentId]: true }));
      
      // Check if attendance record already exists for this student on this date
      const { data: existingRecord, error: checkError } = await supabase
        .from('student_attendance')
        .select('id')
        .eq('student_id', studentId)
        .eq('section_id', sectionId!)
        .eq('date', currentDate)
        .maybeSingle();
        
      if (checkError) {
        throw checkError;
      }
      
      if (existingRecord) {
        // Update existing record
        const { error } = await supabase
          .from('student_attendance')
          .update({ status })
          .eq('id', existingRecord.id);
          
        if (error) throw error;
        
        return { id: existingRecord.id, status };
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('student_attendance')
          .insert({
            student_id: studentId,
            section_id: sectionId!,
            date: currentDate,
            status
          })
          .select()
          .single();
          
        if (error) throw error;
        
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['attendance-records', sectionId, currentDate] 
      });
      queryClient.invalidateQueries({
        queryKey: ['attendance-stats', sectionId]
      });
    },
    onSettled: (_, __, variables) => {
      setLoading(prev => ({ ...prev, [variables.studentId]: false }));
    }
  });

  // Combine student data with attendance records
  const processedData: AttendanceRecord[] = students.map(student => {
    // Find today's attendance record for this student
    const attendanceRecord = attendanceRecords.find(
      record => record.student_id === student.id
    );
    
    // Get attendance statistics for this student
    const stats = attendanceStats[student.id] || { present: 0, absent: 0, total: 0 };
    const percentage = stats.total > 0 ? (stats.present / stats.total) * 100 : 0;
    
    return {
      studentId: student.id,
      studentName: `${student.first_name} ${student.last_name}`,
      admissionNumber: student.student_details?.admission_number || student.id.substring(0, 8),
      attendanceRecord: attendanceRecord ? {
        id: attendanceRecord.id,
        date: attendanceRecord.date,
        status: attendanceRecord.status
      } : undefined,
      attendance: {
        present: stats.present,
        absent: stats.absent,
        total: stats.total,
        percentage: parseFloat(percentage.toFixed(2))
      }
    };
  });

  // Handler for marking attendance
  const handleMarkAttendance = (studentId: string, status: string) => {
    markAttendanceMutation.mutate({ studentId, status });
    
    toast({
      title: "Attendance marked",
      description: `Student marked as ${status}`
    });
  };

  const isLoading = isLoadingStudents || isLoadingAttendance || isLoadingStats;

  if (isLoading) {
    return <div className="text-center py-8">Loading student attendance data...</div>;
  }

  if (!students || students.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No students found in this section.
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Student Attendance Records</h2>
            <p className="text-muted-foreground">
              {dateRange?.from ? format(dateRange.from, 'MMMM d, yyyy') : 'Today'}
            </p>
          </div>
          <AttendanceDateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
        </div>
      </div>

      <div className="mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Today's Status</TableHead>
              <TableHead>Overall Attendance</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedData.map((record) => (
              <TableRow key={record.studentId}>
                <TableCell>{record.admissionNumber}</TableCell>
                <TableCell>{record.studentName}</TableCell>
                <TableCell>
                  {record.attendanceRecord ? (
                    <Badge className={
                      record.attendanceRecord.status === 'present' ? 'bg-green-100 text-green-800' : 
                      record.attendanceRecord.status === 'absent' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }>
                      {record.attendanceRecord.status}
                    </Badge>
                  ) : (
                    <Badge variant="outline">Not marked</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{record.attendance.percentage}%</span>
                    <span className="text-xs text-muted-foreground">
                      {record.attendance.present} present / {record.attendance.absent} absent
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                      onClick={() => handleMarkAttendance(record.studentId, 'present')}
                      disabled={loading[record.studentId]}
                    >
                      Present
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                      onClick={() => handleMarkAttendance(record.studentId, 'absent')}
                      disabled={loading[record.studentId]}
                    >
                      Absent
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
