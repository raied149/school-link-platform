
import { supabase } from "@/integrations/supabase/client";

export const getStudentExams = async (studentId: string) => {
  console.log("Fetching exams for student:", studentId);
  
  const { data, error } = await supabase
    .from('exam_results')
    .select(`
      score,
      exams (
        id,
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

export const getStudentsInSection = async (sectionId: string) => {
  // Skip if sectionId is "all-sections"
  if (sectionId === "all-sections") {
    return [];
  }

  const { data, error } = await supabase
    .from('student_sections')
    .select(`
      student_id,
      profiles:student_id (
        id,
        first_name,
        last_name,
        email,
        student_details (*)
      )
    `)
    .eq('section_id', sectionId);

  if (error) {
    console.error('Error fetching students in section:', error);
    throw error;
  }

  return data.map(item => item.profiles);
};

export const getStudentExamResults = async (examId: string, sectionId: string) => {
  console.log("Fetching student results for exam:", examId, "section:", sectionId);
  // Skip if sectionId is "all-sections"
  if (sectionId === "all-sections") {
    return [];
  }

  // First get all students in the section
  const students = await getStudentsInSection(sectionId);
  
  // Then get all results for these students for the specified exam
  const studentIds = students.map(student => student.id);
  
  const { data: results, error } = await supabase
    .from('student_exam_results')
    .select(`
      *,
      student:student_id (
        id,
        first_name,
        last_name,
        student_details (*)
      )
    `)
    .eq('exam_id', examId)
    .in('student_id', studentIds);

  if (error) {
    console.error('Error fetching student exam results:', error);
    throw error;
  }

  console.log("Retrieved student results:", results);

  // Combine student data with their results
  return results || [];
};

export const saveStudentExamResult = async (resultData: {
  exam_id: string;
  student_id: string;
  marks_obtained: number;
  feedback?: string;
}) => {
  // Check if result already exists
  const { data: existingResult } = await supabase
    .from('student_exam_results')
    .select('id')
    .eq('exam_id', resultData.exam_id)
    .eq('student_id', resultData.student_id)
    .maybeSingle();

  let result;
  
  if (existingResult) {
    // Update existing result
    const { data, error } = await supabase
      .from('student_exam_results')
      .update({
        marks_obtained: resultData.marks_obtained,
        feedback: resultData.feedback || '',
        updated_at: new Date().toISOString()
      })
      .eq('id', existingResult.id)
      .select();

    if (error) {
      console.error('Error updating student exam result:', error);
      throw error;
    }
    
    result = data[0];
  } else {
    // Insert new result
    const { data, error } = await supabase
      .from('student_exam_results')
      .insert({
        exam_id: resultData.exam_id,
        student_id: resultData.student_id,
        marks_obtained: resultData.marks_obtained,
        feedback: resultData.feedback || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error inserting student exam result:', error);
      throw error;
    }
    
    result = data[0];
  }

  return result;
};

export const bulkSaveStudentExamResults = async (results: {
  exam_id: string;
  student_id: string;
  marks_obtained: number;
  feedback?: string;
}[]) => {
  // For each result, upsert (update if exists, insert if not)
  const promises = results.map(async (result) => {
    const { data: existingResult } = await supabase
      .from('student_exam_results')
      .select('id')
      .eq('exam_id', result.exam_id)
      .eq('student_id', result.student_id)
      .maybeSingle();

    if (existingResult) {
      return supabase
        .from('student_exam_results')
        .update({
          marks_obtained: result.marks_obtained,
          feedback: result.feedback || '',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingResult.id);
    } else {
      return supabase
        .from('student_exam_results')
        .insert({
          exam_id: result.exam_id,
          student_id: result.student_id,
          marks_obtained: result.marks_obtained,
          feedback: result.feedback || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    }
  });

  try {
    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error('Error bulk saving student exam results:', error);
    throw error;
  }
};
