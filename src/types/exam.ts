
export interface TestExam {
  id: string;
  name: string;
  type: 'test' | 'exam';
  grade: string;
  sections: string[]; // Array of section IDs
  subjects: string[]; // Array of subject IDs
  maxMarks: number;
  date: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface StudentTestResult {
  id: string;
  testExamId: string;
  studentId: string;
  marks: number;
  feedback?: string;
  updatedAt: string;
}

export interface ExamAssignment {
  id: string;
  examId: string;
  sectionId: string;
  academicYearId: string;
}

export interface StudentExamResult {
  id: string;
  examId: string;
  studentId: string;
  marksObtained: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface ExamWithSubject {
  id: string;
  name: string;
  date: string;
  max_score: number;
  subject_id: string;
  subjects?: {
    name: string;
    code: string;
  };
}

export interface ExamResult {
  score: number;
  exams?: ExamWithSubject;
}
