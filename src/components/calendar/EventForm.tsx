
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
} from "@/components/ui/form";
import { CalendarPlus, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EventType, SchoolEvent } from "@/types";
import { formSchema } from "./schema";
import { TimeInputFields } from "./TimeInputFields";
import { z } from "zod";
import { format } from "date-fns";
import { TeacherSelectionDialog } from "./TeacherSelectionDialog";
import { EventFormHeader } from "./EventFormHeader";
import { DateReminderSelection } from "./DateReminderSelection";
import { EventDescription } from "./EventDescription";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface EventFormProps {
  date: Date;
  teachers: any[];
  event?: SchoolEvent;  // Add this prop for editing existing events
  onSubmit: (event: Omit<SchoolEvent, "id">) => void;
}

export function EventForm({ date, teachers, event, onSubmit }: EventFormProps) {
  const [open, setOpen] = useState(false);
  const [showTeacherDialog, setShowTeacherDialog] = useState(false);
  const [reminderDates, setReminderDates] = useState<Date[]>(
    event?.reminderTimes ? event.reminderTimes.map(t => new Date(t)) : []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: format(date, 'yyyy-MM-dd'),
      type: event?.type || "meeting",
      name: event?.name || "",
      startHour: event?.startTime ? event.startTime.split(':')[0] : "09",
      startMinute: event?.startTime ? event.startTime.split(':')[1].split(' ')[0] : "00",
      startPeriod: event?.startTime ? (event.startTime.split(' ')[1] as "AM" | "PM") : "AM",
      endHour: event?.endTime ? event.endTime.split(':')[0] : "10",
      endMinute: event?.endTime ? event.endTime.split(':')[1].split(' ')[0] : "00",
      endPeriod: event?.endTime ? (event.endTime.split(' ')[1] as "AM" | "PM") : "AM",
      description: event?.description || "",
      teacherIds: event?.teacherIds || [],
      reminderSet: event?.reminderSet || false,
      reminderDates: event?.reminderTimes || [],
      reminderText: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
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
        reminder_text: values.reminderText || "",
      };
      
      if (event) {
        // Update existing event
        const { error: eventError } = await supabase
          .from('calendar_events')
          .update(eventData)
          .eq('id', event.id);
          
        if (eventError) {
          throw eventError;
        }
        
        // Handle teacher assignments for updates
        if (values.teacherIds) {
          // First delete existing teacher assignments
          const { error: deleteError } = await supabase
            .from('calendar_event_teachers')
            .delete()
            .eq('event_id', event.id);
            
          if (deleteError) throw deleteError;
          
          // Insert new teacher assignments if any are selected
          if (values.teacherIds.length > 0) {
            const teacherAssignments = values.teacherIds.map(teacherId => ({
              event_id: event.id,
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
        }
        
        toast.success("Event updated successfully!");
      } else {
        // Insert the event into Supabase
        const { data: eventResult, error: eventError } = await supabase
          .from('calendar_events')
          .insert(eventData)
          .select()
          .single();
          
        if (eventError) {
          throw eventError;
        }
        
        // If teachers are selected, assign them to the event
        if (values.teacherIds && values.teacherIds.length > 0) {
          const teacherAssignments = values.teacherIds.map(teacherId => ({
            event_id: eventResult.id,
            teacher_id: teacherId,
          }));
          
          const { error: teacherError } = await supabase
            .from('calendar_event_teachers')
            .insert(teacherAssignments);
            
          if (teacherError) {
            console.error("Error assigning teachers:", teacherError);
            toast.error("Event saved but there was an issue assigning teachers");
          }
        }
        
        toast.success("Event saved successfully!");
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
        reminderText: values.reminderText,
      });
      
      // Reset form and close dialog
      setOpen(false);
      form.reset();
      setReminderDates([]);
      
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error("Failed to save event");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <CalendarPlus className="mr-2 h-4 w-4" />
          {event ? "Edit Event" : "Add Event"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{event ? "Edit Event" : "Add New Event"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <EventFormHeader form={form} />
            
            <DateReminderSelection 
              form={form} 
              date={date} 
              reminderDates={reminderDates}
              setReminderDates={setReminderDates}
            />

            <div className="grid grid-cols-2 gap-4">
              <TimeInputFields form={form} prefix="start" label="Start Time" />
              <TimeInputFields form={form} prefix="end" label="End Time" />
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setShowTeacherDialog(true)}
            >
              <Users className="mr-2 h-4 w-4" />
              {form.watch('teacherIds')?.length
                ? `${form.watch('teacherIds').length} teacher${form.watch('teacherIds').length > 1 ? 's' : ''} selected`
                : "Assign Teachers (Optional)"}
            </Button>

            <EventDescription form={form} />

            <TeacherSelectionDialog
              open={showTeacherDialog}
              onOpenChange={setShowTeacherDialog}
              selectedTeachers={form.watch('teacherIds') || []}
              onTeachersSelect={(teachers) => {
                form.setValue('teacherIds', teachers);
              }}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (event ? "Updating Event..." : "Creating Event...") : (event ? "Update Event" : "Create Event")}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
