
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task, UpdateTaskInput } from "./types";

export async function updateTask(taskId: string, updates: UpdateTaskInput): Promise<Task | null> {
  try {
    console.log("Updating task:", taskId, "with data:", updates);
    
    // Clean up subject_id if it's "none"
    if (updates.subject_id === "none") {
      updates.subject_id = undefined;
    }
    
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select('*')
      .single();

    if (error) {
      console.error("Error updating task:", error);
      toast.error(`Failed to update task: ${error.message}`);
      return null;
    }

    toast.success("Task updated successfully");
    return data as Task;
  } catch (error: any) {
    console.error("Exception updating task:", error);
    toast.error(`An unexpected error occurred: ${error.message}`);
    return null;
  }
}
