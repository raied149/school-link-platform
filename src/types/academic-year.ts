
export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;  // ISO date string format (YYYY-MM-DD)
  endDate: string;    // ISO date string format (YYYY-MM-DD)
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
