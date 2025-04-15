
import { Incident, IncidentStatus, IncidentType, IncidentSeverity } from "@/types";
import { v4 as uuidv4 } from 'uuid';

// Mock database for incidents
let incidents: Incident[] = [
  {
    id: "1",
    title: "Classroom Disruption",
    date: "2025-04-10",
    time: "10:30",
    location: "Math Classroom - Building A",
    type: "disciplinary",
    description: "A student was repeatedly disrupting the class by making loud noises and refusing to follow instructions.",
    severity: "medium",
    status: "resolved",
    reportedBy: "t2",
    assignedTo: "t1",
    involvedPersons: [
      { userId: "s1", role: "student" }
    ],
    investigationNotes: "Spoke with the student and their parents about their behavior.",
    resolutionDetails: "The student apologized and agreed to follow classroom rules.",
    resolutionDate: "2025-04-11",
    createdAt: "2025-04-10T10:45:00Z",
    updatedAt: "2025-04-11T14:30:00Z"
  },
  {
    id: "2",
    title: "Playground Injury",
    date: "2025-04-12",
    time: "12:15",
    location: "School Playground",
    type: "safety",
    description: "A student fell from the swing and scraped their knee.",
    severity: "low",
    status: "closed",
    reportedBy: "t3",
    assignedTo: "t1",
    involvedPersons: [
      { userId: "s2", role: "student" }
    ],
    investigationNotes: "Inspected the playground equipment and found no defects.",
    resolutionDetails: "First aid was administered by the school nurse. Parents were notified.",
    resolutionDate: "2025-04-12",
    createdAt: "2025-04-12T12:20:00Z",
    updatedAt: "2025-04-12T13:00:00Z"
  },
  {
    id: "3",
    title: "Suspected Bullying",
    date: "2025-04-14",
    time: "14:00",
    location: "School Corridor",
    type: "bullying",
    description: "A teacher witnessed what appeared to be bullying behavior between students.",
    severity: "high",
    status: "under_investigation",
    reportedBy: "t2",
    assignedTo: "t1",
    involvedPersons: [
      { userId: "s3", role: "student" },
      { userId: "s4", role: "student" }
    ],
    investigationNotes: "Interviewing witnesses and the involved students.",
    createdAt: "2025-04-14T14:30:00Z",
    updatedAt: "2025-04-15T09:00:00Z"
  }
];

// Get all incidents
export const getIncidents = (): Promise<Incident[]> => {
  return Promise.resolve([...incidents]);
};

// Get incident by ID
export const getIncidentById = (id: string): Promise<Incident | undefined> => {
  const incident = incidents.find(incident => incident.id === id);
  return Promise.resolve(incident);
};

// Create a new incident
export const createIncident = (incidentData: Omit<Incident, "id" | "createdAt" | "updatedAt">): Promise<Incident> => {
  const now = new Date().toISOString();
  const newIncident: Incident = {
    id: uuidv4(),
    ...incidentData,
    createdAt: now,
    updatedAt: now
  };
  
  incidents.push(newIncident);
  return Promise.resolve(newIncident);
};

// Update an incident
export const updateIncident = (id: string, incidentData: Partial<Omit<Incident, "id" | "createdAt" | "updatedAt">>): Promise<Incident | undefined> => {
  const index = incidents.findIndex(incident => incident.id === id);
  
  if (index !== -1) {
    incidents[index] = {
      ...incidents[index],
      ...incidentData,
      updatedAt: new Date().toISOString()
    };
    return Promise.resolve(incidents[index]);
  }
  
  return Promise.resolve(undefined);
};

// Delete an incident
export const deleteIncident = (id: string): Promise<boolean> => {
  const initialLength = incidents.length;
  incidents = incidents.filter(incident => incident.id !== id);
  return Promise.resolve(initialLength > incidents.length);
};

// Filter incidents by status
export const filterIncidentsByStatus = (status: IncidentStatus): Promise<Incident[]> => {
  const filteredIncidents = incidents.filter(incident => incident.status === status);
  return Promise.resolve(filteredIncidents);
};

// Filter incidents by type
export const filterIncidentsByType = (type: IncidentType): Promise<Incident[]> => {
  const filteredIncidents = incidents.filter(incident => incident.type === type);
  return Promise.resolve(filteredIncidents);
};

// Filter incidents by severity
export const filterIncidentsBySeverity = (severity: IncidentSeverity): Promise<Incident[]> => {
  const filteredIncidents = incidents.filter(incident => incident.severity === severity);
  return Promise.resolve(filteredIncidents);
};

// Get incident type display name
export const getIncidentTypeLabel = (type: IncidentType): string => {
  const types: Record<IncidentType, string> = {
    disciplinary: "Disciplinary",
    safety: "Safety",
    health: "Health",
    bullying: "Bullying",
    it_issue: "IT Issue",
    security: "Security",
    other: "Other"
  };
  
  return types[type] || "Unknown";
};

// Get incident status display name
export const getIncidentStatusLabel = (status: IncidentStatus): string => {
  const statuses: Record<IncidentStatus, string> = {
    reported: "Reported",
    under_investigation: "Under Investigation",
    resolved: "Resolved",
    closed: "Closed"
  };
  
  return statuses[status] || "Unknown";
};

// Get incident severity display name and color
export const getIncidentSeverityInfo = (severity: IncidentSeverity): { label: string; color: string } => {
  const severityMap: Record<IncidentSeverity, { label: string; color: string }> = {
    low: { label: "Low", color: "bg-green-100 text-green-800" },
    medium: { label: "Medium", color: "bg-yellow-100 text-yellow-800" },
    high: { label: "High", color: "bg-red-100 text-red-800" }
  };
  
  return severityMap[severity] || { label: "Unknown", color: "bg-gray-100 text-gray-800" };
};

