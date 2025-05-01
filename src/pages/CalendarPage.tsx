import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDatePicker } from '@/components/calendar/CalendarDatePicker';
import { DailyEvents } from '@/components/calendar/DailyEvents';
import { EventForm } from '@/components/calendar/EventForm';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SchoolEvent, EventType } from '@/types';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Task, taskService } from '@/services/taskService';
import { TaskFormDialog } from '@/components/tasks/TaskFormDialog';
import { useLocation } from 'react-router-dom';

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const location = useLocation();
  
  // Check if we're on the main calendar page (not a sub-route)
  const isMainCalendarPage = location.pathname === "/calendar";

  // Fetch calendar events
  const { data: events = [], isLoading, refetch } = useQuery({
    queryKey: ['calendar-events'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('calendar_events')
          .select(`
            *,
            calendar_event_teachers (
              teacher_id
            )
          `);
        
        if (error) throw error;
        
        return data.map(event => ({
          id: event.id,
          name: event.name,
          type: event.type as EventType,
          date: event.date,
          startTime: event.start_time,
          endTime: event.end_time,
          description: event.description,
          createdAt: event.created_at,
          reminderSet: event.reminder_set,
          reminderTimes: event.reminder_times,
          teacherIds: event.calendar_event_teachers?.map(t => t.teacher_id) || []
        }));
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Failed to load events');
        return [];
      }
    }
  });

  // Fetch tasks for the logged-in user
  const { data: allTasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks-for-calendar', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return taskService.getTasksForUser(user.id, user.role);
    },
    enabled: !!user
  });

  // Filter events and tasks for the selected date
  const formattedSelectedDate = format(selectedDate, 'yyyy-MM-dd');
  const filteredEvents = events.filter(event => {
    if (event.date === formattedSelectedDate) return true;
    if (event.reminderSet && event.reminderTimes && event.reminderTimes.includes(formattedSelectedDate)) {
      return true;
    }
    return false;
  });
  
  // Filter tasks for the selected date
  const filteredTasks = allTasks.filter(task => 
    task.due_date === formattedSelectedDate
  );

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const { error: teacherError } = await supabase
        .from('calendar_event_teachers')
        .delete()
        .eq('event_id', eventId);

      if (teacherError) throw teacherError;

      const { error: eventError } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId);

      if (eventError) throw eventError;

      toast.success('Event deleted successfully');
      refetch();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const handleUpdateEvent = async (eventId: string, eventData: Partial<SchoolEvent>) => {
    try {
      const { error: eventError } = await supabase
        .from('calendar_events')
        .update({
          name: eventData.name,
          type: eventData.type,
          start_time: eventData.startTime,
          end_time: eventData.endTime,
          description: eventData.description,
          reminder_set: eventData.reminderSet,
          reminder_times: eventData.reminderTimes,
        })
        .eq('id', eventId);

      if (eventError) throw eventError;

      if (eventData.teacherIds) {
        const { error: deleteError } = await supabase
          .from('calendar_event_teachers')
          .delete()
          .eq('event_id', eventId);

        if (deleteError) throw deleteError;

        const teacherAssignments = eventData.teacherIds.map(teacherId => ({
          event_id: eventId,
          teacher_id: teacherId,
        }));

        const { error: teacherError } = await supabase
          .from('calendar_event_teachers')
          .insert(teacherAssignments);

        if (teacherError) throw teacherError;
      }

      toast.success('Event updated successfully');
      refetch();
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
    }
  };

  const handleAddEvent = async () => {
    refetch();
  };
  
  // Task mutations
  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Task['status'] }) => 
      taskService.updateTask(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks-for-calendar'] });
    },
  });
  
  const deleteTaskMutation = useMutation({
    mutationFn: taskService.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks-for-calendar'] });
    },
  });
  
  const handleTaskStatusChange = (taskId: string, status: Task['status']) => {
    updateTaskStatusMutation.mutate({ id: taskId, status });
  };
  
  const handleTaskDelete = (taskId: string) => {
    deleteTaskMutation.mutate(taskId);
  };
  
  const handleTaskEdit = (task: Task) => {
    setSelectedTask(task);
    setIsTaskFormOpen(true);
  };
  
  const handleTaskFormClose = (open: boolean) => {
    setIsTaskFormOpen(open);
    if (!open) {
      setSelectedTask(undefined);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Select Date</h2>
              <p className="text-muted-foreground">Choose a date to view or add events</p>
            </div>
            <div className="flex gap-2">
              <EventForm 
                date={selectedDate}
                teachers={[]}
                onSubmit={handleAddEvent}
              />
            </div>
          </div>
          <div className="flex justify-center sm:justify-start">
            <CalendarDatePicker 
              onSelect={(date) => date && setSelectedDate(date)}
              selected={selectedDate}
            />
          </div>
        </Card>
        <Card className="p-6">
          <DailyEvents
            date={selectedDate}
            events={filteredEvents}
            isLoading={isLoading}
            onDelete={handleDeleteEvent}
            onUpdate={handleUpdateEvent}
            tasks={filteredTasks}
            onTaskStatusChange={handleTaskStatusChange}
            onTaskEdit={handleTaskEdit}
            onTaskDelete={handleTaskDelete}
          />
        </Card>
      </div>
      
      <TaskFormDialog 
        open={isTaskFormOpen} 
        onOpenChange={handleTaskFormClose} 
        task={selectedTask}
      />
    </div>
  );
}
