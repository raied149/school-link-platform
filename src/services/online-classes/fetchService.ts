
import { supabase } from "@/integrations/supabase/client";
import { OnlineClass } from "./types";

// Fetch all online classes with related data
export const getAllClasses = async (): Promise<OnlineClass[]> => {
  try {
    const { data, error } = await supabase
      .from('online_classes')
      .select(`
        *,
        classes (
          id,
          name
        ),
        sections (
          id,
          name
        ),
        subjects (
          id,
          name
        ),
        profiles:created_by (
          id,
          first_name,
          last_name
        )
      `)
      .order('date', { ascending: true });

    if (error) {
      console.error("Error fetching online classes:", error);
      throw error;
    }

    console.log("Fetched online classes:", data);
    return data || [];
  } catch (error) {
    console.error("Error in getAllClasses:", error);
    throw error;
  }
};

// Fetch online classes for a specific teacher
export const getClassesForTeacher = async (teacherId: string): Promise<OnlineClass[]> => {
  try {
    const { data, error } = await supabase
      .from('online_classes')
      .select(`
        *,
        classes (
          id,
          name
        ),
        sections (
          id,
          name
        ),
        subjects (
          id,
          name
        ),
        profiles:created_by (
          id,
          first_name,
          last_name
        )
      `)
      .eq('created_by', teacherId)
      .order('date', { ascending: true });

    if (error) {
      console.error("Error fetching teacher's online classes:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error in getClassesForTeacher:", error);
    throw error;
  }
};

// Fetch online classes for a specific student
export const getClassesForStudent = async (studentId: string): Promise<OnlineClass[]> => {
  try {
    // First get the sections the student is enrolled in
    const { data: sectionData, error: sectionError } = await supabase
      .from('student_sections')
      .select('section_id')
      .eq('student_id', studentId);

    if (sectionError) {
      console.error("Error fetching student's sections:", sectionError);
      throw sectionError;
    }

    // If no sections found, return empty array
    if (!sectionData || sectionData.length === 0) {
      return [];
    }

    // Extract section IDs
    const sectionIds = sectionData.map(item => item.section_id);

    // Now get classes for these sections
    const { data, error } = await supabase
      .from('online_classes')
      .select(`
        *,
        classes (
          id,
          name
        ),
        sections (
          id,
          name
        ),
        subjects (
          id,
          name
        ),
        profiles:created_by (
          id,
          first_name,
          last_name
        )
      `)
      .in('section_id', sectionIds)
      .order('date', { ascending: true });

    if (error) {
      console.error("Error fetching student's online classes:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error in getClassesForStudent:", error);
    throw error;
  }
};

// Fetch a single online class by ID
export const getClassById = async (classId: string): Promise<OnlineClass | null> => {
  try {
    const { data, error } = await supabase
      .from('online_classes')
      .select(`
        *,
        classes (
          id,
          name
        ),
        sections (
          id,
          name
        ),
        subjects (
          id,
          name
        ),
        profiles:created_by (
          id,
          first_name,
          last_name
        )
      `)
      .eq('id', classId)
      .single();

    if (error) {
      console.error(`Error fetching online class with ID ${classId}:`, error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in getClassById:", error);
    throw error;
  }
};
