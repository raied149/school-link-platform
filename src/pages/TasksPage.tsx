
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { taskService, Task } from "@/services/taskService";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Search, Filter, Calendar as CalendarIcon, Clock } from "lucide-react";
import { toast } from "sonner";
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog";
import { TaskItem } from "@/components/tasks/TaskItem";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

export default function TasksPage() {
  const { user } = useAuth();
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

  // Fetch tasks for the logged-in user
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", user?.id, user?.role],
    queryFn: async () => {
      if (!user) {
        return [];
      }
      return taskService.getTasksForUser(user.id, user.role);
    },
    enabled: !!user,
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

  // Filter and search logic
  const filteredTasks = tasks.filter(task => {
    // Date filter (if we're viewing by date, only show tasks due on that date)
    if (currentTab === 'by_date' && task.due_date !== formattedSelectedDate) {
      return false;
    }
    
    // Status filter
    if (filterStatus !== 'all' && task.status !== filterStatus) {
      return false;
    }
    
    // Type filter
    if (filterType !== 'all' && task.type !== filterType) {
      return false;
    }
    
    // Tab filter
    if (currentTab === 'assigned' && task.created_by === user?.id) {
      return false;
    }
    if (currentTab === 'received' && task.created_by !== user?.id) {
      return false;
    }
    if (currentTab === 'completed' && task.status !== 'completed') {
      return false;
    }
    if (currentTab === 'pending' && task.status === 'completed') {
      return false;
    }
    
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query)) ||
        (task.assigned_to_user_name && task.assigned_to_user_name.toLowerCase().includes(query)) ||
        (task.creator_name && task.creator_name.toLowerCase().includes(query))
      );
    }
    
    return true;
  });
  
  // Get tasks for the selected date (for the sidebar view)
  const tasksForSelectedDate = tasks.filter(task => 
    task.due_date === formattedSelectedDate
  );
  
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
        <div className="flex gap-2">
          {user && (
            <Button onClick={handleAddTask}>
              <Plus className="mr-2 h-4 w-4" />
              Create Task
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="p-4 md:col-span-4">
          <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList className="mb-2 h-9">
                <TabsTrigger value="all">All</TabsTrigger>
                {user?.role !== 'student' && <TabsTrigger value="assigned">Assigned By Me</TabsTrigger>}
                <TabsTrigger value="received">Assigned To Me</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="by_date">By Date</TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
              <div className="flex-1 relative w-full">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                  <SelectTrigger className="h-9 w-full sm:w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                  <SelectTrigger className="h-9 w-full sm:w-[130px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="admin_task">Administrative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {currentTab === 'by_date' && (
              <div className="flex justify-center sm:justify-start pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Selected date:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{format(selectedDate, 'MMMM d, yyyy')}</span>
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <CalendarIcon className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={handleDateSelect}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-4">
              {isLoading ? (
                <div className="text-center py-10">Loading tasks...</div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  No tasks found. {user && "Create a new task to get started."}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTasks.map(task => (
                    <TaskItem 
                      key={task.id}
                      task={task}
                      onDelete={handleDeleteTask}
                      onEdit={handleEditTask}
                      onStatusChange={handleStatusChange}
                      currentUserId={user?.id}
                    />
                  ))}
                </div>
              )}
            </div>
          </Tabs>
        </Card>
        
        <Card className="p-4 md:col-span-3">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Tasks for {format(selectedDate, 'MMMM d, yyyy')}</h2>
            <p className="text-muted-foreground">View and manage tasks due on this date</p>
          </div>
          
          <div className="space-y-4 mt-4">
            {isLoading ? (
              <div className="text-center py-4">Loading tasks...</div>
            ) : tasksForSelectedDate.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No tasks due on {format(selectedDate, 'MMMM d, yyyy')}.
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {tasksForSelectedDate.map(task => (
                  <TaskItem 
                    key={task.id}
                    task={task}
                    onDelete={handleDeleteTask}
                    onEdit={handleEditTask}
                    onStatusChange={handleStatusChange}
                    currentUserId={user?.id}
                    compact
                  />
                ))}
              </div>
            )}
            
            <div className="mt-6">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full border-dashed">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Select a date
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              
              <div className="flex justify-between mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedDate(new Date())}
                >
                  Today
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setDate(newDate.getDate() - 1);
                      setSelectedDate(newDate);
                    }}
                  >
                    <Clock className="h-4 w-4 -rotate-90" />
                    <span className="sr-only">Previous day</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setDate(newDate.getDate() + 1);
                      setSelectedDate(newDate);
                    }}
                  >
                    <Clock className="h-4 w-4 rotate-90" />
                    <span className="sr-only">Next day</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      <TaskFormDialog 
        open={isFormOpen} 
        onOpenChange={handleFormClose} 
        task={selectedTask}
      />
    </div>
  );
}
