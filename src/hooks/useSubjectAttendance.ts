
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export const useSubjectAttendance = (sectionId?: string, date?: Date) => {
  const queryClient = useQueryClient();
  const formattedDate = date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');

  // Fetch subjects for the section
  const { data: sectionSubjects = [] } = useQuery({
    queryKey: ['section-subjects', sectionId],
    queryFn: async () => {
      if (!sectionId) return [];
      
      // Get class_id for this section
      const { data: sectionData, error: sectionError } = await supabase
        .from('sections')
        .select('class_id')
        .eq('id', sectionId)
        .single();
      
      if (sectionError) throw sectionError;
      
      if (!sectionData?.class_id) return [];
      
      // Get subjects for this class
      const { data: subjectClasses, error: subjectsError } = await supabase
        .from('subject_classes')
        .select(`
          subject_id,
          subjects (
            id,
            name,
            code
          )
        `)
        .eq('class_id', sectionData.class_id);
      
      if (subjectsError) throw subjectsError;
      
      // Extract unique subjects
      const uniqueSubjects = Array.from(
        new Map(subjectClasses.map(item => 
          [item.subject_id, item.subjects]
        )).values()
      );
      
      return uniqueSubjects;
    },
    enabled: !!sectionId
  });

  // Fetch attendance records for the section
  const { data: attendanceRecords = [], isLoading } = useQuery({
    queryKey: ['subject-attendance', sectionId, formattedDate],
    queryFn: async () => {
      if (!sectionId) return [];
      
      const { data, error } = await supabase
        .from('student_attendance')
        .select(`
          *,
          subjects (
            id,
            name,
            code
          )
        `)
        .eq('section_id', sectionId)
        .eq('date', formattedDate);

      if (error) throw error;
      return data;
    },
    enabled: !!sectionId
  });

  // Mark attendance mutation
  const markAttendanceMutation = useMutation({
    mutationFn: async ({ 
      studentId, 
      status, 
      subjectId 
    }: { 
      studentId: string; 
      status: string; 
      subjectId: string;
    }) => {
      // Check for existing record
      const { data: existingRecord } = await supabase
        .from('student_attendance')
        .select('id')
        .eq('student_id', studentId)
        .eq('section_id', sectionId)
        .eq('date', formattedDate)
        .eq('subject_id', subjectId)
        .maybeSingle();

      if (existingRecord) {
        // Update existing record
        const { data, error } = await supabase
          .from('student_attendance')
          .update({ status })
          .eq('id', existingRecord.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('student_attendance')
          .insert({
            student_id: studentId,
            section_id: sectionId,
            date: formattedDate,
            status,
            subject_id: subjectId
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['subject-attendance', sectionId, formattedDate] 
      });
    }
  });

  return {
    sectionSubjects,
    attendanceRecords,
    isLoading,
    markAttendance: markAttendanceMutation.mutate
  };
};
