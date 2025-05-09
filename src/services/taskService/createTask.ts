
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreateTaskInput, Task, DEFAULT_USER_ID } from "./types";

export async function createTask(input: CreateTaskInput): Promise<Task | null> {
  try {
    if (!input.title) {
      toast.error("Task title is required");
      return null;
    }

    // Clean up subject_id if it's "none"
    if (input.subject_id === "none") {
      input.subject_id = undefined;
    }

    // Make sure created_by is always set
    if (!input.created_by) {
      input.created_by = DEFAULT_USER_ID;
    }

    // For personal tasks, set created_by to the assigned user if not already set
    const taskData = { ...input };

    console.log("Creating task with data:", taskData);
    
    const { data, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select('*')
      .single();

    if (error) {
      console.error("Error creating task:", error);
      toast.error(`Failed to create task: ${error.message}`);
      return null;
    }

    toast.success("Task created successfully");
    return data as Task;
  } catch (error: any) {
    console.error("Exception creating task:", error);
    toast.error(`An unexpected error occurred: ${error.message}`);
    return null;
  }
}
