
import { useState } from "react";
import { SchoolEvent } from "@/types";
import { toast } from "sonner";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { formSchema } from "../schema";

export const useEventFormSubmit = (event: SchoolEvent | undefined, onSubmit: (event: Omit<SchoolEvent, "id">) => void) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: z.infer<typeof formSchema>, reminderDates: Date[]) => {
    try {
      setIsSubmitting(true);
      
      // Format the reminder dates to string format
      const formattedReminderDates = reminderDates.map(date => format(date, 'yyyy-MM-dd'));
      
      // Create the event object
      const eventData = {
        name: values.name,
        type: values.type as EventType,
        date: values.date,
        start_time: `${values.startHour}:${values.startMinute} ${values.startPeriod}`,
        end_time: `${values.endHour}:${values.endMinute} ${values.endPeriod}`,
        description: values.description || "",
        reminder_set: values.reminderSet && reminderDates.length > 0,
        reminder_times: formattedReminderDates,
      };
      
      if (event) {
        await handleEventUpdate(eventData, event.id, values.teacherIds);
      } else {
        await handleEventCreate(eventData, values.teacherIds);
      }
      
      // Call the onSubmit callback with the full event data
      onSubmit({
        name: values.name,
        type: values.type as EventType,
        date: values.date,
        startTime: `${values.startHour}:${values.startMinute} ${values.startPeriod}`,
        endTime: `${values.endHour}:${values.endMinute} ${values.endPeriod}`,
        description: values.description,
        teacherIds: values.teacherIds,
        reminderSet: values.reminderSet && reminderDates.length > 0,
        reminderTimes: formattedReminderDates,
      });
      
      toast.success(event ? "Event updated successfully!" : "Event saved successfully!");
      return true;
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error("Failed to save event");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEventUpdate = async (eventData: any, eventId: string, teacherIds?: string[]) => {
    const { error: eventError } = await supabase
      .from('calendar_events')
      .update(eventData)
      .eq('id', eventId);
      
    if (eventError) throw eventError;
    
    if (teacherIds) {
      await handleTeacherAssignments(eventId, teacherIds);
    }
  };

  const handleEventCreate = async (eventData: any, teacherIds?: string[]) => {
    const { data: eventResult, error: eventError } = await supabase
      .from('calendar_events')
      .insert(eventData)
      .select()
      .single();
      
    if (eventError) throw eventError;
    
    if (teacherIds && teacherIds.length > 0) {
      await handleTeacherAssignments(eventResult.id, teacherIds);
    }
  };

  const handleTeacherAssignments = async (eventId: string, teacherIds: string[]) => {
    // First delete existing teacher assignments
    const { error: deleteError } = await supabase
      .from('calendar_event_teachers')
      .delete()
      .eq('event_id', eventId);
      
    if (deleteError) throw deleteError;
    
    // Insert new teacher assignments if any are selected
    if (teacherIds.length > 0) {
      const teacherAssignments = teacherIds.map(teacherId => ({
        event_id: eventId,
        teacher_id: teacherId,
      }));
      
      const { error: teacherError } = await supabase
        .from('calendar_event_teachers')
        .insert(teacherAssignments);
        
      if (teacherError) {
        console.error("Error assigning teachers:", teacherError);
        toast.error("Event updated but there was an issue assigning teachers");
      }
    }
  };

  return { handleSubmit, isSubmitting };
};
