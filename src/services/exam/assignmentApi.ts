
import { supabase } from "@/integrations/supabase/client";

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
