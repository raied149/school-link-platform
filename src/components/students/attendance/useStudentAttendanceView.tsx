
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSubjectAttendance } from "@/hooks/useSubjectAttendance";

export function useStudentAttendanceView(
  classId?: string,
  sectionId?: string,
  studentId?: string
) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const {
    sectionSubjects,
    attendanceRecords,
    isLoading,
    markAttendance
  } = useSubjectAttendance(sectionId, selectedDate);

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

  return {
    selectedDate,
    setSelectedDate,
    selectedSubject,
    setSelectedSubject,
    loading,
    sectionSubjects,
    students,
    filteredAttendanceRecords,
    handleMarkAttendance,
    isLoadingCombined
  };
}
