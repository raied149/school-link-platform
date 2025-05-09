
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export async function deleteTask(taskId: string): Promise<boolean> {
  try {
    console.log("Deleting task:", taskId);
    
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error("Error deleting task:", error);
      toast.error(`Failed to delete task: ${error.message}`);
      return false;
    }

    toast.success("Task deleted successfully");
    return true;
  } catch (error: any) {
    console.error("Exception deleting task:", error);
    toast.error(`An unexpected error occurred: ${error.message}`);
    return false;
  }
}
