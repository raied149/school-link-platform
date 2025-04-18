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
import { CalendarPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { EventType, SchoolEvent, Teacher } from "@/types";
import { validateHour, validateMinute, formatTimeFromParts, convertTo24Hour } from "@/utils/timeUtils";

const formSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  type: z.enum(["meeting", "function", "holiday"] as const),
  date: z.string(),
  startHour: z.string().refine(validateHour, { message: "Invalid hour (1-12)" }),
  startMinute: z.string().refine(validateMinute, { message: "Invalid minute (0-59)" }),
  startPeriod: z.enum(['AM', 'PM']),
  endHour: z.string().refine(validateHour, { message: "Invalid hour (1-12)" }),
  endMinute: z.string().refine(validateMinute, { message: "Invalid minute (0-59)" }),
  endPeriod: z.enum(['AM', 'PM']),
  description: z.string().optional(),
  teacherIds: z.array(z.string()).optional(),
});

interface EventFormProps {
  date: Date;
  teachers: Teacher[];
  onSubmit: (event: Omit<SchoolEvent, "id">) => void;
}

export function EventForm({ date, teachers, onSubmit }: EventFormProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: date.toISOString().split('T')[0],
      type: "meeting",
      name: "",
      startHour: "09",
      startMinute: "00",
      startPeriod: "AM",
      endHour: "10",
      endMinute: "00",
      endPeriod: "AM",
      teacherIds: [],
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const startTime = formatTimeFromParts(values.startHour, values.startMinute);
    const endTime = formatTimeFromParts(values.endHour, values.endMinute);

    const eventData: Omit<SchoolEvent, "id"> = {
      name: values.name,
      type: values.type,
      date: values.date,
      startTime: convertTo24Hour(startTime, values.startPeriod),
      endTime: convertTo24Hour(endTime, values.endPeriod),
      description: values.description,
      teacherIds: values.teacherIds,
    };
    
    onSubmit(eventData);
    setOpen(false);
    form.reset();
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <FormLabel>Start Time</FormLabel>
                <div className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name="startHour"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="HH"
                            maxLength={2}
                            className="text-center"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <span className="text-lg">:</span>
                  <FormField
                    control={form.control}
                    name="startMinute"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="MM"
                            maxLength={2}
                            className="text-center"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="startPeriod"
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-[80px]">
                              <SelectValue placeholder="AM/PM" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="AM">AM</SelectItem>
                            <SelectItem value="PM">PM</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <FormLabel>End Time</FormLabel>
                <div className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name="endHour"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="HH"
                            maxLength={2}
                            className="text-center"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <span className="text-lg">:</span>
                  <FormField
                    control={form.control}
                    name="endMinute"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="MM"
                            maxLength={2}
                            className="text-center"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endPeriod"
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-[80px]">
                              <SelectValue placeholder="AM/PM" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="AM">AM</SelectItem>
                            <SelectItem value="PM">PM</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

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

            <Button type="submit" className="w-full">
              Create Event
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
