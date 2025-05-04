
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserRole } from "@/contexts/AuthContext";

export interface OnlineClass {
  id: string;
  created_at: string;
  created_by: string;
  class_id: string;
  section_id: string;
  subject_id: string;
  date: string;
  start_time: string;
  end_time?: string;
  google_meet_link: string;
  title?: string;
}

export interface OnlineClassWithDetails extends OnlineClass {
  class_name?: string;
  section_name?: string;
  subject_name?: string;
  teacher_name?: string;
}

export interface CreateOnlineClassParams {
  class_id: string;
  section_id: string;
  subject_id: string;
  date: string;
  start_time: string;
  end_time?: string;
  google_meet_link: string;
  title?: string;
  created_by: string;
}

// Helper function to check if string is a valid UUID
const isValidUUID = (id: string) => {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidPattern.test(id);
};

// Development UUID - matches our RLS policies
const DEV_USER_UUID = "00000000-0000-4000-a000-000000000000";

export const onlineClassService = {
  // Create a new online class
  createOnlineClass: async (params: CreateOnlineClassParams): Promise<OnlineClass | null> => {
    try {
      console.log("Creating online class with params:", params);
      
      // Check if created_by is a valid UUID, if not use our development UUID
      if (!isValidUUID(params.created_by)) {
        console.log(`Non-UUID user ID detected: ${params.created_by}, using development UUID`);
        params.created_by = DEV_USER_UUID; // Use our development UUID that matches RLS policies
      }

      const { data, error } = await supabase
        .from('online_classes')
        .insert(params)
        .select('*')
        .single();

      if (error) {
        console.error("Error creating online class:", error);
        toast.error(`Failed to create online class: ${error.message}`);
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
  },

  // Get online classes for a specific user based on their role
  getOnlineClassesForUser: async (userId: string, userRole: UserRole): Promise<OnlineClassWithDetails[]> => {
    try {
      console.log("Getting online classes for user:", userId, userRole);
      
      // Use our development UUID for non-UUID IDs
      const queryUserId = isValidUUID(userId) ? userId : DEV_USER_UUID;
      console.log("Using query user ID:", queryUserId);
      
      let query = supabase
        .from('online_classes')
        .select(`
          *,
          classes(name),
          sections(name),
          subjects(name),
          profiles!online_classes_created_by_fkey(first_name, last_name)
        `);

      // Apply filters based on user role
      if (userRole === 'teacher') {
        query = query.eq('created_by', queryUserId);
      }
      
      // Note: For students, the RLS policy will handle filtering
      
      const { data, error } = await query.order('date', { ascending: true });

      if (error) {
        console.error("Error fetching online classes:", error);
        toast.error("Failed to load online classes");
        return [];
      }

      console.log("Fetched online classes:", data);
      
      return (data as any[]).map(item => ({
        ...item,
        class_name: item.classes?.name,
        section_name: item.sections?.name,
        subject_name: item.subjects?.name,
        teacher_name: `${item.profiles?.first_name || 'Unknown'} ${item.profiles?.last_name || 'Teacher'}`
      }));
    } catch (error) {
      console.error("Exception fetching online classes:", error);
      toast.error("An unexpected error occurred");
      return [];
    }
  },

  // Get online classes by date and section
  getOnlineClassesByDateSection: async (date: string, sectionId: string): Promise<OnlineClassWithDetails[]> => {
    try {
      const { data, error } = await supabase
        .from('online_classes')
        .select(`
          *,
          classes(name),
          sections(name),
          subjects(name),
          profiles!online_classes_created_by_fkey(first_name, last_name)
        `)
        .eq('date', date)
        .eq('section_id', sectionId)
        .order('start_time', { ascending: true });

      if (error) {
        console.error("Error fetching online classes by date/section:", error);
        toast.error("Failed to load online classes");
        return [];
      }

      return (data as any[]).map(item => ({
        ...item,
        class_name: item.classes?.name,
        section_name: item.sections?.name,
        subject_name: item.subjects?.name,
        teacher_name: `${item.profiles?.first_name} ${item.profiles?.last_name}`
      }));
    } catch (error) {
      console.error("Exception fetching online classes by date/section:", error);
      toast.error("An unexpected error occurred");
      return [];
    }
  },

  // Delete an online class
  deleteOnlineClass: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('online_classes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting online class:", error);
        toast.error(`Failed to delete online class: ${error.message}`);
        return false;
      }

      // Don't show toast here, let component handle success messaging
      return true;
    } catch (error) {
      console.error("Exception deleting online class:", error);
      toast.error("An unexpected error occurred");
      return false;
    }
  }
};
