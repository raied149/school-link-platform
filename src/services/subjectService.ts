
import { Subject } from '@/types';

// Mock subjects data
const mockSubjects: Subject[] = [
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

export const subjectService = {
  getSubjects: async (): Promise<Subject[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockSubjects]), 500);
    });
  },

  getSubjectsByClass: async (classId: string): Promise<Subject[]> => {
    return new Promise((resolve) => {
      const subjects = mockSubjects.filter(s => 
        s.classIds && s.classIds.includes(classId)
      );
      setTimeout(() => resolve([...subjects]), 300);
    });
  },

  getSubjectById: async (id: string): Promise<Subject | undefined> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockSubjects.find(s => s.id === id)), 300);
    });
  },

  createSubject: async (subjectData: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subject> => {
    return new Promise((resolve) => {
      const newSubject: Subject = {
        id: Date.now().toString(),
        ...subjectData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      mockSubjects.push(newSubject);
      setTimeout(() => resolve(newSubject), 500);
    });
  },

  updateSubject: async (id: string, subjectData: Partial<Subject>): Promise<Subject | undefined> => {
    return new Promise((resolve) => {
      const index = mockSubjects.findIndex(s => s.id === id);
      if (index !== -1) {
        const updatedSubject = {
          ...mockSubjects[index],
          ...subjectData,
          updatedAt: new Date().toISOString()
        };
        mockSubjects[index] = updatedSubject;
        setTimeout(() => resolve(updatedSubject), 500);
      } else {
        setTimeout(() => resolve(undefined), 500);
      }
    });
  },

  deleteSubject: async (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const index = mockSubjects.findIndex(s => s.id === id);
      if (index !== -1) {
        mockSubjects.splice(index, 1);
        setTimeout(() => resolve(true), 500);
      } else {
        setTimeout(() => resolve(false), 500);
      }
    });
  }
};
