
import { Section } from '@/types/section';

// Mock data for sections
const mockSections: Section[] = [
  {
    id: '1',
    name: 'Section A',
    classId: '1',
    academicYearId: '1',
    teacherId: '1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '2',
    name: 'Section B',
    classId: '1',
    academicYearId: '1',
    teacherId: '2',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '3',
    name: 'Section A',
    classId: '2',
    academicYearId: '1',
    teacherId: '3',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
];

// Service methods
export const sectionService = {
  getSections: async (): Promise<Section[]> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockSections]), 500);
    });
  },
  
  getSectionsByClassAndYear: async (classId: string, academicYearId: string): Promise<Section[]> => {
    // Simulate API call
    return new Promise((resolve) => {
      const sections = mockSections.filter(s => s.classId === classId && s.academicYearId === academicYearId);
      setTimeout(() => resolve([...sections]), 300);
    });
  },
  
  getSectionById: async (id: string): Promise<Section | undefined> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockSections.find(s => s.id === id)), 300);
    });
  },
  
  createSection: async (sectionData: Omit<Section, 'id' | 'createdAt' | 'updatedAt'>): Promise<Section> => {
    // Simulate API call
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
    // Simulate API call
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
    // Simulate API call
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
