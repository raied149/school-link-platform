
// Re-export from more focused modules
export {
  getAllExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam
} from './exam/examApi';

export {
  assignExamToSections,
  getExamAssignments,
  getExamsForSection
} from './exam/assignmentApi';

export {
  getStudentExams,
  getStudentsInSection,
  getStudentExamResults,
  saveStudentExamResult,
  bulkSaveStudentExamResults
} from './exam/resultApi';

// Create examService object for backwards compatibility
export const examService = {
  getExams: getAllExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  assignExamToSections,
  getExamAssignments,
  getExamsForSection,
  getStudentExams,
  getStudentsInSection,
  getStudentExamResults,
  saveStudentExamResult,
  bulkSaveStudentExamResults
};
