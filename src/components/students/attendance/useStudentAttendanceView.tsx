
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSubjectAttendance } from "@/hooks/useSubjectAttendance";
import { format } from "date-fns";

export function useStudentAttendanceView(
  classId?: string,
  sectionId?: string,
  studentId?: string
) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const formattedDate = format(selectedDate, 'yyyy-MM-dd');

  const {
    sectionSubjects,
    attendanceRecords,
    isLoading,
    markAttendance
  } = useSubjectAttendance(sectionId, selectedDate);

  // Set default selected subject when subjects are loaded
  if (selectedSubject === "" && sectionSubjects.length > 0) {
    setSelectedSubject(sectionSubjects[0].id);
  }

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

  // Filter attendance records by the selected subject (if any)
  const filteredAttendanceRecords = attendanceRecords.filter(record => 
    !selectedSubject || record.subject_id === selectedSubject
  );

  const handleMarkAttendance = (studentId: string, status: string, subjectId: string) => {
    if (!subjectId) return;
    
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

  const isLoadingCombined = isLoadingStudents || isLoading || !selectedSubject;

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
