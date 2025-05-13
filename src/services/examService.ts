
// Import all functions from their respective modules
import {
  getAllExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam
} from './exam/examApi';

import {
  assignExamToSections,
  getExamAssignments,
  getExamsForSection
} from './exam/assignmentApi';

import {
  getStudentExams,
  getStudentsInSection,
  getStudentExamResults,
  saveStudentExamResult,
  bulkSaveStudentExamResults
} from './exam/resultApi';

// Re-export the individual functions
export {
  getAllExams,
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

// Create examService object for backwards compatibility
const examService = {
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

export { examService };
