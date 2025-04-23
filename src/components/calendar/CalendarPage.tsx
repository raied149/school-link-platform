
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { CalendarDatePicker } from "@/components/calendar/CalendarDatePicker";
import { EventForm } from "@/components/calendar/EventForm";
import { DailyEvents } from "@/components/calendar/DailyEvents";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";
import { SchoolEvent, EventType } from "@/types";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { data: events = [], isLoading, refetch } = useQuery({
    queryKey: ['calendar-events', format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('calendar_events')
          .select(`
            *,
            calendar_event_teachers (
              teacher_id
            )
          `)
          .eq('date', format(selectedDate, 'yyyy-MM-dd'));
        
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
        // First delete existing teacher assignments
        const { error: deleteError } = await supabase
          .from('calendar_event_teachers')
          .delete()
          .eq('event_id', eventId);

        if (deleteError) throw deleteError;

        // Then insert new teacher assignments
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

  const handleAddEvent = async (eventData: Omit<SchoolEvent, "id">) => {
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">School Calendar</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Calendar View</h2>
              <p className="text-muted-foreground">Browse and view school calendar</p>
            </div>
            <EventForm 
              date={selectedDate}
              teachers={[]}
              onSubmit={handleAddEvent}
            />
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
            events={events}
            isLoading={isLoading}
            onDelete={handleDeleteEvent}
            onUpdate={handleUpdateEvent}
          />
        </Card>
      </div>
    </div>
  );
};

export default CalendarPage;
