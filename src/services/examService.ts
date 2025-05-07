import { supabase } from "@/integrations/supabase/client";
import { StudentExamResult } from "@/types/exam";

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

export const getAllExams = async () => {
  const { data, error } = await supabase
    .from('exams')
    .select(`
      *,
      subjects (
        name,
        code
      )
    `)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching exams:', error);
    throw error;
  }

  return data;
};

export const getExamById = async (examId: string) => {
  const { data, error } = await supabase
    .from('exams')
    .select(`
      *,
      subjects (
        name,
        code
      )
    `)
    .eq('id', examId)
    .single();

  if (error) {
    console.error('Error fetching exam by ID:', error);
    throw error;
  }

  return data;
};

export const createExam = async (examData: {
  name: string;
  date: string;
  max_score: number;
  subject_id?: string;
}) => {
  console.log("Creating exam with data:", examData);
  
  const { data, error } = await supabase
    .from('exams')
    .insert(examData)
    .select();

  if (error) {
    console.error('Error creating exam:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    throw new Error("No data returned from exam creation");
  }

  console.log("Created exam data:", data);
  return data[0];
};

export const updateExam = async (
  examId: string,
  examData: {
    name: string;
    date: string;
    max_score: number;
    subject_id?: string;
  }
) => {
  console.log("Updating exam with ID:", examId, "Data:", examData);
  
  const { data, error } = await supabase
    .from('exams')
    .update(examData)
    .eq('id', examId)
    .select();

  if (error) {
    console.error('Error updating exam:', error);
    throw error;
  }

  return data?.[0];
};

export const assignExamToSections = async (
  examId: string,
  sectionIds: string[],
  academicYearId: string
) => {
  console.log("Assigning exam to sections:", {examId, sectionIds, academicYearId});
  
  if (!examId || !sectionIds.length || !academicYearId) {
    console.error("Missing required parameters for exam assignment");
    throw new Error("Missing required parameters for exam assignment");
  }
  
  // Create an array of assignment objects
  const assignments = sectionIds.map(sectionId => ({
    exam_id: examId,
    section_id: sectionId,
    academic_year_id: academicYearId
  }));

  console.log("Preparing to insert assignments:", assignments);

  // Get current user information - RLS no longer needed since we disabled it
  const { data: userData } = await supabase.auth.getUser();
  console.log("Current user:", userData?.user?.id);

  try {
    const { data, error } = await supabase
      .from('exam_assignments')
      .insert(assignments)
      .select();

    if (error) {
      console.error('Error assigning exam to sections:', error);
      throw error;
    }

    console.log("Successfully created assignments:", data);
    return data;
  } catch (error) {
    console.error('Error in assignExamToSections:', error);
    console.error('Request details:', { examId, sectionIds, academicYearId });
    throw error;
  }
};

export const getExamAssignments = async (examId: string) => {
  console.log("Fetching assignments for exam:", examId);
  try {
    const { data, error } = await supabase
      .from('exam_assignments')
      .select(`
        *,
        sections (
          id,
          name,
          class_id
        ),
        academic_years (
          id,
          name
        )
      `)
      .eq('exam_id', examId);

    if (error) {
      console.error('Error fetching exam assignments:', error);
      throw error;
    }

    console.log("Retrieved exam assignments:", data);
    return data;
  } catch (error) {
    console.error('Error in getExamAssignments:', error);
    throw error;
  }
};

export const getExamsForSection = async (sectionId: string, academicYearId: string) => {
  const { data, error } = await supabase
    .from('exam_assignments')
    .select(`
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
    .eq('section_id', sectionId)
    .eq('academic_year_id', academicYearId);

  if (error) {
    console.error('Error fetching exams for section:', error);
    throw error;
  }

  return data.map(item => item.exams);
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

  // Add updated_by field
  const { data: userData } = await supabase.auth.getUser();
  const dataWithUser = {
    ...resultData,
    updated_by: userData.user?.id
  };

  let result;
  
  if (existingResult) {
    // Update existing result
    const { data, error } = await supabase
      .from('student_exam_results')
      .update(dataWithUser)
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
      .insert(dataWithUser)
      .select();

    if (error) {
      console.error('Error inserting student exam result:', error);
      throw error;
    }
    
    result = data[0];
  }

  return result;
};

export const deleteExam = async (examId: string) => {
  // This will also delete related assignments and results due to CASCADE
  const { error } = await supabase
    .from('exams')
    .delete()
    .eq('id', examId);

  if (error) {
    console.error('Error deleting exam:', error);
    throw error;
  }

  return true;
};

export const bulkSaveStudentExamResults = async (results: {
  exam_id: string;
  student_id: string;
  marks_obtained: number;
  feedback?: string;
}[]) => {
  // Add updated_by field to all results
  const { data: userData } = await supabase.auth.getUser();
  const dataWithUser = results.map(result => ({
    ...result,
    updated_by: userData.user?.id
  }));

  // For each result, upsert (update if exists, insert if not)
  const promises = dataWithUser.map(async (result) => {
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
          feedback: result.feedback,
          updated_by: result.updated_by
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
