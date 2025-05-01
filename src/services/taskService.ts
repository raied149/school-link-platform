
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserRole } from "@/contexts/AuthContext";

// Define TypeScript types for Task and related inputs
export interface Task {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  assigned_to_user_id?: string;
  assigned_to_section_id?: string;
  assigned_to_class_id?: string;
  title: string;
  description?: string;
  due_date?: string;
  due_time?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  type: 'personal' | 'assignment' | 'admin_task';
  google_drive_link?: string;
  subject_id?: string;
  
  // Joined fields
  creator_name?: string;
  assigned_to_user_name?: string;
  assigned_to_section_name?: string;
  assigned_to_class_name?: string;
  subject_name?: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  due_date?: string;
  due_time?: string;
  type: 'personal' | 'assignment' | 'admin_task';
  google_drive_link?: string;
  assigned_to_user_id?: string;
  assigned_to_section_id?: string;
  assigned_to_class_id?: string;
  subject_id?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  due_date?: string;
  due_time?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  google_drive_link?: string;
  subject_id?: string;
}

export const taskService = {
  createTask: async (input: CreateTaskInput): Promise<Task | null> => {
    try {
      if (!input.title) {
        toast.error("Task title is required");
        return null;
      }

      const taskData = {
        ...input,
        created_by: input.type === 'personal' ? input.assigned_to_user_id : undefined
      };

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
  },

  getTasksForUser: async (userId: string, userRole: UserRole): Promise<Task[]> => {
    try {
      console.log("Fetching tasks for user:", userId, "with role:", userRole);
      
      let query = supabase
        .from('tasks')
        .select(`
          *,
          creator:profiles!tasks_created_by_fkey(first_name, last_name),
          assignee:profiles!tasks_assigned_to_user_id_fkey(first_name, last_name),
          section:sections(name),
          class:classes(name),
          subject:subjects(name)
        `);
        
      // Apply different filters based on user role
      if (userRole === 'student') {
        // Students should only see tasks assigned to them
        query = query.eq('assigned_to_user_id', userId);
      } else if (userRole === 'teacher') {
        // Teachers see tasks they created or tasks assigned to them
        query = query.or(`created_by.eq.${userId},assigned_to_user_id.eq.${userId}`);
      }
      // Admins can see all tasks

      const { data, error } = await query
        .order('due_date', { ascending: true, nullsFirst: true })
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching tasks:", error);
        toast.error(`Failed to load tasks: ${error.message}`);
        return [];
      }

      console.log("Tasks fetched successfully:", data?.length || 0, "tasks found");
      
      return (data as any[]).map(item => ({
        ...item,
        creator_name: item.creator ? `${item.creator.first_name} ${item.creator.last_name}` : '',
        assigned_to_user_name: item.assignee ? `${item.assignee.first_name} ${item.assignee.last_name}` : '',
        assigned_to_section_name: item.section?.name,
        assigned_to_class_name: item.class?.name,
        subject_name: item.subject?.name
      }));
    } catch (error: any) {
      console.error("Exception fetching tasks:", error);
      toast.error(`Failed to load tasks: ${error.message}`);
      return [];
    }
  },

  updateTask: async (taskId: string, updates: UpdateTaskInput): Promise<Task | null> => {
    try {
      console.log("Updating task:", taskId, "with data:", updates);
      
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
  },

  deleteTask: async (taskId: string): Promise<boolean> => {
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
};
