
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Task } from "@/services/taskService";
import { TaskFilters } from "./TaskFilters";
import { TaskFilteredList } from "./TaskFilteredList";

interface TaskTabContentProps {
  tasks: Task[];
  isLoading: boolean;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
  currentUserId?: string;
  currentTab: string;
  selectedDate: Date;
  setIsCalendarOpen: (open: boolean) => void;
  isCalendarOpen: boolean;
  handleDateSelect: (date: Date | undefined) => void;
  filterStatus: Task['status'] | 'all';
  setFilterStatus: (status: Task['status'] | 'all') => void;
  filterType: Task['type'] | 'all';
  setFilterType: (type: Task['type'] | 'all') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function TaskTabContent({
  tasks,
  isLoading,
  onDelete,
  onEdit,
  onStatusChange,
  currentUserId,
  currentTab,
  selectedDate,
  setIsCalendarOpen,
  isCalendarOpen,
  handleDateSelect,
  filterStatus,
  setFilterStatus,
  filterType,
  setFilterType,
  searchQuery,
  setSearchQuery,
}: TaskTabContentProps) {
  // Format selected date for filtering
  const formattedSelectedDate = format(selectedDate, 'yyyy-MM-dd');

  return (
    <div className="mt-4">
      <TaskFilters 
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterType={filterType}
        setFilterType={setFilterType}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
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
      
      <TaskFilteredList
        tasks={tasks}
        isLoading={isLoading}
        onDelete={onDelete}
        onEdit={onEdit}
        onStatusChange={onStatusChange}
        currentUserId={currentUserId}
        currentTab={currentTab}
        formattedSelectedDate={formattedSelectedDate}
        filterStatus={filterStatus}
        filterType={filterType}
        searchQuery={searchQuery}
      />
    </div>
  );
}
