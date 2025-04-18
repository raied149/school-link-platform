
import { supabase } from "@/integrations/supabase/client";

export const getStudentExams = async (studentId: string) => {
  const { data, error } = await supabase
    .from('exam_results')
    .select(`
      score,
      exams (
        name,
        date,
        max_score,
        subjects (
          name,
          code
        )
      )
    `)
    .eq('student_id', studentId);

  if (error) {
    console.error('Error fetching student exams:', error);
    throw error;
  }

  return data;
};
