
import { IncidentType, IncidentSeverity, IncidentStatus } from "@/types";

export interface IncidentPerson {
  userId: string;
  role: 'student' | 'teacher' | 'staff' | 'visitor' | 'other';
}

export interface Incident {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: IncidentType;
  subType?: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  reportedBy: string;
  assignedTo?: string;
  involvedPersons: IncidentPerson[];
  investigationNotes?: string;
  resolutionDetails?: string;
  resolutionDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Mock user ID to use when no authenticated user is available
export const MOCK_USER_ID = "123e4567-e89b-12d3-a456-426614174000"; // Admin user from mock users
