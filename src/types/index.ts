// User Types
export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Class Types
export interface Class {
  id: string;
  name: string;
  level: number;
  description?: string;
  academicYearId?: string;
  createdAt: string;
  updatedAt: string;
}

// Academic Year Types
export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Student Types
export interface Student {
  id: string;
  name: string;
  email: string;
  admissionNumber: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  contactNumber?: string;
  address?: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

// Subject Types
export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  credits?: number;
  createdAt: string;
  updatedAt: string;
}

// Teacher Assignment Types
export interface TeacherAssignment {
  id: string;
  teacherId: string;
  sectionId: string;
  subjectId: string;
  academicYearId: string;
  createdAt: string;
  updatedAt: string;
}

// Timetable Types
export interface TimetableSlot {
  id: string;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
  periodNumber: number;
  startTime: string;
  endTime: string;
  sectionId: string;
  subjectId: string;
  teacherId: string;
  academicYearId: string;
  createdAt: string;
  updatedAt: string;
}

// Extended User Types
export interface Teacher extends User {
  employeeId: string;
  joinDate: string;
  qualification: string;
  specialization: string[];
  contactNumber: string;
  address: string;
  subjects: string[]; // Array of subject IDs they can teach
}

export interface StudentDetail extends Student {
  currentClassId?: string;
  currentSectionId?: string;
  academicYearId?: string;
  nationality: string;
  language: string;
  guardian: {
    name: string;
    email: string;
    phone: string;
    relationship: string;
  };
  medical: {
    bloodGroup?: string;
    allergies?: string[];
    medicalHistory?: string;
    medications?: string[];
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
}
