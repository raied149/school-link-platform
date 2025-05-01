
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

      // Clean up subject_id if it's "none"
      if (input.subject_id === "none") {
        input.subject_id = undefined;
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
      
      if (!userId) {
        console.error("No user ID provided");
        return [];
      }
      
      // Fetch tasks with basic details
      let query = supabase.from('tasks').select('*');
        
      // Apply different filters based on user role
      if (userRole === 'student') {
        // Students should only see tasks assigned to them
        query = query.eq('assigned_to_user_id', userId);
      } else if (userRole === 'teacher') {
        // Teachers see tasks they created or tasks assigned to them
        query = query.or(`created_by.eq.${userId},assigned_to_user_id.eq.${userId}`);
      }
      // Admins can see all tasks

      const { data: tasksData, error } = await query
        .order('due_date', { ascending: true, nullsFirst: true })
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching tasks:", error);
        toast.error(`Failed to load tasks: ${error.message}`);
        return [];
      }

      // No tasks found
      if (!tasksData || tasksData.length === 0) {
        return [];
      }

      // Manual join for creator/assignee information
      const taskIds = tasksData.map(task => task.id);
      let enrichedTasks = [...tasksData];
      
      try {
        // Get creator info
        const creatorIds = tasksData
          .map(task => task.created_by)
          .filter(Boolean) as string[];
        
        if (creatorIds.length > 0) {
          const { data: creators } = await supabase
            .from('profiles')
            .select('id, first_name, last_name')
            .in('id', creatorIds);

          if (creators && creators.length > 0) {
            const creatorMap = new Map();
            creators.forEach(creator => {
              creatorMap.set(creator.id, `${creator.first_name} ${creator.last_name}`);
            });

            enrichedTasks = enrichedTasks.map(task => ({
              ...task,
              creator_name: task.created_by ? creatorMap.get(task.created_by) || '' : ''
            }));
          }
        }

        // Get assignee info
        const assigneeIds = tasksData
          .map(task => task.assigned_to_user_id)
          .filter(Boolean) as string[];
        
        if (assigneeIds.length > 0) {
          const { data: assignees } = await supabase
            .from('profiles')
            .select('id, first_name, last_name')
            .in('id', assigneeIds);

          if (assignees && assignees.length > 0) {
            const assigneeMap = new Map();
            assignees.forEach(assignee => {
              assigneeMap.set(assignee.id, `${assignee.first_name} ${assignee.last_name}`);
            });

            enrichedTasks = enrichedTasks.map(task => ({
              ...task,
              assigned_to_user_name: task.assigned_to_user_id 
                ? assigneeMap.get(task.assigned_to_user_id) || '' 
                : ''
            }));
          }
        }

        // Get section info
        const sectionIds = tasksData
          .map(task => task.assigned_to_section_id)
          .filter(Boolean) as string[];
        
        if (sectionIds.length > 0) {
          const { data: sections } = await supabase
            .from('sections')
            .select('id, name')
            .in('id', sectionIds);

          if (sections && sections.length > 0) {
            const sectionMap = new Map();
            sections.forEach(section => {
              sectionMap.set(section.id, section.name);
            });

            enrichedTasks = enrichedTasks.map(task => ({
              ...task,
              assigned_to_section_name: task.assigned_to_section_id 
                ? sectionMap.get(task.assigned_to_section_id) || '' 
                : ''
            }));
          }
        }

        // Get class info
        const classIds = tasksData
          .map(task => task.assigned_to_class_id)
          .filter(Boolean) as string[];
        
        if (classIds.length > 0) {
          const { data: classes } = await supabase
            .from('classes')
            .select('id, name')
            .in('id', classIds);

          if (classes && classes.length > 0) {
            const classMap = new Map();
            classes.forEach(cls => {
              classMap.set(cls.id, cls.name);
            });

            enrichedTasks = enrichedTasks.map(task => ({
              ...task,
              assigned_to_class_name: task.assigned_to_class_id 
                ? classMap.get(task.assigned_to_class_id) || '' 
                : ''
            }));
          }
        }

        // Get subject info
        const subjectIds = tasksData
          .map(task => task.subject_id)
          .filter(Boolean) as string[];
        
        if (subjectIds.length > 0) {
          const { data: subjects } = await supabase
            .from('subjects')
            .select('id, name')
            .in('id', subjectIds);

          if (subjects && subjects.length > 0) {
            const subjectMap = new Map();
            subjects.forEach(subject => {
              subjectMap.set(subject.id, subject.name);
            });

            enrichedTasks = enrichedTasks.map(task => ({
              ...task,
              subject_name: task.subject_id 
                ? subjectMap.get(task.subject_id) || '' 
                : ''
            }));
          }
        }
      } catch (joinError) {
        console.error("Error enriching tasks with additional data:", joinError);
        // Continue with basic task data
      }

      console.log("Tasks fetched successfully:", enrichedTasks.length, "tasks found");
      return enrichedTasks;
    } catch (error: any) {
      console.error("Exception fetching tasks:", error);
      toast.error(`Failed to load tasks: ${error.message}`);
      return [];
    }
  },

  updateTask: async (taskId: string, updates: UpdateTaskInput): Promise<Task | null> => {
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
