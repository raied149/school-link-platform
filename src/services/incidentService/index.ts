
import { Incident, IncidentStatus, IncidentType, IncidentSeverity } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { MOCK_USER_ID } from './constants';

// Helper function to validate UUID
const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

// Export the MOCK_USER_ID so it can be used in components
export { MOCK_USER_ID };

// Map database records to Incident objects
const mapDbToIncident = (incident: any): Incident => {
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
    reportedBy: incident.reported_by,
    assignedTo: incident.assigned_to || undefined,
    investigationNotes: incident.investigation_notes || undefined,
    resolutionDetails: incident.resolution_details || undefined,
    resolutionDate: incident.resolution_date || undefined,
    involvedPersons: incident.involved_persons ? incident.involved_persons.map((person: any) => ({
      userId: person.user_id,
      role: person.role as "student" | "teacher" | "staff" | "visitor" | "other"
    })) : [],
    createdAt: incident.created_at,
    updatedAt: incident.updated_at,
  };
};

// Get all incidents
export const getIncidents = async (): Promise<Incident[]> => {
  try {
    console.log("Fetching incidents from Supabase");
    
    // First get all incidents
    const { data: incidentsData, error } = await supabase
      .from('incidents')
      .select('*');

    if (error) {
      console.error("Error fetching incidents:", error);
      return [];
    }

    if (!incidentsData || incidentsData.length === 0) {
      console.log("No incidents found in database");
      return [];
    }

    // For each incident, get the involved persons
    const incidentsWithInvolved = await Promise.all(incidentsData.map(async (incident) => {
      const { data: involvedPersons, error: involvedError } = await supabase
        .from('incident_involved_persons')
        .select('*')
        .eq('incident_id', incident.id);
      
      return {
        ...incident,
        involved_persons: involvedError ? [] : involvedPersons
      };
    }));

    console.log("Received incidents data with involved persons:", incidentsWithInvolved);
    
    return incidentsWithInvolved.map(mapDbToIncident);
  } catch (error) {
    console.error("Error in getIncidents:", error);
    return [];
  }
};

// Get incident by ID
export const getIncidentById = async (id: string): Promise<Incident | undefined> => {
  try {
    // Validate UUID format
    if (!isValidUUID(id)) {
      console.error("Invalid UUID format:", id);
      return undefined;
    }
    
    // Get the incident
    const { data: incident, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching incident:", error);
      return undefined;
    }

    // Get involved persons
    const { data: involvedPersons, error: involvedError } = await supabase
      .from('incident_involved_persons')
      .select('*')
      .eq('incident_id', id);

    if (involvedError) {
      console.error("Error fetching involved persons:", involvedError);
    }

    const completeIncident = {
      ...incident,
      involved_persons: involvedError ? [] : involvedPersons
    };

    return mapDbToIncident(completeIncident);
  } catch (error) {
    console.error("Error in getIncidentById:", error);
    return undefined;
  }
};

// Create a new incident
export const createIncident = async (incidentData: Omit<Incident, "id" | "createdAt" | "updatedAt">): Promise<Incident> => {
  try {
    console.log("Creating incident with data:", incidentData);
    
    // Prepare data for insertion
    const insertData = {
      title: incidentData.title,
      date: incidentData.date,
      time: incidentData.time,
      location: incidentData.location,
      type: incidentData.type,
      sub_type: incidentData.subType,
      description: incidentData.description,
      severity: incidentData.severity,
      status: incidentData.status,
      reported_by: incidentData.reportedBy || MOCK_USER_ID,
      assigned_to: incidentData.assignedTo || null,
      investigation_notes: incidentData.investigationNotes,
      resolution_details: incidentData.resolutionDetails,
      resolution_date: incidentData.resolutionDate,
    };

    // Insert the incident
    const { data: incident, error: incidentError } = await supabase
      .from('incidents')
      .insert(insertData)
      .select()
      .single();

    if (incidentError) {
      console.error("Error creating incident:", incidentError);
      throw new Error(`Failed to create incident: ${incidentError.message}`);
    }

    // Add involved persons if any
    if (incidentData.involvedPersons && incidentData.involvedPersons.length > 0) {
      const involvedPersonsData = incidentData.involvedPersons.map(person => ({
        incident_id: incident.id,
        user_id: person.userId,
        role: person.role,
      }));
      
      const { error: involvedError } = await supabase
        .from('incident_involved_persons')
        .insert(involvedPersonsData);

      if (involvedError) {
        console.error("Error adding involved persons:", involvedError);
      }
    }

    // Return the created incident with involved persons
    return await getIncidentById(incident.id) as Incident;
  } catch (error) {
    console.error("Error in createIncident:", error);
    throw error;
  }
};

// Update an incident
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
    const { data: updatedIncident, error: incidentError } = await supabase
      .from('incidents')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (incidentError) {
      console.error("Error updating incident:", incidentError);
      throw new Error(`Failed to update incident: ${incidentError.message}`);
    }

    // Update involved persons if provided
    if (incidentData.involvedPersons) {
      try {
        // Delete existing involved persons
        const { error: deleteError } = await supabase
          .from('incident_involved_persons')
          .delete()
          .eq('incident_id', id);

        if (deleteError) {
          console.error("Error deleting involved persons:", deleteError);
        }

        // Insert new involved persons
        if (incidentData.involvedPersons.length > 0) {
          const involvedPersonsData = incidentData.involvedPersons.map(person => ({
            incident_id: id,
            user_id: person.userId,
            role: person.role,
          }));
          
          const { error: involvedError } = await supabase
            .from('incident_involved_persons')
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
    throw error;
  }
};

// Delete an incident
export const deleteIncident = async (id: string): Promise<boolean> => {
  try {
    // Validate UUID format
    if (!isValidUUID(id)) {
      console.error("Invalid UUID format for delete:", id);
      throw new Error("Invalid incident ID format");
    }
    
    // Delete the incident from Supabase - cascade will take care of involved persons
    const { error } = await supabase
      .from('incidents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting incident from Supabase:", error);
      throw new Error(`Failed to delete incident: ${error.message}`);
    }
    
    return true;
  } catch (error) {
    console.error("Error in deleteIncident:", error);
    throw error;
  }
};

// Filter incidents by status
export const filterIncidentsByStatus = async (status: IncidentStatus): Promise<Incident[]> => {
  try {
    const { data: incidentsData, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('status', status);
      
    if (error) {
      console.error("Error filtering incidents by status:", error);
      return [];
    }
    
    if (!incidentsData || incidentsData.length === 0) {
      return [];
    }
    
    // For each incident, get the involved persons
    const incidentsWithInvolved = await Promise.all(incidentsData.map(async (incident) => {
      const { data: involvedPersons, error: involvedError } = await supabase
        .from('incident_involved_persons')
        .select('*')
        .eq('incident_id', incident.id);
      
      return {
        ...incident,
        involved_persons: involvedError ? [] : involvedPersons
      };
    }));
    
    return incidentsWithInvolved.map(mapDbToIncident);
  } catch (error) {
    console.error("Error in filterIncidentsByStatus:", error);
    return [];
  }
};

// Filter incidents by type
export const filterIncidentsByType = async (type: IncidentType): Promise<Incident[]> => {
  try {
    const { data: incidentsData, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('type', type);
      
    if (error) {
      console.error("Error filtering incidents by type:", error);
      return [];
    }
    
    if (!incidentsData || incidentsData.length === 0) {
      return [];
    }
    
    // For each incident, get the involved persons
    const incidentsWithInvolved = await Promise.all(incidentsData.map(async (incident) => {
      const { data: involvedPersons, error: involvedError } = await supabase
        .from('incident_involved_persons')
        .select('*')
        .eq('incident_id', incident.id);
      
      return {
        ...incident,
        involved_persons: involvedError ? [] : involvedPersons
      };
    }));
    
    return incidentsWithInvolved.map(mapDbToIncident);
  } catch (error) {
    console.error("Error in filterIncidentsByType:", error);
    return [];
  }
};

// Filter incidents by severity
export const filterIncidentsBySeverity = async (severity: IncidentSeverity): Promise<Incident[]> => {
  try {
    const { data: incidentsData, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('severity', severity);
      
    if (error) {
      console.error("Error filtering incidents by severity:", error);
      return [];
    }
    
    if (!incidentsData || incidentsData.length === 0) {
      return [];
    }
    
    // For each incident, get the involved persons
    const incidentsWithInvolved = await Promise.all(incidentsData.map(async (incident) => {
      const { data: involvedPersons, error: involvedError } = await supabase
        .from('incident_involved_persons')
        .select('*')
        .eq('incident_id', incident.id);
      
      return {
        ...incident,
        involved_persons: involvedError ? [] : involvedPersons
      };
    }));
    
    return incidentsWithInvolved.map(mapDbToIncident);
  } catch (error) {
    console.error("Error in filterIncidentsBySeverity:", error);
    return [];
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
