import { Incident, IncidentStatus, IncidentType, IncidentSeverity } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Mock database for incidents - keeping this for reference
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
export const getIncidents = async (): Promise<Incident[]> => {
  try {
    const { data: incidents, error } = await supabase
      .from('school_incidents')
      .select(`
        *,
        school_incident_involved (
          user_id,
          role
        )
      `);

    if (error) {
      console.error("Error fetching incidents:", error);
      throw error;
    }

    return incidents.map(incident => ({
      id: incident.id,
      title: incident.title,
      date: incident.date,
      time: incident.time,
      location: incident.location,
      type: incident.type as IncidentType,
      subType: incident.sub_type,
      description: incident.description,
      severity: incident.severity as IncidentSeverity,
      status: incident.status as IncidentStatus,
      reportedBy: incident.reported_by,
      assignedTo: incident.assigned_to,
      investigationNotes: incident.investigation_notes,
      resolutionDetails: incident.resolution_details,
      resolutionDate: incident.resolution_date,
      // Map the database field names to our TypeScript type field names
      involvedPersons: (incident.school_incident_involved || []).map(person => ({
        userId: person.user_id,
        role: person.role as "student" | "teacher" | "staff" | "visitor" | "other"
      })),
      createdAt: incident.created_at,
      updatedAt: incident.updated_at,
    }));
  } catch (error) {
    console.error("Error in getIncidents:", error);
    throw error;
  }
};

// Get incident by ID
export const getIncidentById = async (id: string): Promise<Incident | undefined> => {
  try {
    const { data: incident, error } = await supabase
      .from('school_incidents')
      .select(`
        *,
        school_incident_involved (
          user_id,
          role
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching incident:", error);
      throw error;
    }

    if (!incident) return undefined;

    return {
      id: incident.id,
      title: incident.title,
      date: incident.date,
      time: incident.time,
      location: incident.location,
      type: incident.type as IncidentType,
      subType: incident.sub_type,
      description: incident.description,
      severity: incident.severity as IncidentSeverity,
      status: incident.status as IncidentStatus,
      reportedBy: incident.reported_by,
      assignedTo: incident.assigned_to,
      investigationNotes: incident.investigation_notes,
      resolutionDetails: incident.resolution_details,
      resolutionDate: incident.resolution_date,
      // Map the database field names to our TypeScript type field names
      involvedPersons: (incident.school_incident_involved || []).map(person => ({
        userId: person.user_id,
        role: person.role as "student" | "teacher" | "staff" | "visitor" | "other"
      })),
      createdAt: incident.created_at,
      updatedAt: incident.updated_at,
    };
  } catch (error) {
    console.error("Error in getIncidentById:", error);
    throw error;
  }
};

// Create a new incident
export const createIncident = async (incidentData: Omit<Incident, "id" | "createdAt" | "updatedAt">): Promise<Incident> => {
  try {
    console.log("Creating incident with data:", incidentData);
    
    // Prepare data for insertion, ensuring reported_by and assigned_to are properly formatted
    const { data: incident, error: incidentError } = await supabase
      .from('school_incidents')
      .insert({
        title: incidentData.title,
        date: incidentData.date,
        time: incidentData.time,
        location: incidentData.location,
        type: incidentData.type,
        sub_type: incidentData.subType,
        description: incidentData.description,
        severity: incidentData.severity,
        status: incidentData.status,
        reported_by: incidentData.reportedBy || null,
        assigned_to: incidentData.assignedTo || null,
        investigation_notes: incidentData.investigationNotes,
        resolution_details: incidentData.resolutionDetails,
        resolution_date: incidentData.resolutionDate,
      })
      .select()
      .single();

    if (incidentError) {
      console.error("Error creating incident:", incidentError);
      throw incidentError;
    }

    console.log("Incident created successfully:", incident);

    if (incidentData.involvedPersons && incidentData.involvedPersons.length > 0) {
      // Map our TypeScript field names to the database field names
      const { error: involvedError } = await supabase
        .from('school_incident_involved')
        .insert(
          incidentData.involvedPersons.map(person => ({
            incident_id: incident.id,
            user_id: person.userId,
            role: person.role,
          }))
        );

      if (involvedError) {
        console.error("Error creating involved persons:", involvedError);
        throw involvedError;
      }
    }

    return await getIncidentById(incident.id) as Incident;
  } catch (error) {
    console.error("Error in createIncident:", error);
    throw error;
  }
};

// Update an incident
export const updateIncident = async (id: string, incidentData: Partial<Omit<Incident, "id" | "createdAt" | "updatedAt">>): Promise<Incident | undefined> => {
  try {
    const updateData: any = {
      ...(incidentData.title && { title: incidentData.title }),
      ...(incidentData.date && { date: incidentData.date }),
      ...(incidentData.time && { time: incidentData.time }),
      ...(incidentData.location && { location: incidentData.location }),
      ...(incidentData.type && { type: incidentData.type }),
      ...(incidentData.subType !== undefined && { sub_type: incidentData.subType }),
      ...(incidentData.description && { description: incidentData.description }),
      ...(incidentData.severity && { severity: incidentData.severity }),
      ...(incidentData.status && { status: incidentData.status }),
      ...(incidentData.assignedTo !== undefined && { assigned_to: incidentData.assignedTo }),
      ...(incidentData.investigationNotes !== undefined && { investigation_notes: incidentData.investigationNotes }),
      ...(incidentData.resolutionDetails !== undefined && { resolution_details: incidentData.resolutionDetails }),
      ...(incidentData.resolutionDate !== undefined && { resolution_date: incidentData.resolutionDate }),
    };

    const { error: incidentError } = await supabase
      .from('school_incidents')
      .update(updateData)
      .eq('id', id);

    if (incidentError) {
      console.error("Error updating incident:", incidentError);
      throw incidentError;
    }

    if (incidentData.involvedPersons) {
      // Delete existing involved persons
      const { error: deleteError } = await supabase
        .from('school_incident_involved')
        .delete()
        .eq('incident_id', id);

      if (deleteError) {
        console.error("Error deleting involved persons:", deleteError);
        throw deleteError;
      }

      // Insert new involved persons with the correct field mappings
      if (incidentData.involvedPersons.length > 0) {
        const { error: involvedError } = await supabase
          .from('school_incident_involved')
          .insert(
            incidentData.involvedPersons.map(person => ({
              incident_id: id,
              user_id: person.userId,
              role: person.role,
            }))
          );

        if (involvedError) {
          console.error("Error updating involved persons:", involvedError);
          throw involvedError;
        }
      }
    }

    return await getIncidentById(id);
  } catch (error) {
    console.error("Error in updateIncident:", error);
    throw error;
  }
};

// Delete an incident
export const deleteIncident = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('school_incidents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting incident:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error in deleteIncident:", error);
    throw error;
  }
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
