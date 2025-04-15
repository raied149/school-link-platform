import { AcademicYear, Class, Student, Subject, TeacherAssignment, TimetableSlot, User } from '@/types';
import { Section } from '@/types/section';

// Mock Academic Years
export const mockAcademicYears: AcademicYear[] = [
  {
    id: '1',
    name: '2023-2024',
    startDate: '2023-06-01',
    endDate: '2024-03-31',
    isActive: true,
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01'
  },
  {
    id: '2',
    name: '2024-2025',
    startDate: '2024-06-01',
    endDate: '2025-03-31',
    isActive: false,
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01'
  }
];

// Mock Classes
export const mockClasses: Class[] = [
  {
    id: '1',
    name: 'LKG',
    level: 1,
    description: 'Lower Kindergarten',
    academicYearId: '1',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01'
  },
  {
    id: '2',
    name: 'UKG',
    level: 2,
    description: 'Upper Kindergarten',
    academicYearId: '1',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01'
  },
  {
    id: '3',
    name: 'Grade 1',
    level: 3,
    description: 'First Grade',
    academicYearId: '1',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01'
  }
];

// Mock Sections
export const mockSections: Section[] = [
  {
    id: '1',
    name: 'Section A',
    classId: '1',
    academicYearId: '1',
    teacherId: '1',
    maxStudents: 30,
    currentStudents: 25,
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01'
  },
  {
    id: '2',
    name: 'Section B',
    classId: '1',
    academicYearId: '1',
    teacherId: '2',
    maxStudents: 30,
    currentStudents: 28,
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01'
  }
];

// Mock Students
export const mockStudents: StudentDetail[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@school.com',
    admissionNumber: 'ADM001',
    dateOfBirth: '2018-05-15',
    gender: 'male',
    contactNumber: '1234567890',
    currentClassId: '1',
    currentSectionId: '1',
    academicYearId: '1',
    nationality: 'American',
    language: 'English',
    guardian: {
      name: 'Robert Doe',
      email: 'robert.doe@email.com',
      phone: '9876543210',
      relationship: 'Father'
    },
    medical: {
      bloodGroup: 'A+',
      allergies: ['Peanuts', 'Dairy'],
      medicalHistory: 'Asthma',
      medications: ['Inhaler'],
      emergencyContact: {
        name: 'Sarah Doe',
        phone: '5555555555',
        relationship: 'Mother'
      }
    },
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@school.com',
    admissionNumber: 'ADM002',
    dateOfBirth: '2018-06-20',
    gender: 'female',
    contactNumber: '0987654321',
    currentClassId: '1',
    currentSectionId: '2',
    academicYearId: '1',
    nationality: 'British',
    language: 'English',
    guardian: {
      name: 'Michael Smith',
      email: 'michael.smith@email.com',
      phone: '1231231234',
      relationship: 'Father'
    },
    medical: {
      bloodGroup: 'O+',
      allergies: [],
      medicalHistory: 'None',
      medications: [],
      emergencyContact: {
        name: 'Emily Smith',
        phone: '4444444444',
        relationship: 'Mother'
      }
    },
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01'
  }
];

// Mock Subjects
export const mockSubjects: Subject[] = [
  {
    id: '1',
    name: 'Mathematics',
    code: 'MATH101',
    description: 'Basic Mathematics',
    credits: 5,
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01'
  },
  {
    id: '2',
    name: 'English',
    code: 'ENG101',
    description: 'English Language',
    credits: 5,
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01'
  }
];

// Mock Users (Teachers)
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Dr. Robert Brown',
    email: 'robert.brown@school.com',
    role: 'teacher'
  },
  {
    id: '2',
    name: 'Ms. Sarah Wilson',
    email: 'sarah.wilson@school.com',
    role: 'teacher'
  }
];

// Mock Teacher Assignments
export const mockTeacherAssignments: TeacherAssignment[] = [
  {
    id: '1',
    teacherId: '1',
    sectionId: '1',
    subjectId: '1',
    academicYearId: '1',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01'
  },
  {
    id: '2',
    teacherId: '2',
    sectionId: '1',
    subjectId: '2',
    academicYearId: '1',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01'
  }
];

// Mock Timetable Slots
export const mockTimetableSlots: TimetableSlot[] = [
  {
    id: '1',
    day: 'monday',
    periodNumber: 1,
    startTime: '09:00',
    endTime: '10:00',
    sectionId: '1',
    subjectId: '1',
    teacherId: '1',
    academicYearId: '1',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01'
  },
  {
    id: '2',
    day: 'monday',
    periodNumber: 2,
    startTime: '10:00',
    endTime: '11:00',
    sectionId: '1',
    subjectId: '2',
    teacherId: '2',
    academicYearId: '1',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01'
  }
];
