
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
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CalendarPlus, Calendar as CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EventType, SchoolEvent, Teacher } from "@/types";
import { formSchema } from "./schema";
import { TimeInputFields } from "./TimeInputFields";
import { TeacherSelection } from "./TeacherSelection";
import { z } from "zod";
import { format, addDays } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

interface EventFormProps {
  date: Date;
  teachers: Teacher[];
  onSubmit: (event: Omit<SchoolEvent, "id">) => void;
}

const reminderDayOptions = [
  { id: "same_day", label: "Same day", value: 0 },
  { id: "one_day", label: "1 day before", value: 1 },
  { id: "two_days", label: "2 days before", value: 2 },
  { id: "three_days", label: "3 days before", value: 3 },
  { id: "one_week", label: "1 week before", value: 7 },
];

export function EventForm({ date, teachers, onSubmit }: EventFormProps) {
  const [open, setOpen] = useState(false);
  const [showReminderTime, setShowReminderTime] = useState(false);
  const [showTeacherSelection, setShowTeacherSelection] = useState(true);
  const [selectedReminderDays, setSelectedReminderDays] = useState<number[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: format(date, 'yyyy-MM-dd'),
      type: "meeting",
      name: "",
      startHour: "09",
      startMinute: "00",
      startPeriod: "AM",
      endHour: "10",
      endMinute: "00",
      endPeriod: "AM",
      teacherIds: [],
      reminderSet: false,
      reminderTime: null,
    },
  });

  const handleReminderDayToggle = (dayValue: number) => {
    setSelectedReminderDays(prev => 
      prev.includes(dayValue)
        ? prev.filter(d => d !== dayValue)
        : [...prev, dayValue]
    );
  };

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    // Create reminder times for each selected day before the event
    const reminderTimes = selectedReminderDays.map(daysBeforeEvent => {
      const eventDate = new Date(values.date);
      const reminderDate = addDays(eventDate, -daysBeforeEvent);
      return format(reminderDate, 'yyyy-MM-dd') + 'T09:00';
    });

    onSubmit({
      name: values.name,
      type: values.type as EventType,
      date: values.date,
      startTime: `${values.startHour}:${values.startMinute} ${values.startPeriod}`,
      endTime: `${values.endHour}:${values.endMinute} ${values.endPeriod}`,
      description: values.description,
      teacherIds: values.teacherIds,
      reminderSet: values.reminderSet && reminderTimes.length > 0,
      reminderTimes: values.reminderSet ? reminderTimes : null,
    });
    
    setOpen(false);
    form.reset();
    setSelectedReminderDays([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <CalendarPlus className="mr-2 h-4 w-4" />
          Add Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter event name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="function">Function</SelectItem>
                      <SelectItem value="holiday">Holiday</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Event Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <TimeInputFields form={form} prefix="start" label="Start Time" />
              <TimeInputFields form={form} prefix="end" label="End Time" />
            </div>

            <TeacherSelection 
              form={form} 
              teachers={teachers} 
              show={showTeacherSelection} 
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter event description"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reminderSet"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Set Reminder</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        setShowReminderTime(checked);
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {showReminderTime && (
              <div className="space-y-2">
                <FormLabel>Reminder Days (select multiple)</FormLabel>
                <div className="space-y-2">
                  {reminderDayOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={option.id}
                        checked={selectedReminderDays.includes(option.value)} 
                        onCheckedChange={() => handleReminderDayToggle(option.value)}
                      />
                      <label 
                        htmlFor={option.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedReminderDays.length === 0 && showReminderTime && (
                  <p className="text-sm text-destructive">Please select at least one reminder day</p>
                )}
              </div>
            )}

            <Button type="submit" className="w-full">
              Create Event
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
