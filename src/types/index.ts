
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
  academicYearId?: string; // Link to academic year
  createdAt: string;
  updatedAt: string;
}
