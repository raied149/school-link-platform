
import { Section } from '@/types/section';
import { supabase } from '@/integrations/supabase/client';
import { mockSections } from '@/mocks/data';

// Service methods
export const sectionService = {
  getSections: async (): Promise<Section[]> => {
    try {
      console.log("Fetching all sections");
      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .order('name');
      
      if (error) {
        console.error("Error fetching sections:", error);
        // Fall back to mock data if there's an error
        return [...mockSections];
      }
      
      // Map to our Section type
      return data.map(section => ({
        id: section.id,
        name: section.name,
        classId: section.class_id,
        academicYearId: "", // Not directly available in DB schema
        teacherId: section.teacher_id || undefined,
        createdAt: section.created_at,
        updatedAt: section.created_at
      }));
    } catch (error) {
      console.error("Exception in getSections:", error);
      return [...mockSections];
    }
  },
  
  getSectionsByClassAndYear: async (classId: string, academicYearId: string): Promise<Section[]> => {
    try {
      console.log(`Fetching sections for class: ${classId}`);
      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .eq('class_id', classId)
        .order('name');
      
      if (error) {
        console.error("Error fetching sections by class:", error);
        // Fall back to mock data if there's an error
        return mockSections.filter(s => 
          s.classId === classId && s.academicYearId === academicYearId
        );
      }
      
      // Map to our Section type
      return data.map(section => ({
        id: section.id,
        name: section.name,
        classId: section.class_id,
        academicYearId: academicYearId, // Using the provided parameter
        teacherId: section.teacher_id || undefined,
        createdAt: section.created_at,
        updatedAt: section.created_at
      }));
    } catch (error) {
      console.error("Exception in getSectionsByClassAndYear:", error);
      return mockSections.filter(s => 
        s.classId === classId && s.academicYearId === academicYearId
      );
    }
  },
  
  // New method to get sections for a student
  getSectionsForStudent: async (studentId: string, classId?: string): Promise<Section[]> => {
    try {
      console.log(`Fetching sections for student: ${studentId}`);
      
      // First get the section IDs that the student is assigned to
      let query = supabase.from('student_sections')
        .select('section_id')
        .eq('student_id', studentId);
      
      // If classId is provided, we also need to filter out sections that don't belong to this class
      if (classId) {
        // We can't directly filter by class_id in the student_sections table
        // So we'll need to get the data and filter it in a second step
        const { data: studentSections, error: studentSectionsError } = await query;
        
        if (studentSectionsError) {
          console.error("Error fetching student section assignments:", studentSectionsError);
          throw studentSectionsError;
        }
        
        const sectionIds = studentSections.map(row => row.section_id);
        
        if (sectionIds.length === 0) {
          return [];
        }
        
        // Now fetch the actual sections and filter by class_id
        const { data: sections, error: sectionsError } = await supabase
          .from('sections')
          .select('*')
          .in('id', sectionIds)
          .eq('class_id', classId);
        
        if (sectionsError) {
          console.error("Error fetching sections for student:", sectionsError);
          throw sectionsError;
        }
        
        return sections.map(section => ({
          id: section.id,
          name: section.name,
          classId: section.class_id,
          academicYearId: "", // Not available directly
          teacherId: section.teacher_id || undefined,
          createdAt: section.created_at,
          updatedAt: section.created_at
        }));
      } else {
        // If no classId is provided, we'll fetch all sections the student is assigned to
        const { data: studentSections, error: studentSectionsError } = await query;
        
        if (studentSectionsError) {
          console.error("Error fetching student section assignments:", studentSectionsError);
          throw studentSectionsError;
        }
        
        const sectionIds = studentSections.map(row => row.section_id);
        
        if (sectionIds.length === 0) {
          return [];
        }
        
        // Now fetch the actual sections
        const { data: sections, error: sectionsError } = await supabase
          .from('sections')
          .select('*')
          .in('id', sectionIds);
        
        if (sectionsError) {
          console.error("Error fetching sections for student:", sectionsError);
          throw sectionsError;
        }
        
        return sections.map(section => ({
          id: section.id,
          name: section.name,
          classId: section.class_id,
          academicYearId: "", // Not available directly
          teacherId: section.teacher_id || undefined,
          createdAt: section.created_at,
          updatedAt: section.created_at
        }));
      }
    } catch (error) {
      console.error("Exception in getSectionsForStudent:", error);
      return [];
    }
  },
  
  getSectionById: async (id: string): Promise<Section | undefined> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockSections.find(s => s.id === id)), 300);
    });
  },
  
  createSection: async (sectionData: Omit<Section, 'id' | 'createdAt' | 'updatedAt'>): Promise<Section> => {
    return new Promise((resolve) => {
      const newSection: Section = {
        id: Date.now().toString(),
        ...sectionData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      mockSections.push(newSection);
      setTimeout(() => resolve(newSection), 500);
    });
  },
  
  updateSection: async (id: string, sectionData: Partial<Omit<Section, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Section | undefined> => {
    return new Promise((resolve) => {
      const index = mockSections.findIndex(s => s.id === id);
      if (index !== -1) {
        const updatedSection = {
          ...mockSections[index],
          ...sectionData,
          updatedAt: new Date().toISOString()
        };
        mockSections[index] = updatedSection;
        setTimeout(() => resolve(updatedSection), 500);
      } else {
        setTimeout(() => resolve(undefined), 500);
      }
    });
  },
  
  deleteSection: async (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const index = mockSections.findIndex(s => s.id === id);
      if (index !== -1) {
        mockSections.splice(index, 1);
        setTimeout(() => resolve(true), 500);
      } else {
        setTimeout(() => resolve(false), 500);
      }
    });
  }
};
