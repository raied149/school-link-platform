
import { Class } from '@/types';

// Mock data for classes
const mockClasses: Class[] = [
  {
    id: '1',
    name: 'Grade 1',
    level: 1,
    description: 'First grade elementary class',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '2',
    name: 'Grade 2',
    level: 2,
    description: 'Second grade elementary class',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '3',
    name: 'Grade 3',
    level: 3,
    description: 'Third grade elementary class',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '4',
    name: 'Grade 4',
    level: 4,
    description: 'Fourth grade elementary class',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '5',
    name: 'Grade 5',
    level: 5,
    description: 'Fifth grade elementary class',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
];

// Service methods
export const classService = {
  getClasses: async (): Promise<Class[]> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockClasses]), 500);
    });
  },
  
  getClassById: async (id: string): Promise<Class | undefined> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockClasses.find(c => c.id === id)), 300);
    });
  },
  
  createClass: async (classData: Omit<Class, 'id' | 'createdAt' | 'updatedAt'>): Promise<Class> => {
    // Simulate API call
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
    // Simulate API call
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
    // Simulate API call
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
