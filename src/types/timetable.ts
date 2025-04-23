
export type WeekDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export type SlotType = 'subject' | 'break' | 'event';

export interface TimeSlot {
  id: string;
  startTime: string; // format: "HH:MM"
  endTime: string; // format: "HH:MM"
  duration?: number; // in minutes
  slotType: SlotType;
  title?: string; // For breaks or events
  subjectId?: string; // Only for subject slots
  teacherId?: string; // Set automatically based on subject assignment
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
