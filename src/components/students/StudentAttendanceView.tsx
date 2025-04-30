
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubjectAttendance } from "@/hooks/useSubjectAttendance";
import { SubjectFilter } from "@/components/attendance/SubjectFilter";

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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const {
    sectionSubjects,
    attendanceRecords,
    isLoading,
    markAttendance
  } = useSubjectAttendance(sectionId, selectedDate);

  // Format current date to string for Supabase query
  const formattedDate = format(selectedDate, 'yyyy-MM-dd');
  
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

  // Filter attendance records by subject
  const filteredAttendanceRecords = attendanceRecords.filter(record => 
    selectedSubject === "all" || record.subject_id === selectedSubject
  );

  const handleMarkAttendance = (studentId: string, status: string, subjectId: string) => {
    setLoading(prev => ({ ...prev, [`${studentId}-${subjectId}`]: true }));
    
    markAttendance(
      { studentId, status, subjectId },
      {
        onSettled: () => {
          setLoading(prev => ({ ...prev, [`${studentId}-${subjectId}`]: false }));
        }
      }
    );
  };

  const isLoadingCombined = isLoadingStudents || isLoading || isLoadingStats;

  if (isLoadingCombined) {
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
              {format(selectedDate, 'MMMM d, yyyy')}
            </p>
          </div>
          <div className="flex gap-4">
            <SubjectFilter
              subjects={sectionSubjects}
              selectedSubject={selectedSubject}
              onSubjectChange={setSelectedSubject}
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, 'MMMM d, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              sectionSubjects.map((subject) => {
                const attendanceRecord = filteredAttendanceRecords.find(
                  record => record.student_id === student.id && record.subject_id === subject.id
                );

                return (
                  <TableRow key={`${student.id}-${subject.id}`}>
                    <TableCell>{student.id.substring(0, 8)}</TableCell>
                    <TableCell>{student.first_name} {student.last_name}</TableCell>
                    <TableCell>{subject.name} ({subject.code})</TableCell>
                    <TableCell>
                      {attendanceRecord ? (
                        <Badge className={
                          attendanceRecord.status === 'present' ? 'bg-green-100 text-green-800' : 
                          attendanceRecord.status === 'absent' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }>
                          {attendanceRecord.status}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Not marked</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                          onClick={() => handleMarkAttendance(student.id, 'present', subject.id)}
                          disabled={loading[`${student.id}-${subject.id}`]}
                        >
                          Present
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                          onClick={() => handleMarkAttendance(student.id, 'absent', subject.id)}
                          disabled={loading[`${student.id}-${subject.id}`]}
                        >
                          Absent
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
