
import { toast } from "sonner";
import { CreateOnlineClassParams } from "./types";

// Helper function to check if string is a valid UUID
export const isValidUUID = (id: string): boolean => {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidPattern.test(id);
};

// Development UUID - matches our RLS policies
export const DEV_USER_UUID = "00000000-0000-4000-a000-000000000000";

// Validate create online class params
export const validateCreateParams = (params: CreateOnlineClassParams): string | null => {
  // Validate required fields
  if (!params.class_id || !params.section_id || !params.subject_id || !params.date || 
      !params.start_time || !params.google_meet_link || !params.created_by) {
    console.error("Missing required fields for online class creation", params);
    toast.error("All required fields must be filled");
    return "Missing required fields";
  }
  
  // Check if required IDs are valid UUIDs
  if (!isValidUUID(params.class_id)) {
    console.error(`Invalid class_id: ${params.class_id}`);
    toast.error("Invalid class selection");
    return "Invalid class ID";
  }
  
  if (!isValidUUID(params.section_id)) {
    console.error(`Invalid section_id: ${params.section_id}`);
    toast.error("Invalid section selection");
    return "Invalid section ID";
  }
  
  if (!isValidUUID(params.subject_id)) {
    console.error(`Invalid subject_id: ${params.subject_id}`);
    toast.error("Invalid subject selection");
    return "Invalid subject ID";
  }
  
  return null;
};
