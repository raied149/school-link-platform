
import { z } from "zod";

export const formSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  type: z.enum(["meeting", "function", "holiday"]),
  date: z.string(),
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
