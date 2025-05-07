
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
