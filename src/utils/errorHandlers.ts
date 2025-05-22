
export function handleDatabaseError(error: any): string {
  console.error("Database error:", error);
  
  // Check if it's a unique constraint violation
  if (error.message?.includes('unique_teacher_employee_id')) {
    return "This Employee ID is already in use. Please use a different one.";
  }
  
  if (error.message?.includes('unique_student_admission_number')) {
    return "This Admission Number is already in use. Please use a different one.";
  }
  
  // Generic error message for other types of errors
  return error.message || "An unknown error occurred. Please try again.";
}
