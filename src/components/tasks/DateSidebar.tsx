
import { useState } from "react";
import { format } from "date-fns";
import { Calendar, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Task } from "@/services/taskService";
import { TaskItem } from "./TaskItem";

interface DateSidebarProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  tasks: Task[];
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
  currentUserId?: string;
  isLoading: boolean;
}

export function DateSidebar({
  selectedDate,
  setSelectedDate,
  tasks,
  onDelete,
  onEdit,
  onStatusChange,
  currentUserId,
  isLoading
}: DateSidebarProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // Format selected date for filtering
  const formattedSelectedDate = format(selectedDate, 'yyyy-MM-dd');
  
  // Get tasks for the selected date (for the sidebar view)
  const tasksForSelectedDate = tasks.filter(task => 
    task.due_date === formattedSelectedDate
  );

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setIsCalendarOpen(false);
    }
  };
  
  return (
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
                onDelete={onDelete}
                onEdit={onEdit}
                onStatusChange={onStatusChange}
                currentUserId={currentUserId}
                compact
              />
            ))}
          </div>
        )}
        
        <div className="mt-6">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full border-dashed">
                <Calendar className="mr-2 h-4 w-4" />
                Select a date
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <CalendarComponent
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
  );
}
