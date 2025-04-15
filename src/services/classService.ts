
import { Class } from '@/types';
import { mockClasses } from '@/mocks/data';

// Service methods
export const classService = {
  getClasses: async (): Promise<Class[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockClasses]), 500);
    });
  },
  
  getClassesByYear: async (yearId: string): Promise<Class[]> => {
    return new Promise((resolve) => {
      const classes = mockClasses.filter(c => c.academicYearId === yearId);
      setTimeout(() => resolve([...classes]), 300);
    });
  },
  
  getClassById: async (id: string): Promise<Class | undefined> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockClasses.find(c => c.id === id)), 300);
    });
  },
  
  createClass: async (classData: Omit<Class, 'id' | 'createdAt' | 'updatedAt'>): Promise<Class> => {
    return new Promise((resolve) => {
      const newClass: Class = {
        id: Date.now().toString(),
        ...classData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      mockClasses.push(newClass);
      setTimeout(() => resolve(newClass), 500);
    });
  },
  
  updateClass: async (id: string, classData: Partial<Omit<Class, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Class | undefined> => {
    return new Promise((resolve) => {
      const index = mockClasses.findIndex(c => c.id === id);
      if (index !== -1) {
        const updatedClass = {
          ...mockClasses[index],
          ...classData,
          updatedAt: new Date().toISOString()
        };
        mockClasses[index] = updatedClass;
        setTimeout(() => resolve(updatedClass), 500);
      } else {
        setTimeout(() => resolve(undefined), 500);
      }
    });
  },
  
  deleteClass: async (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const index = mockClasses.findIndex(c => c.id === id);
      if (index !== -1) {
        mockClasses.splice(index, 1);
        setTimeout(() => resolve(true), 500);
      } else {
        setTimeout(() => resolve(false), 500);
      }
    });
  }
};
