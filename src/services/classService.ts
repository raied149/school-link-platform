import { Class } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { mockClasses } from '@/mocks/data';

// Service methods
export const classService = {
  getClasses: async (): Promise<Class[]> => {
    try {
      console.log("Fetching all classes");
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('name');
      
      if (error) {
        console.error("Error fetching classes:", error);
        // Fall back to mock data if there's an error
        return [...mockClasses];
      }
      
      // Map to our Class type
      return data.map(cls => ({
        id: cls.id,
        name: cls.name,
        level: 0, // Default value as it's not in the DB schema
        academicYearId: cls.year_id,
        createdAt: cls.created_at,
        updatedAt: cls.created_at
      }));
    } catch (error) {
      console.error("Exception in getClasses:", error);
      return [...mockClasses];
    }
  },
  
  getClassesByYear: async (yearId: string): Promise<Class[]> => {
    try {
      console.log("Fetching classes for year:", yearId);
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('year_id', yearId)
        .order('name');
      
      if (error) {
        console.error("Error fetching classes by year:", error);
        // Fall back to mock data if there's an error
        return mockClasses.filter(c => c.academicYearId === yearId);
      }
      
      // Map to our Class type
      return data.map(cls => ({
        id: cls.id,
        name: cls.name,
        level: 0, // Default value as it's not in the DB schema
        academicYearId: cls.year_id,
        createdAt: cls.created_at,
        updatedAt: cls.created_at
      }));
    } catch (error) {
      console.error("Exception in getClassesByYear:", error);
      return mockClasses.filter(c => c.academicYearId === yearId);
    }
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
        academicYearId: classData.academicYearId || "default",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      mockClasses.push(newClass as any);
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
