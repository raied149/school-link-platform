
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
      
      // First, fetch all tasks based on user role with basic details
      let query = supabase
        .from('tasks')
        .select('*');
        
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

      // Now, we need to fetch additional details
      // First, get all the required IDs
      const creatorIds = tasksData.map(task => task.created_by).filter(Boolean);
      const userIds = tasksData.map(task => task.assigned_to_user_id).filter(Boolean);
      const sectionIds = tasksData.map(task => task.assigned_to_section_id).filter(Boolean);
      const classIds = tasksData.map(task => task.assigned_to_class_id).filter(Boolean);
      const subjectIds = tasksData.map(task => task.subject_id).filter(Boolean);

      // Fetch creators
      const { data: creators } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', creatorIds);

      // Fetch assigned users
      const { data: assignedUsers } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', userIds);

      // Fetch sections
      const { data: sections } = await supabase
        .from('sections')
        .select('id, name')
        .in('id', sectionIds);

      // Fetch classes
      const { data: classes } = await supabase
        .from('classes')
        .select('id, name')
        .in('id', classIds);

      // Fetch subjects
      const { data: subjects } = await supabase
        .from('subjects')
        .select('id, name')
        .in('id', subjectIds);

      // Create lookup maps
      const creatorMap = creators ? creators.reduce((acc, creator) => {
        acc[creator.id] = `${creator.first_name} ${creator.last_name}`;
        return acc;
      }, {}) : {};
      
      const userMap = assignedUsers ? assignedUsers.reduce((acc, user) => {
        acc[user.id] = `${user.first_name} ${user.last_name}`;
        return acc;
      }, {}) : {};
      
      const sectionMap = sections ? sections.reduce((acc, section) => {
        acc[section.id] = section.name;
        return acc;
      }, {}) : {};
      
      const classMap = classes ? classes.reduce((acc, cls) => {
        acc[cls.id] = cls.name;
        return acc;
      }, {}) : {};
      
      const subjectMap = subjects ? subjects.reduce((acc, subject) => {
        acc[subject.id] = subject.name;
        return acc;
      }, {}) : {};

      // Combine all data
      const enrichedTasks = tasksData.map(task => ({
        ...task,
        creator_name: task.created_by ? creatorMap[task.created_by] : '',
        assigned_to_user_name: task.assigned_to_user_id ? userMap[task.assigned_to_user_id] : '',
        assigned_to_section_name: task.assigned_to_section_id ? sectionMap[task.assigned_to_section_id] : '',
        assigned_to_class_name: task.assigned_to_class_id ? classMap[task.assigned_to_class_id] : '',
        subject_name: task.subject_id ? subjectMap[task.subject_id] : ''
      }));

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
