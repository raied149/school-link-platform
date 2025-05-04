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
