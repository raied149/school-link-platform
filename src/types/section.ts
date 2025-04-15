
export interface Section {
  id: string;
  name: string;
  classId: string;
  academicYearId: string;
  teacherId?: string;
  maxStudents?: number;
  currentStudents?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SectionDetails extends Section {
  students: string[]; // Array of student IDs
  subjects: string[]; // Array of subject IDs
  timetableSlots: string[]; // Array of timetable slot IDs
}
