
import { Subject } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const subjectService = {
  getSubjects: async (): Promise<Subject[]> => {
    try {
      console.log("Fetching all subjects");
      const { data, error } = await supabase
        .from('subjects')
        .select('*');
      
      if (error) {
        console.error("Error fetching subjects:", error);
        throw error;
      }
      
      console.log("Subjects data:", data);
      
      // Map to our Subject type
      return (data || []).map(subject => ({
        id: subject.id,
        name: subject.name,
        code: subject.code,
        description: '',
        credits: 0,
        classIds: [],
        createdAt: subject.created_at,
        updatedAt: subject.created_at
      }));
    } catch (error) {
      console.error("Error in getSubjects:", error);
      // Return mock data as fallback
      return [
        {
          id: '1',
          name: 'Mathematics',
          code: 'MATH101',
          description: 'Basic mathematics including algebra and geometry',
          credits: 5,
          classIds: ['1', '2'],
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
        },
        {
          id: '2',
          name: 'Science',
          code: 'SCI101',
          description: 'General science covering physics, chemistry, and biology',
          credits: 4,
          classIds: ['1', '2'],
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
        },
        {
          id: '3',
          name: 'English',
          code: 'ENG101',
          description: 'English language and literature',
          credits: 3,
          classIds: ['1', '2', '3'],
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
        },
      ];
    }
  },

  getSubjectsByClass: async (classId: string): Promise<Subject[]> => {
    try {
      console.log("Fetching subjects for class:", classId);
      // First get subject_ids related to this class from subject_classes
      const { data: subjectClasses, error: classError } = await supabase
        .from('subject_classes')
        .select('subject_id')
        .eq('class_id', classId);
      
      if (classError) {
        console.error("Error fetching subject classes:", classError);
        throw classError;
      }
      
      console.log("Subject classes data:", subjectClasses);
      
      if (!subjectClasses || subjectClasses.length === 0) {
        return [];
      }
      
      const subjectIds = subjectClasses.map(sc => sc.subject_id);
      
      // Then fetch the actual subject details
      const { data: subjects, error: subjectError } = await supabase
        .from('subjects')
        .select('*')
        .in('id', subjectIds);
      
      if (subjectError) {
        console.error("Error fetching subjects:", subjectError);
        throw subjectError;
      }
      
      console.log("Subjects data:", subjects);
      
      // Map to our Subject type
      return (subjects || []).map(subject => ({
        id: subject.id,
        name: subject.name,
        code: subject.code,
        description: '',
        credits: 0,
        classIds: [classId],
        createdAt: subject.created_at,
        updatedAt: subject.created_at
      }));
    } catch (error) {
      console.error("Error in getSubjectsByClass:", error);
      return [];
    }
  },

  getSubjectById: async (id: string): Promise<Subject | undefined> => {
    try {
      console.log("Fetching subject by id:", id);
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error("Error fetching subject:", error);
        throw error;
      }
      
      console.log("Subject data:", data);
      
      if (!data) return undefined;
      
      // Map to our Subject type
      return {
        id: data.id,
        name: data.name,
        code: data.code,
        description: '',
        credits: 0,
        classIds: [],
        createdAt: data.created_at,
        updatedAt: data.created_at
      };
    } catch (error) {
      console.error("Error in getSubjectById:", error);
      return undefined;
    }
  },

  createSubject: async (subjectData: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subject> => {
    return {
      id: Date.now().toString(),
      ...subjectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },

  updateSubject: async (id: string, subjectData: Partial<Subject>): Promise<Subject | undefined> => {
    return undefined;
  },

  deleteSubject: async (id: string): Promise<boolean> => {
    return false;
  }
};
