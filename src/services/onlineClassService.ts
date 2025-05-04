
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

export const onlineClassService = {
  // Create a new online class
  createOnlineClass: async (params: CreateOnlineClassParams): Promise<OnlineClass | null> => {
    try {
      // Check if created_by is a valid UUID
      if (!isValidUUID(params.created_by)) {
        // For development/testing, use a placeholder UUID if the ID isn't valid
        console.log(`Non-UUID user ID detected: ${params.created_by}, using a placeholder UUID`);
        // Generate a deterministic UUID for test users
        params.created_by = "00000000-0000-4000-a000-000000000000"; // Use a placeholder UUID
      }

      const { data, error } = await supabase
        .from('online_classes')
        .insert(params)
        .select('*')
        .single();

      if (error) {
        console.error("Error creating online class:", error);
        toast.error("Failed to schedule online class");
        return null;
      }

      toast.success("Online class scheduled successfully");
      return data;
    } catch (error) {
      console.error("Exception creating online class:", error);
      toast.error("An unexpected error occurred");
      return null;
    }
  },

  // Get online classes for a specific user based on their role
  getOnlineClassesForUser: async (userId: string, userRole: UserRole): Promise<OnlineClassWithDetails[]> => {
    try {
      // Use a placeholder UUID for development/test users with non-UUID IDs
      const queryUserId = isValidUUID(userId) ? userId : "00000000-0000-4000-a000-000000000000";
      
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
        toast.error("Failed to delete online class");
        return false;
      }

      toast.success("Online class deleted successfully");
      return true;
    } catch (error) {
      console.error("Exception deleting online class:", error);
      toast.error("An unexpected error occurred");
      return false;
    }
  }
};
