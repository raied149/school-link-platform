
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
    .select('*')
    .eq('exam_id', examId)
    .in('student_id', studentIds);

  if (error) {
    console.error('Error fetching student exam results:', error);
    throw error;
  }

  console.log("Retrieved student results:", results);

  // Combine student data with their results
  return students.map(student => {
    const result = results?.find(r => r.student_id === student.id);
    return {
      student,
      result: result || null
    };
  });
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

  // Remove updated_by field - no longer using authenticated user
  const dataToSave = {
    ...resultData
  };

  let result;
  
  if (existingResult) {
    // Update existing result
    const { data, error } = await supabase
      .from('student_exam_results')
      .update(dataToSave)
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
      .insert(dataToSave)
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
  // Remove updated_by field from all results
  const dataToSave = results.map(result => ({
    ...result
  }));

  // For each result, upsert (update if exists, insert if not)
  const promises = dataToSave.map(async (result) => {
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
          feedback: result.feedback
        })
        .eq('id', existingResult.id);
    } else {
      return supabase
        .from('student_exam_results')
        .insert(result);
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
