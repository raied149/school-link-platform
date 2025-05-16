
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task } from "./types";
import { UserRole } from "@/contexts/AuthContext";

export async function getTasksForUser(userId: string, userRole: UserRole): Promise<Task[]> {
  try {
    console.log("Fetching tasks for user:", userId, "with role:", userRole);
    
    if (!userId) {
      console.error("No user ID provided");
      return [];
    }
    
    let query = supabase.from('tasks').select('*');
    
    // Apply different filters based on user role
    if (userRole === 'student') {
      // First, get the student's section to include section-assigned tasks
      const { data: studentSection, error: sectionError } = await supabase
        .from('student_sections')
        .select('section_id, sections!inner (class_id)')
        .eq('student_id', userId)
        .maybeSingle();
      
      if (sectionError) {
        console.error("Error fetching student section:", sectionError);
      }
      
      // For students, we need to show:
      // 1. Tasks directly assigned to them
      // 2. Tasks assigned to their section
      // 3. Tasks assigned to their class
      if (studentSection) {
        const sectionId = studentSection.section_id;
        const classId = studentSection.sections.class_id;
        
        console.log("Found student section:", sectionId, "and class:", classId);
        
        // Query tasks where:
        // - Task is assigned directly to this student, OR
        // - Task is assigned to their section, OR
        // - Task is assigned to their class
        query = query.or(`assigned_to_user_id.eq.${userId},assigned_to_section_id.eq.${sectionId},assigned_to_class_id.eq.${classId}`);
      } else {
        // If we couldn't find the student's section, just show tasks assigned to them directly
        query = query.eq('assigned_to_user_id', userId);
      }
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
}
