
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreateOnlineClassParams, OnlineClass } from "./types";
import { validateCreateParams } from "./validation";

export const createOnlineClass = async (params: CreateOnlineClassParams): Promise<OnlineClass | null> => {
  try {
    console.log("Creating online class with params:", params);
    
    // Validate params
    const validationError = validateCreateParams(params);
    if (validationError) {
      return null;
    }

    console.log(`Using created_by: ${params.created_by}`);

    const { data, error } = await supabase
      .from('online_classes')
      .insert(params)
      .select('*')
      .single();

    if (error) {
      console.error("Error creating online class:", error);
      
      // Provide more specific error messages based on error codes
      if (error.code === '23503') {
        toast.error("One of the referenced records (class, section, or subject) doesn't exist");
      } else {
        toast.error(`Failed to create online class: ${error.message}`);
      }
      return null;
    }

    console.log("Online class created successfully:", data);
    // Don't show toast here, let the component handle success messaging
    return data;
  } catch (error) {
    console.error("Exception creating online class:", error);
    toast.error("An unexpected error occurred when creating class");
    return null;
  }
};
