
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { CalendarDatePicker } from "@/components/calendar/CalendarDatePicker";
import { EventForm } from "@/components/calendar/EventForm";
import { DailyEvents } from "@/components/calendar/DailyEvents";
import { SchoolEvent, EventType } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['calendar-events', format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async () => {
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
        reminderTime: event.reminder_time,
        teacherIds: event.calendar_event_teachers?.map(t => t.teacher_id) || []
      }));
    }
  });

  const handleAddEvent = async (eventData: Omit<SchoolEvent, "id">) => {
    const { data, error } = await supabase
      .from('calendar_events')
      .insert([{
        name: eventData.name,
        type: eventData.type,
        date: eventData.date,
        start_time: eventData.startTime,
        end_time: eventData.endTime,
        description: eventData.description,
        reminder_set: eventData.reminderSet,
        reminder_time: eventData.reminderTime
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding event:', error);
      return;
    }

    if (eventData.teacherIds?.length) {
      const { error: teacherError } = await supabase
        .from('calendar_event_teachers')
        .insert(
          eventData.teacherIds.map(teacherId => ({
            event_id: data.id,
            teacher_id: teacherId
          }))
        );

      if (teacherError) {
        console.error('Error assigning teachers:', teacherError);
      }
    }
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
          />
        </Card>
      </div>
    </div>
  );
};

export default CalendarPage;
