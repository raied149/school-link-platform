
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
  created_by: string;
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

// Default user ID to use when no authenticated user is available
export const DEFAULT_USER_ID = "123e4567-e89b-12d3-a456-426614174000"; // Admin user
