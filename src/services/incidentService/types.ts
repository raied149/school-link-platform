
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
