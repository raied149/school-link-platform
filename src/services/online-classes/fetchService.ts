
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { OnlineClassWithDetails } from "./types";
import { UserRole } from "@/contexts/AuthContext";
import { isValidUUID, DEV_USER_UUID } from "./validation";

export const getOnlineClassesForUser = async (userId: string, userRole: UserRole): Promise<OnlineClassWithDetails[]> => {
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
};

export const getOnlineClassesByDateSection = async (date: string, sectionId: string): Promise<OnlineClassWithDetails[]> => {
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
};
