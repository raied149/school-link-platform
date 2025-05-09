
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Task, CreateTaskInput, taskService, DEFAULT_USER_ID } from "@/services/taskService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { academicYearService } from "@/services/academicYearService";
import { TeacherSelectionDialog } from "../calendar/TeacherSelectionDialog";
import { TaskFormHeader } from "./form/TaskFormHeader";
import { TaskBasicFields } from "./form/TaskBasicFields";
import { TaskDateTimePicker } from "./form/TaskDateTimePicker";
import { AdminTaskFields } from "./form/AdminTaskFields";
import { TeacherAssignmentFields } from "./form/TeacherAssignmentFields";
import { TaskGoogleDriveLink } from "./form/TaskGoogleDriveLink";
import { TaskFormFooter } from "./form/TaskFormFooter";

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
}

export function TaskFormDialog({ open, onOpenChange, task }: TaskFormDialogProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [taskType, setTaskType] = useState<'personal' | 'assignment' | 'admin_task'>(task?.type || 'personal');
  const [date, setDate] = useState<Date | undefined>(task?.due_date ? new Date(task.due_date) : undefined);
  const [time, setTime] = useState(task?.due_time || "");
  const [googleDriveLink, setGoogleDriveLink] = useState(task?.google_drive_link || "");
  const [assignmentType, setAssignmentType] = useState<'user' | 'section' | 'class'>(
    task?.assigned_to_user_id ? 'user' : 
    task?.assigned_to_section_id ? 'section' : 
    task?.assigned_to_class_id ? 'class' : 'user'
  );
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(task?.assigned_to_user_id);
  const [selectedSectionId, setSelectedSectionId] = useState<string | undefined>(task?.assigned_to_section_id);
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>(task?.assigned_to_class_id);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | undefined>(task?.subject_id);
  
  // Teacher selection
  const [teacherSelectionOpen, setTeacherSelectionOpen] = useState(false);
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>(
    task?.assigned_to_user_id && task.type === 'admin_task' ? [task.assigned_to_user_id] : []
  );
  
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<{
    title: string;
    description: string;
  }>({
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
    },
  });

  // Get current active academic year
  const { data: activeYear } = useQuery({
    queryKey: ['active-academic-year'],
    queryFn: () => academicYearService.getActiveAcademicYear(),
  });
  
  // Fetch teachers for admin tasks
  const { data: teachers = [] } = useQuery({
    queryKey: ["teachers-for-tasks"],
    queryFn: async () => {
      if (!user || user.role !== 'admin') return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          teacher_details (
            professional_info
          )
        `)
        .eq('role', 'teacher');
      
      if (error) {
        console.error("Error fetching teachers:", error);
        return [];
      }
      
      return data.map(teacher => {
        // Safely access employeeId with proper type checking
        const professionalInfo = teacher.teacher_details?.professional_info;
        let employeeId = 'N/A';
        
        if (professionalInfo && 
            typeof professionalInfo === 'object' && 
            'employeeId' in professionalInfo) {
          employeeId = professionalInfo.employeeId as string || 'N/A';
        }
        
        return {
          id: teacher.id,
          name: `${teacher.first_name} ${teacher.last_name}`,
          employeeId: employeeId
        };
      });
    },
    enabled: !!user && user.role === 'admin',
  });
  
  // Fetch students for assignments
  const { data: students = [] } = useQuery({
    queryKey: ["students-for-tasks"],
    queryFn: async () => {
      if (!user || user.role !== 'teacher') return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student');
      
      if (error) {
        console.error("Error fetching students:", error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user && user.role === 'teacher' && taskType === 'assignment' && assignmentType === 'user',
  });
  
  // Fetch classes for assignments
  const { data: classes = [] } = useQuery({
    queryKey: ["classes-for-tasks", activeYear?.id],
    queryFn: async () => {
      if (!user || !activeYear?.id) return [];
      
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('year_id', activeYear.id)
        .order('name');
      
      if (error) {
        console.error("Error fetching classes:", error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user && !!activeYear?.id && taskType === 'assignment' && assignmentType === 'class',
  });
  
  // Fetch sections based on selected class
  const { data: sections = [] } = useQuery({
    queryKey: ["sections-for-tasks", selectedClassId],
    queryFn: async () => {
      if (!selectedClassId) return [];
      
      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .eq('class_id', selectedClassId)
        .order('name');
      
      if (error) {
        console.error("Error fetching sections:", error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!selectedClassId && taskType === 'assignment' && assignmentType === 'section',
  });
  
  // Fetch subjects for the selected class
  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects-for-tasks", selectedClassId],
    queryFn: async () => {
      if (!selectedClassId) return [];
      
      // Get subjects associated with the class
      const { data: subjectClasses, error: subjectClassesError } = await supabase
        .from('subject_classes')
        .select('subject_id')
        .eq('class_id', selectedClassId);
      
      if (subjectClassesError) {
        console.error("Error fetching subject classes:", subjectClassesError);
        return [];
      }
      
      if (!subjectClasses || subjectClasses.length === 0) return [];
      
      const subjectIds = subjectClasses.map(sc => sc.subject_id);
      
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .in('id', subjectIds)
        .order('name');
      
      if (error) {
        console.error("Error fetching subjects:", error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!selectedClassId,
  });

  useEffect(() => {
    // Reset form when dialog opens/closes or task changes
    if (!open) {
      reset();
      setTaskType('personal');
      setDate(undefined);
      setTime("");
      setGoogleDriveLink("");
      setAssignmentType('user');
      setSelectedUserId(undefined);
      setSelectedSectionId(undefined);
      setSelectedClassId(undefined);
      setSelectedSubjectId(undefined);
      setSelectedTeachers([]);
    } else if (task) {
      setValue('title', task.title);
      setValue('description', task.description || '');
      setTaskType(task.type);
      setDate(task.due_date ? new Date(task.due_date) : undefined);
      setTime(task.due_time || '');
      setGoogleDriveLink(task.google_drive_link || '');
      setSelectedSubjectId(task.subject_id);
      
      if (task.assigned_to_user_id) {
        if (task.type === 'admin_task') {
          setSelectedTeachers([task.assigned_to_user_id]);
        } else {
          setAssignmentType('user');
          setSelectedUserId(task.assigned_to_user_id);
        }
      } else if (task.assigned_to_section_id) {
        setAssignmentType('section');
        setSelectedSectionId(task.assigned_to_section_id);
      } else if (task.assigned_to_class_id) {
        setAssignmentType('class');
        setSelectedClassId(task.assigned_to_class_id);
      }
    }
  }, [open, task, reset, setValue]);
  
  // Effect to update selectedUserId when selectedTeachers changes
  useEffect(() => {
    if (taskType === 'admin_task' && selectedTeachers.length > 0) {
      setSelectedUserId(selectedTeachers[0]);
    }
  }, [selectedTeachers, taskType]);
  
  const createTaskMutation = useMutation({
    mutationFn: taskService.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      onOpenChange(false);
    }
  });
  
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      taskService.updateTask(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      onOpenChange(false);
    }
  });

  const onSubmit = handleSubmit((data) => {
    const formattedDate = date ? format(date, 'yyyy-MM-dd') : undefined;
    
    let taskInput: CreateTaskInput = {
      title: data.title,
      description: data.description,
      due_date: formattedDate,
      due_time: time || undefined,
      type: taskType,
      google_drive_link: googleDriveLink || undefined,
      subject_id: selectedSubjectId,
      created_by: user?.id || DEFAULT_USER_ID
    };
    
    // Set assignment target based on assignment type
    if (taskType === 'personal') {
      taskInput.assigned_to_user_id = user?.id || DEFAULT_USER_ID;
    } else if (taskType === 'admin_task') {
      if (!selectedUserId) {
        toast.error("Please select a teacher to assign this task to");
        return;
      }
      taskInput.assigned_to_user_id = selectedUserId;
    } else if (taskType === 'assignment') {
      switch (assignmentType) {
        case 'user':
          if (!selectedUserId) {
            toast.error("Please select a student to assign this task to");
            return;
          }
          taskInput.assigned_to_user_id = selectedUserId;
          break;
        case 'section':
          if (!selectedSectionId) {
            toast.error("Please select a section to assign this task to");
            return;
          }
          taskInput.assigned_to_section_id = selectedSectionId;
          break;
        case 'class':
          if (!selectedClassId) {
            toast.error("Please select a class to assign this task to");
            return;
          }
          taskInput.assigned_to_class_id = selectedClassId;
          break;
      }
    }
    
    if (task) {
      // Update existing task
      updateTaskMutation.mutate({
        id: task.id,
        updates: taskInput
      });
    } else {
      // Create new task
      createTaskMutation.mutate(taskInput);
    }
  });
  
  // Handle teacher selection
  const handleTeacherSelect = (teacherIds: string[]) => {
    setSelectedTeachers(teacherIds);
    if (teacherIds.length > 0) {
      setSelectedUserId(teacherIds[0]);
    } else {
      setSelectedUserId(undefined);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <TaskFormHeader task={task} />
          
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <TaskBasicFields
                register={register}
                errors={errors}
                taskType={taskType}
                setTaskType={setTaskType}
                selectedSubjectId={selectedSubjectId}
                setSelectedSubjectId={setSelectedSubjectId}
                subjects={subjects}
                userRole={user?.role}
              />
              
              <TaskDateTimePicker
                date={date}
                setDate={setDate}
                time={time}
                setTime={setTime}
              />
              
              {taskType === 'admin_task' && user?.role === 'admin' && (
                <AdminTaskFields
                  selectedTeachers={selectedTeachers}
                  setTeacherSelectionOpen={setTeacherSelectionOpen}
                  setSelectedTeachers={setSelectedTeachers}
                />
              )}
              
              {taskType === 'assignment' && user?.role === 'teacher' && (
                <TeacherAssignmentFields
                  assignmentType={assignmentType}
                  setAssignmentType={setAssignmentType}
                  selectedUserId={selectedUserId}
                  setSelectedUserId={setSelectedUserId}
                  selectedClassId={selectedClassId}
                  setSelectedClassId={setSelectedClassId}
                  selectedSectionId={selectedSectionId}
                  setSelectedSectionId={setSelectedSectionId}
                  students={students}
                  classes={classes}
                  sections={sections}
                />
              )}
              
              <TaskGoogleDriveLink
                googleDriveLink={googleDriveLink}
                setGoogleDriveLink={setGoogleDriveLink}
              />
            </div>
            
            <TaskFormFooter
              onCancel={() => onOpenChange(false)}
              isPending={createTaskMutation.isPending || updateTaskMutation.isPending}
              isEdit={!!task}
            />
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Teacher Selection Dialog */}
      <TeacherSelectionDialog
        open={teacherSelectionOpen}
        onOpenChange={setTeacherSelectionOpen}
        selectedTeachers={selectedTeachers}
        onTeachersSelect={handleTeacherSelect}
      />
    </>
  );
}
