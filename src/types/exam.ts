
export interface TestExam {
  id: string;
  name: string;
  type: 'test' | 'exam';
  classes: string[]; // Array of class IDs
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
