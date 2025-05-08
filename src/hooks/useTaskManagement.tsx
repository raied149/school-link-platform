
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { taskService, Task, DEFAULT_USER_ID } from "@/services/taskService";
import { format } from "date-fns";

interface UseTaskManagementOptions {
  userId?: string;
  userRole?: string;
}

export function useTaskManagement({ userId, userRole }: UseTaskManagementOptions) {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<Task['status'] | 'all'>('all');
  const [filterType, setFilterType] = useState<Task['type'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState('all');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Format selected date for filtering
  const formattedSelectedDate = format(selectedDate, 'yyyy-MM-dd');

  // Fetch tasks for the logged-in user or use default user
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", userId || DEFAULT_USER_ID, userRole || "admin"],
    queryFn: async () => {
      return taskService.getTasksForUser(
        userId || DEFAULT_USER_ID, 
        userRole || "admin"
      );
    },
  });
  
  const deleteTaskMutation = useMutation({
    mutationFn: taskService.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
  
  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Task['status'] }) => 
      taskService.updateTask(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
  
  const handleDeleteTask = (taskId: string) => {
    deleteTaskMutation.mutate(taskId);
  };
  
  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsFormOpen(true);
  };
  
  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    updateTaskStatusMutation.mutate({ id: taskId, status: newStatus });
  };
  
  const handleAddTask = () => {
    setSelectedTask(undefined);
    setIsFormOpen(true);
  };
  
  const handleFormClose = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setSelectedTask(undefined);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setIsCalendarOpen(false);
      // Switch to date view if not already there
      if (currentTab !== 'by_date') {
        setCurrentTab('by_date');
      }
    }
  };
  
  return {
    tasks,
    isLoading,
    isFormOpen,
    selectedTask,
    filterStatus,
    filterType,
    searchQuery,
    currentTab,
    selectedDate,
    isCalendarOpen,
    formattedSelectedDate,
    setFilterStatus,
    setFilterType,
    setSearchQuery,
    setCurrentTab,
    setSelectedDate,
    setIsCalendarOpen,
    handleDeleteTask,
    handleEditTask,
    handleStatusChange,
    handleAddTask,
    handleFormClose,
    handleDateSelect
  };
}
