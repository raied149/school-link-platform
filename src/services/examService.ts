
import { supabase } from "@/integrations/supabase/client";

export const getStudentExams = async (studentId: string) => {
  console.log("Fetching exams for student:", studentId);
  
  const { data, error } = await supabase
    .from('exam_results')
    .select(`
      score,
      exams (
        name,
        date,
        max_score,
        subject_id,
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

  console.log("Retrieved exam results:", data);
  return data;
};
