
import { Incident, IncidentStatus, IncidentType, IncidentSeverity } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

// Helper function to validate UUID
const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

// Map database records to Incident objects
const mapDbToIncident = (incident: any): Incident => ({
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
  involvedPersons: (incident.school_incident_involved || []).map(person => ({
    userId: person.user_id,
    role: person.role as "student" | "teacher" | "staff" | "visitor" | "other"
  })),
  createdAt: incident.created_at,
  updatedAt: incident.updated_at,
});

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
      return []; // Return empty array if there's an error
    }

    if (!incidentsData || incidentsData.length === 0) {
      console.log("No incidents found in database");
      return []; // Return empty array if no data
    }

    console.log("Received incidents data:", incidentsData);
    return incidentsData.map(mapDbToIncident);
  } catch (error) {
    console.error("Error in getIncidents:", error);
    return []; // Return empty array on any error
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
      return undefined;
    }

    if (!incident) {
      return undefined;
    }

    return mapDbToIncident(incident);
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
      throw new Error(`Failed to create incident: ${incidentError.message}`);
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
    return mapDbToIncident(incident);
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
      .from('school_incidents')
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
    
    // Delete the incident from Supabase
    const { error } = await supabase
      .from('school_incidents')
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
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    return data.map(mapDbToIncident);
  } catch (error) {
    console.error("Error in filterIncidentsByStatus:", error);
    return [];
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
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    return data.map(mapDbToIncident);
  } catch (error) {
    console.error("Error in filterIncidentsByType:", error);
    return [];
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
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    return data.map(mapDbToIncident);
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

// Helper function to seed initial incidents data - you can call this from the console or a button if needed
export const seedIncidentData = async (): Promise<void> => {
  try {
    // Sample incident data with valid UUID format for reported_by and assigned_to
    const sampleData = [
      {
        title: "Classroom Disruption",
        date: "2025-04-10",
        time: "10:30",
        location: "Math Classroom - Building A",
        type: "disciplinary",
        description: "A student was repeatedly disrupting the class by making loud noises and refusing to follow instructions.",
        severity: "medium",
        status: "resolved",
        reported_by: null, // Using null instead of invalid UUIDs
        assigned_to: null,
        investigation_notes: "Spoke with the student and their parents about their behavior.",
        resolution_details: "The student apologized and agreed to follow classroom rules.",
        resolution_date: "2025-04-11"
      },
      {
        title: "Playground Injury",
        date: "2025-04-12",
        time: "12:15",
        location: "School Playground",
        type: "safety",
        description: "A student fell from the swing and scraped their knee.",
        severity: "low",
        status: "closed",
        reported_by: null,
        assigned_to: null,
        investigation_notes: "Inspected the playground equipment and found no defects.",
        resolution_details: "First aid was administered by the school nurse. Parents were notified.",
        resolution_date: "2025-04-12"
      },
      {
        title: "Suspected Bullying",
        date: "2025-04-14",
        time: "14:00",
        location: "School Corridor",
        type: "bullying",
        description: "A teacher witnessed what appeared to be bullying behavior between students.",
        severity: "high",
        status: "under_investigation",
        reported_by: null,
        assigned_to: null,
        investigation_notes: "Interviewing witnesses and the involved students."
      }
    ];

    // Insert incidents
    const { data: insertedIncidents, error } = await supabase
      .from('school_incidents')
      .insert(sampleData)
      .select();

    if (error) {
      console.error("Error seeding incidents:", error);
      return;
    }

    console.log("Successfully seeded incidents:", insertedIncidents);

    // Insert involved persons for each incident
    if (insertedIncidents && insertedIncidents.length === 3) {
      const involvedPersons = [
        {
          incident_id: insertedIncidents[0].id,
          user_id: "s1",
          role: "student"
        },
        {
          incident_id: insertedIncidents[1].id,
          user_id: "s2",
          role: "student"
        },
        {
          incident_id: insertedIncidents[2].id,
          user_id: "s3",
          role: "student"
        },
        {
          incident_id: insertedIncidents[2].id,
          user_id: "s4",
          role: "student"
        }
      ];

      const { error: involvedError } = await supabase
        .from('school_incident_involved')
        .insert(involvedPersons);

      if (involvedError) {
        console.error("Error adding involved persons:", involvedError);
      } else {
        console.log("Successfully added involved persons");
      }
    }
  } catch (error) {
    console.error("Error in seedIncidentData:", error);
  }
};
