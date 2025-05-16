
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
  exam_id: string;
  section_id: string;
  academic_year_id: string;
  sections?: {
    id: string;
    name: string;
    class_id?: string;
  };
}

export interface StudentExamResult {
  id: string;
  exam_id: string;
  student_id: string;
  marks_obtained: number;
  feedback?: string;
  created_at: string;
  updated_at: string;
  updated_by?: string;
  student?: {
    id: string;
    first_name: string;
    last_name: string;
    student_details?: {
      admission_number?: string;
    };
  };
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
  student?: {
    id: string;
    first_name: string;
    last_name: string;
    student_details?: {
      admission_number?: string;
    };
  };
}
