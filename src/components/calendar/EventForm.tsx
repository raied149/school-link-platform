
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { CalendarPlus, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EventType, SchoolEvent } from "@/types";
import { formSchema } from "./schema";
import * as z from "zod";
import { TimeInputFields } from "./TimeInputFields";
import { format, isBefore, startOfDay } from "date-fns";
import { TeacherSelectionDialog } from "./TeacherSelectionDialog";
import { EventFormHeader } from "./EventFormHeader";
import { DateReminderSelection } from "./DateReminderSelection";
import { EventDescription } from "./EventDescription";
import { useEventFormSubmit } from "./hooks/useEventFormSubmit";

interface EventFormProps {
  date: Date;
  teachers: any[];
  event?: SchoolEvent;
  onSubmit: (event: Omit<SchoolEvent, "id">) => void;
}

export function EventForm({ date, teachers, event, onSubmit }: EventFormProps) {
  const [open, setOpen] = useState(false);
  const [showTeacherDialog, setShowTeacherDialog] = useState(false);
  const [reminderDates, setReminderDates] = useState<Date[]>(
    event?.reminderTimes ? event.reminderTimes.map(t => new Date(t)) : []
  );

  // Check if the selected date is in the past
  const isPastDate = isBefore(startOfDay(date), startOfDay(new Date()));

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
    },
  });

  const { handleSubmit, isSubmitting } = useEventFormSubmit(event, onSubmit);

  const onFormSubmit = async (values: z.infer<typeof formSchema>) => {
    const success = await handleSubmit(values, reminderDates);
    if (success) {
      setOpen(false);
      form.reset();
      setReminderDates([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          disabled={isPastDate && !event}
        >
          <CalendarPlus className="mr-2 h-4 w-4" />
          {event ? "Edit Event" : (isPastDate ? "Cannot Add Past Event" : "Add Event")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{event ? "Edit Event" : "Add New Event"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
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
