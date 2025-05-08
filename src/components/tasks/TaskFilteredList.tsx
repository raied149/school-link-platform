
import { Task } from "@/services/taskService";
import { TaskItem } from "./TaskItem";

interface TaskFilteredListProps {
  tasks: Task[];
  isLoading: boolean;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
  currentUserId?: string;
  currentTab: string;
  formattedSelectedDate: string;
  filterStatus: Task['status'] | 'all';
  filterType: Task['type'] | 'all';
  searchQuery: string;
}

export function TaskFilteredList({
  tasks,
  isLoading,
  onDelete,
  onEdit,
  onStatusChange,
  currentUserId,
  currentTab,
  formattedSelectedDate,
  filterStatus,
  filterType,
  searchQuery,
}: TaskFilteredListProps) {
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
    if (currentTab === 'assigned' && task.created_by === currentUserId) {
      return false;
    }
    if (currentTab === 'received' && task.created_by !== currentUserId) {
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
        (task.title?.toLowerCase() || '').includes(query) ||
        (task.description?.toLowerCase() || '').includes(query) ||
        (task.assigned_to_user_name?.toLowerCase() || '').includes(query) ||
        (task.creator_name?.toLowerCase() || '').includes(query)
      );
    }
    
    return true;
  });

  if (isLoading) {
    return (
      <div className="text-center py-10">Loading tasks...</div>
    );
  } 
    
  if (filteredTasks.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No tasks found. {currentUserId && "Create a new task to get started."}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredTasks.map(task => (
        <TaskItem 
          key={task.id}
          task={task}
          onDelete={onDelete}
          onEdit={onEdit}
          onStatusChange={onStatusChange}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}
