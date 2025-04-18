
import { TimeSlot, TimetableFilter, WeekDay } from '@/types/timetable';
import { v4 as uuidv4 } from 'uuid';

const mockTimeSlots: TimeSlot[] = [
  {
    id: '1',
    startTime: '08:00',
    endTime: '09:00',
    subjectId: '1', // Mathematics
    teacherId: '1',
    dayOfWeek: 'Monday',
    classId: '1',
    sectionId: '1',
    academicYearId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    startTime: '09:00',
    endTime: '10:00',
    subjectId: '2', // Science
    teacherId: '2',
    dayOfWeek: 'Monday',
    classId: '1',
    sectionId: '1',
    academicYearId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    startTime: '10:15',
    endTime: '11:15',
    subjectId: '3', // English
    teacherId: '3',
    dayOfWeek: 'Monday',
    classId: '1',
    sectionId: '1',
    academicYearId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    startTime: '08:00',
    endTime: '09:00',
    subjectId: '1', // Mathematics
    teacherId: '1',
    dayOfWeek: 'Tuesday',
    classId: '1',
    sectionId: '1',
    academicYearId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Service methods
export const timetableService = {
  getTimeSlots: async (filter?: TimetableFilter): Promise<TimeSlot[]> => {
    return new Promise((resolve) => {
      let filteredSlots = [...mockTimeSlots];
      
      if (filter) {
        if (filter.dayOfWeek) {
          filteredSlots = filteredSlots.filter(slot => slot.dayOfWeek === filter.dayOfWeek);
        }
        
        if (filter.classId) {
          filteredSlots = filteredSlots.filter(slot => slot.classId === filter.classId);
        }
        
        if (filter.sectionId) {
          filteredSlots = filteredSlots.filter(slot => slot.sectionId === filter.sectionId);
        }
        
        if (filter.teacherId) {
          filteredSlots = filteredSlots.filter(slot => slot.teacherId === filter.teacherId);
        }
        
        if (filter.academicYearId) {
          filteredSlots = filteredSlots.filter(slot => slot.academicYearId === filter.academicYearId);
        }
      }
      
      setTimeout(() => resolve(filteredSlots), 300);
    });
  },
  
  getTimeSlotById: async (id: string): Promise<TimeSlot | undefined> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockTimeSlots.find(slot => slot.id === id)), 300);
    });
  },
  
  createTimeSlot: async (timeSlotData: Omit<TimeSlot, 'id' | 'createdAt' | 'updatedAt'>): Promise<TimeSlot> => {
    return new Promise((resolve) => {
      const newTimeSlot: TimeSlot = {
        id: uuidv4(),
        ...timeSlotData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      mockTimeSlots.push(newTimeSlot);
      setTimeout(() => resolve(newTimeSlot), 500);
    });
  },
  
  updateTimeSlot: async (id: string, timeSlotData: Partial<Omit<TimeSlot, 'id' | 'createdAt' | 'updatedAt'>>): Promise<TimeSlot | undefined> => {
    return new Promise((resolve) => {
      const index = mockTimeSlots.findIndex(slot => slot.id === id);
      if (index !== -1) {
        const updatedTimeSlot = {
          ...mockTimeSlots[index],
          ...timeSlotData,
          updatedAt: new Date().toISOString()
        };
        mockTimeSlots[index] = updatedTimeSlot;
        setTimeout(() => resolve(updatedTimeSlot), 500);
      } else {
        setTimeout(() => resolve(undefined), 500);
      }
    });
  },
  
  deleteTimeSlot: async (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const index = mockTimeSlots.findIndex(slot => slot.id === id);
      if (index !== -1) {
        mockTimeSlots.splice(index, 1);
        setTimeout(() => resolve(true), 500);
      } else {
        setTimeout(() => resolve(false), 500);
      }
    });
  },
  
  getWeekDays: (): WeekDay[] => {
    return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  },

  getTimeRange: (): string[] => {
    const timeRange: string[] = [];
    for (let hour = 7; hour <= 17; hour++) {
      const formattedHour = hour.toString().padStart(2, '0');
      timeRange.push(`${formattedHour}:00`);
      timeRange.push(`${formattedHour}:30`);
    }
    return timeRange;
  }
};
