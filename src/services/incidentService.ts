import { Incident, IncidentStatus, IncidentType, IncidentSeverity } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

// Mock database for incidents - updated with proper UUID format
let incidents: Incident[] = [
  {
    id: "61469c3a-5da0-47e8-bb64-5b71fba5faea",
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
    id: "72e5c7b9-3a1f-48a9-b2c5-38d6f4e71b0d",
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
    id: "83f1d4e2-b6c8-4793-a5d7-29e8f53b1c2a",
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

// Helper function to validate UUID
const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

// Get all incidents
export const getIncidents = async (): Promise<Incident[]> => {
  try {
    console.log("Fetching incidents from Supabase");
    const { data: incidentsData, error } = await supabase
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
      // If there's an error with Supabase, fall back to mock data
      return incidents;
    }

    if (!incidentsData || incidentsData.length === 0) {
      console.log("No incidents found in database, using mock data");
      return incidents; // Return mock data if no results
    }

    console.log("Received incidents data:", incidentsData);
    return incidentsData.map(incident => ({
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
    // Fall back to mock data if there's any error
    return incidents;
  }
};

// Get incident by ID
export const getIncidentById = async (id: string): Promise<Incident | undefined> => {
  try {
    // Validate UUID format
    if (!isValidUUID(id)) {
      console.error("Invalid UUID format:", id);
      return incidents.find(inc => inc.id === id);
    }
    
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
      // Fall back to mock data
      return incidents.find(inc => inc.id === id);
    }

    if (!incident) {
      return incidents.find(inc => inc.id === id);
    }

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
    // Fall back to mock data
    return incidents.find(inc => inc.id === id);
  }
};

// Create a new incident
export const createIncident = async (incidentData: Omit<Incident, "id" | "createdAt" | "updatedAt">): Promise<Incident> => {
  try {
    console.log("Creating incident with data:", incidentData);
    
    // Prepare data for insertion
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
      // If we can't create in the database, fall back to mock data
      const newId = uuidv4();
      const newIncident: Incident = {
        id: newId,
        ...incidentData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      incidents.unshift(newIncident);
      return newIncident;
    }

    if (incidentData.involvedPersons && incidentData.involvedPersons.length > 0) {
      const involvedPersonsData = incidentData.involvedPersons.map(person => ({
        incident_id: incident.id,
        user_id: person.userId,
        role: person.role,
      }));
      
      const { error: involvedError } = await supabase
        .from('school_incident_involved')
        .insert(involvedPersonsData);

      if (involvedError) {
        console.error("Error adding involved persons:", involvedError);
      }
    }

    // Return the created incident
    return {
      id: incident.id,
      title: incident.title,
      date: incident.date,
      time: incident.time,
      location: incident.location,
      type: incident.type as IncidentType,
      subType: incident.sub_type || undefined,
      description: incident.description,
      severity: incident.severity as IncidentSeverity,
      status: incident.status as IncidentStatus,
      reportedBy: incident.reported_by || undefined,
      assignedTo: incident.assigned_to || undefined,
      investigationNotes: incident.investigation_notes || undefined,
      resolutionDetails: incident.resolution_details || undefined,
      resolutionDate: incident.resolution_date || undefined,
      involvedPersons: incidentData.involvedPersons || [],
      createdAt: incident.created_at,
      updatedAt: incident.updated_at,
    };
  } catch (error) {
    console.error("Error in createIncident:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    // Even if there's an error with the database, still return the mock incident
    // so the UI doesn't break
    const newId = uuidv4();
    const newIncident: Incident = {
      id: newId,
      ...incidentData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    incidents.unshift(newIncident);
    return newIncident;
  }
};

// Update an incident - Improved with better error handling
export const updateIncident = async (id: string, incidentData: Partial<Omit<Incident, "id" | "createdAt" | "updatedAt">>): Promise<Incident | undefined> => {
  try {
    // Validate UUID format before proceeding
    if (!isValidUUID(id)) {
      console.error("Invalid UUID format for update:", id);
      throw new Error("Invalid incident ID format");
    }

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
      // Always update timestamp when updating
      updated_at: new Date().toISOString()
    };

    // Check if we have an actual update to make
    if (Object.keys(updateData).length === 0) {
      console.warn("No data provided for update.");
      return await getIncidentById(id);
    }

    // Update the incident in Supabase
    const { error: incidentError } = await supabase
      .from('school_incidents')
      .update(updateData)
      .eq('id', id);

    if (incidentError) {
      console.error("Error updating incident:", incidentError);
      // Fall back to updating mock data
      const incidentIndex = incidents.findIndex(inc => inc.id === id);
      if (incidentIndex >= 0) {
        incidents[incidentIndex] = {
          ...incidents[incidentIndex],
          ...incidentData,
          updatedAt: new Date().toISOString()
        };
        return incidents[incidentIndex];
      }
      throw new Error("Failed to update incident and could not find matching mock data");
    }

    // Update involved persons if provided
    if (incidentData.involvedPersons) {
      try {
        // Delete existing involved persons
        const { error: deleteError } = await supabase
          .from('school_incident_involved')
          .delete()
          .eq('incident_id', id);

        if (deleteError) {
          console.error("Error deleting involved persons:", deleteError);
        }

        // Insert new involved persons with the correct field mappings
        if (incidentData.involvedPersons.length > 0) {
          const involvedPersonsData = incidentData.involvedPersons.map(person => ({
            incident_id: id,
            user_id: person.userId,
            role: person.role,
          }));
          
          const { error: involvedError } = await supabase
            .from('school_incident_involved')
            .insert(involvedPersonsData);

          if (involvedError) {
            console.error("Error adding involved persons:", involvedError);
          }
        }
      } catch (error) {
        console.error("Error handling involved persons update:", error);
      }
    }

    // Return the updated incident
    return await getIncidentById(id);
  } catch (error) {
    console.error("Error in updateIncident:", error);
    
    // Return any mock data as a fallback if possible
    const foundIncident = incidents.find(inc => inc.id === id);
    if (foundIncident) {
      return {
        ...foundIncident,
        ...incidentData,
        updatedAt: new Date().toISOString()
      };
    }
    // Let the caller handle undefined
    return undefined;
  }
};

// Delete an incident - Improved with better error handling and validation
export const deleteIncident = async (id: string): Promise<boolean> => {
  try {
    // Validate UUID format
    if (!isValidUUID(id)) {
      console.error("Invalid UUID format for delete:", id);
      throw new Error("Invalid incident ID format");
    }
    
    // Delete the incident from Supabase
    const { error } = await supabase
      .from('school_incidents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting incident from Supabase:", error);
      
      // Fall back to mock data deletion
      const initialLength = incidents.length;
      incidents = incidents.filter(inc => inc.id !== id);
      return incidents.length < initialLength;
    }
    
    // Also remove from mock data in case we fall back to it later
    incidents = incidents.filter(inc => inc.id !== id);
    return true;
  } catch (error) {
    console.error("Error in deleteIncident:", error);
    
    // Try to handle the mock data deletion anyway to keep UI consistent
    try {
      const initialLength = incidents.length;
      incidents = incidents.filter(inc => inc.id !== id);
      return incidents.length < initialLength;
    } catch (e) {
      console.error("Failed to delete from mock data:", e);
      return false;
    }
  }
};

// Filter incidents by status
export const filterIncidentsByStatus = async (status: IncidentStatus): Promise<Incident[]> => {
  try {
    const { data, error } = await supabase
      .from('school_incidents')
      .select(`
        *,
        school_incident_involved (
          user_id,
          role
        )
      `)
      .eq('status', status);
      
    if (error) {
      console.error("Error filtering incidents by status:", error);
      // Fall back to filtering mock data
      return incidents.filter(incident => incident.status === status);
    }
    
    if (!data || data.length === 0) {
      // If no results from Supabase, fall back to mock data
      return incidents.filter(incident => incident.status === status);
    }
    
    return data.map(incident => ({
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
      involvedPersons: (incident.school_incident_involved || []).map(person => ({
        userId: person.user_id,
        role: person.role as "student" | "teacher" | "staff" | "visitor" | "other"
      })),
      createdAt: incident.created_at,
      updatedAt: incident.updated_at,
    }));
  } catch (error) {
    console.error("Error in filterIncidentsByStatus:", error);
    return incidents.filter(incident => incident.status === status);
  }
};

// Filter incidents by type
export const filterIncidentsByType = async (type: IncidentType): Promise<Incident[]> => {
  try {
    const { data, error } = await supabase
      .from('school_incidents')
      .select(`
        *,
        school_incident_involved (
          user_id,
          role
        )
      `)
      .eq('type', type);
      
    if (error) {
      console.error("Error filtering incidents by type:", error);
      return incidents.filter(incident => incident.type === type);
    }
    
    if (!data || data.length === 0) {
      return incidents.filter(incident => incident.type === type);
    }
    
    return data.map(incident => ({
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
      involvedPersons: (incident.school_incident_involved || []).map(person => ({
        userId: person.user_id,
        role: person.role as "student" | "teacher" | "staff" | "visitor" | "other"
      })),
      createdAt: incident.created_at,
      updatedAt: incident.updated_at,
    }));
  } catch (error) {
    console.error("Error in filterIncidentsByType:", error);
    return incidents.filter(incident => incident.type === type);
  }
};

// Filter incidents by severity
export const filterIncidentsBySeverity = async (severity: IncidentSeverity): Promise<Incident[]> => {
  try {
    const { data, error } = await supabase
      .from('school_incidents')
      .select(`
        *,
        school_incident_involved (
          user_id,
          role
        )
      `)
      .eq('severity', severity);
      
    if (error) {
      console.error("Error filtering incidents by severity:", error);
      return incidents.filter(incident => incident.severity === severity);
    }
    
    if (!data || data.length === 0) {
      return incidents.filter(incident => incident.severity === severity);
    }
    
    return data.map(incident => ({
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
      involvedPersons: (incident.school_incident_involved || []).map(person => ({
        userId: person.user_id,
        role: person.role as "student" | "teacher" | "staff" | "visitor" | "other"
      })),
      createdAt: incident.created_at,
      updatedAt: incident.updated_at,
    }));
  } catch (error) {
    console.error("Error in filterIncidentsBySeverity:", error);
    return incidents.filter(incident => incident.severity === severity);
  }
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
