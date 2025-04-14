
import { AcademicYear } from '@/types/academic-year';

// Mock data for academic years
const mockAcademicYears: AcademicYear[] = [
  {
    id: '1',
    name: '2023-2024',
    startDate: '2023-08-15',
    endDate: '2024-05-31',
    isActive: true,
    createdAt: '2023-06-01',
    updatedAt: '2023-06-01'
  },
  {
    id: '2',
    name: '2022-2023',
    startDate: '2022-08-16',
    endDate: '2023-05-30',
    isActive: false,
    createdAt: '2022-06-01',
    updatedAt: '2022-06-01'
  },
  {
    id: '3',
    name: '2021-2022',
    startDate: '2021-08-17',
    endDate: '2022-05-29',
    isActive: false,
    createdAt: '2021-06-01',
    updatedAt: '2021-06-01'
  }
];

// Service methods
export const academicYearService = {
  getAcademicYears: async (): Promise<AcademicYear[]> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockAcademicYears]), 500);
    });
  },
  
  getAcademicYearById: async (id: string): Promise<AcademicYear | undefined> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockAcademicYears.find(y => y.id === id)), 300);
    });
  },
  
  createAcademicYear: async (yearData: Omit<AcademicYear, 'id' | 'createdAt' | 'updatedAt'>): Promise<AcademicYear> => {
    // Simulate API call
    return new Promise((resolve) => {
      const newYear: AcademicYear = {
        id: Date.now().toString(),
        ...yearData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // If this year is active, deactivate others
      if (newYear.isActive) {
        mockAcademicYears.forEach(y => {
          if (y.id !== newYear.id) {
            y.isActive = false;
          }
        });
      }
      
      mockAcademicYears.push(newYear);
      setTimeout(() => resolve(newYear), 500);
    });
  },
  
  updateAcademicYear: async (id: string, yearData: Partial<Omit<AcademicYear, 'id' | 'createdAt' | 'updatedAt'>>): Promise<AcademicYear | undefined> => {
    // Simulate API call
    return new Promise((resolve) => {
      const index = mockAcademicYears.findIndex(y => y.id === id);
      if (index !== -1) {
        const updatedYear = {
          ...mockAcademicYears[index],
          ...yearData,
          updatedAt: new Date().toISOString()
        };
        
        // If this year is being set to active, deactivate others
        if (yearData.isActive === true) {
          mockAcademicYears.forEach(y => {
            if (y.id !== id) {
              y.isActive = false;
            }
          });
        }
        
        mockAcademicYears[index] = updatedYear;
        setTimeout(() => resolve(updatedYear), 500);
      } else {
        setTimeout(() => resolve(undefined), 500);
      }
    });
  },
  
  deleteAcademicYear: async (id: string): Promise<boolean> => {
    // Simulate API call
    return new Promise((resolve) => {
      const index = mockAcademicYears.findIndex(y => y.id === id);
      if (index !== -1) {
        // Prevent deletion of active year
        if (mockAcademicYears[index].isActive) {
          setTimeout(() => resolve(false), 500);
          return;
        }
        
        mockAcademicYears.splice(index, 1);
        setTimeout(() => resolve(true), 500);
      } else {
        setTimeout(() => resolve(false), 500);
      }
    });
  }
};
