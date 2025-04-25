
import { z } from "zod";
import { startOfDay, isBefore } from "date-fns";

export const formSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  type: z.enum(["meeting", "function", "holiday"]),
  date: z.string().refine((date) => {
    const selectedDate = startOfDay(new Date(date));
    const today = startOfDay(new Date());
    return !isBefore(selectedDate, today);
  }, "Cannot create events for past dates"),
  startHour: z.string(),
  startMinute: z.string(),
  startPeriod: z.enum(["AM", "PM"]),
  endHour: z.string(),
  endMinute: z.string(),
  endPeriod: z.enum(["AM", "PM"]),
  description: z.string().optional(),
  teacherIds: z.array(z.string()).optional(),
  reminderSet: z.boolean().default(false),
  reminderDates: z.array(z.string()).optional(),
});
