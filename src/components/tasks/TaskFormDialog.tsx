import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Task, CreateTaskInput, taskService, DEFAULT_USER_ID } from "@/services/taskService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Users } from "lucide-react";
import { format } from "date-fns";
import { academicYearService } from "@/services/academicYearService";
import { TeacherSelectionDialog } from "../calendar/TeacherSelectionDialog";

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task; // For editing existing tasks
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
  
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<{
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
  
  // Determine available task types based on user role
  const availableTaskTypes = user?.role === 'admin' 
    ? ['admin_task']
    : user?.role === 'teacher'
      ? ['personal', 'assignment']
      : ['personal'];

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
      created_by: user?.id || DEFAULT_USER_ID  // Always set created_by
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

  const isValidURL = (str: string) => {
    if (!str) return true;
    try {
      new URL(str);
      return true;
    } catch (_) {
      return false;
    }
  };
  
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
          <DialogHeader>
            <DialogTitle>{task ? "Edit Task" : "Create New Task"}</DialogTitle>
            <DialogDescription>
              {task 
                ? "Update task details below." 
                : "Create a new task or assignment by filling out the details below."}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  placeholder="Enter task title"
                  {...register("title", { required: "Title is required" })}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter task description (optional)"
                  {...register("description")}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taskType">Task Type <span className="text-red-500">*</span></Label>
                  <Select value={taskType} onValueChange={(value: any) => setTaskType(value)}>
                    <SelectTrigger id="taskType">
                      <SelectValue placeholder="Select task type" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTaskTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type === 'personal' ? 'Personal Task' : 
                          type === 'assignment' ? 'Assignment' : 'Administrative Task'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject (Optional)</Label>
                  <Select 
                    value={selectedSubjectId || undefined} 
                    onValueChange={setSelectedSubjectId}
                  >
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No subject</SelectItem>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time">Due Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>
              
              {taskType === 'admin_task' && user?.role === 'admin' && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <Users className="h-4 w-4" /> Assign to Teacher
                  </Label>
                  <div className="flex items-center gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1 justify-start"
                      onClick={() => setTeacherSelectionOpen(true)}
                    >
                      {selectedTeachers.length > 0 
                        ? `${selectedTeachers.length} teacher${selectedTeachers.length > 1 ? 's' : ''} selected` 
                        : "Select teachers"}
                    </Button>
                    {selectedTeachers.length > 0 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedTeachers([])}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              )}
              
              {taskType === 'assignment' && user?.role === 'teacher' && (
                <>
                  <div className="space-y-2">
                    <Label>Assignment Type</Label>
                    <Select value={assignmentType} onValueChange={(value: any) => setAssignmentType(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Individual Student</SelectItem>
                        <SelectItem value="section">Section</SelectItem>
                        <SelectItem value="class">Entire Class</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {assignmentType === 'user' && (
                    <div className="space-y-2">
                      <Label htmlFor="studentId">Assign to Student <span className="text-red-500">*</span></Label>
                      <Select 
                        value={selectedUserId || undefined} 
                        onValueChange={setSelectedUserId}
                      >
                        <SelectTrigger id="studentId">
                          <SelectValue placeholder="Select a student" />
                        </SelectTrigger>
                        <SelectContent>
                          {students.map((student) => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.first_name} {student.last_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {assignmentType === 'class' && (
                    <div className="space-y-2">
                      <Label htmlFor="classId">Assign to Class <span className="text-red-500">*</span></Label>
                      <Select 
                        value={selectedClassId || undefined} 
                        onValueChange={setSelectedClassId}
                      >
                        <SelectTrigger id="classId">
                          <SelectValue placeholder="Select a class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {assignmentType === 'section' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="sectionClassId">Class <span className="text-red-500">*</span></Label>
                        <Select 
                          value={selectedClassId || undefined} 
                          onValueChange={setSelectedClassId}
                        >
                          <SelectTrigger id="sectionClassId">
                            <SelectValue placeholder="Select a class first" />
                          </SelectTrigger>
                          <SelectContent>
                            {classes.map((cls) => (
                              <SelectItem key={cls.id} value={cls.id}>
                                {cls.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="sectionId">Assign to Section <span className="text-red-500">*</span></Label>
                        <Select 
                          value={selectedSectionId || undefined} 
                          onValueChange={setSelectedSectionId}
                          disabled={!selectedClassId}
                        >
                          <SelectTrigger id="sectionId">
                            <SelectValue placeholder={selectedClassId ? "Select a section" : "Select a class first"} />
                          </SelectTrigger>
                          <SelectContent>
                            {sections.map((section) => (
                              <SelectItem key={section.id} value={section.id}>
                                {section.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="googleDriveLink">Google Drive Link (Optional)</Label>
                <Input
                  id="googleDriveLink"
                  placeholder="https://drive.google.com/..."
                  value={googleDriveLink}
                  onChange={(e) => setGoogleDriveLink(e.target.value)}
                />
                {googleDriveLink && !isValidURL(googleDriveLink) && (
                  <p className="text-sm text-red-500">Please enter a valid URL</p>
                )}
              </div>
            </div>
            
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createTaskMutation.isPending || updateTaskMutation.isPending}
              >
                {createTaskMutation.isPending || updateTaskMutation.isPending 
                  ? "Saving..." 
                  : task ? "Update Task" : "Create Task"}
              </Button>
            </DialogFooter>
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
