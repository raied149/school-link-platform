
export type WeekDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface TimeSlot {
  id: string;
  startTime: string; // format: "HH:MM"
  endTime: string; // format: "HH:MM"
  duration?: number; // in minutes
  subjectId: string;
  teacherId: string;
  dayOfWeek: WeekDay;
  classId: string;
  sectionId: string;
  academicYearId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimetableFilter {
  dayOfWeek?: WeekDay;
  classId?: string;
  sectionId?: string;
  teacherId?: string;
  academicYearId?: string;
}
