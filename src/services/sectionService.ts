
import { Section } from '@/types/section';
import { mockSections } from '@/mocks/data';

// Service methods
export const sectionService = {
  getSections: async (): Promise<Section[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockSections]), 500);
    });
  },
  
  getSectionsByClassAndYear: async (classId: string, academicYearId: string): Promise<Section[]> => {
    return new Promise((resolve) => {
      const sections = mockSections.filter(s => 
        s.classId === classId && s.academicYearId === academicYearId
      );
      setTimeout(() => resolve([...sections]), 300);
    });
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
