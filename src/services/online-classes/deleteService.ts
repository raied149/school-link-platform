
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const deleteOnlineClass = async (id: string): Promise<boolean> => {
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
};
