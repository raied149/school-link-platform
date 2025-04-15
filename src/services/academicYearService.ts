
import { AcademicYear } from "@/types/academic-year";
import { mockAcademicYears } from "@/mocks/data";

export const academicYearService = {
  getAcademicYears: async (): Promise<AcademicYear[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockAcademicYears]), 500);
    });
  },
  
  getAcademicYearById: async (id: string): Promise<AcademicYear | undefined> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockAcademicYears.find(year => year.id === id)), 300);
    });
  },
  
  createAcademicYear: async (yearData: Omit<AcademicYear, 'id' | 'createdAt' | 'updatedAt'>): Promise<AcademicYear> => {
    return new Promise((resolve) => {
      const newYear: AcademicYear = {
        id: Date.now().toString(),
        ...yearData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      mockAcademicYears.push(newYear);
      setTimeout(() => resolve(newYear), 500);
    });
  },
  
  updateAcademicYear: async (id: string, yearData: Partial<Omit<AcademicYear, 'id' | 'createdAt' | 'updatedAt'>>): Promise<AcademicYear | undefined> => {
    return new Promise((resolve) => {
      const index = mockAcademicYears.findIndex(year => year.id === id);
      if (index !== -1) {
        const updatedYear = {
          ...mockAcademicYears[index],
          ...yearData,
          updatedAt: new Date().toISOString()
        };
        mockAcademicYears[index] = updatedYear;
        setTimeout(() => resolve(updatedYear), 500);
      } else {
        setTimeout(() => resolve(undefined), 500);
      }
    });
  },
  
  deleteAcademicYear: async (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const index = mockAcademicYears.findIndex(year => year.id === id);
      if (index !== -1) {
        mockAcademicYears.splice(index, 1);
        setTimeout(() => resolve(true), 500);
      } else {
        setTimeout(() => resolve(false), 500);
      }
    });
  }
};
