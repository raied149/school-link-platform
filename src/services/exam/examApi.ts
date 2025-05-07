
import { supabase } from "@/integrations/supabase/client";

// Core exam CRUD operations
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
