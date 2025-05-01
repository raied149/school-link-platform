
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { taskService, Task } from "@/services/taskService";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Search, Filter, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskItem } from "@/components/tasks/TaskItem";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarDatePicker } from "@/components/calendar/CalendarDatePicker";

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

  // Format selected date for filtering
  const formattedSelectedDate = format(selectedDate, 'yyyy-MM-dd');

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

  // Get tasks for the selected date (for the sidebar view)
  const tasksForSelectedDate = tasks.filter(task => 
    task.due_date === formattedSelectedDate
  );

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
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="all">All Tasks</TabsTrigger>
                {user?.role !== 'student' && <TabsTrigger value="assigned">Assigned By Me</TabsTrigger>}
                <TabsTrigger value="received">Assigned To Me</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="by_date">By Date</TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex flex-col md:flex-row gap-2 md:items-center justify-between">
              <div className="flex-1 relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col md:flex-row gap-2">
                <div className="w-full md:w-[150px]">
                  <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                    <SelectTrigger>
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
                </div>
                
                <div className="w-full md:w-[150px]">
                  <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                    <SelectTrigger>
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
            </div>
            
            {currentTab === 'by_date' && (
              <div className="flex justify-center sm:justify-start pt-2">
                <CalendarDatePicker 
                  onSelect={(date) => date && setSelectedDate(date)}
                  selected={selectedDate}
                />
              </div>
            )}
            
            <TabsContent value="all" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-10">Loading tasks...</div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  No tasks found. {user && "Create a new task to get started."}
                </div>
              ) : (
                filteredTasks.map(task => (
                  <TaskItem 
                    key={task.id}
                    task={task}
                    onDelete={handleDeleteTask}
                    onEdit={handleEditTask}
                    onStatusChange={handleStatusChange}
                    currentUserId={user?.id}
                  />
                ))
              )}
            </TabsContent>
            
            <TabsContent value="assigned" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-10">Loading tasks...</div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  You haven't assigned any tasks yet.
                </div>
              ) : (
                filteredTasks.map(task => (
                  <TaskItem 
                    key={task.id}
                    task={task}
                    onDelete={handleDeleteTask}
                    onEdit={handleEditTask}
                    onStatusChange={handleStatusChange}
                    currentUserId={user?.id}
                  />
                ))
              )}
            </TabsContent>
            
            <TabsContent value="received" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-10">Loading tasks...</div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  No tasks have been assigned to you.
                </div>
              ) : (
                filteredTasks.map(task => (
                  <TaskItem 
                    key={task.id}
                    task={task}
                    onDelete={handleDeleteTask}
                    onEdit={handleEditTask}
                    onStatusChange={handleStatusChange}
                    currentUserId={user?.id}
                  />
                ))
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-10">Loading tasks...</div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  No completed tasks found.
                </div>
              ) : (
                filteredTasks.map(task => (
                  <TaskItem 
                    key={task.id}
                    task={task}
                    onDelete={handleDeleteTask}
                    onEdit={handleEditTask}
                    onStatusChange={handleStatusChange}
                    currentUserId={user?.id}
                  />
                ))
              )}
            </TabsContent>
            
            <TabsContent value="pending" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-10">Loading tasks...</div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  No pending tasks found.
                </div>
              ) : (
                filteredTasks.map(task => (
                  <TaskItem 
                    key={task.id}
                    task={task}
                    onDelete={handleDeleteTask}
                    onEdit={handleEditTask}
                    onStatusChange={handleStatusChange}
                    currentUserId={user?.id}
                  />
                ))
              )}
            </TabsContent>
            
            <TabsContent value="by_date" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-10">Loading tasks...</div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  No tasks found for {format(selectedDate, 'MMMM d, yyyy')}.
                </div>
              ) : (
                filteredTasks.map(task => (
                  <TaskItem 
                    key={task.id}
                    task={task}
                    onDelete={handleDeleteTask}
                    onEdit={handleEditTask}
                    onStatusChange={handleStatusChange}
                    currentUserId={user?.id}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </Card>
        
        <Card className="p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Tasks for {format(selectedDate, 'MMMM d, yyyy')}</h2>
            <p className="text-muted-foreground">View and manage tasks due on this date</p>
          </div>
          
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-10">Loading tasks...</div>
            ) : tasksForSelectedDate.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No tasks due on {format(selectedDate, 'MMMM d, yyyy')}.
              </div>
            ) : (
              tasksForSelectedDate.map(task => (
                <TaskItem 
                  key={task.id}
                  task={task}
                  onDelete={handleDeleteTask}
                  onEdit={handleEditTask}
                  onStatusChange={handleStatusChange}
                  currentUserId={user?.id}
                  compact
                />
              ))
            )}
            
            <div className="flex justify-between items-center pt-4">
              <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())}>
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
                  <Calendar className="h-4 w-4" />
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
                  <Clock className="h-4 w-4" />
                  <span className="sr-only">Next day</span>
                </Button>
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
